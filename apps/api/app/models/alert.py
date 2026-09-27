import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_type = Column(String(50), nullable=False, default="WATCHLIST_MATCH", index=True)
    priority = Column(String(20), nullable=False, default="HIGH", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    
    camera_id = Column(String(36), ForeignKey("cameras.id"), nullable=False, index=True)
    vehicle_detection_id = Column(String(36), ForeignKey("vehicle_detections.id"), nullable=True)
    watchlist_id = Column(String(36), ForeignKey("watchlists.id"), nullable=True)
    plate_number = Column(String(20), nullable=True, index=True)
    
    status = Column(String(20), default="NEW", index=True)  # NEW, ACKNOWLEDGED, RESOLVED, DISMISSED
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    detection = relationship("VehicleDetection", back_populates="alerts")
    watchlist = relationship("Watchlist", back_populates="alerts")
