# PROJECT STATUS — GUJARAT SENTINELX
**Integrated CCTV Intelligence, GIS & Cross-Camera Investigation Platform**  
**Government of Gujarat — Home Department & Gujarat Police**  
**Target:** Gujarat CCTV Hackathon 2026  
**Last Updated:** 2026-09-27 20:48:00 UTC  

---

## 1. Current Phase Overview
- **CURRENT STATUS:** **PROTOTYPE COMPLETE & VERIFIED (READY FOR JURY EVALUATION)**
- **AUTHORITATIVE CCTV INGEST:** **IMPLEMENTED (`/api/ingest` + `CameraCatalogueService`)**
- **STREAM SESSION MANAGER:** **OPERATIONAL (RTSP TCP, Ref-Counting, Health Metrics)**
- **TIMING ENGINE:** **STRICTLY PTS-DRIVEN (No CAP_PROP_FPS, No Arrival Times)**
- **PRIMARY ACCEPTANCE TEST (`GJ01AB1234`):** **VERIFIED & OPERATIONAL (7 Cameras)**
- **AUTOMATED TEST SUITE:** **22/22 PYTEST TESTS PASSING (100% GREEN)**
- **LIVE CCTV STREAMING GRID:** **CONNECTED (`cctv.corp8.cloud` / RTSP / WHEP / HLS)**
- **NATIONAL VAHAN 4.0 REGISTRY:** **LIVE INTEGRATED VIA SUREPASS KYC GATEWAY**

---

## 2. Completed Milestones & Capabilities

### Core Platform & Architecture
- [x] **37-Part Government Documentation Matrix (`/docs/00` to `36`):**
  - Includes PRD, SRS, System Architecture, Database Schema, API Specification, AI Architecture, Video Pipeline, VMS Integration, GIS Architecture, Scalability (80,000 Cameras), Disaster Recovery, Frontend/Backend Architecture, Testing, Demo Script, Test Data, VAHAN Integration, Authoritative Ingest Specification (`35-CCTV-INGEST-SPECIFICATION.md`), and Stream Operations Manual (`36-STREAM-OPERATIONS.md`).
- [x] **Official Gujarat Police Branding:** Official emblem integrated into `/apps/web/public/gujarat-police-logo.png` and command center navigation.

### Authoritative CCTV Ingest & Stream Operations (Sections 4–19)
- [x] **Dynamic Catalogue Discovery Contract (`GET /api/ingest`):**
  - Never hardcoded. Dynamically serves 50 heterogeneous cameras across Gujarat with full stream metadata.
- [x] **`CameraCatalogueService`:**
  - Background discovery, schema validation, metadata normalization, database synchronization, addition/removal detection, and stream manager event listener notification.
- [x] **`StreamSessionManager` with Reference Counting:**
  - Prevents gateway duplicate connections. Atomic `acquire()` / `release()` lifecycle.
- [x] **Mandatory RTSP over TCP:**
  - `os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"`. UDP strictly disabled for AI pipelines.
- [x] **Presentation Timestamps (PTS) as Authoritative Time Source:**
  - Velocity, dwell time, and chronological sequence driven strictly by PTS ($\Delta t$). Never uses arrival time or declared FPS.
- [x] **Exponential Backoff Reconnect:**
  - Reconnect cycles: 2s -> 4s -> 8s -> 16s -> 30s max cap.
- [x] **Decoder Warning Recovery:**
  - Gracefully recovers from RPS/POC missing reference errors without pipeline termination; transitions to `DEGRADED`.
- [x] **Scene Discontinuity & Loop Cut Detection:**
  - Detects PTS rollbacks and resets short-term trackers while preserving historical database events.

### Modular AI Engine (Sections 20 & 21)
- [x] **Modular Interfaces (`/app/ai/interfaces.py`):**
  - `DetectionProvider`, `TrackingProvider`, `ANPRProvider`, `FaceRecognitionProvider`, `EmbeddingProvider`.
- [x] **Production Implementations (`/app/ai/pipeline.py`):**
  - `YOLOv8DetectionProvider`, `ByteTrackTrackingProvider` with PTS timing, `PaddleOCRANPRProvider` with Indian HSRP plate normalization (`GJ-01-AB-1234` -> `GJ01AB1234`), `DeepSortEmbeddingProvider`.

### VMS Federation Layer (Section 38)
- [x] **`VMSAdapter` Architecture (`/app/integrations/vms/adapters.py`):**
  - Adapters for Milestone XProtect, Genetec Security Center, HikCentral Professional, Matrix SATATYA SAMAS, and universal ONVIF Profile T.

