# 36 — STREAM OPERATIONS MANUAL
**Gujarat SentinelX Platform**  
**Document Ref:** GSX-OPS-STREAM-2026-V1  
**Last Updated:** 2026-09-27  

---

## 1. Stream Session Management Architecture
The `StreamSessionManager` coordinates all live stream consumption across the statewide CCTV deployment. To eliminate duplicate bandwidth demands on edge camera gateways, every camera session operates under atomic reference counting:

```text
       Live Monitoring (Client 1) ──┐
                                     ├──► acquire("operator_1") [ref_count=1 -> Start Stream]
         AI Pipeline (Worker 2)   ──┘
                                     └──► acquire("ai_worker_2") [ref_count=2 -> Share Stream]
                                     
       Operator Closes Tab        ─────► release("operator_1") [ref_count=1 -> Keep Active]
       AI Pipeline Completes Task ─────► release("ai_worker_2") [ref_count=0 -> Clean Shutdown]
```

---

## 2. Camera Lifecycle State Machine
Cameras transition through 7 explicit lifecycle states:

```text
  [ DISCOVERED ]
        │ (Acquire / Ingest)
        ▼
  [ CONNECTING ] ──(Success)──► [ ONLINE ] ──(Decoder Warning)──► [ DEGRADED ]
        │                             │                                  │
     (Fail)                        (Drop)                             (Drop)
        │                             │                                  │
        └──────────────┬──────────────┴──────────────────────────────────┘
                       ▼
               [ RECONNECTING ] (Exponential Backoff: 2s -> 30s)
                       │
             (Catalogue Sync Removed)
                       │
                       ▼
                  [ REMOVED ]
```

---

## 3. Operational Endpoints

### 3.1. Authoritative Catalogue Discovery
- **Endpoint:** `GET /api/ingest`
- **Response Format:**
  ```json
  [
    {
      "camera_id": "cam01",
      "camera_code": "CAM-AHM-001",
      "name": "SG Hwy - Iscon Crossroad Junction",
      "location": "SG Highway, Iscon Crossroad, Satellite, Ahmedabad",
      "latitude": 23.0287,
      "longitude": 72.5068,
      "codec": "H.264",
      "live_status": "ONLINE",
      "width": 1920,
      "height": 1080,
      "fps_declared": 25.0,
      "bitrate": 4096,
      "rtsp_url": "rtsp://cybersachinyadav%40gmail.com:A2ZV-8SLH-T9NF@103.250.160.189:8554/stream/cam01",
      "webrtc_url": "http://cybersachinyadav%40gmail.com:A2ZV-8SLH-T9NF@103.250.160.189:8889/stream/cam01/whep",
      "hls_url": "https://cctv.corp8.cloud/live/stream/cam01/index.m3u8",
      "vms_id": "Milestone XProtect",
      "department": "Home Department",
      "district": "Ahmedabad"
    }
  ]
  ```

### 3.2. Stream Acquisition
- **Endpoint:** `POST /api/v1/streams/{camera_code}/acquire`
- **Payload:** `{"consumer_id": "operator_console_4"}`

### 3.3. Stream Release
- **Endpoint:** `POST /api/v1/streams/{camera_code}/release`
- **Payload:** `{"consumer_id": "operator_console_4"}`

### 3.4. Real-time Stream Telemetry
- **Endpoint:** `GET /api/v1/streams/{camera_code}/health`
- **Telemetry Returned:**
  - `measured_fps`: Continuously measured frame arrival frequency
  - `last_pts`: Presentation timestamp of latest decoded frame
  - `last_delta_t_ms`: Inter-frame timestamp interval ($\Delta t$)
  - `decode_errors`: Tolerated warning count
  - `reconnect_count`: Active reconnection cycle count
  - `current_backoff_sec`: Exponential backoff timer

---

## 4. Failure Injection Testing
For evaluation, CI/CD, and resilience drills, operators can trigger controlled failure injection:
- `POST /api/v1/simulator/failure-injection`
  - Failure types: `offline`, `decoder_warning`, `pts_gap`, `scene_discontinuity`
- `POST /api/v1/simulator/failure-injection/clear`
  - Restores all cameras to nominal operation.
