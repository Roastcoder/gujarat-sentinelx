from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.event import CameraEvent
from app.models.camera import Camera
from app.schemas.event import CameraEventResponse, EventListResponse, CameraEventCreate
from app.api.websocket import ws_manager

router = APIRouter()

@router.get("", response_model=EventListResponse)
async def list_events(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    camera_id: Optional[str] = None,
    event_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(CameraEvent).order_by(CameraEvent.timestamp.desc())

    if camera_id:
        query = query.where(CameraEvent.camera_id == camera_id)
    if event_type:
        query = query.where(CameraEvent.event_type == event_type.upper())

    count_stmt = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_stmt)).scalar() or 0

    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    events = result.scalars().all()

    # Enrich with camera details
    cam_ids = list(set(e.camera_id for e in events))
    cams_res = await db.execute(select(Camera).options(selectinload(Camera.district)).where(Camera.id.in_(cam_ids)))
    cam_dict = {c.id: c for c in cams_res.scalars().all()}

    items = []
    for e in events:
        c = cam_dict.get(e.camera_id)
        items.append(
            CameraEventResponse(
                id=e.id,
                camera_id=e.camera_id,
                camera_code=c.camera_code if c else "CAM-UNK",
                camera_name=c.name if c else "Unknown",
                district_name=c.district.name if c and c.district else "Gujarat",
                timestamp=e.timestamp,
                event_type=e.event_type,
                object_type=e.object_type,
                confidence=e.confidence,
                latitude=e.latitude,
                longitude=e.longitude,
                image_reference=e.image_reference,
                video_reference=e.video_reference,
                created_at=e.created_at
            )
        )

    return EventListResponse(
        total=total,
        page=page,
        limit=limit,
        items=items
    )

@router.post("", response_model=CameraEventResponse)
async def create_event(
    event_in: CameraEventCreate,
    db: AsyncSession = Depends(get_db)
):
    evt = CameraEvent(**event_in.dict())
    db.add(evt)
    await db.commit()
    await db.refresh(evt)

    # Broadcast
    await ws_manager.broadcast("event.created", {
        "id": evt.id,
        "camera_id": evt.camera_id,
        "event_type": evt.event_type,
        "confidence": evt.confidence,
        "timestamp": evt.timestamp.isoformat()
    })

    return CameraEventResponse(
        id=evt.id,
        camera_id=evt.camera_id,
        timestamp=evt.timestamp,
        event_type=evt.event_type,
        object_type=evt.object_type,
        confidence=evt.confidence,
        latitude=evt.latitude,
        longitude=evt.longitude,
        image_reference=evt.image_reference,
        video_reference=evt.video_reference,
        created_at=evt.created_at
    )
