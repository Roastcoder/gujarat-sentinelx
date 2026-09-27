from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class AlertCreate(BaseModel):
    alert_type: str = "WATCHLIST_MATCH"
    priority: str = "HIGH"
    title: str
    description: Optional[str] = None
    camera_id: str
    vehicle_detection_id: Optional[str] = None
    watchlist_id: Optional[str] = None
    plate_number: Optional[str] = None

class AlertAcknowledgeRequest(BaseModel):
    notes: Optional[str] = "Acknowledged by Control Room Officer"

class AlertResponse(BaseModel):
    id: str
    alert_type: str
    priority: str
    title: str
    description: Optional[str] = None
    camera_id: str
    camera_code: Optional[str] = None
    camera_name: Optional[str] = None
    district_name: Optional[str] = None
    vehicle_detection_id: Optional[str] = None
    watchlist_id: Optional[str] = None
    plate_number: Optional[str] = None
    status: str
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AlertListResponse(BaseModel):
    total: int
    unacknowledged: int
    items: List[AlertResponse]
