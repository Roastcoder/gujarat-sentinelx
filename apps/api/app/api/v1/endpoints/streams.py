"""
Stream Operations & Session Management Endpoints
Conforms to Sections 6, 8, 11, 17, 18, 19.
"""

import os
import re
import httpx
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import Response, JSONResponse, FileResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.database import get_db
from app.models.camera import Camera, CameraHealth
from app.services.stream_manager import stream_manager
from app.services.catalogue_service import catalogue_service
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

class AcquireStreamRequest(BaseModel):
    consumer_id: str
    purpose: Optional[str] = "live_monitoring"

class ReleaseStreamRequest(BaseModel):
    consumer_id: str

@router.get("/sessions", response_model=List[Dict[str, Any]])
async def list_stream_sessions(
    current_user: User = Depends(get_current_user)
):
    """List all active stream sessions with reference counts and PTS metrics."""
    return stream_manager.get_all_sessions()

@router.post("/{camera_code}/acquire")
async def acquire_stream_session(
    camera_code: str,
    body: AcquireStreamRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Acquire stream session with reference counting.
    If ref_count transitions 0 -> 1, RTSP TCP connection is initialized.
    """
    stmt = select(Camera).where(Camera.camera_code == camera_code)
    res = await db.execute(stmt)
    cam = res.scalar_one_or_none()
    if not cam:
        raise HTTPException(status_code=404, detail=f"Camera '{camera_code}' not found")

    session = stream_manager.get_or_create_session(
        camera_code=cam.camera_code,
        camera_name=cam.name,
        rtsp_url=cam.rtsp_url or f"rtsp://103.250.160.189:8554/stream/{cam.camera_code.lower()}",
        codec=cam.codec or "H.264",
        width=cam.width or 1920,
        height=cam.height or 1080,
        fps=cam.fps_declared or 25.0,
        bitrate=cam.bitrate or 4096
    )
    new_ref_count = session.acquire(body.consumer_id)

    return {
        "status": "ACQUIRED",
        "camera_code": cam.camera_code,
        "ref_count": new_ref_count,
        "connection_state": session.connection_state,
        "codec": session.codec,
        "webrtc_url": cam.webrtc_url,
        "hls_url": cam.hls_url
    }

@router.post("/{camera_code}/release")
async def release_stream_session(
    camera_code: str,
    body: ReleaseStreamRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Release stream reference.
    When ref_count drops to 0, session terminates cleanly to conserve bandwidth.
    """
    new_ref_count = stream_manager.release_stream(camera_code, body.consumer_id)
    return {
        "status": "RELEASED",
        "camera_code": camera_code,
        "ref_count": new_ref_count
    }

@router.get("/{camera_code}/health")
async def get_stream_health(
    camera_code: str,
    current_user: User = Depends(get_current_user)
):
    """Returns real-time stream telemetry: PTS, measured FPS, latency, reconnect backoff."""
    session = stream_manager.get_session(camera_code)
    if not session:
        return {
            "camera_code": camera_code,
            "connection_state": "DISCOVERED",
            "ref_count": 0,
            "measured_fps": 0.0,
            "last_pts": None,
            "frames_received": 0,
            "reconnect_count": 0,
            "current_backoff_sec": 0.0,
            "status": "IDLE"
        }
    return session.to_dict()

@router.post("/catalogue/sync")
async def trigger_catalogue_sync(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Triggers manual camera discovery and database synchronization from /api/ingest."""
    result = await catalogue_service.sync_with_database(db)
    return result

@router.get("/catalogue/status")
async def get_catalogue_status(
    current_user: User = Depends(get_current_user)
):
    """Returns discovery catalogue sync status and cached count."""
    return catalogue_service.get_sync_status()

@router.api_route("/{cam_id}/whep", methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"])
async def proxy_whep_stream(
    cam_id: str,
    request: Request
):
    """
    Secure HTTPS WebRTC WHEP Proxy to Sentinel MediaMTX Grid (103.250.160.189:8889).
    Bypasses browser Mixed Content security blocking when application is deployed over HTTPS.
    Forward client SDP offer with Basic Auth and return SDP answer.
    """
    if request.method == "OPTIONS":
        return Response(status_code=200, headers={"Allow": "GET, POST, PATCH, DELETE, OPTIONS"})

    clean_id = cam_id.lower().replace("-", "").replace("_", "")
    match = re.search(r'(\d+)', clean_id)
    num = int(match.group(1)) if match else 1
    stream_key = f"cam{str(num).zfill(2)}"
    
    target_url = f"http://{settings.SENTINEL_GRID_HOST}:{settings.SENTINEL_GRID_WHEP_PORT}/stream/{stream_key}/whep"
    body_bytes = await request.body()
    
    headers = {"Content-Type": request.headers.get("content-type", "application/sdp")}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.request(
                method=request.method,
                url=target_url,
                content=body_bytes,
                headers=headers,
                auth=(settings.SENTINEL_GRID_EMAIL, settings.SENTINEL_GRID_PASSWORD)
            )
            
            resp_headers = {"Content-Type": resp.headers.get("content-type", "application/sdp")}
            if "location" in resp.headers:
                resp_headers["Location"] = resp.headers["location"]
                
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers=resp_headers
            )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={"status": "error", "message": f"WHEP gateway error: {str(e)}"}
        )

@router.get("/{cam_id}/snapshot")
async def get_stream_snapshot(cam_id: str):
    """
    Returns high-definition JPEG snapshot frame for specified camera.
    """
    clean_id = cam_id.lower().replace("-", "").replace("_", "")
    match = re.search(r'(\d+)', clean_id)
    num = int(match.group(1)) if match else 1
    cam_num = ((num - 1) % 16) + 1
    key = f"cam{str(cam_num).zfill(2)}"

    possible_paths = [
        os.path.join(os.getcwd(), "storage", "camera_snapshots", f"{key}.jpg"),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "storage", "camera_snapshots", f"{key}.jpg")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..", "web", "public", "camera_snapshots", f"{key}.jpg")),
        os.path.join(os.getcwd(), "storage", "camera_snapshots", "cam01.jpg"),
    ]
    for p in possible_paths:
        if os.path.exists(p):
            return FileResponse(p, media_type="image/jpeg", headers={"Cache-Control": "public, max-age=1"})

    return Response(status_code=404, content="Snapshot not found")
