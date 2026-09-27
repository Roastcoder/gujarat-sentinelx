# 08 — DATABASE DESIGN & SCHEMA SPECIFICATION
**Platform:** Gujarat SentinelX  
**Primary Engine:** PostgreSQL 15 + PostGIS 3.3 (Dual Dialect with SQLite Async)  

---

## 1. Entity-Relationship Schema Overview

```
 [roles] 1 ──── ∞ [users] 1 ──── ∞ [investigations] 1 ──── ∞ [investigation_evidence]
                     │                    │
                     │                    └──── ∞ [investigation_notes]
                     ▼
 [departments] 1 ──── ∞ [cameras] 1 ──── 1 [camera_health]
                           │
 [districts]   1 ──── ∞    ├──── ∞ [camera_events]
                           │
 [police_stations] 1 ─ ∞   └──── ∞ [vehicle_detections] 1 ──── ∞ [alerts]
                                           │                       ▲
                                           ├──── 1 [anpr_detections]│
                                           │                       │
                                           └───────────────────────┴── ∞ [watchlists] 1 ─── ∞ [watchlist_vehicles]
```

---

## 2. Table Specifications & Indexes

### 2.1 `cameras`
- `id` (VARCHAR 36, PK)
- `camera_code` (VARCHAR 50, UNIQUE, INDEX)
- `name` (VARCHAR 150)
- `department_id` (FK `departments.id`)
- `district_id` (FK `districts.id`, INDEX)
- `police_station_id` (FK `police_stations.id`)
- `latitude` (FLOAT, INDEX)
- `longitude` (FLOAT, INDEX)
- `vendor` (VARCHAR 50)
- `vms` (VARCHAR 50)
- `protocol` (VARCHAR 20)
- `stream_url` (VARCHAR 255)
- `resolution` (VARCHAR 20)
- `fps` (INTEGER)
- `ptz_support` (BOOLEAN)
- `anpr_enabled` (BOOLEAN)
- `status` (VARCHAR 20, INDEX) — ONLINE, OFFLINE, DEGRADED
- `retention_period` (INTEGER, Default 30 Days)

### 2.2 `vehicle_detections`
- `id` (VARCHAR 36, PK)
- `camera_id` (FK `cameras.id`, INDEX)
- `timestamp` (DATETIME, INDEX)
- `tracking_id` (VARCHAR 50, INDEX)
- `plate_number` (VARCHAR 20, INDEX)
- `plate_confidence` (FLOAT)
- `vehicle_type` (VARCHAR 50)
- `vehicle_color` (VARCHAR 30)
- `latitude` (FLOAT)
- `longitude` (FLOAT)
- `speed_kmh` (FLOAT)
- `heading` (VARCHAR 10)
- `snapshot_url` (VARCHAR 255)
- `video_reference` (VARCHAR 255)
- `is_flagged` (BOOLEAN)
- **Composite Indexes:**
  - `idx_vehicle_plate_time`: (`plate_number`, `timestamp`)
  - `idx_vehicle_camera_time`: (`camera_id`, `timestamp`)
