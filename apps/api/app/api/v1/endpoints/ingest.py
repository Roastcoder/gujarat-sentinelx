"""
Authoritative Camera Discovery Endpoint (Section 5)
GET /api/ingest
The catalogue is the contract. Camera IDs and URLs are never hardcoded.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Request, Query
from app.simulator.camera_generator import generate_catalogue_response
from app.core.config import settings

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]], tags=["Camera Discovery Ingest Contract"])
async def get_ingest_catalogue(
    request: Request,
    host: Optional[str] = Query(None, description="Optional stream host override")
):
    """
    Authoritative Camera Catalogue Ingest Endpoint conforming to Section 5:
    - Never hardcoded
    - Retrieves: Camera ID, Location, Lat, Lon, Codec (H.264/H.265), Status, Width, Height,
      FPS, Bitrate, RTSP URL, WebRTC WHEP URL, HLS URL, VMS ID, Department, District.
    """
    target_host = host or settings.SENTINEL_GRID_HOST
    base_url = str(request.base_url).rstrip("/")
    return generate_catalogue_response(host=target_host, base_url=base_url)
