# 27. DEMO MODE & PRESENTATION RUNBOOK
**Project:** Gujarat SentinelX  
**Authority:** Government of Gujarat — Home Department & Gujarat Police  
**Hackathon Target:** Gujarat CCTV Hackathon 2026  
**Document Code:** GDJ-SENX-DOC-27  

---

## 1. Executive Summary

Demo Mode in Gujarat SentinelX is designed specifically for jury evaluation and command center demonstrations. It ensures:
1. **Deterministic Execution:** The primary acceptance test (`GJ01AB1234`) will always execute flawlessly regardless of network conditions.
2. **One-Click Replay:** Officers and judges can trigger the complete 7-camera tracking journey at any moment via the top-bar "Run Demo Scenario" button or `POST /api/v1/demo/trigger`.
3. **Dual Verification:** Combines synthetic ANPR checkpoints with real live streaming feeds (Sentinel Camera Grid) and national VAHAN 4.0 registry records (Surepass).

---

## 2. One-Click Demo Trigger

### 2.1 UI Trigger
Located on the top navigation bar of every page:
- Button: **"Run Demo Scenario (GJ01AB1234)"**
- On click:
  1. Sends `POST /api/v1/demo/trigger`.
  2. Seeds/resets 7 sequential camera detections across Ahmedabad and Gandhinagar.
  3. Triggers HIGH-priority Watchlist Alert for Vehicle Theft / Kidnapping Case `#INV-2026-0402`.
  4. Displays a success notification badge with direct navigation link.
  5. Automatically redirects to `/vehicles/GJ01AB1234`.

### 2.2 API Trigger
```bash
curl -X POST http://localhost:8000/api/v1/demo/trigger
```
**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Demo scenario initialized successfully for vehicle GJ01AB1234",
  "vehicle_number": "GJ01AB1234",
  "checkpoints_traversed": 7,
  "watchlist_match": true,
  "alert_id": "ALT-20260925-001"
}
```

---

## 3. Demo Walkthrough Sequence (2-Minute Hackathon Pitch)

### Step 1: The Alert Trigger (00:00 - 00:30)
- Start on `/dashboard`.
- Notice the live CCTV stats (50 cameras, 98.4% uptime, 14 active alerts).
- Click **"Run Demo Scenario"**.
- Watchlist trigger fires instantly with red notification drawer.

### Step 2: Vehicle Intelligence & VAHAN Dossier (00:30 - 01:00)
- Navigate to `/vehicles/GJ01AB1234`.
- Highlight the **Live Surepass VAHAN 4.0 Dossier**:
  - Registered Owner: GAURAV
  - Address: Nava Naroda, Ahmedabad
  - Vehicle: Royal Enfield Bullet 350
  - RC Status: ACTIVE
  - Insurance & PUCC status verified.

### Step 3: Cross-Camera GIS Trajectory (01:00 - 01:30)
- Show the interactive MapLibre GL map tracing the route:
  - Iscon Crossroad → Pakwan → Thaltej → Vaishnodevi → Koba Circle (Alert) → CHH Road → Sachivalaya.
  - Waypoints numbered 1 through 7 with hover telemetry (Speed, Time, Confidence).

### Step 4: Live Surveillance Feeds & Video Grid (01:30 - 01:45)
- Navigate to `/live`.
- Switch between 1x1, 2x2, 3x3, and 4x4 matrix view.
- Demonstrate low-latency HLS/WebRTC streaming from Sentinel Camera Grid.

### Step 5: Evidence & Audit Log (01:45 - 02:00)
- Show the Forensic Snapshot Gallery with SHA-256 tamper-proof stamps.
- Click **"Export Dossier"** for digital chain-of-custody.
- Navigate to `/audit-logs` to show Section 65B Indian Evidence Act compliant logging.
