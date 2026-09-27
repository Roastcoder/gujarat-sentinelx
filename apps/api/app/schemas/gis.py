from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class GeoJSONGeometry(BaseModel):
    type: str  # "Point", "LineString"
    coordinates: Any  # [lng, lat] or [[lng, lat], ...]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

class RouteWaypoint(BaseModel):
    camera_id: str
    camera_code: str
    camera_name: str
    timestamp: str
    latitude: float
    longitude: float
    plate_number: str
    confidence: float
    speed_kmh: float
    snapshot_url: Optional[str] = None
    step_number: int

class VehicleRouteResponse(BaseModel):
    plate_number: str
    waypoints: List[RouteWaypoint]
    geojson: GeoJSONFeatureCollection
    total_cameras: int
    total_detections: int
    first_seen: str
    last_seen: str
    estimated_distance_km: float
    elapsed_time_minutes: float
