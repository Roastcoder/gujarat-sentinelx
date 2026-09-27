"""
ANPR Ingest API
─────────────────────────────────────────────────────────────────
POST /api/v1/anpr/ingest
  Receives a plate detection + base64 snapshot from the frontend
  camera player. Pipeline:
    1. Decode & save snapshot JPEG to disk (public/anpr_captures/)
    2. Resolve camera DB record by camera_code
    3. Write VehicleDetection row
    4. Write ANPRDetection row
    5. Write CameraEvent row (ANPR_DETECTED)
    6. Cross-match watchlist → if hit, write Alert + WS broadcast
    7. Return saved record IDs + snapshot URL

GET /api/v1/anpr/detections
  List all ANPR detections (paginated, filterable by plate / camera / date)
"""
import os
import base64
import uuid
import json
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from pydantic import BaseModel

from app.core.database import get_db
from app.models.event import VehicleDetection, ANPRDetection as ANPRDetectionModel, CameraEvent
from app.models.camera import Camera
from app.models.watchlist import WatchlistVehicle
from app.models.alert import Alert
from app.api.websocket import ws_manager

router = APIRouter()

# ─── Where to save snapshot files ───────────────────────────────
SNAPSHOT_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..", "web", "public", "anpr_captures")
)
os.makedirs(SNAPSHOT_DIR, exist_ok=True)


# ─── Pydantic Schemas ───────────────────────────────────────────

class ANPRIngestPayload(BaseModel):
    camera_code: str                    # e.g. "CAM-AHM-001"
    camera_name: str
    plate_number: str                   # e.g. "GJ01AB1234"
    plate_confidence: float             # 0–100
    vehicle_type: str                   # Car / SUV / Truck / Bus / Motorcycle
    vehicle_color: str
    vehicle_confidence: float           # YOLOv8 body box confidence
    latitude: float
    longitude: float
    speed_kmh: float = 0.0
    heading: str = "N"
    bbox_x: float                       # % from left (vehicle body box)
    bbox_y: float                       # % from top
    bbox_w: float                       # % width
    bbox_h: float                       # % height
    snapshot_b64: Optional[str] = None  # base64 JPEG (data:image/jpeg;base64,…)
    timestamp: Optional[str] = None     # ISO8601, defaults to now


class ANPRIngestResponse(BaseModel):
    success: bool
    detection_id: str
    anpr_id: str
    event_id: str
    snapshot_url: Optional[str]
    watchlist_hit: bool
    watchlist_name: Optional[str]
    alert_id: Optional[str]
    message: str


class ANPRDetectionListItem(BaseModel):
    id: str
    camera_code: str
    camera_name: str
    plate_number: str
    plate_confidence: float
    vehicle_type: str
    vehicle_color: str
    latitude: float
    longitude: float
    snapshot_url: Optional[str]
    is_flagged: bool
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Helper: decode + save base64 snapshot ──────────────────────

