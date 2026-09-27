# 09 — API SPECIFICATION (OPENAPI V1)
**Platform:** Gujarat SentinelX  
**Base URL:** `/api/v1`  
**Interactive Docs:** `/docs` (Swagger UI) & `/redoc`  

---

## 1. Authentication & RBAC
- `POST /api/v1/auth/login` — Authenticate username & password; returns JWT bearer token and officer profile.
- `POST /api/v1/auth/logout` — Revokes session and registers logout audit entry.
- `GET /api/v1/auth/me` — Fetches current authenticated officer profile and permissions.

## 2. Camera Registry
- `GET /api/v1/cameras` — List cameras with pagination, district filter, vendor filter, and status.
- `GET /api/v1/cameras/{id}` — Retrieve camera profile with live health metrics.
- `POST /api/v1/cameras` — Register a new camera node into the state topology.
- `PUT /api/v1/cameras/{id}` — Update camera parameters or streaming URL.
- `DELETE /api/v1/cameras/{id}` — Deactivate camera node.

## 3. GIS & Spatial Endpoints
- `GET /api/v1/gis/cameras` — GeoJSON FeatureCollection of all camera coordinates with operational status.
- `GET /api/v1/gis/events` — GeoJSON FeatureCollection of recent detection points.
- `GET /api/v1/gis/routes/{plate}` — GeoJSON FeatureCollection containing waypoints and connected LineString travel trajectory for target vehicle.

## 4. Vehicle Intelligence & Journey Reconstruction
- `GET /api/v1/vehicles` — Search historical vehicle sightings by plate, district, color, or vehicle type.
- `GET /api/v1/vehicles/{plate}` — Master vehicle intelligence endpoint returning status, first/last seen, 7-camera timeline, GIS trajectory, and evidence locker.
- `GET /api/v1/vehicles/{plate}/timeline` — Chronological cross-camera sightings list.
- `GET /api/v1/vehicles/{plate}/route` — Trajectory waypoints with hop distance and velocity.

## 5. Alerts & Watchlists
- `GET /api/v1/alerts` — Real-time security alerts queue.
- `POST /api/v1/alerts/{id}/acknowledge` — Acknowledge alert with officer notes.
- `GET /api/v1/watchlists` — Active police watchlists.
- `POST /api/v1/watchlists/{id}/vehicles` — Add suspect vehicle to hotlist.

## 6. System Health, VMS, Audit & Demo
- `GET /api/v1/system/health` — Infrastructure telemetry across 8 microservices.
- `GET /api/v1/vms/integrations` — Connected VMS platforms (Sentinel Grid, Milestone, Genetec, Matrix).
- `GET /api/v1/audit/logs` — Security and access compliance audit trail.
- `POST /api/v1/demo/trigger` — Trigger primary hackathon demonstration scenario (`GJ01AB1234`).
- `WS /api/v1/ws` — Real-time event broadcasting channel.
