import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    DEMO_MODE: bool = True
    APP_NAME: str = "Gujarat SentinelX"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = "cctv-sentinelx-gujarat-gov-hackathon-2026-secure-key-32b"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./sentinelx.db"
    DATABASE_SYNC_URL: str = "sqlite:///./sentinelx.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Kafka
    KAFKA_BROKERS: str = "localhost:9092"
    KAFKA_TOPIC_DETECTIONS: str = "cctv.detections.vehicle"
    KAFKA_TOPIC_ANPR: str = "cctv.anpr.events"
    KAFKA_TOPIC_ALERTS: str = "cctv.alerts.priority"
    
    # OpenSearch
    OPENSEARCH_URL: str = "http://localhost:9200"
    OPENSEARCH_USER: str = "admin"
    OPENSEARCH_PASSWORD: str = "admin"
    
    # ClickHouse
    CLICKHOUSE_URL: str = "http://localhost:8123"
    
    # S3 / Evidence Storage
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "sentinelx-evidence"
    STORAGE_PATH: str = "./storage/evidence"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]

    # Surepass Government VAHAN / RC / e-Challan / Aadhaar Integration
    SUREPASS_API_TOKEN: Optional[str] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc3NTkxMzI1MiwianRpIjoiNDE0NjczMzAtNGE5OC00ZTI1LTkxYmYtNjc5MDNmNGM2NGYyIiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2Lm1laGFyYWR2aXNvcnlAc3VyZXBhc3MuaW8iLCJuYmYiOjE3NzU5MTMyNTIsImV4cCI6MjQwNjYzMzI1MiwiZW1haWwiOiJtZWhhcmFkdmlzb3J5QHN1cmVwYXNzLmlvIiwidGVuYW50X2lkIjoibWFpbiIsInVzZXJfY2xhaW1zIjp7InNjb3BlcyI6WyJ1c2VyIl19fQ.BSk7zSY6QlYLNP70-njpSs-mg6YifiRef0o5OoQ9aVI"
    SUREPASS_RC_FULL_URL: str = "https://kyc-api.surepass.io/api/v1/rc/rc-full"
    SUREPASS_RC_FULL_SECONDARY_URL: str = "https://kyc-api.surepass.app/api/v1/rc/rc-full"
    SUREPASS_AADHAAR_URL: str = "https://kyc-api.surepass.io/api/v1/aadhaar-validation/aadhaar-validation"
    SUREPASS_CHALLAN_URL: str = "https://kyc-api.surepass.app/api/v1/rc/rc-related/challan-details"

    # Sentinel Camera Grid Integration (cctv.corp8.cloud & 103.250.160.189)
    SENTINEL_GRID_EMAIL: str = "cybersachinyadav@gmail.com"
    SENTINEL_GRID_PASSWORD: str = "A2ZV-8SLH-T9NF"
    SENTINEL_GRID_HOST: str = "103.250.160.189"
    SENTINEL_GRID_RTSP_PORT: int = 8554
    SENTINEL_GRID_WHEP_PORT: int = 8889
    SENTINEL_GRID_CDN: str = "https://cctv.corp8.cloud"

    # Authoritative Camera Discovery & Stream Ingest (Sections 4, 5, 6, 11)
    INGEST_CATALOGUE_URL: str = "http://localhost:8000/api/ingest"
    CATALOGUE_REFRESH_INTERVAL_SECONDS: int = 45
    RTSP_FORCE_TCP: bool = True
    STREAM_RECONNECT_MIN_BACKOFF: float = 2.0
    STREAM_RECONNECT_MAX_BACKOFF: float = 30.0
    STREAM_INACTIVITY_TIMEOUT_SEC: float = 120.0


    class Config:
        env_file = (".env", "../.env", "../../.env")
        case_sensitive = True
        extra = "allow"

settings = Settings()

