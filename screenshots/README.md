# Gujarat SentinelX: Platform Screenshots Index
**Project:** Gujarat CCTV Hackathon 2026  
**Application:** Gujarat SentinelX — Statewide CCTV Intelligence & Vehicle Journey Reconstruction  
**Resolution:** 1920 × 1080 (Full HD Native Captures)  
**Environment:** Active Localhost Dev Instance (`http://localhost:3000` & `http://localhost:8000`)

---

## Visual Deliverables Gallery

| # | Screenshot File | Application Route | Key Features & Evidence |
|---|---|---|---|
| **01** | `01_login_portal.png` | `/login` | Officer badge authentication, 256-bit GovNet TLS indicator, 1-Click quick login demo profiles (Investigator, Admin, Operator, Auditor), Home Dept branding. |
| **02** | `02_command_dashboard.png` | `/dashboard` | Statewide telemetry (80,000+ cameras across 33 districts, 59 active edge feeds, 2.4M vehicles scanned, 128 active alerts), 24-hr ANPR ingest curve, OCR latency (16.4ms), 1-Click Demo trigger. |
| **03** | `03_vehicle_journey_reconstruction.png` | `/vehicles/GJ01AB1234` | **Primary Acceptance Test**: Target `GJ01AB1234`, 119 detections across 22 cameras, 3,287 km traversed, 98% OCR confidence, **MoRTH VAHAN 4.0 Surepass Live RC**, Gujarat Traffic e-Challan records (₹3,500 pending), chronological sighting timeline, GIS route vector. |
| **04** | `04_live_cctv_grid.png` | `/live` | Multi-camera video wall (1x1, 2x2, 3x3, 4x4 matrix), active RTSP/HLS streams from Ahmedabad Chiman Bhai Bridge, Janpath, ONGC Office, camera telemetry overlay, live ANPR detection panel. |
| **05** | `05_vms_integration.png` | `/vms` | **Heterogeneous VMS Federation Layer (Section 38)**: 5 active adapters (Milestone XProtect Corporate, Genetec Security Center Omnicast, HikCentral Enterprise, Matrix SATATYA SAMAS, Universal ONVIF Profile T), zero rip-and-replace proof. |
| **06** | `06_alerts_and_watchlists.png` | `/alerts` | Real-time watchlist alert console, multi-tier hotlists (Stolen, Wanted, Impounded), real-time alert dispatch cards for `GJ01AB1234`, one-click officer acknowledgment flow. |
| **07** | `07_forensic_investigations.png` | `/investigations` | Digital investigation workspace (`INV-2026-0402`), Section 65B Indian Evidence Act compliant digital chain of custody, tamper-evident SHA-256 evidence hashing, court dossier export. |
| **08** | `08_system_health.png` | `/system-health` | Statewide microservices health telemetry: PostgreSQL/PostGIS (1ms), Redis PubSub (2ms), Kafka message bus (12ms), OpenSearch fuzzy engine (18ms), ClickHouse analytics (8ms), MinIO S3 storage (15ms), AI pipeline (28ms), Sentinel Camera Grid (42ms). |
| **09** | `09_gis_statewide_map.png` | `/map` | Statewide GIS camera map with spatial clustering, district boundaries, route tracing vector engine connecting SG Highway to Gandhinagar Sachivalaya. |
| **10** | `10_audit_logs.png` | `/audit-logs` | Immutable cryptographic audit trail: tracks officer queries, plate searches, video exports, alert acknowledgments with badge IDs, IP addresses, and timestamps. |
| **11** | `11_rc_challan_vahan.png` | `/rc-challan` | Dedicated MoRTH VAHAN 4.0 & Gujarat e-Challan verification portal: owner name, make/model, RTO jurisdiction, insurance validity, PUCC number, chassis & engine number reveals. |

---

## Screenshot Previews & Descriptions

### 1. Officer Sign-In & Security Gate (`01_login_portal.png`)
Provides role-based access control (RBAC) with pre-seeded demo personas (Inspector V. K. Patel, Director General, Head Operator Rathod, Auditor S. K. Joshi). Demonstrates compliance with the Gujarat Police IT Security Mandate.

### 2. State CCTV Command & Intelligence Center (`02_command_dashboard.png`)
Presents executive overview metrics across all 33 Gujarat districts. Features ANPR throughput curves, vehicle type distribution, average GPU OCR inference latency (16.4ms via TensorRT), and instant 1-click test triggers.

### 3. Cross-Camera Vehicle Journey Reconstruction (`03_vehicle_journey_reconstruction.png`)
Fulfills the core hackathon requirement:
- Displays target vehicle `GJ01AB1234` flagged under FIR-402/2026 Navrangpura.
- Live integration with MoRTH VAHAN 4.0 returning registered owner (Gaurav), Royal Enfield Bullet, valid insurance, and PUCC certificate.
- Displays 4 Gujarat Traffic Police e-Challan records with ₹3,500 pending fines.
- Visualizes 7 sequential camera hops along SG Highway to Gandhinagar Secretariat with transit speeds, timestamps, and confidence scores.

### 4. Live CCTV Video Wall & Stream Gateway (`04_live_cctv_grid.png`)
Features low-latency playback across a selectable 1-up, 4-up, 9-up, or 16-up layout with presentation timestamp (PTS) telemetry, live plate scanning HUD, and camera telemetry overlays.

### 5. Heterogeneous VMS Federation Layer (`05_vms_integration.png`)
Demonstrates how SentinelX unifies disparate VMS deployments without replacing existing hardware or software:
- Milestone XProtect Corporate (Ahmedabad SmartCity)
- Genetec Security Center Omnicast (Gandhinagar Security Zone)
- HikCentral Professional (Surat Traffic Division)
- Matrix SATATYA SAMAS (Gujarat State Highway Corridor)
- Universal ONVIF Profile T (Local police station NVRs)

### 6. Real-Time Watchlist & Alert Center (`06_alerts_and_watchlists.png`)
Showcases real-time alert evaluation when high-priority watchlist plates are detected, triggering visual warnings, audio chimes, and mandatory officer acknowledgment with audit logging.

### 7. Forensic Evidence & Section 65B Compliance (`07_forensic_investigations.png`)
Maintains an immutable chain of custody for digital evidence. Every extracted snapshot is stamped with a SHA-256 cryptographic hash, camera ID, GPS coordinates, and investigator badge number for court admissibility.

### 8. Statewide Infrastructure Telemetry (`08_system_health.png`)
Monitors all core microservices and distributed storage nodes with real-time latency indicators, ensuring 99.98% SLA and high-availability statewide operation.
