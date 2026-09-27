# 11 — VIDEO PIPELINE ARCHITECTURE: SENTINEL CAMERA GRID
**Platform:** Gujarat SentinelX  
**Authority:** Government of Gujarat — Home Department & Gujarat Police  

---

## 1. Overview
The SentinelX video ingestion pipeline connects heterogeneous live CCTV camera feeds across Gujarat. The pipeline abstracts physical camera hardware and VMS gateways, offering normalized playback, frame decoding, and AI inference.

```
+-----------------------------------------------------------------------------------------------+
|                                SENTINEL CAMERA GRID (cctv.corp8.cloud)                        |
|  [HLS CDN Host: 443]          [RTSP Gateway: 103.250.160.189:8554]   [WHEP Gateway: 8889]    |
+-----------------------------------------------------------------------------------------------+
                                               │
             ┌─────────────────────────────────┼────────────────────────────────┐
             ▼ (RTSP TCP)                      ▼ (HLS)                          ▼ (WHEP)
+-------------------------+       +-------------------------+       +-------------------------+
|     AI INGEST ENGINE    |       |     DASHBOARD PLAYER    |       |   LOW-LATENCY PREVIEW   |
| • Force TCP Transport   |       | • Hls.js Adaptive Stream|       | • WebRTC Browser Ingest |
| • PTS Monotonic Timing  |       | • CDN Cookie Session    |       | • Sub-500ms Realtime    |
| • Exponential Backoff   |       | • Fallback to Canvas    |       | • 1/4/9/16 Camera Grid  |
| • Discontinuity Recovery|       | • Auto-Reconnect Logic  |       | • Stream HUD Telemetry  |
+-------------------------+       +-------------------------+       +-------------------------+
```

---

## 2. Ingest Protocols & Live Endpoints

### 2.1 HLS (HTTP Live Streaming)
- **Host:** `https://cctv.corp8.cloud/<id>/index.m3u8`
- **Authentication:** Session cookie (`sentinel=...`) acquired via `/auth/login`.
- **Intended For:** Command Center web dashboard, remote operator tablets, mobile feeds.
- **Handling:** Client-side Hls.js integration with error recovery for network drops and loop point scene discontinuities.

### 2.2 RTSP (Real-Time Streaming Protocol)
- **Host:** `rtsp://<email>:<password>@103.250.160.189:8554/stream/<id>`
- **Live Credentials:** `cybersachinyadav%40gmail.com:A2ZV-8SLH-T9NF`
- **Port:** `8554` (TCP)
- **Critical Integrator Requirement:** Must enforce TCP (`rtsp_transport;tcp`). UDP suffers packet drops across state firewalls leading to frame artifacts.
- **Intended For:** AI Inference (OpenCV, YOLOv8/v11, PaddleOCR, DeepStream).

### 2.3 WebRTC (WHEP — WebRTC HTTP Egress Protocol)
- **Host:** `http://<email>:<password>@103.250.160.189:8889/stream/<id>/whep`
- **Port:** `8889`
- **Intended For:** Sub-second browser monitoring and multi-camera split screen (1/4/9/16 grid).

---

## 4. Dynamic Camera Catalogue Discovery

Do NOT hardcode camera IDs. The camera grid is dynamic. The active catalogue must be queried from:

```bash
# Establish session cookie:
curl -s -c cookies.txt -d "email=cybersachinyadav@gmail.com&password=A2ZV-8SLH-T9NF" https://cctv.corp8.cloud/auth/login

# Fetch active catalogue (returns cam01 ... cam30):
curl -s -b cookies.txt -H "User-Agent: Mozilla/5.0..." https://cctv.corp8.cloud/cameras.json
```

---

## 5. Verified AI Integrator Code Snippets

### 5.1 Python 3 with OpenCV (RTSP / AI Inference)
```python
import os, cv2

# Force TCP transport (MANDATORY to prevent UDP packet drop and decode corruption):
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

# Stream URL with percent-encoded email (cybersachinyadav%40gmail.com):
url = "rtsp://cybersachinyadav%40gmail.com:A2ZV-8SLH-T9NF@103.250.160.189:8554/stream/cam04"
cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)

while True:
    ok, frame = cap.read()
    if not ok:
        print("Reconnecting to stream...")
        break  # Apply exponential reconnect backoff
    
    # Accurate timing MUST use presentation timestamp (PTS), never arrival time:
    pts_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
    
    # Process frame with YOLOv8 ANPR inference model...
```

### 5.2 GStreamer Pipeline (RTSP TCP)
```bash
gst-launch-1.0 rtspsrc location=rtsp://cybersachinyadav%40gmail.com:A2ZV-8SLH-T9NF@103.250.160.189:8554/stream/cam04 protocols=tcp latency=200 \
  ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! fakesink
```

### 5.3 FFmpeg / ffplay Quick Preview
```bash
# Direct RTSP preview over TCP (Port 8554):
ffplay -rtsp_transport tcp rtsp://cybersachinyadav%40gmail.com:A2ZV-8SLH-T9NF@103.250.160.189:8554/stream/cam04

# Public HLS stream preview:
ffplay https://cctv.corp8.cloud/cam04/index.m3u8
```
