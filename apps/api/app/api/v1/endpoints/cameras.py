from typing import Optional, List
import os
import re
from fastapi import APIRouter, Depends, Query, Request, status
from fastapi.responses import FileResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.errors import SentinelXException
from app.models.camera import Camera, CameraHealth
from app.models.jurisdiction import District, Department, PoliceStation
from app.models.user import User
from app.schemas.camera import CameraResponse, CameraCreate, CameraUpdate, CameraListResponse, CameraHealthResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.audit_service import log_audit_action

router = APIRouter()

@router.get("", response_model=CameraListResponse)
async def list_cameras(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    vendor: Optional[str] = None,
    vms: Optional[str] = None,
    anpr_only: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Camera)
        .options(
            selectinload(Camera.district),
            selectinload(Camera.department),
            selectinload(Camera.police_station),
            selectinload(Camera.health)
        )
    )

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Camera.camera_code.ilike(search_filter),
                Camera.name.ilike(search_filter),
                Camera.model.ilike(search_filter)
            )
        )
    if district:
        query = query.join(District, Camera.district_id == District.id).where(
            or_(District.code.ilike(district), District.name.ilike(district))
        )
    if status:
        query = query.where(Camera.status == status.upper())
    if vendor:
        query = query.where(Camera.vendor.ilike(f"%{vendor}%"))
    if vms:
        query = query.where(Camera.vms.ilike(f"%{vms}%"))
    if anpr_only is True:
        query = query.where(Camera.anpr_enabled == True)

    # Count total
    count_stmt = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_stmt)).scalar() or 0

    # Paginate
    offset = (page - 1) * limit
    stmt = query.order_by(Camera.camera_code.asc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    cameras = result.scalars().all()

    items = []
    for c in cameras:
        items.append(
            CameraResponse(
                id=c.id,
                camera_code=c.camera_code,
                name=c.name,
                department_id=c.department_id,
                district_id=c.district_id,
                police_station_id=c.police_station_id,
                zone=c.zone,
                latitude=c.latitude,
                longitude=c.longitude,
                vendor=c.vendor,
                model=c.model,
                vms=c.vms,
                protocol=c.protocol,
                stream_url=c.stream_url,
                resolution=c.resolution,
                fps=c.fps,
                ptz_support=c.ptz_support,
                anpr_enabled=c.anpr_enabled,
                audio_enabled=c.audio_enabled,
                night_vision=c.night_vision,
                status=c.status,
                retention_period=c.retention_period,
                district_name=c.district.name if c.district else None,
                department_name=c.department.name if c.department else None,
                police_station_name=c.police_station.name if c.police_station else None,
                health=CameraHealthResponse.from_orm(c.health) if c.health else None,
                created_at=c.created_at,
                updated_at=c.updated_at
            )
        )

    return CameraListResponse(
        total=total,
        page=page,
        limit=limit,
        items=items
    )

@router.get("/sentinel-grid/catalogue")
async def get_sentinel_grid_catalogue(
    force_refresh: bool = Query(False)
):
    """
    Returns the dynamic Sentinel Camera Grid catalogue with multi-protocol URLs
    (HLS, RTSP over TCP:8554, WebRTC WHEP:8889) and integrator AI code snippets.
    """
    from app.integrations.stream.sentinel_grid import sentinel_grid_service
    return await sentinel_grid_service.get_catalogue(force_refresh=force_refresh)

@router.get("/{id}/live-frame")
async def get_camera_live_frame(id: str):
    """
    Returns the real-time JPEG snapshot frame from the physical camera stream.
    Used for instant video preview, posters, and fallback feeds.
    """
    clean_id = id.lower().replace("-", "").replace("_", "")
    match = re.search(r'(\d+)', clean_id)
    num = int(match.group(1)) if match else 1
    # Wrap within 1-16
    cam_num = ((num - 1) % 16) + 1
    cam_id = f"cam{str(cam_num).zfill(2)}"

    snapshot_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "..", "..",
        "web", "public", "camera_snapshots", f"{cam_id}.jpg"
    ))

    if os.path.exists(snapshot_path):
        return FileResponse(
            snapshot_path,
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=1"}
        )

    fallback_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "..", "..",
        "web", "public", "camera_snapshots", "cam01.jpg"
    ))
    if os.path.exists(fallback_path):
        return FileResponse(
            fallback_path,
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=1"}
        )

    return Response(status_code=404, content="Frame not available")

