# GUJARAT SENTINELX: Phased Development Plan

**Project:** Gujarat SentinelX — Integrated CCTV Intelligence, GIS & Cross-Camera Investigation Platform  
**Target:** Gujarat CCTV Hackathon 2026  
**Execution Strategy:** Incremental, test-driven, verifiable implementation across 20 distinct phases.

---

## Phase Matrix & Progression

| Phase | Title | Core Deliverables | Verification Milestone |
|---|---|---|---|
| **Phase 1** | Repository & Architecture | Monorepo structure, `.env.example`, `Makefile`, `docker-compose.yml`, documentation | Verified directory tree and config manifests |
| **Phase 2** | Database & Migrations | PostgreSQL / PostGIS schemas, dual-dialect support (Postgres + SQLite fallback), Alembic migrations, initial seeders | Database tables instantiated and verified |
| **Phase 3** | FastAPI Foundation | Core settings, structured logging, request ID middleware, standard error handling, health endpoints | Server responds to `/api/health` with 200 OK |
| **Phase 4** | Authentication & RBAC | JWT access/refresh tokens, password hashing, role enforcement (Super Admin, Investigator, Operator, Auditor) | Auth endpoints functional; protected routes blocked |
| **Phase 5** | Camera Registry | Camera CRUD APIs, filtering by district/status/vendor, status heartbeat, pagination | Camera registry API tested with 50 camera profiles |
| **Phase 6** | GIS Engine & Endpoints | GeoJSON serialization for camera points, clustered queries, route linestrings, bounding boxes | GIS endpoints return valid GeoJSON for cameras & routes |
| **Phase 7** | Frontend Command Center | Next.js App Router, Tailwind CSS design system, dark navy police command theme, layout, nav, KPI cards | Frontend builds and renders command center dashboard |
| **Phase 8** | Camera Simulator | 50 logical camera feeds across Gujarat (Ahmedabad, Surat, Gandhinagar, etc.), synthetic video generators, stream telemetry | Simulator runs generating realistic stream metadata |
| **Phase 9** | Event Engine | Detection event ingestion, normalization pipeline, event bus interface, event query endpoints | Event creation and retrieval verified via API |
| **Phase 10** | Vehicle & ANPR Module | License plate recognition models, Indian registration validator, confidence scoring, vehicle classification | ANPR detections mapped to camera nodes with confidence |
| **Phase 11** | Vehicle Investigation | Investigation search, journey reconstruction engine, cross-camera timeline, GIS route generation | Input `GJ01AB1234` returns chronological journey |
| **Phase 12** | Watchlist & Alert Engine | Watchlist management CRUD, real-time alert trigger, priority classification, acknowledgement lifecycle | Matching vehicle `GJ01AB1234` fires real-time alert |
| **Phase 13** | Live Video Monitoring | 1/4/9/16 grid layouts, stream playback, stream health telemetry (FPS, latency, status), camera switching | Live grid renders multiple camera streams with overlays |
| **Phase 14** | Search & Analytics Layer | OpenSearch full-text/fuzzy plate abstraction, ClickHouse analytical aggregation abstraction, Kafka message bridge | Analytics endpoints return aggregated time-series data |
| **Phase 15** | System Health & Diagnostics | Realtime component health indicators (Postgres, Redis, Kafka, AI Workers, Storage, Cameras) | `/system-health` visualizes operational status |
| **Phase 16** | Security & Audit Logging | Immutable audit logging for vehicle lookups, camera streams, evidence views; rate limiting, headers | Audit log captures user actions with timestamps & IP |
| **Phase 17** | Scalability Documentation | Production architecture for 80,000 cameras: edge gateways, Kafka partitioning, ClickHouse sharding, disaster recovery | `docs/scalability.md` and `docs/deployment.md` created |
| **Phase 18** | Automated Test Suite | Unit tests, API integration tests, vehicle journey test, ANPR accuracy test, RBAC tests | `pytest` test suite passes with green results |
| **Phase 19** | Demo Mode & Presentation | "Run Demo Scenario" banner, automated `GJ01AB1234` timeline replay, simulated camera triggers, WebSocket sync | One-click demo triggers 7-camera journey & alert |
| **Phase 20** | Final Polish & Review | UI refinement, loading/empty/error states, demo script (`docs/demo-script.md`), production README | End-to-end acceptance test succeeds flawlessly |

---

## Detailed Acceptance Checklist for Primary Demo

1. [x] Start FastAPI Backend & Next.js Frontend
2. [x] Access Command Center Dashboard with 6 real-time KPI cards
3. [x] GIS Map displays 50 camera pins with status markers (Online/Offline/Degraded)
4. [x] Enter vehicle registration number `GJ01AB1234` into the prominent Investigation search
5. [x] Direct navigation to `/vehicles/GJ01AB1234`:
   - Verification of vehicle attributes (White SUV, Tata Safari / Mahindra XUV700)
   - Watchlist match: Flagged as `HIGH PRIORITY` (Stolen / Wanted in connection with Case #402)
   - 7 Camera detections spanning Ahmedabad to Gandhinagar
   - Interactive GIS route drawn connecting Camera nodes with directional arrows
   - Chronological timeline with detection timestamps and confidence scores (>95%)
   - Evidence locker displaying capture snapshots with plate overlays
6. [x] Real-time alert dispatched to Command Center alert drawer without page reload
7. [x] Case dossier created in Investigation workspace
8. [x] Audit log captures query event with Officer credential and timestamp
9. [x] System health displays 50 active cameras and operational services
