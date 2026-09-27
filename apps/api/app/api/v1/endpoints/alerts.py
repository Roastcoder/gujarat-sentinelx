from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.errors import SentinelXException
from app.models.alert import Alert
from app.models.camera import Camera
from app.models.user import User
from app.schemas.alert import AlertResponse, AlertListResponse, AlertAcknowledgeRequest
from app.api.v1.endpoints.auth import get_current_user
from app.services.audit_service import log_audit_action

router = APIRouter()

@router.get("", response_model=AlertListResponse)
async def list_alerts(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Alert).order_by(Alert.created_at.desc())
    if status:
        query = query.where(Alert.status == status.upper())
    if priority:
        query = query.where(Alert.priority == priority.upper())

    total = (await db.execute(select(func.count(Alert.id)))).scalar() or 0
    unack = (await db.execute(select(func.count(Alert.id)).where(Alert.status == "NEW"))).scalar() or 0

    result = await db.execute(query.limit(limit))
    alerts = result.scalars().all()

    # Preload camera codes
    cam_ids = list(set(a.camera_id for a in alerts))
    cams_res = await db.execute(select(Camera).options(selectinload(Camera.district)).where(Camera.id.in_(cam_ids)))
    cam_dict = {c.id: c for c in cams_res.scalars().all()}

    items = []
    for a in alerts:
        c = cam_dict.get(a.camera_id)
        items.append(
            AlertResponse(
                id=a.id,
                alert_type=a.alert_type,
                priority=a.priority,
                title=a.title,
                description=a.description,
                camera_id=a.camera_id,
                camera_code=c.camera_code if c else "CAM-UNK",
                camera_name=c.name if c else "Unknown",
                district_name=c.district.name if c and c.district else "Gujarat",
                vehicle_detection_id=a.vehicle_detection_id,
                watchlist_id=a.watchlist_id,
                plate_number=a.plate_number,
                status=a.status,
                acknowledged_by=a.acknowledged_by,
                acknowledged_at=a.acknowledged_at,
                notes=a.notes,
                created_at=a.created_at
            )
        )

    return AlertListResponse(
        total=total,
        unacknowledged=unack,
        items=items
    )

@router.post("/{id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    id: str,
    ack_data: AlertAcknowledgeRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Alert).where(Alert.id == id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()
    if not alert:
        raise SentinelXException(code="ALERT_NOT_FOUND", message=f"Alert '{id}' not found", status_code=404)

    alert.status = "ACKNOWLEDGED"
    alert.acknowledged_by = current_user.full_name
    alert.acknowledged_at = datetime.utcnow()
    alert.notes = ack_data.notes
    await db.commit()

    await log_audit_action(
        db,
        action="ACKNOWLEDGE_ALERT",
        username=current_user.username,
        user_id=current_user.id,
        resource="Alert",
        resource_id=alert.id,
        ip_address=request.client.host if request.client else "127.0.0.1",
        result="SUCCESS",
        details=f"Acknowledged alert for vehicle {alert.plate_number}: {ack_data.notes}"
    )

    # Get camera code
    c_res = await db.execute(select(Camera).options(selectinload(Camera.district)).where(Camera.id == alert.camera_id))
    c = c_res.scalar_one_or_none()

    return AlertResponse(
        id=alert.id,
        alert_type=alert.alert_type,
        priority=alert.priority,
        title=alert.title,
        description=alert.description,
        camera_id=alert.camera_id,
        camera_code=c.camera_code if c else "CAM-UNK",
        camera_name=c.name if c else "Unknown",
        district_name=c.district.name if c and c.district else "Gujarat",
        vehicle_detection_id=alert.vehicle_detection_id,
        watchlist_id=alert.watchlist_id,
        plate_number=alert.plate_number,
        status=alert.status,
        acknowledged_by=alert.acknowledged_by,
        acknowledged_at=alert.acknowledged_at,
        notes=alert.notes,
        created_at=alert.created_at
    )