### Backend Engine (`apps/api`)
- [x] **FastAPI Modern Async Architecture:** Pydantic v2, SQLAlchemy 2.0, dual-engine (PostgreSQL/PostGIS + SQLite async with self-healing column migrations).
- [x] **16 Relational Models:** Users, Roles, Jurisdictions, Cameras, Events, ANPR Detections, Watchlists, Alerts, Investigations, Evidence, Audit Logs, System Health.
- [x] **Vehicle Intelligence & Journey Reconstruction:**
  - Sequential 7-camera tracking for `GJ01AB1234` (Iscon Crossroad → Sachivalaya Gate 1).
  - Accurate Haversine distance, speed, and PTS timestamp chronology.
  - GeoJSON FeatureCollection route generation for GIS mapping.
- [x] **Live National VAHAN 4.0 & Surepass Integration:**
  - Automated RC query with secondary failover, owner name (`GAURAV`), maker/model (`ROYAL-ENFIELD BULLET`), chassis/engine (`SB484623H`).

### Frontend Command Center (`apps/web`)
- [x] **Next.js 14 App Router:** Built with Tailwind CSS, dark navy command-center theme (`#070D18`), Lucide icons, MapLibre GL, and Recharts.
- [x] **15 Production Views:**
  1. `/dashboard` — Statewide surveillance telemetry HUD, quick plate search, GIS preview.
  2. `/vehicles/[plate]` — Master investigation workspace for `GJ01AB1234`, MapLibre GL route, 7-camera chronological timeline, Official VAHAN 4.0 Dossier, SHA-256 evidence locker.
  3. `/live` — 1x1, 2x2, 3x3, 4x4 surveillance matrix with live HLS stream players from Sentinel Camera Grid.
  4. `/map` — Full-screen interactive MapLibre GIS map with 50 camera pins, district boundaries, and active route toggle.
  5. `/cameras` & `/cameras/[id]` — Camera inventory registry with live health badges and video streams.
  6. `/vehicles` — Vehicle intelligence directory and filterable sighting ledger.
  7. `/alerts` — Real-time priority alert center with one-click officer acknowledgment.
  8. `/watchlists` — High-priority hotlists (Stolen Vehicles, Anti-Terror, Inter-District).
  9. `/investigations` — Case dossier management with Section 65B digital stamps.
  10. `/analytics` — Recharts time-series traffic velocity and OCR accuracy analytics.
  11. `/vms` — Heterogeneous VMS integration dashboard.
  12. `/system-health` — 8-component hardware and service diagnostic monitor.
  13. `/audit-logs` — Immutable compliance access logs.
  14. `/events` — Real-time normalized event stream.
  15. `/users` & `/settings` — RBAC management and video retention policies.

---

## 3. Test Suite & Build Verification Summary
- **Backend Tests:** 22 Passed, 0 Failed (100% Green, 5.37s)
  - `test_api_ingest_discovery_contract`: PASSED
  - `test_rtsp_tcp_enforcement`: PASSED
  - `test_stream_session_reference_counting`: PASSED
  - `test_pts_authoritative_timing_and_velocity`: PASSED
  - `test_decoder_warning_recovery`: PASSED
  - `test_scene_discontinuity_detection`: PASSED
  - `test_exponential_backoff_calculation`: PASSED
  - `test_anpr_plate_normalization`: PASSED
  - `test_vms_federation_adapters`: PASSED
  - `test_failure_injection_resilience`: PASSED
  - `test_streams_endpoints`: PASSED
  - `test_primary_vehicle_investigation_gj01ab1234`: PASSED
  - `test_surepass_vahan_integration`: PASSED
  - `test_sentinel_grid_catalogue`: PASSED
- **Frontend Build:** 19/19 Static/Dynamic Routes Successfully Compiled (Code 0)
- **VAHAN Live Query:** Verified via Surepass API (Status 200 OK)
- **Sentinel Camera Grid Feeds:** Active on `cctv.corp8.cloud` and `103.250.160.189`

---

## 4. How to Run Locally

### Backend (Terminal 1)
```bash
cd apps/api
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Ingest Discovery Contract: `http://localhost:8000/api/ingest`
- Swagger UI: `http://localhost:8000/docs`

### Frontend (Terminal 2)
```bash
cd apps/web
npm run dev -- -p 3000
```
- Command Center UI: `http://localhost:3000`
