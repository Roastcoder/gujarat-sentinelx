from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class CameraEventCreate(BaseModel):
    camera_id: str
    event_type: str
    object_type: str = "vehicle"
    confidence: float = 0.95
    latitude: float
    longitude: float
    image_reference: Optional[str] = None
    video_reference: Optional[str] = None
    metadata_json: Optional[str] = None

class CameraEventResponse(BaseModel):
    id: str
    camera_id: str
    camera_code: Optional[str] = None
    camera_name: Optional[str] = None
    district_name: Optional[str] = None
    timestamp: datetime
    event_type: str
    object_type: str
    confidence: float
    latitude: float
    longitude: float
    image_reference: Optional[str] = None
    video_reference: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class EventListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[CameraEventResponse]