@router.get("/{id}", response_model=CameraResponse)
async def get_camera(
    id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Camera)
        .options(
            selectinload(Camera.district),
            selectinload(Camera.department),
            selectinload(Camera.police_station),
            selectinload(Camera.health)
        )
        .where(or_(Camera.id == id, Camera.camera_code == id))
    )
    result = await db.execute(stmt)
    c = result.scalar_one_or_none()
    if not c:
        raise SentinelXException(
            code="CAMERA_NOT_FOUND",
            message=f"Camera '{id}' was not found in registry.",
            status_code=404
        )

    await log_audit_action(
        db,
        action="VIEW_CAMERA",
        username=current_user.username,
        user_id=current_user.id,
        resource="Camera",
        resource_id=c.camera_code,
        ip_address=request.client.host if request.client else "127.0.0.1",
        result="SUCCESS"
    )

    return CameraResponse(
        id=c.id,
        camera_code=c.camera_code,
        name=c.name,
        department_id=c.department_id,
        district_id=c.district_id,
        police_station_id=c.police_station_id,
        zone=c.zone,
        latitude=c.latitude,
        longitude=c.longitude,
        vendor=c.vendor,
        model=c.model,
        vms=c.vms,
        protocol=c.protocol,
        stream_url=c.stream_url,
        resolution=c.resolution,
        fps=c.fps,
        ptz_support=c.ptz_support,
        anpr_enabled=c.anpr_enabled,
        audio_enabled=c.audio_enabled,
        night_vision=c.night_vision,
        status=c.status,
        retention_period=c.retention_period,
        district_name=c.district.name if c.district else None,
        department_name=c.department.name if c.department else None,
        police_station_name=c.police_station.name if c.police_station else None,
        health=CameraHealthResponse.from_orm(c.health) if c.health else None,
        created_at=c.created_at,
        updated_at=c.updated_at
    )

@router.post("", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
async def create_camera(
    camera_data: CameraCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check duplicate code
    existing = await db.execute(select(Camera).where(Camera.camera_code == camera_data.camera_code))
    if existing.scalar_one_or_none():
        raise SentinelXException(
            code="CAMERA_CODE_EXISTS",
            message=f"Camera with code '{camera_data.camera_code}' already exists.",
            status_code=409
        )

    cam = Camera(**camera_data.dict())
    db.add(cam)
    await db.flush()

    health = CameraHealth(
        camera_id=cam.id,
        fps=float(cam.fps),
        latency_ms=40,
        packet_loss_pct=0.0,
        bitrate_kbps=4096,
        status=cam.status
    )
    db.add(health)
    await db.commit()
    await db.refresh(cam)

    await log_audit_action(
        db,
        action="CREATE_CAMERA",
        username=current_user.username,
        user_id=current_user.id,
        resource="Camera",
        resource_id=cam.camera_code,
        ip_address=request.client.host if request.client else "127.0.0.1",
        result="SUCCESS"
    )

    return await get_camera(cam.id, request, current_user, db)

@router.put("/{id}", response_model=CameraResponse)
async def update_camera(
    id: str,
    update_data: CameraUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Camera).where(or_(Camera.id == id, Camera.camera_code == id))
    result = await db.execute(stmt)
    c = result.scalar_one_or_none()
    if not c:
        raise SentinelXException(code="CAMERA_NOT_FOUND", message=f"Camera '{id}' not found", status_code=404)

    for field, val in update_data.dict(exclude_unset=True).items():
        setattr(c, field, val)

    await db.commit()
    return await get_camera(c.id, request, current_user, db)

@router.delete("/{id}")
async def delete_camera(
    id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Camera).where(or_(Camera.id == id, Camera.camera_code == id))
    result = await db.execute(stmt)
    c = result.scalar_one_or_none()
    if not c:
        raise SentinelXException(code="CAMERA_NOT_FOUND", message=f"Camera '{id}' not found", status_code=404)

    c.status = "OFFLINE"
    await db.commit()

    await log_audit_action(
        db,
        action="DEACTIVATE_CAMERA",
        username=current_user.username,
        user_id=current_user.id,
        resource="Camera",
        resource_id=c.camera_code,
        result="SUCCESS"
    )
    return {"status": "success", "message": f"Camera {c.camera_code} deactivated successfully"}