def _save_snapshot(b64_data: str, filename: str) -> str:
    """Decode base64 JPEG and write to SNAPSHOT_DIR. Returns public URL path."""
    try:
        if "," in b64_data:
            b64_data = b64_data.split(",", 1)[1]
        raw = base64.b64decode(b64_data)
        filepath = os.path.join(SNAPSHOT_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(raw)
        return f"/anpr_captures/{filename}"
    except Exception as e:
        return None


# ─── POST /anpr/ingest ──────────────────────────────────────────

@router.post("/ingest", response_model=ANPRIngestResponse)
async def ingest_anpr_detection(
    payload: ANPRIngestPayload,
    db: AsyncSession = Depends(get_db),
):
    """
    Called by the frontend CameraFeedPlayer every time an ANPR
    detection fires. Saves snapshot + DB records atomically.
    """
    ts = datetime.utcnow()
    if payload.timestamp:
        try:
            ts = datetime.fromisoformat(payload.timestamp.replace("Z", "+00:00")).replace(tzinfo=None)
        except Exception:
            pass

    # ── 1. Resolve camera ──────────────────────────────────────
    cam_res = await db.execute(
        select(Camera).where(
            or_(
                Camera.camera_code == payload.camera_code,
                Camera.name.ilike(f"%{payload.camera_name}%"),
            )
        ).limit(1)
    )
    camera = cam_res.scalar_one_or_none()

    # If no DB camera record, use a placeholder UUID tied to camera_code
    # (in production, all cameras are seeded — this is just a safety net)
    camera_id = camera.id if camera else payload.camera_code
    lat = camera.latitude if camera else payload.latitude
    lon = camera.longitude if camera else payload.longitude

    # ── 2. Save snapshot JPEG to disk ─────────────────────────
    snapshot_url = None
    if payload.snapshot_b64:
        clean_plate = payload.plate_number.replace(" ", "").replace("-", "").upper()
        fname = f"{clean_plate}_{payload.camera_code}_{int(ts.timestamp())}.jpg"
        snapshot_url = _save_snapshot(payload.snapshot_b64, fname)

    # ── 3. Write VehicleDetection ──────────────────────────────
    tracking_id = f"TRK-{uuid.uuid4().hex[:8].upper()}"
    det = VehicleDetection(
        camera_id=camera_id,
        timestamp=ts,
        tracking_id=tracking_id,
        plate_number=payload.plate_number.upper().replace(" ", "").replace("-", ""),
        plate_confidence=round(payload.plate_confidence / 100.0, 4) if payload.plate_confidence > 1 else payload.plate_confidence,
        vehicle_type=payload.vehicle_type,
        vehicle_color=payload.vehicle_color,
        latitude=lat,
        longitude=lon,
        speed_kmh=payload.speed_kmh,
        heading=payload.heading,
        snapshot_url=snapshot_url,
        is_flagged=False,
    )
    db.add(det)
    await db.flush()  # get det.id before linking

    # ── 4. Write ANPRDetection ─────────────────────────────────
    state_code = payload.plate_number[:2].upper() if len(payload.plate_number) >= 2 else "GJ"
    anpr = ANPRDetectionModel(
        detection_id=det.id,
        camera_id=camera_id,
        plate_number=det.plate_number,
        confidence=det.plate_confidence,
        state_code=state_code,
        raw_text=payload.plate_number,
        verified=True,
        timestamp=ts,
    )
    db.add(anpr)
    await db.flush()

    # ── 5. Write CameraEvent ───────────────────────────────────
    meta = {
        "plate": det.plate_number,
        "vehicle_type": payload.vehicle_type,
        "vehicle_color": payload.vehicle_color,
        "confidence": payload.plate_confidence,
        "bbox": {"x": payload.bbox_x, "y": payload.bbox_y, "w": payload.bbox_w, "h": payload.bbox_h},
        "snapshot_url": snapshot_url,
        "tracking_id": tracking_id,
    }
    evt = CameraEvent(
        camera_id=camera_id,
        timestamp=ts,
        event_type="ANPR_DETECTED",
        object_type=payload.vehicle_type.lower(),
        confidence=det.plate_confidence,
        latitude=lat,
        longitude=lon,
        image_reference=snapshot_url,
        metadata_json=json.dumps(meta),
    )
    db.add(evt)
    await db.flush()

    # ── 6. Watchlist cross-check ───────────────────────────────
    wl_res = await db.execute(
        select(WatchlistVehicle).where(
            WatchlistVehicle.plate_number == det.plate_number,
            WatchlistVehicle.is_active == True,
        ).limit(1)
    )
    wl_hit = wl_res.scalar_one_or_none()
    watchlist_hit = wl_hit is not None
    watchlist_name = None
    alert_id = None

    if watchlist_hit:
        det.is_flagged = True
        evt.event_type = "WATCHLIST_MATCH"

        alert = Alert(
            camera_id=camera_id,
            vehicle_detection_id=det.id,
            watchlist_id=wl_hit.watchlist_id,
            alert_type="WATCHLIST_MATCH",
            plate_number=det.plate_number,
            title=f"⚠ WATCHLIST HIT: {det.plate_number}",
            description=f"Vehicle {det.plate_number} ({payload.vehicle_type} · {payload.vehicle_color}) detected at {payload.camera_name}. Reason: {wl_hit.reason}",
            status="NEW",
            priority=wl_hit.priority or "HIGH",
        )
        db.add(alert)
        await db.flush()
        alert_id = alert.id
        watchlist_name = wl_hit.reason

    await db.commit()

    # ── 7. WebSocket broadcast ─────────────────────────────────
    ws_event_type = "anpr.watchlist_hit" if watchlist_hit else "anpr.detection"
    await ws_manager.broadcast(ws_event_type, {
        "plate": det.plate_number,
        "camera_code": payload.camera_code,
        "camera_name": payload.camera_name,
        "vehicle_type": payload.vehicle_type,
        "vehicle_color": payload.vehicle_color,
        "confidence": payload.plate_confidence,
        "snapshot_url": snapshot_url,
        "watchlist_hit": watchlist_hit,
        "timestamp": ts.isoformat(),
        "detection_id": det.id,
    })

    return ANPRIngestResponse(
        success=True,
        detection_id=det.id,
        anpr_id=anpr.id,
        event_id=evt.id,
        snapshot_url=snapshot_url,
        watchlist_hit=watchlist_hit,
        watchlist_name=watchlist_name,
        alert_id=alert_id,
        message=f"{'⚠ WATCHLIST HIT — ' if watchlist_hit else ''}Plate {det.plate_number} saved from {payload.camera_code}",
    )


# ─── GET /anpr/detections ────────────────────────────────────────

@router.get("/detections", response_model=List[ANPRDetectionListItem])
async def list_anpr_detections(
    plate: Optional[str] = None,
    camera_code: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """List recent ANPR detections, optionally filtered by plate or camera."""
    query = select(VehicleDetection).order_by(VehicleDetection.timestamp.desc())

    if plate:
        clean = plate.replace("-", "").replace(" ", "").upper()
        query = query.where(VehicleDetection.plate_number.ilike(f"%{clean}%"))
    if camera_code:
        cam_r = await db.execute(select(Camera).where(Camera.camera_code == camera_code).limit(1))
        cam = cam_r.scalar_one_or_none()
        if cam:
            query = query.where(VehicleDetection.camera_id == cam.id)

    result = await db.execute(query.limit(limit))
    dets = result.scalars().all()

    items = []
    for d in dets:
        cam_r2 = await db.execute(select(Camera).where(Camera.id == d.camera_id).limit(1))
        cam2 = cam_r2.scalar_one_or_none()
        items.append(ANPRDetectionListItem(
            id=d.id,
            camera_code=cam2.camera_code if cam2 else d.camera_id,
            camera_name=cam2.name if cam2 else "Unknown",
            plate_number=d.plate_number,
            plate_confidence=d.plate_confidence,
            vehicle_type=d.vehicle_type,
            vehicle_color=d.vehicle_color,
            latitude=d.latitude,
            longitude=d.longitude,
            snapshot_url=d.snapshot_url,
            is_flagged=d.is_flagged,
            timestamp=d.timestamp,
        ))

    return items
