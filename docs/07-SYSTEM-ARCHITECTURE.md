# 07 — SYSTEM ARCHITECTURE DOCUMENT
**Platform:** Gujarat SentinelX  
**Authority:** Government of Gujarat — Home Department & Gujarat Police  

---

## 1. High-Level Architectural Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    HETEROGENEOUS CCTV FEEDS                                        |
|  [Ahmedabad Municipal]    [Gandhinagar SafeCity]    [Surat Traffic Division]    [State Highways]  |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                    VMS ADAPTER & GATEWAY LAYER                                     |
|  • Milestone MIP Adapter  • Genetec Omnicast WebSDK  • Sentinel Grid HLS/RTSP/WHEP  • Matrix ONVIF |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                      EDGE STREAM GATEWAY                                           |
|  • Force TCP Protocol     • Monotonic PTS Parser     • Discontinuity Cut Filter • Stream HUD Telemetry |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                 PLUGGABLE AI ANALYTICS PIPELINE                                    |
|  • DetectionProvider (YOLOv8/v11)  • OCRProvider (PaddleOCR/CRNN)  • TrackingProvider (ByteTrack)   |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                   DISTRIBUTED EVENT BUS (KAFKA)                                    |
|  Topics: cctv.detections.vehicle | cctv.anpr.events | cctv.alerts.priority                         |
+----------------------------------------------------------------------------------------------------+
                                                  │
            ┌─────────────────────────────────────┼──────────────────────────────────┐
            ▼                                     ▼                                  ▼
+────────────────────────+            +───────────────────────+          +─────────────────────────+
|  POSTGRESQL / POSTGIS  |            |      OPENSEARCH       |          |       CLICKHOUSE        |
| • Camera Topology      |            | • Fuzzy Plate Search  |          | • Time-Series Analytics |
| • Watchlists & Alerts  |            | • Registration Prefix |          | • Scalable Aggregations |
+────────────────────────+            +───────────────────────+          +─────────────────────────+
            │                                                                         │
            └─────────────────────────────────────┬───────────────────────────────────┘
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                   CORE INTELLIGENCE API (FASTAPI)                                  |
|  • Journey Reconstruction Engine  • Watchlist Alert Matcher  • Audit Trail Logger  • WebSockets    |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                               COMMAND CENTER DASHBOARD (NEXT.JS 14)                                |
|  • Dark Navy Police UI    • MapLibre GL GIS    • 1/4/9/16 Video Wall    • GJ01AB1234 Investigation |
+----------------------------------------------------------------------------------------------------+
```
