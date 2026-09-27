from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class CameraBase(BaseModel):
    camera_code: str
    name: str
    department_id: Optional[str] = None
    district_id: str
    police_station_id: Optional[str] = None
    zone: Optional[str] = None
    latitude: float
    longitude: float
    vendor: str = "Hikvision"
    model: Optional[str] = "DS-2CD7A26G0/P-IZHS"
    vms: str = "Milestone XProtect"
    protocol: str = "RTSP"
    stream_url: Optional[str] = None
    resolution: str = "1080p"
    fps: int = 25
    ptz_support: bool = False
    anpr_enabled: bool = True
    audio_enabled: bool = False
    night_vision: bool = True
    status: str = "ONLINE"
    retention_period: int = 30

    # Stream Specs (Section 33)
    location: Optional[str] = None
    codec: str = "H.264"
    width: int = 1920
    height: int = 1080
    fps_declared: float = 25.0
    bitrate: int = 4096
    rtsp_url: Optional[str] = None
    webrtc_url: Optional[str] = None
    hls_url: Optional[str] = None
    vms_id: Optional[str] = None
    connection_state: str = "ONLINE"
    last_catalogue_sync: Optional[datetime] = None
    last_frame_at: Optional[datetime] = None
    last_pts: Optional[float] = None

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    vendor: Optional[str] = None
    model: Optional[str] = None
    vms: Optional[str] = None
    protocol: Optional[str] = None
    stream_url: Optional[str] = None
    resolution: Optional[str] = None
    fps: Optional[int] = None
    ptz_support: Optional[bool] = None
    anpr_enabled: Optional[bool] = None
    audio_enabled: Optional[bool] = None
    night_vision: Optional[bool] = None
    status: Optional[str] = None
    retention_period: Optional[int] = None
    codec: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    rtsp_url: Optional[str] = None
    webrtc_url: Optional[str] = None
    hls_url: Optional[str] = None
    connection_state: Optional[str] = None

class CameraHealthResponse(BaseModel):
    fps: float
    measured_fps: float = 25.0
    latency_ms: int
    packet_loss_pct: float
    bitrate_kbps: int
    frames_received: int = 0
    frames_decoded: int = 0
    decode_errors: int = 0
    reconnect_count: int = 0
    current_backoff_sec: float = 0.0
    codec: str = "H.264"
    resolution: str = "1080p"
    last_error: Optional[str] = None
    last_heartbeat: datetime
    status: str

    class Config:
        from_attributes = True

class CameraResponse(CameraBase):
    id: str
    district_name: Optional[str] = None
    department_name: Optional[str] = None
    police_station_name: Optional[str] = None
    health: Optional[CameraHealthResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CameraListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[CameraResponse]

# Authoritative Camera Catalogue Schema for /api/ingest (Section 5)
class CameraIngestItem(BaseModel):
    camera_id: str
    name: str
    location: str
    latitude: float
    longitude: float
    codec: str = "H.264"  # H.264 or H.265
    live_status: str = "ONLINE"
    width: int = 1920
    height: int = 1080
    fps_declared: float = 25.0
    bitrate: Optional[int] = 4096
    rtsp_url: str
    webrtc_url: Optional[str] = None
    hls_url: Optional[str] = None
    vms_id: Optional[str] = "Sentinel-VMS"
    department: Optional[str] = "Home Department"
    district: Optional[str] = "Ahmedabad"

class CameraCatalogueResponse(BaseModel):
    total: int
    timestamp: datetime
    cameras: List[CameraIngestItem]

class StreamSessionItem(BaseModel):
    camera_code: str
    camera_name: str
    rtsp_url: str
    codec: str
    resolution: str
    connection_state: str  # DISCOVERED, CONNECTING, ONLINE, DEGRADED, OFFLINE, RECONNECTING, REMOVED
    ref_count: int
    last_pts: Optional[float] = None
    frames_received: int
    frames_decoded: int
    decode_errors: int
    reconnect_count: int
    current_backoff_sec: float
    measured_fps: float
    last_error: Optional[str] = None
    uptime_seconds: float

