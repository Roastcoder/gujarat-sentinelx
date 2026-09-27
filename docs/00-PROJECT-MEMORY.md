# 00 — PROJECT MEMORY: GUJARAT SENTINELX
**Integrated CCTV Intelligence, GIS & Cross-Camera Investigation Platform**  
**Authority:** Government of Gujarat — Home Department & Gujarat Police  
**Hackathon:** Gujarat CCTV Hackathon 2026  
**Status:** ACTIVE AUTONOMOUS DEVELOPMENT  
**Tagline:** "Connect Every Camera. Understand Every Event. Reconstruct Every Journey."

---

## 1. Project North Star & Mission
The core objective is to deliver a functional, end-to-end hackathon prototype proving cross-camera vehicle intelligence across statewide heterogeneous CCTV infrastructure:
- **Primary Acceptance Test Vehicle:** `GJ01AB1234`
- **Output:** Vehicle detected, normalized plate OCR, 7 sequential camera detections across Ahmedabad and Gandhinagar corridors, strictly PTS-derived chronological timestamps, GPS locations, GIS polyline route, high-confidence ANPR snapshots, watchlist match flag, real-time alert dispatch, official National VAHAN 4.0 dossier, and Section 65B Indian Evidence Act compliant investigation case records.

---

## 2. Statewide Scale & Scope
The target environment contains:
- **26 Government Departments** (Home Department, Food & Civil Supplies, RTO, Municipal Corporations, State Highway Authority, etc.)
- **~80,000 Cameras at Statewide Scale** distributed over ~1,000 km across 33 districts of Gujarat.
- **Heterogeneous Environments:** Analog and IP cameras, mixed codecs (H.264 & H.265/HEVC), diverse resolutions (720p, 1080p, 1440p, 4K), varied GOP structures, and variable frame rates.
- **Heterogeneous VMS Platforms:** Milestone XProtect, Genetec Security Center, HikCentral, Matrix Comsec, and proprietary city surveillance networks.
- **Existing Government Databases:** VAHAN, SARTHI, eGujCop, AFIS, Stolen Vehicle Records, Wanted Persons, Missing Persons, Unidentified Dead Bodies.

---

## 3. Authoritative CCTV Ingest & Streaming Contract
All video ingest adheres strictly to the authoritative specifications:
1. **The Catalogue is the Contract (`GET /api/ingest`):**
   - Camera IDs and stream URLs are **never hardcoded**.
   - `CameraCatalogueService` periodically polls `GET /api/ingest` (every 30–60s), validates schema, normalizes camera metadata, syncs changes to the database, detects additions/removals, and notifies `StreamSessionManager`.
   - Historical detections and logs are always preserved if a camera is removed.
2. **Three Streaming Protocol Tiers:**
   - **RTSP (`rtsp://<host>:8554/stream/<id>`):** Strictly for backend AI inference and ANPR processing. Forced over TCP (`rtsp_transport;tcp`). UDP is strictly prohibited.
   - **WebRTC WHEP (`http://<host>:8889/stream/<id>/whep`):** Sub-second low-latency live preview for operators in the browser.
   - **HLS (`http://<host>/live/stream/<id>/index.m3u8`):** Universal fallback for restricted networks, dashboards, and mobile devices.
3. **PTS is the Authoritative Time Source:**
   - All frame timing, vehicle velocity, and tracking logic are driven strictly by Presentation Timestamps (`CAP_PROP_POS_MSEC` or container PTS).
   - Wall-clock arrival time and `CAP_PROP_FPS` are **never used** for movement calculations: `delta_t = current_pts - previous_pts`.
4. **Stream Load Management & Lifecycle:**
   - `StreamSessionManager` with atomic reference counting prevents duplicate connections to edge gateways.
   - Camera lifecycle states: `DISCOVERED`, `CONNECTING`, `ONLINE`, `DEGRADED`, `OFFLINE`, `RECONNECTING`, `REMOVED`.
   - Automatic reconnect with exponential backoff: 2s, 4s, 8s, 16s, max 30s.
   - Tolerates decoder warnings (`RPS`, `POC`) without crashing pipeline.
   - Detects scene discontinuities (loop cuts) and resets short-term trackers while preserving historical detections.

---

## 4. Architectural Layers
1. **Model 1: Centralized CCTV Registry & GIS Foundation** (PostgreSQL/PostGIS, MapLibre GL).
2. **Model 2: Unified Viewing & Metadata Analytics** (WHEP/HLS, OpenSearch, ClickHouse).
3. **Model 3: VMS Federation & Middleware** (`VMSAdapter` abstractions for Milestone, Genetec, Matrix, HikCentral, ONVIF).
4. **Model 4: Central/Regional AI & Video Intelligence Platform** (Modular `DetectionProvider`, `TrackingProvider`, `ANPRProvider`, `FaceRecognitionProvider`, `EmbeddingProvider`).

---

## 5. Technology Stack
- **Backend:** Python 3.14 / FastAPI / Pydantic v2 / SQLAlchemy 2.0 (Dual-engine: SQLite async dev + PostgreSQL/PostGIS prod).
- **Frontend:** Next.js 14 App Router / React 18 / Tailwind CSS / MapLibre GL / Recharts / Lucide Icons.
- **Realtime:** WebSockets for alert broadcast, ANPR telemetry, and stream health.
- **External Integration:** Surepass KYC National VAHAN 4.0 Gateway with automated failover.
- **Testing:** Pytest automated test suite (Unit, Integration, Failure injection).
