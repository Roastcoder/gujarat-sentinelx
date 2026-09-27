import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.seeder import seed_data

@pytest.fixture(scope="session", autouse=True)
def init_data():
    asyncio.run(seed_data())

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_root_and_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    res_root = client.get("/")
    assert res_root.status_code == 200
    assert res_root.json()["status"] == "OPERATIONAL"

def test_auth_login(client):
    res = client.post("/api/v1/auth/login", json={
        "username": "investigator",
        "password": "SentinelX@2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user_info"]["username"] == "investigator"
    assert data["user_info"]["role"] == "Investigator"

def test_camera_registry_crud(client):
    # 1. List cameras (50 seeded)
    res = client.get("/api/v1/cameras")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 50

    # 2. Filter by district
    res_ahm = client.get("/api/v1/cameras?district=Ahmedabad")
    assert res_ahm.status_code == 200
    assert res_ahm.json()["total"] == 20

    # 3. Get single camera
    res_single = client.get("/api/v1/cameras/CAM-AHM-001")
    assert res_single.status_code == 200
    assert res_single.json()["camera_code"] == "CAM-AHM-001"
    assert res_single.json()["status"] == "ONLINE"

def test_primary_vehicle_investigation_gj01ab1234(client):
    """
    CRITICAL ACCEPTANCE TEST:
    Input: GJ01AB1234
    Output:
    - Vehicle found
    - 7 Camera detections
    - Chronological timeline
    - GIS route with waypoints
    - Watchlist match status
    """
    res = client.get("/api/v1/vehicles/GJ01AB1234")
    assert res.status_code == 200
    data = res.json()

    assert data["plate_number"] == "GJ01AB1234"
    assert data["status"] in ["ALERT", "WATCHLIST"]
    assert data["total_detections"] == 7
    assert data["total_cameras"] == 7
    assert data["watchlist_status"]["is_matched"] is True
    assert data["watchlist_status"]["priority"] == "HIGH"

    # Verify timeline sequence across 7 cameras
    timeline = data["timeline"]
    assert len(timeline) == 7
    assert timeline[0]["camera_code"] == "CAM-AHM-001"
    assert timeline[1]["camera_code"] == "CAM-AHM-004"
    assert timeline[2]["camera_code"] == "CAM-AHM-009"
    assert timeline[3]["camera_code"] == "CAM-AHM-014"
    assert timeline[4]["camera_code"] == "CAM-GND-021"
    assert timeline[5]["camera_code"] == "CAM-GND-028"
    assert timeline[6]["camera_code"] == "CAM-GND-035"

def test_vehicle_gis_route(client):
    res = client.get("/api/v1/gis/routes/GJ01AB1234")
    assert res.status_code == 200
    data = res.json()
    assert data["plate_number"] == "GJ01AB1234"
    assert len(data["waypoints"]) == 7
    assert data["geojson"]["type"] == "FeatureCollection"
    assert len(data["geojson"]["features"]) >= 8

def test_alerts_and_acknowledgement(client):
    res = client.get("/api/v1/alerts")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    alert = data["items"][0]

    ack_res = client.post(f"/api/v1/alerts/{alert['id']}/acknowledge", json={
        "notes": "Verified by Control Room Officer Patel; intercept units dispatched"
    })
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "ACKNOWLEDGED"

def test_system_health(client):
    res = client.get("/api/v1/system/health")
    assert res.status_code == 200
    data = res.json()
    assert data["overall_status"] == "OPERATIONAL"
    assert data["total_cameras"] >= 50
    assert len(data["components"]) >= 8

def test_demo_scenario_trigger(client):
    res = client.post("/api/v1/demo/trigger")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["vehicle_number"] == "GJ01AB1234"
    assert data["checkpoints_traversed"] == 7
    assert data["watchlist_match"] is True

def test_surepass_vahan_integration(client):
    # Test dedicated /vahan endpoint
    res = client.get("/api/v1/vehicles/GJ01AB1234/vahan")
    assert res.status_code == 200
    data = res.json()
    assert data["rc_number"] == "GJ01AB1234"
    assert "owner_name" in data
    assert data["owner_name"] == "GAURAV"
    assert data["rc_status"] == "ACTIVE"
    assert "SB484623H" in (data.get("vehicle_chasi_number") or "")

    # Test that /api/v1/vehicles/GJ01AB1234 has enriched vahan_details
    v_res = client.get("/api/v1/vehicles/GJ01AB1234")
    assert v_res.status_code == 200
    v_data = v_res.json()
    assert v_data["vahan_details"] is not None
    assert v_data["vahan_details"]["owner_name"] == "GAURAV"

def test_sentinel_grid_catalogue(client):
    res = client.get("/api/v1/cameras/sentinel-grid/catalogue")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 30
    first = data[0]
    assert "protocols" in first
    assert "hls" in first["protocols"]
    assert "rtsp" in first["protocols"]
    assert "webrtc" in first["protocols"]
    assert "8554" in first["protocols"]["rtsp"]["url"]
    assert "cybersachinyadav%40gmail.com" in first["protocols"]["rtsp"]["url"]
    assert "snippets" in first
    assert "opencv_python" in first["snippets"]
    assert "rtsp_transport;tcp" in first["snippets"]["opencv_python"]

def test_vehicle_challan_records(client):
    res = client.get("/api/v1/vehicles/GJ01AB1234/challans")
    assert res.status_code == 200
    data = res.json()
    assert data["plate_number"] == "GJ01AB1234"
    assert data["total_challans"] >= 2
    assert data["pending_challans"] >= 1
    assert data["total_pending_amount"] > 0
    assert len(data["challans"]) == data["total_challans"]
    first = data["challans"][0]
    assert "challan_number" in first
    assert "violation_type" in first
    assert "fine_amount" in first
    assert "payment_status" in first

