# 01 — PROJECT OVERVIEW: GUJARAT SENTINELX
**Integrated CCTV Intelligence, GIS & Cross-Camera Investigation Platform**  
**Authority:** Government of Gujarat — Home Department & Gujarat Police  
**Event:** Gujarat CCTV Hackathon 2026  

---

## 1. Executive Summary
**Gujarat SentinelX** is a unified intelligence, surveillance, and forensic investigation platform that aggregates heterogeneous municipal, traffic, and police CCTV cameras across Gujarat into a single GIS-enabled command and control dashboard.

Instead of incurring prohibitive capital costs and operational downtime attempting to replace existing municipal and departmental VMS installations (Milestone, Genetec, Matrix, HikCentral), SentinelX operates as an **Integration and Intelligence Layer** deployed above them.

```
Existing CCTV / VMS Infrastructure (Municipal, Police, Highway)
                             ↓
             SENTINELX ADAPTER & GATEWAY LAYER
                             ↓
           AI PROCESSING & EVENT CORRELATION BUS
                             ↓
         CENTRAL GIS & CROSS-CAMERA INVESTIGATION
                             ↓
         POLICE STATE COMMAND & CONTROL DASHBOARD
```

---

## 2. Core Capabilities Demonstrated
1. **Centralized Camera Registry:** Complete CRUD and health monitoring across 50 cameras.
2. **Sentinel Camera Grid Ingestion:** Live feeds mapped from `cctv.corp8.cloud` (`cam01` through `cam30`) with HLS, RTSP (TCP:8554), and WHEP protocols.
3. **Vehicle Intelligence & ANPR:** Optical Character Recognition conforming to Indian High-Security Registration Plates (HSRP) with confidence scoring.
4. **Cross-Camera Tracking & Journey Reconstruction:** Primary hackathon demonstration solving input `GJ01AB1234` by reconstructing 7 sequential camera sightings across Ahmedabad and Gandhinagar.
5. **Interactive GIS Trajectory:** MapLibre GL polyline route generation with direction vectors, transit speed estimations, and timestamps.
6. **Watchlist & Real-Time Alert Engine:** Automatic detection matching against active hotlists (wanted getaway vehicle in Case FIR-402/2026) with WebSocket alert broadcasting.
7. **Forensic Evidence Locker:** Tamper-proof photographic snapshots with SHA-256 chain-of-custody hashes.
8. **Security & Auditability:** Role-Based Access Control and immutable audit logging for all vehicle lookups.
