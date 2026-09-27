from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class WatchlistVehicleAdd(BaseModel):
    plate_number: str
    reason: str
    case_number: Optional[str] = None
    priority: str = "HIGH"
    notes: Optional[str] = None
    expires_at: Optional[datetime] = None

class WatchlistVehicleResponse(BaseModel):
    id: str
    watchlist_id: str
    plate_number: str
    reason: str
    case_number: Optional[str] = None
    priority: str
    notes: Optional[str] = None
    is_active: bool
    added_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WatchlistCreate(BaseModel):
    name: str
    description: Optional[str] = None
    priority: str = "HIGH"
    category: str = "WANTED"

class WatchlistResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    priority: str
    category: str
    is_active: bool
    created_by: str
    vehicle_count: int = 0
    vehicles: List[WatchlistVehicleResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
