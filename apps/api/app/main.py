import time
import uuid
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.errors import SentinelXException, sentinelx_exception_handler, generic_exception_handler
from app.api.v1.router import api_router
from app.api.websocket import ws_manager
from app.seeder import seed_data

# Initialize logging
setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Unified CCTV Intelligence, GIS & Cross-Camera Investigation Platform "
        "for the Gujarat CCTV Hackathon 2026. Integrates heterogeneous VMS feeds, "
        "ANPR/OCR analytics, cross-camera journey reconstruction, and state-wide GIS topology."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID & Audit Middleware
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response

# Exception Handlers
app.add_exception_handler(SentinelXException, sentinelx_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# WebSocket Endpoint
@app.websocket("/api/v1/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; clients can send ping or subscription requests
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Section 5: Authoritative Ingest Discovery Contract at root /api/ingest
from app.api.v1.endpoints.ingest import router as root_ingest_router
from app.services.catalogue_service import catalogue_service
from app.services.stream_manager import stream_manager
from app.core.database import AsyncSessionLocal

app.include_router(root_ingest_router, prefix="/api/ingest", tags=["Authoritative Ingest Contract"])

# Register stream manager as listener to catalogue discoveries
catalogue_service.register_listener(stream_manager)

@app.on_event("startup")
async def on_startup():
    logger.info("Initializing Gujarat SentinelX API Core...")
    try:
        await seed_data()
        logger.info("Database seeded successfully. Synchronizing camera catalogue from /api/ingest...")
        async with AsyncSessionLocal() as session:
            sync_res = await catalogue_service.sync_with_database(session)
            logger.info(f"Initial catalogue synchronization completed: {sync_res}")
        logger.info("SentinelX API ready for operations.")
    except Exception as e:
        logger.error(f"Error during startup seeder / catalogue sync: {e}")

@app.on_event("shutdown")
async def on_shutdown():
    logger.info("Shutting down Gujarat SentinelX API Core...")
    stream_manager.shutdown()

@app.get("/", tags=["Health"])
async def root():
    return {
        "platform": settings.APP_NAME,
        "version": "1.0.0",
        "jurisdiction": "State of Gujarat, India",
        "status": "OPERATIONAL",
        "demo_mode": settings.DEMO_MODE,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
        "ingest_contract": "/api/ingest"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "timestamp": time.time()}

