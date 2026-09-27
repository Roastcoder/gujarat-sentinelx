import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    camera_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=True)
    district_id = Column(String(36), ForeignKey("districts.id"), nullable=False, index=True)
    police_station_id = Column(String(36), ForeignKey("police_stations.id"), nullable=True)
    zone = Column(String(50), nullable=True)
    
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    
    vendor = Column(String(50), nullable=False, default="Hikvision")
    model = Column(String(100), nullable=True)
    vms = Column(String(50), nullable=False, default="Milestone XProtect")
    protocol = Column(String(20), nullable=False, default="RTSP")
    stream_url = Column(String(255), nullable=True)
    resolution = Column(String(20), default="1080p")
    fps = Column(Integer, default=25)
    
    ptz_support = Column(Boolean, default=False)
    anpr_enabled = Column(Boolean, default=True)
    audio_enabled = Column(Boolean, default=False)
    night_vision = Column(Boolean, default=True)
    
    # Technical Stream Specifications (Section 33)
    location = Column(String(255), nullable=True)
    codec = Column(String(20), default="H.264")  # H.264, H.265
    width = Column(Integer, default=1920)
    height = Column(Integer, default=1080)
    fps_declared = Column(Float, default=25.0)
    bitrate = Column(Integer, default=4096)
    
    rtsp_url = Column(String(500), nullable=True)
    webrtc_url = Column(String(500), nullable=True)
    hls_url = Column(String(500), nullable=True)
    
    vms_id = Column(String(50), nullable=True)
    
    last_catalogue_sync = Column(DateTime, nullable=True)
    last_frame_at = Column(DateTime, nullable=True)
    last_pts = Column(Float, nullable=True)  # in milliseconds
    
    # Lifecycle States: DISCOVERED, CONNECTING, ONLINE, DEGRADED, OFFLINE, RECONNECTING, REMOVED
    connection_state = Column(String(30), default="ONLINE", index=True)

    status = Column(String(20), default="ONLINE", index=True)  # ONLINE, OFFLINE, DEGRADED, UNKNOWN
    installation_date = Column(DateTime, default=datetime.utcnow)
    retention_period = Column(Integer, default=30)  # days
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="cameras")
    district = relationship("District", back_populates="cameras")
    police_station = relationship("PoliceStation", back_populates="cameras")
    health = relationship("CameraHealth", back_populates="camera", uselist=False, cascade="all, delete-orphan")
    vehicle_detections = relationship("VehicleDetection", back_populates="camera", cascade="all, delete-orphan")

class CameraHealth(Base):
    __tablename__ = "camera_health"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    camera_id = Column(String(36), ForeignKey("cameras.id"), unique=True, nullable=False)
    fps = Column(Float, default=25.0)
    measured_fps = Column(Float, default=25.0)
    latency_ms = Column(Integer, default=45)
    packet_loss_pct = Column(Float, default=0.0)
    bitrate_kbps = Column(Integer, default=4096)
    
    frames_received = Column(Integer, default=0)
    frames_decoded = Column(Integer, default=0)
    decode_errors = Column(Integer, default=0)
    reconnect_count = Column(Integer, default=0)
    current_backoff_sec = Column(Float, default=0.0)
    codec = Column(String(20), default="H.264")
    resolution = Column(String(20), default="1080p")
    last_error = Column(Text, nullable=True)
    
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="ONLINE")

    camera = relationship("Camera", back_populates="health")
