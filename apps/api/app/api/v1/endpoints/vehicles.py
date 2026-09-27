from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.event import VehicleDetection
from app.models.camera import Camera
from app.models.jurisdiction import District
from app.models.user import User
from app.schemas.vehicle import (
    VehicleIntelligenceResponse,
    VehicleDetectionItem,
    VehicleTimelineItem,
    VahanDetails,
    VehicleChallanResponse,
)
from app.schemas.gis import VehicleRouteResponse
from app.services.journey_service import reconstruct_vehicle_journey, generate_vehicle_route_geojson
from app.api.v1.endpoints.auth import get_current_user
from app.services.audit_service import log_audit_action
from app.integrations.vahan.surepass import surepass_service

router = APIRouter()

@router.get("", response_model=List[VehicleDetectionItem])
async def search_vehicles(
    plate: Optional[str] = None,
    camera_id: Optional[str] = None,
    district: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    vehicle_color: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    request: Request = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(VehicleDetection)
        .options(
            selectinload(VehicleDetection.camera).selectinload(Camera.district)
        )
    )

    if plate:
        clean = plate.replace("-", "").replace(" ", "").upper()
        query = query.where(VehicleDetection.plate_number.ilike(f"%{clean}%"))
    if camera_id:
        query = query.where(VehicleDetection.camera_id == camera_id)
    if vehicle_type:
        query = query.where(VehicleDetection.vehicle_type.ilike(f"%{vehicle_type}%"))
    if vehicle_color:
        query = query.where(VehicleDetection.vehicle_color.ilike(f"%{vehicle_color}%"))
    if district:
        query = query.join(Camera, VehicleDetection.camera_id == Camera.id)\
                     .join(District, Camera.district_id == District.id)\
                     .where(District.name.ilike(f"%{district}%"))

    stmt = query.order_by(VehicleDetection.timestamp.desc()).limit(limit)
    result = await db.execute(stmt)
    dets = result.scalars().all()

    if plate:
        await log_audit_action(
            db,
            action="SEARCH_VEHICLE",
            username=current_user.username,
            user_id=current_user.id,
            resource="Vehicle",
            resource_id=plate,
            ip_address=request.client.host if request.client else "127.0.0.1",
            result="SUCCESS",
            details=f"Searched for plate '{plate}', returned {len(dets)} detections"
        )

    items = []
    for d in dets:
        items.append(
            VehicleDetectionItem(
                id=d.id,
                camera_id=d.camera_id,
                camera_code=d.camera.camera_code if d.camera else "CAM-UNK",
                camera_name=d.camera.name if d.camera else "Unknown",
                district_name=d.camera.district.name if d.camera and d.camera.district else "Gujarat",
                timestamp=d.timestamp,
                tracking_id=d.tracking_id,
                plate_number=d.plate_number,
                plate_confidence=d.plate_confidence,
                vehicle_type=d.vehicle_type,
                vehicle_color=d.vehicle_color,
                latitude=d.latitude,
                longitude=d.longitude,
                speed_kmh=d.speed_kmh,
                heading=d.heading,
                snapshot_url=d.snapshot_url,
                video_reference=d.video_reference,
                is_flagged=d.is_flagged
            )
        )
    return items

@router.get("/{plate}", response_model=VehicleIntelligenceResponse)
async def get_vehicle_intelligence(
    plate: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    intel = await reconstruct_vehicle_journey(db, plate)

    # Enrich with Surepass VAHAN 4.0 government registration details
    try:
        rc_data = await surepass_service.get_rc_details(plate)
        if rc_data:
            intel.vahan_details = VahanDetails(**rc_data)
    except Exception as e:
        # Never break primary investigation view if external API has network hiccup
        pass

    await log_audit_action(
        db,
        action="VIEW_VEHICLE",
        username=current_user.username,
        user_id=current_user.id,
        resource="VehicleJourney",
        resource_id=plate,
        ip_address=request.client.host if request.client else "127.0.0.1",
        result="SUCCESS",
        details=f"Viewed vehicle intelligence and cross-camera journey for '{plate}'"
    )

    return intel

@router.get("/{plate}/vahan", response_model=VahanDetails)
async def get_vehicle_vahan_details(
    plate: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Direct endpoint to query official VAHAN 4.0 RC details via Surepass integration.
    """
    rc_data = await surepass_service.get_rc_details(plate)
    
    await log_audit_action(
        db,
        action="QUERY_VAHAN_RC",
        username=current_user.username,
        user_id=current_user.id,
        resource="VahanRegistry",
        resource_id=plate,
        ip_address=request.client.host if request.client else "127.0.0.1",
        result="SUCCESS",
        details=f"Queried official Surepass VAHAN 4.0 RC registry for vehicle '{plate}'"
    )
    
    return VahanDetails(**rc_data)

@router.get("/{plate}/timeline", response_model=List[VehicleTimelineItem])
async def get_vehicle_timeline(
    plate: str,
    db: AsyncSession = Depends(get_db)
):
    intel = await reconstruct_vehicle_journey(db, plate)
    return intel.timeline

@router.get("/{plate}/route", response_model=VehicleRouteResponse)
async def get_vehicle_route_endpoint(
    plate: str,
    db: AsyncSession = Depends(get_db)
):
    return await generate_vehicle_route_geojson(db, plate)

@router.get("/{plate}/challans", response_model=VehicleChallanResponse)
async def get_vehicle_challan_details(
    plate: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Query Gujarat Traffic Police e-Challan records and traffic violation history for a vehicle.
    """
    challan_data = await surepass_service.get_challan_details(plate)

    await log_audit_action(
        db,
        action="QUERY_ECHALLAN",
        username=current_user.username,
        user_id=current_user.id,
        resource="ChallanRegistry",
        resource_id=plate,
        ip_address=request.client.host if request.client else "127.0.0.1",
        result="SUCCESS",
        details=f"Queried Gujarat e-Challan records for vehicle '{plate}', found {challan_data.get('total_challans', 0)} notices"
    )

    return VehicleChallanResponse(**challan_data)

