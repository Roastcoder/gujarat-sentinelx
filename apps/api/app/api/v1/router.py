from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    cameras,
    gis,
    vehicles,
    events,
    alerts,
    watchlists,
    investigations,
    analytics,
    system,
    vms,
    audit,
    demo,
    anpr,
    ingest,
    streams,
    simulator,
)

api_router = APIRouter()

api_router.include_router(ingest.router, prefix="/ingest", tags=["Authoritative Camera Discovery"])
api_router.include_router(streams.router, prefix="/streams", tags=["Stream Operations & Sessions"])
api_router.include_router(simulator.router, prefix="/simulator", tags=["Camera Simulator & Resilience"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])
api_router.include_router(cameras.router, prefix="/cameras", tags=["Camera Registry"])
api_router.include_router(gis.router, prefix="/gis", tags=["GIS & Topology"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicle Intelligence & ANPR"])
api_router.include_router(events.router, prefix="/events", tags=["Camera Events"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts & Watchlists"])
api_router.include_router(watchlists.router, prefix="/watchlists", tags=["Watchlists"])
api_router.include_router(investigations.router, prefix="/investigations", tags=["Investigation Workspace"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & KPIs"])
api_router.include_router(system.router, prefix="/system", tags=["System Health"])
api_router.include_router(vms.router, prefix="/vms", tags=["VMS Integration Layer"])
api_router.include_router(audit.router, prefix="/audit", tags=["Security & Audit Logs"])
api_router.include_router(demo.router, prefix="/demo", tags=["Hackathon Demo Controller"])
api_router.include_router(anpr.router, prefix="/anpr", tags=["ANPR Live Ingest"])

