from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class ComponentHealth(BaseModel):
    name: str
    status: str  # HEALTHY, DEGRADED, UNHEALTHY
    latency_ms: int
    details: str
    is_simulated: bool = False

class SystemHealthResponse(BaseModel):
    overall_status: str
    total_components: int
    healthy_components: int
    uptime_seconds: int
    camera_availability_pct: float
    total_cameras: int
    online_cameras: int
    components: List[ComponentHealth]
    timestamp: datetime
