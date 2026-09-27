import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.camera import Camera
from app.models.event import VehicleDetection, ANPRDetection, CameraEvent
from app.models.alert import Alert
from app.models.watchlist import WatchlistVehicle, Watchlist
from app.api.websocket import ws_manager
from app.services.alert_service import check_watchlist_and_alert
from app.services.audit_service import log_audit_action

router = APIRouter()

@router.post("/trigger")
async def trigger_demo_scenario(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Executes the deterministic primary hackathon demo scenario for vehicle GJ01AB1234:
    - Simulates sequential cross-camera tracking across Ahmedabad and Gandhinagar corridors
    - Fires ANPR events
    - Triggers watchlist match
    - Broadcasts live WebSocket alerts
    """
    plate_number = "GJ01AB1234"
    
    # 7-Camera Waypoint stops
    journey_codes = [
        ("CAM-AHM-001", "SG Hwy - Iscon Crossroad Junction", 48.0, 0.974),
        ("CAM-AHM-004", "SG Hwy - Pakwan Dining Junction", 52.5, 0.968),
        ("CAM-AHM-009", "SG Hwy - Thaltej Underpass North Exit", 61.2, 0.981),
        ("CAM-AHM-014", "SG Hwy - Vaishnodevi Circle Intersect", 65.0, 0.979),
        ("CAM-GND-021", "Ahmedabad-GND Hwy - Koba Circle Post", 58.4, 0.967),
        ("CAM-GND-028", "CH-0 Circle - Pathikashram North Post", 45.0, 0.985),
        ("CAM-GND-035", "Vidhan Sabha Marg - Sector 10 Approach", 38.2, 0.991),
    ]

    cams_res = await db.execute(select(Camera).where(Camera.camera_code.in_([c[0] for c in journey_codes])))
    cams_dict = {c.camera_code: c for c in cams_res.scalars().all()}

    now = datetime.utcnow()
    dispatched_events = []

    for idx, (code, name, speed, conf) in enumerate(journey_codes):
        cam = cams_dict.get(code)
        if not cam:
            continue
        
        event_time = now - timedelta(minutes=(len(journey_codes) - idx) * 3)
        
        # Broadcast real-time detection via WebSocket
        await ws_manager.broadcast("vehicle.detected", {
            "camera_code": code,
            "camera_name": name,
            "plate_number": plate_number,
            "speed_kmh": speed,
            "confidence": conf,
            "timestamp": event_time.isoformat(),
            "step": idx + 1,
            "total_steps": len(journey_codes)
        })

        dispatched_events.append({
            "step": idx + 1,
            "camera_code": code,
            "camera_name": name,
            "speed_kmh": speed,
            "confidence": conf,
            "time": event_time.strftime("%H:%M:%S")
        })

    # Trigger Watchlist Alert at Koba Circle (Step 5)
    cam_koba = cams_dict.get("CAM-GND-021")
    if cam_koba:
        alert = await check_watchlist_and_alert(
            db=db,
            camera_id=cam_koba.id,
            plate_number=plate_number,
        )

    await log_audit_action(
        db,
        action="DEMO_TRIGGER",
        username="Command Center Lead",
        resource="DemoScenario",
        resource_id=plate_number,
        ip_address=request.client.host if request.client else "127.0.0.1",
        result="SUCCESS",
        details=f"Primary hackathon demo scenario executed for '{plate_number}' with 7 camera checkpoints"
    )

    return {
        "status": "success",
        "scenario": "Primary Hackathon Demonstration - GJ01AB1234",
        "vehicle_number": plate_number,
        "vehicle_type": "SUV (White Tata Safari)",
        "checkpoints_traversed": len(dispatched_events),
        "watchlist_match": True,
        "priority": "HIGH",
        "alert_fired": True,
        "events": dispatched_events,
        "message": "Demo scenario completed successfully. Route and live alert broadcasted to Command Center."
    }
