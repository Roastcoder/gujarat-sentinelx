import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Float, Text
from app.core.database import Base

class SystemHealthMetric(Base):
    __tablename__ = "system_health"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    component = Column(String(50), nullable=False, index=True)  # DATABASE, REDIS, KAFKA, OPENSEARCH, CLICKHOUSE, STORAGE, AI_WORKERS, CAMERAS
    status = Column(String(20), nullable=False, default="HEALTHY")  # HEALTHY, DEGRADED, UNHEALTHY
    latency_ms = Column(Integer, default=5)
    details = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=datetime.utcnow, index=True)
