import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(String(255), nullable=True)
    priority = Column(String(20), default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    category = Column(String(50), default="WANTED")  # STOLEN, WANTED, SUSPICIOUS, TRAFFIC_OFFENDER, VIP
    is_active = Column(Boolean, default=True)
    created_by = Column(String(100), default="State Command Center")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicles = relationship("WatchlistVehicle", back_populates="watchlist", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="watchlist")

class WatchlistVehicle(Base):
    __tablename__ = "watchlist_vehicles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    watchlist_id = Column(String(36), ForeignKey("watchlists.id"), nullable=False, index=True)
    plate_number = Column(String(20), nullable=False, index=True)
    reason = Column(String(255), nullable=False)
    case_number = Column(String(100), nullable=True)
    priority = Column(String(20), default="HIGH")
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    watchlist = relationship("Watchlist", back_populates="vehicles")
