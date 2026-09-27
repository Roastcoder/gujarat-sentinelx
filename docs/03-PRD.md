# 03 — PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Project:** Gujarat SentinelX  
**Authority:** Government of Gujarat — Home Department & Gujarat Police  
**Hackathon Target:** Gujarat CCTV Hackathon 2026  

---

## 1. Product Goals
1. Establish a unified, searchable registry of heterogeneous cameras.
2. Ingest live camera streams via HLS, RTSP (TCP:8554), and WHEP from the Sentinel Camera Grid (`cctv.corp8.cloud`).
3. Deliver sub-second cross-camera vehicle correlation and journey reconstruction for `GJ01AB1234`.
4. Plot interactive GIS routes on MapLibre GL vector maps with directional arrows and transit speeds.
5. Provide automatic watchlist alerting with WebSocket broadcast and officer acknowledgment.
6. Record immutable security audit logs for all sensitive queries.

## 2. Target User Personas
- **State Command Center Director:** Monitors statewide health, high-level intelligence, and district statistics.
- **Investigation Officer (e.g. Inspector V. K. Patel):** Searches license plates, reconstructs vehicle trajectories, compiles digital forensic dossiers.
- **Control Room Operator:** Monitors 1/4/9/16 live video walls and responds to real-time watchlist match alerts.
- **Vigilance & Compliance Auditor:** Inspects audit logs to guarantee that surveillance data is accessed only under authorized warrants.

## 3. Key Non-Goals (Prototype Scope)
- Does not replace physical VMS servers or municipal NVR hardware.
- Does not stream 80,000 continuous raw video feeds to a central cloud (metadata-only edge ingest model).
