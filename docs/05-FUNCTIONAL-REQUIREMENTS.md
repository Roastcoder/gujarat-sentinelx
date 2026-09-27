# 05 — FUNCTIONAL REQUIREMENTS MATRIX
**Platform:** Gujarat SentinelX  

| Requirement ID | Module | Feature Description | Implementation Status |
|---|---|---|---|
| **FR-01** | Camera Registry | Full CRUD, unique camera code, district, department, police station, vendor, VMS, coordinates, capabilities | [IMPLEMENTED & TESTED] |
| **FR-02** | Live Video Wall | 1/4/9/16 layout grid, HLS & RTSP TCP streams, telemetry HUD, full-screen toggle, snapshot capture | [IMPLEMENTED & TESTED] |
| **FR-03** | GIS Mapping | MapLibre GL vector tiles, camera markers with online/offline badges, interactive popup, route polyline | [IMPLEMENTED & TESTED] |
| **FR-04** | ANPR Ingestion | License plate detection, confidence score, Indian HSRP format verification, timestamp extraction | [IMPLEMENTED & TESTED] |
| **FR-05** | Vehicle Intelligence | Query by plate (e.g. `GJ01AB1234`), 7-camera chronological timeline, transit speed, distance | [IMPLEMENTED & TESTED] |
| **FR-06** | Journey Reconstruction | Multi-camera correlation connecting adjacent sightings with directional vectors and elapsed duration | [IMPLEMENTED & TESTED] |
| **FR-07** | Watchlist Matching | Hotlist check against criminal cases, priority classification (LOW, MEDIUM, HIGH, CRITICAL) | [IMPLEMENTED & TESTED] |
| **FR-08** | Realtime Alerts | Instant WebSocket broadcast to Command Center alert drawer, audio cue, and acknowledgment lifecycle | [IMPLEMENTED & TESTED] |
| **FR-09** | Forensic Evidence | Photographic snapshots with plate highlights, metadata, and SHA-256 chain of custody hashes | [IMPLEMENTED & TESTED] |
| **FR-10** | Investigation Dossier | Digital case files (`INV-2026-0402`), attached officer notes, suspect plate linking | [IMPLEMENTED & TESTED] |
| **FR-11** | Security & RBAC | JWT authentication, bcrypt passwords, role enforcement (Super Admin, Investigator, Operator, Auditor) | [IMPLEMENTED & TESTED] |
| **FR-12** | Audit Logging | Immutable audit records on sensitive queries, camera viewing, alert responses, and data exports | [IMPLEMENTED & TESTED] |
| **FR-13** | Demo Mode | One-click "RUN DEMO SCENARIO" executing deterministic 7-camera tracking and alert firing | [IMPLEMENTED & TESTED] |
