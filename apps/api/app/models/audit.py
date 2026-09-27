import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True)
    username = Column(String(100), nullable=False, default="System Operator")
    action = Column(String(50), nullable=False, index=True)
    resource = Column(String(100), nullable=True)
    resource_id = Column(String(100), nullable=True)
    case_id = Column(String(100), nullable=True)
    ip_address = Column(String(50), nullable=True, default="127.0.0.1")
    user_agent = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)
    result = Column(String(20), default="SUCCESS")  # SUCCESS, DENIED, FAILED
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
