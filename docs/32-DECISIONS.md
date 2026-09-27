# 32 — ARCHITECTURE DECISION RECORDS (ADR)
**Gujarat SentinelX Platform**

---

### ADR-001: Hybrid Multi-Model Architecture
* **Status:** Accepted
* **Context:** Statewide integration of 26 government departments and ~80,000 heterogeneous cameras requires combining central registries, VMS federation, unified viewing, and distributed AI analytics.
* **Decision:** Implement a Hybrid Architecture combining Model 1 (Centralized Registry & GIS), Model 2 (Unified Viewing & Analytics), Model 3 (VMS Federation), and Model 4 (Modular Edge/Regional AI Engine).
* **Consequences:** Eliminates wholesale rip-and-replace of legacy VMS infrastructure while ensuring centralized command, control, and intelligence.

---

### ADR-002: Dual-Engine Database Strategy (PostgreSQL/PostGIS + SQLite Async)
* **Status:** Accepted
* **Context:** The system needs zero-dependency local development and CI testing alongside enterprise-scale production deployment with geospatial indexing.
* **Decision:** Use SQLAlchemy 2.0 with async engine abstraction supporting SQLite (`sqlite+aiosqlite`) for development and PostgreSQL with PostGIS extension for production.
* **Consequences:** Developers can run the entire platform with zero external database containers, while production deployments take full advantage of spatial indexing (`ST_DWithin`, `ST_Distance`).

---

### ADR-003: Authoritative Catalogue Discovery via `/api/ingest`
* **Status:** Accepted
* **Context:** Camera IDs and stream URLs must never be hard-coded; the upstream video gateway can alter camera mappings, codecs, or availability at any time.
* **Decision:** All camera ingestion is driven strictly by `GET /api/ingest`. The `CameraCatalogueService` polls this endpoint periodically, detects additions/removals/modifications, updates the registry, and notifies the `StreamSessionManager`.
* **Consequences:** Dynamic resilience against upstream infrastructure modifications without code reconfiguration.

---

### ADR-004: Mandatory RTSP over TCP for AI Inference
* **Status:** Accepted
* **Context:** UDP transport for RTSP causes packet loss, visual artifacts, and corrupted macroblocks under network jitter, leading to severe OCR/ANPR degradation.
* **Decision:** All backend RTSP clients MUST force TCP transport (`rtsp_transport;tcp` in OpenCV/FFmpeg, `protocols=tcp` in GStreamer).
* **Consequences:** Guarantees frame integrity for deep learning pipelines. Drops in frame rates are handled by PTS timing rather than packet corruption.

---

### ADR-005: Presentation Timestamps (PTS) as the Authoritative Time Source
* **Status:** Accepted
* **Context:** Frame arrival time over the network suffers from buffering jitter. Declared `CAP_PROP_FPS` is often inaccurate or variable.
* **Decision:** All video timing, vehicle velocity, dwell time, and tracking duration calculations MUST use Presentation Timestamps (`CAP_PROP_POS_MSEC` or container PTS): `delta_t = current_pts - previous_pts`.
* **Consequences:** Accurate velocity and chronological reconstruction across variable frame rate (VFR) streams and network delays.

---

### ADR-006: Stream Session Manager with Reference Counting
* **Status:** Accepted
* **Context:** Upstream edge gateways and cameras can easily be overwhelmed if every viewer, AI worker, and investigation inspector opens a separate RTSP stream.
* **Decision:** Implement `StreamSessionManager` with atomic reference counting (`ref_count`). Streams are opened once when `ref_count` transitions 0 → 1 and cleanly terminated when `ref_count` drops to 0.
* **Consequences:** Minimizes upstream network load and prevents gateway CPU/bandwidth exhaustion.

---

### ADR-007: Three-Tier Video Distribution (RTSP, WHEP, HLS)
* **Status:** Accepted
* **Context:** Backend AI requires raw RTP/RTSP, operators require sub-second live previews in browsers, and executive dashboards require firewall-friendly delivery.
* **Decision:** Split streaming into:
  1. RTSP/TCP for backend AI ingestion.
  2. WebRTC WHEP for sub-500ms browser operator feeds.
  3. HLS for fallback, mobile, and wide-area dashboards.
* **Consequences:** Optimal protocol matched to each operational role.

---

### ADR-008: Exponential Backoff Reconnection & Decoder Error Resilience
* **Status:** Accepted
* **Context:** RTSP streams from field cameras experience periodic disconnects, network hiccups, and missing IDR/keyframe warnings (`RPS`, `POC`).
* **Decision:** Implement automatic reconnection with exponential backoff (2s, 4s, 8s, 16s, 30s max). Decoder warnings are logged but do not crash the pipeline; streams transition through explicit state machine states.
* **Consequences:** Robust 24/7 stream resilience without tight reconnect loops.

---

### ADR-009: Modular AI Provider Abstraction
* **Status:** Accepted
* **Context:** Different cameras, jurisdictions, or edge nodes may deploy different AI models (YOLOv8, ByteTrack, PaddleOCR, NVIDIA DeepStream, or cloud APIs).
* **Decision:** Decouple application services from specific deep learning weights using abstract interfaces: `DetectionProvider`, `TrackingProvider`, `ANPRProvider`, `FaceRecognitionProvider`, and `EmbeddingProvider`.
* **Consequences:** Zero vendor lock-in; easy swapping of OCR or detector models without changing core business logic.

---

### ADR-010: VMS Federation Adapter Pattern
* **Status:** Accepted
* **Context:** Gujarat has existing installations from Milestone, Genetec, Matrix, and HikCentral.
* **Decision:** Implement `VMSAdapter` interface with concrete adapters translating vendor APIs to normalized camera and stream models.
* **Consequences:** Uniform platform experience across heterogeneous commercial VMS platforms.

---

### ADR-011: Hierarchical Edge/Regional Architecture for 80,000 Cameras
* **Status:** Accepted
* **Context:** Transporting 80,000 raw video streams (approx. 320 Gbps) to a single central data center is technically and financially infeasible.
* **Decision:** Implement a three-tier hierarchical architecture:
  1. **Edge/Site Gateways:** Run local decoding, ANPR, and metadata extraction.
  2. **Regional Command Nodes (33 Districts):** Aggregate events, perform local correlation, and manage district storage.
  3. **Statewide Central Platform (Gandhinagar):** Ingests lightweight JSON metadata, alerts, and coordinates inter-district investigations. Live video is streamed centrally only on-demand.
* **Consequences:** Reduces statewide WAN bandwidth consumption by over 95%.

---

### ADR-012: Live National VAHAN 4.0 & e-Challan Integration
* **Status:** Accepted
* **Context:** Investigating officers require instant verification of registered ownership, engine/chassis number, insurance, and pending e-challans.
* **Decision:** Integrate live KYC gateway (Surepass API) with automated secondary failover (`.io` to `.app`) and Section 65B compliant audit logging.
* **Consequences:** Real-time enriched vehicle intelligence alongside CCTV tracking.
