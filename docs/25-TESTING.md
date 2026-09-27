# 25 — AUTOMATED TESTING SUITE & VERIFICATION
**Platform:** Gujarat SentinelX  

---

## 1. Test Suite Architecture
The test suite in `apps/api/tests/test_api.py` uses `pytest` and `fastapi.testclient.TestClient` to execute end-to-end integration tests without network mocks:

1. `test_root_and_health`: Validates system status and OpenAPI availability.
2. `test_auth_login`: Verifies JWT issuance, role verification, and credential checks.
3. `test_camera_registry_crud`: Tests listing, pagination, district filtering, and single camera lookup across 50 seeded nodes.
4. `test_primary_vehicle_investigation_gj01ab1234`: Verifies the primary hackathon acceptance test (7 cameras, timeline, watchlist match).
5. `test_vehicle_gis_route`: Tests GeoJSON LineString and Point generation.
6. `test_alerts_and_acknowledgement`: Validates alert queue and officer acknowledgment lifecycle.
7. `test_system_health`: Checks health of all 8 infrastructure components.
8. `test_demo_scenario_trigger`: Tests the automated demo scenario runner.

---

## 2. Test Execution & Results
```bash
cd apps/api
.venv/bin/pytest -v tests/test_api.py
```
**Results:** 8 Passed, 0 Failed (100% Green in 1.68s).
