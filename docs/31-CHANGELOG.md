# 31 — CHANGELOG: GUJARAT SENTINELX

## [v1.0.0-hackathon] - 2026-09-25

### Added
- **Monorepo Architecture:** Established `apps/api` (FastAPI), `apps/web` (Next.js), `services/` (AI, Stream Gateway), `simulator/`, and `docs/`.
- **Database Schema & Models:** Implemented SQLAlchemy 2.0 models for Cameras, Health, Jurisdictions, Events, ANPR, Watchlists, Alerts, Investigations, Evidence, and Audit Logs. Dual dialect support with PostgreSQL/PostGIS and async SQLite fallback.
- **Master Seeder:** Seeded 50 heterogeneous CCTV cameras across Gujarat (Ahmedabad, Gandhinagar, Surat, Vadodara, Rajkot) with real-world vendors (Hikvision, Dahua, Axis, CP Plus, Matrix).
- **Official Sentinel Camera Grid Ingest:** Integrated live catalog from `cctv.corp8.cloud/cameras.json` (30 cameras: `cam01` through `cam30`) with session auth, HLS URLs, RTSP (TCP:8554), and WHEP (8889).
- **Vehicle Intelligence & Journey Reconstruction:** Built cross-camera correlation engine calculating distance via Haversine, transit speeds, and chronological waypoints for primary demo vehicle `GJ01AB1234`.
- **GIS GeoJSON Endpoints:** Provided GeoJSON FeatureCollections for camera topologies, live events, and vehicle LineString travel routes.
- **Alert & Watchlist Engine:** Real-time hotlist matcher dispatching priority alerts over WebSockets with acknowledgment lifecycle.
- **Security & Audit Trail:** Full audit logging on sensitive lookups (camera views, vehicle queries, alert acknowledgments).
- **Official Gujarat Police Insignia:** Saved official emblem to `apps/web/public/gujarat-police-logo.png`.
- **Automated Test Suite:** 8 comprehensive tests in `apps/api/tests/test_api.py` passing 100% green.
