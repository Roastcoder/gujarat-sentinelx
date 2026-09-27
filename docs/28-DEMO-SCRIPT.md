# 28 — DEMO SCRIPT & JURY PRESENTATION WALKTHROUGH
**Platform:** Gujarat SentinelX  
**Hackathon:** Gujarat CCTV Hackathon 2026  
**Demonstration Duration:** 3 – 5 Minutes  
**Primary Vehicle:** `GJ01AB1234` (White Tata Safari SUV)  

---

## Pre-Flight Verification Checklist
1. FastAPI Backend running on `http://localhost:8000` (Swagger docs at `/docs`).
2. Next.js Frontend running on `http://localhost:3000`.
3. Database initialized and seeded with 50 cameras (30 Sentinel Grid live feeds + 20 synthetic state corridor cameras).
4. Watchlist active with target plate `GJ01AB1234` flagged as `HIGH PRIORITY` (FIR #402/2026).

---

## 3-Minute Live Jury Script

### Step 1: Command Center Overview (0:00 – 0:45)
- **Action:** Open `http://localhost:3000/dashboard`.
- **Showcase:**
  - Official **Government of Gujarat — Home Department & Gujarat Police** crest in header.
  - KPI Cards: 80,000+ State Cameras projected, 50 prototype cameras active, 46 Online, 3 Offline, 1 Degraded.
  - Realtime Alert Banner and Event Ticker updating over WebSocket.
- **Narrative:**
  > *"Good morning respected jury members. Gujarat SentinelX is a unified CCTV intelligence and cross-camera investigation platform. Instead of replacing existing VMS systems like Milestone, Genetec, or Matrix, SentinelX operates as a vendor-neutral intelligence layer over heterogeneous infrastructure."*

---

### Step 2: GIS Topology & Live Sentinel Grid (0:45 – 1:30)
- **Action:** Navigate to `/map` and `/live`.
- **Showcase:**
  - MapLibre GL GIS Map displaying 50 camera pins across Ahmedabad, Gandhinagar, Surat, Vadodara, and Rajkot.
  - Click on a camera pin (e.g. `CAM-AHM-001` or `cam01` Chimanbhai Bridge) to show camera telemetry, vendor, VMS, and live stream status.
  - Open `/live` to show the 1/4/9/16 multi-camera grid streaming real feeds from `cctv.corp8.cloud` alongside telemetry HUD.
- **Narrative:**
  > *"Our GIS map unifies cameras across departments. Notice that we seamlessly integrate live RTSP/HLS streams from the official Sentinel Camera Grid with monotonic presentation timestamp tracking, enforced TCP, and automatic loop-cut recovery."*

---

### Step 3: The Core Hackathon Challenge — Search `GJ01AB1234` (1:30 – 2:45)
- **Action:**
  - In the prominent top search bar, type `GJ01AB1234` and hit Enter (or click "Investigate").
  - The browser opens `/vehicles/GJ01AB1234`.
- **Showcase:**
  - **Status Header:** `WATCHLIST MATCH — HIGH PRIORITY (Case FIR-402/2026 - C.G. Road Heist)`.
  - **KPIs:** 7 Camera Detections, 18.4 km Estimated Distance, 53.9 Minutes Elapsed Time, 97.4% Avg OCR Confidence.
  - **GIS Route:** MapLibre animates the connected journey from Iscon Crossroad (`CAM-AHM-001`) through Thaltej, Vaishnodevi Circle, and into Gandhinagar via Koba Circle (`CAM-GND-021`) up to Vidhan Sabha Marg (`CAM-GND-035`).
  - **Chronological Timeline:** Expanding each waypoint shows exact timestamps (08:42:17 → 09:36:12), speeds (48 km/h → 65 km/h), and camera IDs.
  - **Evidence Locker:** Photographic snapshot showing high-confidence license plate with HSRP security hologram.
- **Narrative:**
  > *"Here is our core demonstration. With one plate query: GJ01AB1234, SentinelX correlates 7 distinct camera nodes across two municipal jurisdictions. The investigator sees the exact chronological timeline, the animated GIS travel trajectory, and forensic photographic evidence with complete chain-of-custody metadata."*

---

### Step 4: Real-time Alert & Watchlist Engine (2:45 – 3:30)
- **Action:** Click the top banner button: **"RUN DEMO SCENARIO"**.
- **Showcase:**
  - Live WebSocket toast notification pops up: `ALERT: Flagged vehicle GJ01AB1234 detected at Koba Circle (CAM-GND-021)`.
  - Alert drawer opens showing suspect details and "Acknowledge" button.
  - Click "Acknowledge" — status turns green, and an immutable entry is added to `/audit-logs`.
- **Narrative:**
  > *"SentinelX evaluates incoming ANPR detections against real-time hotlists. When this suspect vehicle passed Koba Circle, an instant alert was broadcast to the Command Center. The officer acknowledges the alert, and every single query and action is cryptographically recorded in the audit trail."*

---

### Step 5: Scalability to 80,000 Cameras & Wrap-up (3:30 – 4:30)
- **Action:** Navigate to `/system-health` and show `/docs/19-SCALABILITY.md`.
- **Showcase:**
  - Component telemetry (Postgres, Redis, Kafka, OpenSearch, ClickHouse, MinIO, AI Workers).
  - Architectural blueprint: Edge processing across 33 District Command Centers (DCCC) sending metadata-only over Kafka to prevent WAN saturation.
- **Closing Punchline:**
  > *"SentinelX proves that Gujarat does not need to discard existing CCTV investments. By deploying this intelligence layer, Gujarat Police can connect every camera, understand every event, and reconstruct every journey."*
