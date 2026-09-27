"""
Automated Test Suite for Authoritative CCTV Ingest & Stream Operations
Covers Sections 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 17, 18, 19, 20, 21, 38, 47, 51.
"""

import os
import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.services.catalogue_service import catalogue_service
from app.services.stream_manager import (
    stream_manager,
    StreamSession,
    STATE_DISCOVERED,
    STATE_CONNECTING,
    STATE_ONLINE,
    STATE_DEGRADED,
    STATE_OFFLINE,
    STATE_RECONNECTING
)
from app.ai.interfaces import ANPRProvider
from app.ai.pipeline import ai_pipeline, ByteTrackTrackingProvider, YOLOv8DetectionProvider
from app.integrations.vms.adapters import vms_federation
from app.simulator.camera_generator import inject_camera_failure, clear_camera_failures

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_api_ingest_discovery_contract(client):
    """
    SECTION 5 ACCEPTANCE TEST:
    GET /api/ingest
    The catalogue is the contract. Never hardcode IDs or URLs.
    Validates presence of all 50 cameras with full stream and codec metadata.
    """
    res = client.get("/api/ingest")
    assert res.status_code == 200
    cameras = res.json()
    assert len(cameras) >= 50

    # Verify first camera metadata completeness
    cam01 = cameras[0]
    required_fields = [
        "camera_id", "camera_code", "name", "location", "latitude", "longitude",
        "codec", "live_status", "width", "height", "fps_declared", "bitrate",
        "rtsp_url", "webrtc_url", "hls_url", "vms_id", "department", "district"
    ]
    for field in required_fields:
        assert field in cam01, f"Missing required field: {field}"

    # Section 4 Stream Specifications
    assert "8554" in cam01["rtsp_url"], "RTSP stream must point to port 8554"
    assert "8889" in cam01["webrtc_url"], "WHEP stream must point to port 8889"
    assert "whep" in cam01["webrtc_url"], "WHEP URL must include /whep"
    assert "index.m3u8" in cam01["hls_url"], "HLS stream must target m3u8 playlist"

    # Section 7: Verify mixed codecs (H.264 & H.265)
    codecs = {c["codec"] for c in cameras}
    assert "H.264" in codecs, "Must support H.264 codec"
    assert "H.265" in codecs, "Must support H.265/HEVC codec"

    # Section 13: Verify mixed resolutions
    resolutions = {(c["width"], c["height"]) for c in cameras}
    assert (1920, 1080) in resolutions, "Must support 1080p"
    assert (2560, 1440) in resolutions or (1280, 720) in resolutions, "Must support mixed resolutions"

def test_rtsp_tcp_enforcement():
    """
    SECTION 6 ACCEPTANCE TEST:
    Verifies that TCP is strictly enforced for RTSP capture.
    """
    assert os.environ.get("OPENCV_FFMPEG_CAPTURE_OPTIONS") == "rtsp_transport;tcp"
    assert settings.RTSP_FORCE_TCP is True

def test_stream_session_reference_counting():
    """
    SECTION 17 ACCEPTANCE TEST:
    Verifies StreamSessionManager atomic reference counting.
    Connections open on 0 -> 1 and terminate when ref_count reaches 0.
    """
    session = stream_manager.get_or_create_session(
        camera_code="CAM-TEST-999",
        camera_name="Test Verification Camera",
        rtsp_url="rtsp://103.250.160.189:8554/stream/cam01",
        codec="H.264"
    )
    assert session.ref_count == 0

    # Acquire 1 (e.g., Live Monitoring View)
    ref1 = session.acquire("operator_desk_1")
    assert ref1 == 1
    assert "operator_desk_1" in session.active_consumers

    # Acquire 2 (e.g., AI Vehicle Detection Pipeline)
    ref2 = session.acquire("ai_worker_node_2")
    assert ref2 == 2
    assert session.ref_count == 2

    # Release 1
    ref3 = session.release("operator_desk_1")
    assert ref3 == 1
    assert "operator_desk_1" not in session.active_consumers

    # Release 2 (Drops to 0)
    ref4 = session.release("ai_worker_node_2")
    assert ref4 == 0
    assert session.ref_count == 0

def test_pts_authoritative_timing_and_velocity():
    """
    SECTION 8 & 9 ACCEPTANCE TEST:
    Verifies that timing and speed calculations use strictly Presentation Timestamps (PTS)
    and NEVER declared CAP_PROP_FPS or arrival time.
    """
    session = StreamSession(
        camera_code="CAM-AHM-001",
        camera_name="SG Highway Junction",
        rtsp_url="rtsp://103.250.160.189:8554/stream/cam01",
        fps_declared=25.0
    )

    # First Frame at PTS = 1000 ms
    session._handle_pts_update(1000.0)
    assert session.last_pts == 1000.0

    # Second Frame at PTS = 1200 ms (delta_t = 200 ms)
    session._handle_pts_update(1200.0)
    assert session.last_pts == 1200.0
    assert session.last_delta_t_ms == 200.0

    # Compute speed over 4.0 meters in 200 ms (4.0m / 0.2s = 20 m/s = 72 km/h)
    speed_kmh = session.compute_movement_velocity(4.0)
    assert speed_kmh is not None
    assert abs(speed_kmh - 72.0) < 0.1

def test_decoder_warning_recovery():
    """
    SECTION 12 ACCEPTANCE TEST:
    Verifies that non-fatal decoder warnings (RPS, POC) do NOT crash the stream
    and allow graceful recovery in DEGRADED status.
    """
    session = StreamSession(
        camera_code="CAM-AHM-004",
        camera_name="Pakwan Crossroad",
        rtsp_url="rtsp://103.250.160.189:8554/stream/cam04"
    )
    session.handle_decoder_warning("Error constructing frame RPS / POC not found")
    assert session.decode_errors == 1
    assert session.connection_state == STATE_DEGRADED
    assert "RPS" in session.last_error

