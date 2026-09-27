import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_number = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    officer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    officer_name = Column(String(100), nullable=False)
    priority = Column(String(20), default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default="OPEN", index=True)  # OPEN, IN_PROGRESS, REVIEW, CLOSED
    target_plates = Column(String(255), nullable=True)  # Comma-separated plate numbers
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    evidence = relationship("InvestigationEvidence", back_populates="investigation", cascade="all, delete-orphan")
    notes = relationship("InvestigationNote", back_populates="investigation", cascade="all, delete-orphan")

class InvestigationEvidence(Base):
    __tablename__ = "investigation_evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False, index=True)
    evidence_type = Column(String(50), default="SNAPSHOT")  # SNAPSHOT, VIDEO_CLIP, ANPR_REPORT, ROUTE_MAP
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String(255), nullable=False)
    camera_id = Column(String(36), nullable=True)
    detection_id = Column(String(36), nullable=True)
    captured_at = Column(DateTime, default=datetime.utcnow)
    chain_of_custody = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="evidence")

class InvestigationNote(Base):
    __tablename__ = "investigation_notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False, index=True)
    author_name = Column(String(100), nullable=False)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="notes")
