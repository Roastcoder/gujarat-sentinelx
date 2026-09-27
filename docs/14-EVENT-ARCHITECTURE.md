# 14 — EVENT-DRIVEN STREAMING ARCHITECTURE
**Platform:** Gujarat SentinelX  

---

## 1. Event Pipeline & Normalization
Every camera detection, whether ingested from physical RTSP, HLS, or synthetic simulation, is converted into a normalized detection event payload:

```json
{
  "event_id": "EVT-928172",
  "camera_id": "CAM-AHM-00182",
  "timestamp": "2026-09-25T08:42:17Z",
  "event_type": "ANPR_DETECTED",
  "object_type": "vehicle",
  "plate": "GJ01AB1234",
  "plate_confidence": 0.974,
  "vehicle_type": "SUV",
  "vehicle_color": "White",
  "speed_kmh": 48.0,
  "heading": "North",
  "tracking_id": "TRK-12882"
}
```

---

## 2. Kafka Topic Partitioning (80,000 Scale)
- `cctv.streams.raw` — Stream heartbeat and telemetry.
- `cctv.detections.vehicle` — Raw YOLO bounding boxes and trajectories.
- `cctv.anpr.events` — High-confidence license plate readings.
- `cctv.alerts.priority` — Hotlist matching events requiring immediate tactical response.
- **Partitioning Key:** Hashed by `district_id` ensuring strict sequential ordering of events per jurisdiction while enabling horizontal worker concurrency.
