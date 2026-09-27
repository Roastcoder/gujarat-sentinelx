import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class CameraEvent(Base):
    __tablename__ = "camera_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    camera_id = Column(String(36), ForeignKey("cameras.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    event_type = Column(String(50), nullable=False, index=True)  # VEHICLE_DETECTED, ANPR_DETECTED, WATCHLIST_MATCH, CAMERA_OFFLINE, VMS_DISCONNECTED, SYSTEM_ALERT
    object_type = Column(String(50), default="vehicle")
    confidence = Column(Float, default=0.95)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_reference = Column(String(255), nullable=True)
    video_reference = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class VehicleDetection(Base):
    __tablename__ = "vehicle_detections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    camera_id = Column(String(36), ForeignKey("cameras.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    tracking_id = Column(String(50), nullable=True, index=True)
    plate_number = Column(String(20), nullable=False, index=True)
    plate_confidence = Column(Float, default=0.96)
    vehicle_type = Column(String(50), default="SUV")  # Sedan, SUV, Hatchback, Truck, Bus, Motorcycle, Auto
    vehicle_color = Column(String(30), default="White")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=45.0)
    heading = Column(String(10), default="North")
    snapshot_url = Column(String(255), nullable=True)
    video_reference = Column(String(255), nullable=True)
    is_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    camera = relationship("Camera", back_populates="vehicle_detections")
    alerts = relationship("Alert", back_populates="detection", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_vehicle_plate_time", "plate_number", "timestamp"),
        Index("idx_vehicle_camera_time", "camera_id", "timestamp"),
    )

class ANPRDetection(Base):
    __tablename__ = "anpr_detections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    detection_id = Column(String(36), ForeignKey("vehicle_detections.id"), nullable=True)
    camera_id = Column(String(36), ForeignKey("cameras.id"), nullable=False, index=True)
    plate_number = Column(String(20), nullable=False, index=True)
    confidence = Column(Float, default=0.967)
    state_code = Column(String(10), default="GJ")
    raw_text = Column(String(50), nullable=False)
    verified = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
