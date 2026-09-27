from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DashboardKPIs(BaseModel):
    total_cameras: int
    online_cameras: int
    offline_cameras: int
    degraded_cameras: int
    live_events_today: int
    vehicles_today: int
    total_alerts: int
    critical_alerts: int
    simulated_state_cameras: int = 80000
    simulated_state_online: int = 76420
    simulated_state_offline: int = 3580
    simulated_state_events: int = 12482
    simulated_state_vehicles: str = "2.4M"
    simulated_state_alerts: int = 327

class DistrictStatItem(BaseModel):
    district_name: str
    camera_count: int
    online_count: int
    events_count: int
    alerts_count: int

class HourlyDetectionItem(BaseModel):
    hour: str
    detections: int
    alerts: int

class TopCameraItem(BaseModel):
    camera_code: str
    camera_name: str
    district_name: str
    event_count: int
    status: str

class AnalyticsOverviewResponse(BaseModel):
    kpis: DashboardKPIs
    districts: List[DistrictStatItem]
    hourly_trends: List[HourlyDetectionItem]
    top_cameras: List[TopCameraItem]
    vehicle_types_breakdown: Dict[str, int]
