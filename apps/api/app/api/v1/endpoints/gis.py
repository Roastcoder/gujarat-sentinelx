from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.camera import Camera
from app.models.event import VehicleDetection
from app.schemas.gis import GeoJSONFeatureCollection, GeoJSONFeature, GeoJSONGeometry, VehicleRouteResponse
from app.services.journey_service import generate_vehicle_route_geojson

router = APIRouter()

@router.get("/cameras", response_model=GeoJSONFeatureCollection)
async def get_gis_cameras(
    district: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Camera).options(selectinload(Camera.district), selectinload(Camera.health))
    if status:
        query = query.where(Camera.status == status.upper())
    result = await db.execute(query)
    cameras = result.scalars().all()

    features = []
    for c in cameras:
        if district and c.district and c.district.code.lower() != district.lower() and c.district.name.lower() != district.lower():
            continue
        features.append(
            GeoJSONFeature(
                geometry=GeoJSONGeometry(
                    type="Point",
                    coordinates=[c.longitude, c.latitude]
                ),
                properties={
                    "id": c.id,
                    "camera_code": c.camera_code,
                    "name": c.name,
                    "district": c.district.name if c.district else "Gujarat",
                    "status": c.status,
                    "vendor": c.vendor,
                    "vms": c.vms,
                    "protocol": c.protocol,
                    "stream_url": c.stream_url,
                    "anpr_enabled": c.anpr_enabled,
                    "ptz_support": c.ptz_support,
                    "fps": c.health.fps if c.health else c.fps,
                    "latency_ms": c.health.latency_ms if c.health else 45,
                }
            )
        )
    return GeoJSONFeatureCollection(features=features)

@router.get("/events", response_model=GeoJSONFeatureCollection)
async def get_gis_events(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(VehicleDetection)
        .options(selectinload(VehicleDetection.camera))
        .order_by(VehicleDetection.timestamp.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    detections = result.scalars().all()

    features = []
    for d in detections:
        features.append(
            GeoJSONFeature(
                geometry=GeoJSONGeometry(
                    type="Point",
                    coordinates=[d.longitude, d.latitude]
                ),
                properties={
                    "id": d.id,
                    "plate_number": d.plate_number,
                    "camera_code": d.camera.camera_code if d.camera else "CAM-UNK",
                    "camera_name": d.camera.name if d.camera else "Unknown",
                    "confidence": d.plate_confidence,
                    "vehicle_type": d.vehicle_type,
                    "vehicle_color": d.vehicle_color,
                    "speed_kmh": d.speed_kmh,
                    "timestamp": d.timestamp.isoformat(),
                    "snapshot_url": d.snapshot_url,
                    "is_flagged": d.is_flagged,
                }
            )
        )
    return GeoJSONFeatureCollection(features=features)

@router.get("/routes/{plate}", response_model=VehicleRouteResponse)
async def get_vehicle_route(
    plate: str,
    db: AsyncSession = Depends(get_db)
):
    return await generate_vehicle_route_geojson(db, plate)
