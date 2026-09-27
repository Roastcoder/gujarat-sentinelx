from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class VehicleDetectionItem(BaseModel):
    id: str
    camera_id: str
    camera_code: str
    camera_name: str
    district_name: Optional[str] = None
    timestamp: datetime
    tracking_id: Optional[str] = None
    plate_number: str
    plate_confidence: float
    vehicle_type: str
    vehicle_color: str
    latitude: float
    longitude: float
    speed_kmh: float
    heading: str
    snapshot_url: Optional[str] = None
    video_reference: Optional[str] = None
    is_flagged: bool

    class Config:
        from_attributes = True

class VehicleTimelineItem(BaseModel):
    time_str: str
    date_str: str
    timestamp: datetime
    camera_id: str
    camera_code: str
    camera_name: str
    district: str
    latitude: float
    longitude: float
    confidence: float
    vehicle_type: str
    vehicle_color: str
    speed_kmh: float
    snapshot_url: Optional[str] = None
    watchlist_flag: bool

class VehicleAttributes(BaseModel):
    plate_number: str
    vehicle_type: str
    vehicle_color: str
    state_code: str = "GJ"
    confidence_avg: float
    flagged: bool

class WatchlistMatchDetail(BaseModel):
    is_matched: bool
    watchlist_name: Optional[str] = None
    priority: Optional[str] = None
    reason: Optional[str] = None
    case_number: Optional[str] = None

class VahanDetails(BaseModel):
    rc_number: str
    rc_status: str
    owner_name: str
    present_address: str
    permanent_address: Optional[str] = None
    registered_at: str
    registration_date: str
    maker_description: str
    maker_model: str
    vehicle_category: str
    vehicle_chasi_number: str
    vehicle_engine_number: str
    fuel_type: str
    color: Optional[str] = None
    insurance_company: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    insurance_upto: Optional[str] = None
    pucc_number: Optional[str] = None
    pucc_upto: Optional[str] = None
    tax_upto: Optional[str] = None
    fit_up_to: Optional[str] = None
    financed: Optional[bool] = False
    financer: Optional[str] = None
    is_live_verified: bool = True
    verified_source: str = "SUREPASS_NATIONAL_VAHAN_API"
    queried_at: Optional[str] = None

class ChallanItem(BaseModel):
    challan_number: str
    date_time: str
    violation_type: str
    violation_code: str
    location: str
    camera_code: Optional[str] = None
    district: str
    speed_kmh: Optional[float] = None
    fine_amount: int
    payment_status: str  # "PENDING", "PAID", "DISPOSED_IN_LOK_ADALAT"
    payment_date: Optional[str] = None
    evidence_url: Optional[str] = None
    challan_pdf_url: Optional[str] = None
    rto_code: str

class VehicleChallanResponse(BaseModel):
    plate_number: str
    total_challans: int
    pending_challans: int
    total_pending_amount: int
    challans: List[ChallanItem]
    verified_source: str
    queried_at: str

class VehicleIntelligenceResponse(BaseModel):
    plate_number: str
    status: str  # NORMAL, WATCHLIST, ALERT
    first_seen: datetime
    last_seen: datetime
    total_detections: int
    total_cameras: int
    total_locations: int
    estimated_distance_km: float
    elapsed_time_minutes: float
    attributes: VehicleAttributes
    watchlist_status: WatchlistMatchDetail
    timeline: List[VehicleTimelineItem]
    detections: List[VehicleDetectionItem]
    vahan_details: Optional[VahanDetails] = None

class VehicleSearchQuery(BaseModel):
    plate_number: Optional[str] = None
    camera_id: Optional[str] = None
    district: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_color: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    min_confidence: Optional[float] = None
    watchlist_only: Optional[bool] = False
