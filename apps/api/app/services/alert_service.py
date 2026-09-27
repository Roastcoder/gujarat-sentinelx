from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.watchlist import WatchlistVehicle, Watchlist
from app.models.alert import Alert
from app.models.camera import Camera
from app.api.websocket import ws_manager
from app.core.logging import logger

async def check_watchlist_and_alert(
    db: AsyncSession,
    camera_id: str,
    plate_number: str,
    detection_id: Optional[str] = None
) -> Optional[Alert]:
    try:
        # Normalize plate search (remove spaces/dashes)
        clean_plate = plate_number.replace("-", "").replace(" ", "").upper()
        
        # Check active watchlist vehicles
        stmt = (
            select(WatchlistVehicle, Watchlist)
            .join(Watchlist, WatchlistVehicle.watchlist_id == Watchlist.id)
            .where(
                WatchlistVehicle.is_active == True,
                Watchlist.is_active == True
            )
        )
        result = await db.execute(stmt)
        matched_pair = None
        for wv, wl in result.all():
            target_clean = wv.plate_number.replace("-", "").replace(" ", "").upper()
            if target_clean == clean_plate:
                matched_pair = (wv, wl)
                break
                
        if not matched_pair:
            return None

        wv, wl = matched_pair
        
        # Camera info
        cam_result = await db.execute(select(Camera).where(Camera.id == camera_id))
        camera = cam_result.scalar_one_or_none()
        cam_name = camera.name if camera else "CCTV Camera"
        cam_code = camera.camera_code if camera else camera_id

        alert = Alert(
            alert_type="WATCHLIST_MATCH",
            priority=wv.priority or wl.priority or "HIGH",
            title=f"WATCHLIST MATCH: {plate_number}",
            description=f"Flagged vehicle {plate_number} detected at {cam_name} ({cam_code}). Reason: {wv.reason}",
            camera_id=camera_id,
            vehicle_detection_id=detection_id,
            watchlist_id=wl.id,
            plate_number=plate_number,
            status="NEW",
            created_at=datetime.utcnow()
        )
        db.add(alert)
        await db.commit()
        await db.refresh(alert)

        # Broadcast via WebSocket
        await ws_manager.broadcast("alert.created", {
            "id": alert.id,
            "type": alert.alert_type,
            "priority": alert.priority,
            "vehicle": plate_number,
            "camera_code": cam_code,
            "camera_name": cam_name,
            "reason": wv.reason,
            "timestamp": alert.created_at.isoformat()
        })
        logger.warning(f"ALERT CREATED: Vehicle {plate_number} matched watchlist '{wl.name}' at camera {cam_code}")
        return alert
    except Exception as e:
        logger.error(f"Error checking watchlist: {e}")
        return None
