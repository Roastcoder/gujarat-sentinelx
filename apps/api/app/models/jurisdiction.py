import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cameras = relationship("Camera", back_populates="department")

class District(Base):
    __tablename__ = "districts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    state = Column(String(50), default="Gujarat")
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    police_stations = relationship("PoliceStation", back_populates="district")
    cameras = relationship("Camera", back_populates="district")

class PoliceStation(Base):
    __tablename__ = "police_stations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    district_id = Column(String(36), ForeignKey("districts.id"), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    contact_number = Column(String(50), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    district = relationship("District", back_populates="police_stations")
    cameras = relationship("Camera", back_populates="police_station")
