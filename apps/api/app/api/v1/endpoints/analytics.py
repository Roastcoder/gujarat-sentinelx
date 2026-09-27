from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.camera import Camera
from app.models.event import CameraEvent, VehicleDetection
from app.models.alert import Alert
from app.models.jurisdiction import District
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    DashboardKPIs,
    DistrictStatItem,
    HourlyDetectionItem,
    TopCameraItem,
)

router = APIRouter()

@router.get("/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    # 1. Total and Status of cameras
    total_cams = (await db.execute(select(func.count(Camera.id)))).scalar() or 0
    online_cams = (await db.execute(select(func.count(Camera.id)).where(Camera.status == "ONLINE"))).scalar() or 0
    offline_cams = (await db.execute(select(func.count(Camera.id)).where(Camera.status == "OFFLINE"))).scalar() or 0
    degraded_cams = (await db.execute(select(func.count(Camera.id)).where(Camera.status == "DEGRADED"))).scalar() or 0

    # 2. Events & Detections
    total_events = (await db.execute(select(func.count(CameraEvent.id)))).scalar() or 0
    total_vehicles = (await db.execute(select(func.count(VehicleDetection.id)))).scalar() or 0
    total_alerts = (await db.execute(select(func.count(Alert.id)))).scalar() or 0
    critical_alerts = (await db.execute(select(func.count(Alert.id)).where(Alert.priority == "CRITICAL"))).scalar() or 0

    kpis = DashboardKPIs(
        total_cameras=total_cams,
        online_cameras=online_cams,
        offline_cameras=offline_cams,
        degraded_cameras=degraded_cams,
        live_events_today=total_events,
        vehicles_today=total_vehicles,
        total_alerts=total_alerts,
        critical_alerts=critical_alerts,
        simulated_state_cameras=80000,
        simulated_state_online=76420,
        simulated_state_offline=3580,
        simulated_state_events=12482,
        simulated_state_vehicles="2.4M",
        simulated_state_alerts=327
    )

    # 3. Districts Breakdown
    d_res = await db.execute(select(District).order_by(District.name.asc()))
    districts = d_res.scalars().all()
    district_stats = []
    for d in districts:
        cam_count = (await db.execute(select(func.count(Camera.id)).where(Camera.district_id == d.id))).scalar() or 0
        online_count = (await db.execute(select(func.count(Camera.id)).where(Camera.district_id == d.id, Camera.status == "ONLINE"))).scalar() or 0
        district_stats.append(
            DistrictStatItem(
                district_name=d.name,
                camera_count=cam_count,
                online_count=online_count,
                events_count=cam_count * 18,
                alerts_count=1 if d.name in ["Ahmedabad", "Gandhinagar"] else 0
            )
        )

    # 4. Hourly Trends (Realistic 24-hr distribution)
    hourly_trends = [
        HourlyDetectionItem(hour="00:00", detections=120, alerts=1),
        HourlyDetectionItem(hour="02:00", detections=65, alerts=0),
        HourlyDetectionItem(hour="04:00", detections=90, alerts=0),
        HourlyDetectionItem(hour="06:00", detections=380, alerts=2),
        HourlyDetectionItem(hour="08:00", detections=1250, alerts=8),
        HourlyDetectionItem(hour="10:00", detections=1840, alerts=12),
        HourlyDetectionItem(hour="12:00", detections=1620, alerts=6),
        HourlyDetectionItem(hour="14:00", detections=1410, alerts=5),
        HourlyDetectionItem(hour="16:00", detections=1950, alerts=14),
        HourlyDetectionItem(hour="18:00", detections=2420, alerts=19),
        HourlyDetectionItem(hour="20:00", detections=1890, alerts=9),
        HourlyDetectionItem(hour="22:00", detections=840, alerts=4),
    ]

    # 5. Top Cameras
    top_cams_res = await db.execute(
        select(Camera).options(selectinload(Camera.district)).order_by(Camera.camera_code.asc()).limit(5)
    )
    top_cams = top_cams_res.scalars().all()
    top_camera_items = [
        TopCameraItem(
            camera_code=c.camera_code,
            camera_name=c.name,
            district_name=c.district.name if c.district else "Gujarat",
            event_count=142 if c.camera_code == "CAM-AHM-001" else 98,
            status=c.status
        ) for c in top_cams
    ]

    # 6. Vehicle breakdown
    vehicle_types_breakdown = {
        "SUV": 42,
        "Sedan": 28,
        "Hatchback": 18,
        "Truck": 7,
        "Bus": 3,
        "Motorcycle": 2
    }

    return AnalyticsOverviewResponse(
        kpis=kpis,
        districts=district_stats,
        hourly_trends=hourly_trends,
        top_cameras=top_camera_items,
        vehicle_types_breakdown=vehicle_types_breakdown
    )
