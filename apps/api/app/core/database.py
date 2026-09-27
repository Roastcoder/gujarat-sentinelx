from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

class Base(DeclarativeBase):
    pass

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

from sqlalchemy import text

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Self-healing migration for SQLite dev tables
        if "sqlite" in settings.DATABASE_URL:
            # Check existing columns in cameras
            res = await conn.execute(text("PRAGMA table_info(cameras)"))
            cols = [row[1] for row in res.fetchall()]
            
            missing_cam_cols = [
                ("location", "VARCHAR(255)"),
                ("codec", "VARCHAR(20) DEFAULT 'H.264'"),
                ("width", "INTEGER DEFAULT 1920"),
                ("height", "INTEGER DEFAULT 1080"),
                ("fps_declared", "FLOAT DEFAULT 25.0"),
                ("bitrate", "INTEGER DEFAULT 4096"),
                ("rtsp_url", "VARCHAR(500)"),
                ("webrtc_url", "VARCHAR(500)"),
                ("hls_url", "VARCHAR(500)"),
                ("vms_id", "VARCHAR(50)"),
                ("last_catalogue_sync", "DATETIME"),
                ("last_frame_at", "DATETIME"),
                ("last_pts", "FLOAT"),
                ("connection_state", "VARCHAR(30) DEFAULT 'ONLINE'"),
            ]
            for col_name, col_type in missing_cam_cols:
                if col_name not in cols:
                    await conn.execute(text(f"ALTER TABLE cameras ADD COLUMN {col_name} {col_type}"))

            # Check existing columns in camera_health
            h_res = await conn.execute(text("PRAGMA table_info(camera_health)"))
            h_cols = [row[1] for row in h_res.fetchall()]
            
            missing_health_cols = [
                ("frames_received", "INTEGER DEFAULT 0"),
                ("frames_decoded", "INTEGER DEFAULT 0"),
                ("decode_errors", "INTEGER DEFAULT 0"),
                ("reconnect_count", "INTEGER DEFAULT 0"),
                ("current_backoff_sec", "FLOAT DEFAULT 0.0"),
                ("codec", "VARCHAR(20) DEFAULT 'H.264'"),
                ("resolution", "VARCHAR(20) DEFAULT '1080p'"),
                ("measured_fps", "FLOAT DEFAULT 25.0"),
                ("last_error", "TEXT"),
            ]
            for col_name, col_type in missing_health_cols:
                if col_name not in h_cols:
                    await conn.execute(text(f"ALTER TABLE camera_health ADD COLUMN {col_name} {col_type}"))

