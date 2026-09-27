# GUJARAT SENTINELX: System Architecture Document
**Version:** 1.0  
**Project:** Gujarat CCTV Hackathon 2026 — Integrated CCTV Intelligence, GIS & Cross-Camera Investigation Platform  
**Target Scalability:** ~80,000 Heterogeneous Cameras  
**Prototype Scope:** ~50 Simulated & Real Stream Feeds  

---

## 1. Executive Architecture Overview

**Gujarat SentinelX** is designed as a vendor-agnostic, federated intelligence and investigation layer deployed above heterogeneous CCTV cameras and existing Video Management Systems (VMS) across Gujarat's districts, departments, and police jurisdictions.

Rather than executing a high-risk "rip-and-replace" of existing municipal (Smart Cities), traffic, highway, and police VMS infrastructure (Milestone, Genetec, Hikvision, Dahua, Matrix, Honeywell, etc.), SentinelX establishes an **Integration & Adapter Layer** that ingests normalized RTSP/HLS/ONVIF streams and edge metadata, processes events through an AI & Event pipeline, and surfaces actionable intelligence on a unified GIS-powered Command Center.

```
+----------------------------------------------------------------------------------------------------+
|                                     EXISTING CCTV INFRASTRUCTURE                                   |
|  [Ahmedabad SafeCity]    [Surat Traffic VMS]    [Rajkot SmartCity]    [State Highway Patrol RTSP]  |
|  (Milestone / Genetec)    (HikCentral / Dahua)    (Matrix / ONVIF)      (Edge Cameras / NVRs)      |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                    INTEGRATION & ADAPTER LAYER                                     |
|  • ONVIF Discovery & PTZ  • RTSP Stream Proxies  • HLS Transcoders  • Vendor REST API Adapters     |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                            STREAM GATEWAY & EDGE / REGIONAL PROCESSING                             |
|  • Stream Health Mon      • Frame Decoders       • Region Ingest     • Edge Metadata Extractor     |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                    AI ANALYTICS ENGINE (PLUGGABLE)                                 |
|  • DetectionProvider (YOLOv8/v11)               • TrackingProvider (ByteTrack / BoT-SORT)          |
|  • OCRProvider (PaddleOCR / CRNN)               • VehicleAttributeProvider (Color, Make, Model)    |
|  • Deterministic Simulator (Hackathon Demo & Synthetic Stress Testing)                           |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                     DISTRIBUTED EVENT BUS (KAFKA)                                  |
|  Topics: cctv.streams.raw | cctv.detections.vehicle | cctv.anpr.events | cctv.alerts.priority      |
+----------------------------------------------------------------------------------------------------+
                                                  │
            ┌─────────────────────────────────────┼──────────────────────────────────┐
            ▼                                     ▼                                  ▼
+────────────────────────+            +───────────────────────+          +─────────────────────────+
|     POSTGRESQL /       |            |      OPENSEARCH       |          |       CLICKHOUSE        |
|        POSTGIS         |            |      (FTS & LPR)      |          |       (ANALYTICS)       |
| • Camera Registry      |            | • Fuzzy Plate Search  |          | • Time-series Analytics |
| • Spatial Topology/GIS |            | • Multi-Attribute FTS |          | • Billions of Events    |
| • Watchlists & Alerts  |            | • Fast Candidate Gen  |          | • High-Throughput Aggs  |
| • Users, Roles & RBAC  |            +───────────────────────+          +─────────────────────────+
| • Investigation Cases  |                        │                                   │
+────────────────────────+                        └─────────────────┬─────────────────┘
            │                                                       │
            ▼                                                       ▼
+----------------------------------------------------------------------------------------------------+
|                                 SENTINELX CORE INTELLIGENCE API                                    |
|  • FastAPI (Python 3.11+)       • SQLAlchemy 2.0 ORM        • Pydantic v2 Schemas                  |
|  • Cross-Camera Correlator     • Journey Reconstruction    • Rule & Alert Engine                  |
|  • Evidence Locker API         • Audit Log Engine          • WebSocket / SSE Realtime Hub         |
+----------------------------------------------------------------------------------------------------+
                                                  │ (REST + WebSockets)
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                              COMMAND & CONTROL DASHBOARD (NEXT.JS)                                 |
|  • Next.js App Router (React 19)   • Tailwind CSS Design System   • MapLibre GL GIS Engine          |
|  • 1/4/9/16 Live Camera Grid      • Interactive Journey Player   • Investigation Workspace         |
|  • Realtime Alert Banner & Drawer • System Health & Telemetry    • Audit Trail & Export Center     |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Core Functional Subsystems

### 2.1 Camera Registry & Topology
- **Unified Schema:** Stores camera identifier (`CAM-AHM-00182`), hardware vendor, firmware, district, police station jurisdiction, GPS coordinates (`ST_Point`), protocol, stream URL, resolution, FPS, capability flags (`ptz`, `anpr`, `audio`, `night_vision`), retention policies, and real-time operational health.
- **Hierarchical Jurisdictions:** State -> District (e.g., Ahmedabad, Gandhinagar, Surat) -> Police Station / Zone -> Camera Location.

### 2.2 GIS & Spatial Engine
- Powered by **MapLibre GL JS** on the client and **PostGIS** on the server.
- Supports GeoJSON streaming, marker clustering for 80k scalability, district boundary overlays, heatmaps, and spatial route plotting.
- Dynamic route vector generator connecting detection points with direction vectors, camera timestamps, and transit speed estimations.

### 2.3 Live Monitoring & Stream Gateway
- Multi-view grid (1-up, 4-up, 9-up, 16-up layouts) supporting low-latency stream playback.
- Graceful degradation: For physical cameras, RTSP/HLS stream multiplexing; for synthetic/demo environments, deterministic simulated video rendering with live timestamp overlays and detection bounding boxes.

### 2.4 AI Pipeline & Provider Abstraction
- Clean separation between business logic and neural networks:
  - `DetectionProvider`: Detects bounding boxes for `car`, `truck`, `bus`, `motorcycle`, `auto-rickshaw`.
  - `OCRProvider`: Localizes license plates and executes character recognition compliant with Indian HSRP formats (e.g., `GJ-01-AB-1234`).
  - `TrackingProvider`: Assigns persistent `tracking_id` within camera frame sequences using ByteTrack algorithms.
  - `VehicleAttributeProvider`: Extracts color, vehicle classification, and heading.
- Built-in `DeterministicSimulator` to execute reproducible hackathon demonstrations without requiring local multi-GPU clusters.

### 2.5 Cross-Camera Journey Reconstruction
- Solves the primary hackathon challenge: Given input `GJ01AB1234`:
  1. Correlate chronologically ordered ANPR detection records across distinct camera nodes.
  2. Compute hop times, distance traversed, and average velocity between adjacent camera posts.
  3. Generate interactive GIS route polylines with directional arrows and timestamp waypoints.
  4. Assemble chronological photographic evidence tiles with confidence metrics.

### 2.6 Alert & Watchlist Engine
- Real-time matching of incoming ANPR events against active watchlists (Stolen, Wanted, Suspicious, Expired Insurance, VIP Movement).
- Real-time alert dispatch via WebSocket and Server-Sent Events (SSE) with sound cues, persistent alert drawer, and acknowledgment workflows with audit logging.

### 2.7 Investigation Workspace & Evidence Locker
- Formal digital case creation (`INV-2026-001`), attaching vehicle journey snapshots, officer notes, chain of custody metadata, and exportable forensic investigation dossiers.

### 2.8 Security, RBAC & Audit Trail
- JWT-based authentication with role-based access control (`Super Admin`, `District Admin`, `Investigator`, `Operator`, `Auditor`).
- Every vehicle query, camera access, evidence view, or alert acknowledgment generates an immutable cryptographic audit log entry.

---

## 3. Technology Stack Justification

| Layer | Selected Tech | Rationale |
|---|---|---|
| **Frontend** | Next.js, React, TypeScript | SSR/CSR hybrid capabilities, type safety, modular component architecture. |
| **Styling** | Tailwind CSS + Lucide Icons | High-density government command-center theme; precise dark navy palette. |
| **GIS / Mapping** | MapLibre GL JS | Open-source, zero API-key lock-in, high-performance WebGL vector tiles. |
| **Backend API** | FastAPI (Python) | Native async, high throughput, automatic OpenAPI documentation, Pydantic validation. |
| **Primary Database** | PostgreSQL + PostGIS | ACID compliance, rock-solid relational data integrity, industry-standard spatial functions. |
| **Search / Analytics** | OpenSearch & ClickHouse Abstractions | Ultra-fast plate prefix/wildcard search and analytical time-series event aggregations. |
| **Streaming / Message Bus** | Kafka Abstraction | High-throughput distributed event bus capable of sustaining 80,000 camera feeds. |
| **Cache & Realtime** | Redis + WebSockets | Sub-millisecond state caching, pub/sub for live alert broadcasting. |

---

## 4. Scalability: Prototype (50 Cameras) to Production (80,000 Cameras)

### 4.1 Prototype Architecture (Hackathon)
- Ingests ~50 cameras across key Gujarat transit nodes (Ahmedabad SG Highway, Gandhinagar Secretariat, Surat Ring Road, Vadodara Express, etc.).
- Centralized FastAPI application with in-process or containerized SQLite/PostgreSQL, Redis, and event dispatchers.
- Complete mock and real adapter fallback modes ensuring zero-setup operational reliability.

### 4.2 Production Architecture (~80,000 Cameras)
- **Edge / Regional Gateways:** 33 District Command & Control Centers (DCCC) performing frame decoding and preliminary inference. Only metadata, thumbnails, and priority clips hit the State Data Center (SDC).
- **Kafka Partitioning:** Partitioned by `district_id` and `camera_id` hashes across 12-node Kafka clusters.
- **ClickHouse Cluster:** Ingests 50,000+ detection events/second with automated monthly partitioning and TTL retention policies.
- **PostgreSQL Read Replicas:** Read-heavy GIS queries and registry lookups offloaded to regionally distributed replicas.
