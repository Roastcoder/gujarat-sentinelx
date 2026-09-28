# Gujarat SentinelX
**Integrated CCTV Intelligence, GIS & Cross-Camera Journey Reconstruction Platform**  
*Government of Gujarat — Home Department & Gujarat Police*  
*Target: Gujarat CCTV Hackathon 2026*  

> **Tagline:** *"Connect Every Camera. Understand Every Event. Reconstruct Every Journey."*

## 🏆 Hackathon Submission Deliverables

The complete hackathon submission package is organized in dedicated documents and folders:

1. **[Solution Presentation (Slide Deck)](file:///Users/yogiifaujdar/Downloads/Gujarat%20SentinelX/SOLUTION_PRESENTATION.md):** 14-slide executive presentation covering problem statement, value proposition, acceptance test results, MoRTH VAHAN 4.0 integration, VMS federation, C4 architecture, and statewide 80k scalability.
2. **[High-Level Design (HLD) Document](file:///Users/yogiifaujdar/Downloads/Gujarat%20SentinelX/HIGH_LEVEL_DESIGN.md):** Complete technical architecture document detailing C4 diagrams, subsystem specifications, storage topology (PostGIS, ClickHouse, OpenSearch, MinIO), capacity calculations, and Section 65B forensics.
3. **[Workflow & Integration Diagrams](file:///Users/yogiifaujdar/Downloads/Gujarat%20SentinelX/WORKFLOW_INTEGRATION_DIAGRAMS.md):** Production-grade Mermaid sequence and flow diagrams for Vehicle Journey Tracking, Heterogeneous VMS Federation, MoRTH VAHAN 4.0 Surepass Gateway, Real-Time Alert Dispatch, and Section 65B Forensic Hashing.
4. **[Screenshots Folder & Visual Gallery](file:///Users/yogiifaujdar/Downloads/Gujarat%20SentinelX/screenshots/README.md):** 11 Full HD (1920×1080) native application captures demonstrating every core capability (Command Dashboard, Vehicle Journey `GJ01AB1234`, Live CCTV Grid, VMS Gateway, Alerts, System Health, and VAHAN RC Portal).
5. **[Submit Your Solution (Video Demonstration Guide)](file:///Users/yogiifaujdar/Downloads/Gujarat%20SentinelX/SUBMISSION_VIDEO_GUIDE.md):** Timestamped 8-scene voiceover script, recording guide, and copy-paste portal submission entries.

---

## 🌟 Overview
Gujarat SentinelX is an open, modular, vendor-neutral CCTV video intelligence and geospatial platform designed to integrate heterogeneous CCTV infrastructure across 26 government departments and scale toward ~80,000 cameras.

### Key Capabilities
- **Authoritative Ingest Discovery Contract (`GET /api/ingest`):** Fully dynamic camera discovery. No hardcoded camera IDs or URLs.
- **Strictly PTS-Driven Timing Engine:** Video analytics, dwell-time, and velocity calculated strictly from Presentation Timestamps ($\Delta t = \text{PTS}_{\text{current}} - \text{PTS}_{\text{previous}}$); ignores arrival jitter and declared FPS.
- **RTSP Force TCP:** Guaranteed packet integrity for backend deep learning (`rtsp_transport;tcp`).
- **Atomic Reference Counting (`StreamSessionManager`):** Prevents duplicate edge gateway streaming load.
- **Cross-Camera Vehicle Journey Reconstruction:** Trajectory tracking for target vehicle `GJ01AB1234` across 7 sequential corridors.
- **National VAHAN 4.0 Integration:** Real-time KYC vehicle registration lookup (registered owner, engine/chassis, tax/insurance validity).
- **VMS Federation Layer:** Adapters for Milestone XProtect, Genetec Security Center, HikCentral, Matrix SAMAS, and ONVIF Profile T.
- **Indian Evidence Act Compliance:** Section 65B compliant audit logging and SHA-256 evidence hashing.

---

## 🚀 Quick Start (Localhost)

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Backend Setup (FastAPI)
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Swagger Docs: `http://localhost:8000/docs`
- Discovery Contract: `http://localhost:8000/api/ingest`

### 2. Frontend Setup (Next.js 14)
```bash
cd apps/web
npm install
npm run dev
```
- Command Center UI: `http://localhost:3000`
- Ingest & Stream Ops: `http://localhost:3000/ingest`
- Target Vehicle Dossier: `http://localhost:3000/vehicles/GJ01AB1234`

### 3. Automated Test Suite
```bash
cd apps/api
source .venv/bin/activate
pytest -v tests/
```

---

## 🏛️ System Architecture

```text
       [ Heterogeneous CCTV / VMS Grid ]
                       │
                       ▼
       Authoritative Discovery Contract (GET /api/ingest)
                       │
                       ▼
            CameraCatalogueService (Sync, Cache, Diff, Health)
                       │
                       ▼
            StreamSessionManager (RTSP TCP, Ref-Counting)
           ┌───────────┴───────────┐
           ▼                       ▼
    WebRTC WHEP (Browser)     HLS Fallback (Wide-Area)
           │
           ▼
    RTSP / TCP Ingestion (os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"]="rtsp_transport;tcp")
           │
           ▼
    Dual Codec Pipeline (H.264 & H.265 / HEVC Dynamic Parsers)
           │
           ▼
    Authoritative PTS Timing Engine (Δt = PTS_current - PTS_previous; strictly no CAP_PROP_FPS)
           │
           ▼
    Modular AI Pipeline (DetectionProvider, ByteTrack with PTS, PaddleOCR ANPR, Re-ID)
           │
           ▼
    Realtime Intelligence & Investigation Workspace (GJ01AB1234, MapLibre GIS, National VAHAN 4.0)
```

---

## 📄 License
Government of Gujarat — Public Safety & Hackathon Prototype 2026.
