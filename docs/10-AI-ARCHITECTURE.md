# 10 — AI VIDEO ANALYTICS & INFERENCE ARCHITECTURE
**Platform:** Gujarat SentinelX  

---

## 1. Provider-Based AI Abstraction
To ensure hardware independence and vendor neutrality, SentinelX separates AI model execution from business services through provider interfaces:

```
+----------------------------------------------------------------------------------------------------+
|                                    AI PROVIDER INTERFACES                                          |
|  • DetectionProvider          • OCRProvider          • TrackingProvider    • AttributeProvider     |
+----------------------------------------------------------------------------------------------------+
                                                  │
                  ┌───────────────────────────────┴───────────────────────────────┐
                  ▼                                                               ▼
+------------------------------------+                         +-------------------------------------+
|      DETERMINISTIC SIMULATOR       |                         |        PRODUCTION DEEPSTREAM        |
|  • Standalone Zero-GPU Mode        |                         |  • TensorRT YOLOv8 / YOLOv11        |
|  • Reproducible Hackathon Scenario |                         |  • PaddleOCR / SVTR HSRP Text       |
|  • Synthetic Stress Testing        |                         |  • ByteTrack Inter-Frame Tracking   |
+------------------------------------+                         +-------------------------------------+
```

---

## 2. Neural Network Pipeline
1. **Object Detection (YOLOv8 / YOLOv11):** Localizes vehicles (`car`, `truck`, `bus`, `motorcycle`, `auto`).
2. **License Plate Localization (LPD):** Isolates the bounding box for the High-Security Registration Plate.
3. **Optical Character Recognition (PaddleOCR / CRNN):** Reads characters formatted per Indian Motor Vehicles Act (`GJ` state code, district RTO code, series, and 4-digit registration).
4. **Inter-Frame Tracking (ByteTrack / BoT-SORT):** Associates detections across video frames using Kalman filtering to track persistent trajectories through camera blindspots.
