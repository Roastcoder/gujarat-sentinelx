# 35 — CCTV INGEST SPECIFICATION
**Gujarat SentinelX Platform**  
**Classification:** Authoritative Technical Standard  
**Document Ref:** GSX-SPEC-INGEST-2026-V1  
**Last Updated:** 2026-09-27  

---

## 1. Scope and Authority
This document defines the binding technical specification for all CCTV stream ingestion across the Gujarat SentinelX platform. This specification takes precedence over all other architectural assumptions and must be strictly adhered to by all edge gateways, regional processing nodes, and backend ingestion pipelines.

---

## 2. Stream Architecture Principles
1. **Live-Only RTP/RTSP Architecture:**
   - Every camera feed represents an operational, real-time physical camera.
   - Video arrives sequentially in real-time.
   - There is strictly **no seeking**, **no byte-range fetching** for the AI inference pipeline, and **no assumption that footage can be pre-downloaded**.
   - Local-video-first architectures are expressly prohibited.

2. **The Catalogue is the Contract (`GET /api/ingest`):**
   - Camera IDs, stream paths, and token formats must **NEVER be hardcoded** into application code.
   - All ingestion begins from `GET /api/ingest`.
   - The catalogue is dynamic and subject to upstream additions, renamings, and status changes.
   - `CameraCatalogueService` polls `/api/ingest` every 30–60 seconds, detects changes, persists updates, and preserves historical event linkages if a camera is removed.

---

## 3. Protocol Tiers and Port Allocation

| Protocol | Endpoint Pattern | Operational Purpose | Client Enforcement |
| :--- | :--- | :--- | :--- |
| **RTSP** | `rtsp://<host>:8554/stream/<id>` | High-throughput AI Inference, ANPR, Object Tracking | **MANDATORY TCP** (`rtsp_transport;tcp`) |
| **WebRTC WHEP** | `http://<host>:8889/stream/<id>/whep` | Low-latency (sub-500ms) live preview in operator browser | Standard HTTP POST / WHEP Client |
| **HLS** | `https://<host>/live/stream/<id>/index.m3u8` | Wide-area command dashboards, mobile devices, restricted networks | Native HLS / Video.js / Hls.js |

---

## 4. Mandatory Transport & Codec Standards

### 4.1. Mandatory RTSP over TCP
UDP transport is strictly prohibited for AI inference due to packet loss, macroblock corruption, and OCR character corruption under network jitter.
- **OpenCV / FFmpeg:**
  ```python
  import os
  os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"
  cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
  ```
- **GStreamer:**
  ```text
  rtspsrc location=<url> protocols=tcp ! rtph264depay ! h264parse ! avdec_h264 ! appsink
  ```
- **NVIDIA DeepStream:**
  ```ini
  [source0]
  type=4
  uri=<url>
  select-rtp-protocol=4
  ```

### 4.2. Dual Codec Support (H.264 & H.265 / HEVC)
The system dynamically selects the hardware/software decoder per camera:
- **H.264:** `rtph264depay` -> `h264parse` -> `decoder`
- **H.265 / HEVC:** `rtph265depay` -> `h265parse` -> `decoder`
- **NVIDIA Acceleration:** `nvv4l2decoder` with dynamic payload parsing.

---

## 5. Presentation Timestamps (PTS) — Authoritative Time Standard
All timing logic across Gujarat SentinelX is driven strictly by Presentation Timestamps:
- **OpenCV:** `CAP_PROP_POS_MSEC`
- **GStreamer:** Buffer PTS (`GST_BUFFER_PTS`)
- **Prohibited Sources:**
  - Wall-clock frame arrival time (`time.time()`)
  - Processing completion timestamp
  - Declared `CAP_PROP_FPS`

### 5.1. Velocity & Movement Calculation
Vehicle velocity and tracker dwell time are calculated using actual elapsed PTS:
$$\Delta t = \text{PTS}_{\text{current}} - \text{PTS}_{\text{previous}}$$
$$v = \frac{\text{Distance}}{\Delta t}$$

---

## 6. Fault Tolerance & Decoder Error Handling
1. **Exponential Backoff Reconnect:**
   - On network interruption or camera drop, reconnect backoff follows:
     $$T_{\text{backoff}} = \min(30.0, 2.0 \times 2^{(\text{count} - 1)})$$
   - Sequence: 2.0s, 4.0s, 8.0s, 16.0s, 30.0s (maximum cap).
2. **Decoder Warnings Resilience:**
   - Non-fatal warnings such as `"Error constructing the frame RPS"` or `"Could not find ref with POC"` are logged and transition the camera to `DEGRADED` rather than terminating the pipeline.
3. **Scene Cut / Loop Point Discontinuity:**
   - If PTS rolls backwards ($\Delta t < -1000\text{ ms}$) or jumps abruptly ($\Delta t > 60000\text{ ms}$), the system resets short-term trackers and background models while keeping historical database detections completely intact.