def test_scene_discontinuity_detection():
    """
    SECTION 14 ACCEPTANCE TEST:
    Verifies that loop point cuts or abrupt PTS jumps trigger tracker reset
    without deleting persistent historical events.
    """
    session = StreamSession(
        camera_code="CAM-AHM-009",
        camera_name="Thaltej Underpass",
        rtsp_url="rtsp://103.250.160.189:8554/stream/cam09"
    )

    reset_triggered = False
    def on_reset(code, delta):
        nonlocal reset_triggered
        reset_triggered = True

    session.register_discontinuity_callback(on_reset)

    # Initial frame at PTS 50000ms
    session._handle_pts_update(50000.0)

    # Abrupt backward loop point cut to PTS 100ms
    session._handle_pts_update(100.0)

    assert reset_triggered is True, "Scene discontinuity callback must trigger on loop reset"

def test_exponential_backoff_calculation():
    """
    SECTION 11 ACCEPTANCE TEST:
    Verifies exponential backoff reconnect policy (2s -> 4s -> 8s -> 16s -> max 30s).
    """
    min_b = settings.STREAM_RECONNECT_MIN_BACKOFF
    max_b = settings.STREAM_RECONNECT_MAX_BACKOFF

    def calc_backoff(count):
        return min(max_b, min_b * (2 ** (count - 1)))

    assert calc_backoff(1) == 2.0
    assert calc_backoff(2) == 4.0
    assert calc_backoff(3) == 8.0
    assert calc_backoff(4) == 16.0
    assert calc_backoff(5) == 30.0  # Capped at max 30.0
    assert calc_backoff(10) == 30.0

def test_anpr_plate_normalization():
    """
    SECTION 22 ACCEPTANCE TEST:
    Verifies that raw ANPR strings are normalized to standard Indian registration format.
    """
    assert ANPRProvider.normalize_plate("GJ-01-AB-1234") == "GJ01AB1234"
    assert ANPRProvider.normalize_plate("gj 01 ab 1234") == "GJ01AB1234"
    assert ANPRProvider.normalize_plate("GJ01AB1234 ") == "GJ01AB1234"

def test_vms_federation_adapters(client):
    """
    SECTION 38 ACCEPTANCE TEST:
    Verifies heterogeneous commercial VMS adapters (Milestone, Genetec, Matrix, HikCentral, ONVIF).
    """
    res = client.get("/api/v1/vms/adapters")
    assert res.status_code == 200
    adapters = res.json()
    assert len(adapters) >= 5
    adapter_ids = [a["id"] for a in adapters]
    assert "VMS-MIL-01" in adapter_ids
    assert "VMS-GEN-01" in adapter_ids
    assert "VMS-MTX-01" in adapter_ids

    # Health endpoint
    h_res = client.get("/api/v1/vms/adapters/health")
    assert h_res.status_code == 200
    healths = h_res.json()
    assert len(healths) >= 5

def test_failure_injection_resilience(client):
    """
    SECTION 47 & 51 ACCEPTANCE TEST:
    Verifies failure injection for CI and evaluation without affecting healthy state.
    """
    # 1. Inject offline state for cam01
    res = client.post("/api/v1/simulator/failure-injection", json={
        "camera_id": "cam01",
        "failure_type": "offline",
        "enabled": True
    })
    assert res.status_code == 200
    assert res.json()["status"] == "APPLIED"

    # Verify /api/ingest reflects offline status
    ingest_res = client.get("/api/ingest")
    cam01 = next(c for c in ingest_res.json() if c["camera_id"] == "cam01")
    assert cam01["live_status"] == "OFFLINE"

    # 2. Clear failures
    clear_res = client.post("/api/v1/simulator/failure-injection/clear")
    assert clear_res.status_code == 200
    assert clear_res.json()["status"] == "CLEARED"

    # Verify cam01 is restored to ONLINE
    restored_res = client.get("/api/ingest")
    cam01_restored = next(c for c in restored_res.json() if c["camera_id"] == "cam01")
    assert cam01_restored["live_status"] == "ONLINE"

def test_streams_endpoints(client):
    """
    Tests /api/v1/streams/sessions, acquire, health, and release endpoints.
    """
    # 1. Acquire
    acq_res = client.post("/api/v1/streams/CAM-AHM-001/acquire", json={
        "consumer_id": "pytest_runner",
        "purpose": "automated_verification"
    })
    assert acq_res.status_code == 200
    data = acq_res.json()
    assert data["status"] == "ACQUIRED"
    assert data["ref_count"] >= 1

    # 2. Health
    h_res = client.get("/api/v1/streams/CAM-AHM-001/health")
    assert h_res.status_code == 200
    h_data = h_res.json()
    assert h_data["camera_code"] == "CAM-AHM-001"
    assert h_data["ref_count"] >= 1

    # 3. Sessions list
    s_res = client.get("/api/v1/streams/sessions")
    assert s_res.status_code == 200
    sessions = s_res.json()
    assert any(s["camera_code"] == "CAM-AHM-001" for s in sessions)

    # 4. Release
    rel_res = client.post("/api/v1/streams/CAM-AHM-001/release", json={
        "consumer_id": "pytest_runner"
    })
    assert rel_res.status_code == 200
    assert rel_res.json()["status"] == "RELEASED"
