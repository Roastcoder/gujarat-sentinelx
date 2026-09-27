# 04 — SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
**Platform:** Gujarat SentinelX  

---

## 1. System Requirements
- **Frontend Engine:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, MapLibre GL, Recharts.
- **Backend API:** FastAPI (Python 3.11+ / 3.14), Pydantic v2, SQLAlchemy 2.0 ORM, Uvicorn ASGI Server.
- **Database:** PostgreSQL 15 + PostGIS 3.3 (Docker) with SQLite Async fallback for zero-dependency standalone execution.
- **Messaging & Streaming Bus:** Kafka KRaft Mode / In-memory PubSub fallback.
- **Real-Time WebSockets:** Starlette/FastAPI WebSocket ConnectionManager with broadcast channels.
- **Live Stream Protocols:** HLS (CDN host `cctv.corp8.cloud`), RTSP (TCP port 8554), WebRTC (WHEP port 8889).

## 2. Interface Specifications
- **HTTP / REST:** JSON API following OpenAPI 3.1.0 specifications under `/api/v1`.
- **GIS Formats:** RFC 7946 compliant GeoJSON FeatureCollections for camera nodes and vehicle route polylines.
- **Error Format:** Standardized `{ "error": { "code": "...", "message": "...", "request_id": "..." } }`.
