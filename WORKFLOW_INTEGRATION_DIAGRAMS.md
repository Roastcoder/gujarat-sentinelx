# GUJARAT SENTINELX: Workflow & Integration Diagrams
**Project:** Gujarat CCTV Hackathon 2026  
**System:** Gujarat SentinelX — Statewide CCTV Intelligence & Vehicle Journey Reconstruction Platform  
**Target:** 80,000 Heterogeneous Cameras across 33 Districts  
**Authority:** Government of Gujarat — Home Department & Gujarat Police  

---

## 1. End-to-End Vehicle Journey Reconstruction Workflow

This workflow illustrates how a query for vehicle registration `GJ01AB1234` reconstructs the cross-camera timeline, computes spatial travel vectors, queries the national vehicle registry, and compiles the forensic dossier in under 1 second.

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Investigating Officer / Operator
    participant UI as Command Center UI (Next.js)
    participant API as SentinelX Core API (FastAPI)
    participant Redis as Redis Cache
    participant DB as PostgreSQL + PostGIS
    participant CH as ClickHouse (ANPR Event Store)
    participant Surepass as MoRTH VAHAN 4.0 Gateway
    participant Map as MapLibre GL GIS Engine

    Officer->>UI: Enter plate "GJ01AB1234" (or click 1-Click Demo)
    UI->>API: GET /api/v1/vehicles/GJ01AB1234/journey
    
    API->>Redis: Check cached journey graph (key: journey:GJ01AB1234)
    alt Cache Miss / Real-time Query
        API->>CH: Query chronological ANPR detections (order by detected_at ASC)
        CH-->>API: 119 detection events across 22 camera points
        API->>DB: Fetch camera spatial topology (lat, lon, district, police_station)
        DB-->>API: Camera geospatial metadata & direction vectors
        API->>API: Spatio-Temporal Correlator (hop distance, velocity, transit time)
        API->>Redis: Cache computed journey vector (TTL: 300s)
    else Cache Hit
        Redis-->>API: Pre-computed trajectory & detections
    end

    par Parallel VAHAN Registry Query
        API->>Surepass: POST /api/v1/vahan/rc-verify (plate="GJ01AB1234")
        Surepass-->>API: Vehicle Details (Owner: Gaurav, Royal Enfield Bullet, Insurance: Valid, PUCC, Pending Challans: 2)
    and GIS Route Generation
        API->>DB: ST_MakeLine(camera_geom ORDER BY detected_at)
        DB-->>API: GeoJSON LineString + Waypoint Features
    end

    API-->>UI: Consolidated Journey Payload (Timeline, Speeds, VAHAN RC, Challans, GeoJSON)
    UI->>Map: Render Vector Route & Numbered Waypoint Markers (1 to 7)
    UI-->>Officer: Interactive Timeline, Snapshot Previews, Speed Graphs, VAHAN Dossier
```

---

## 2. Heterogeneous VMS Adapter & Federation Pipeline

SentinelX acts as a vendor-agnostic intelligence overlay without requiring "rip-and-replace" of existing infrastructure across municipal corporations, police command rooms, and highway concessions.

```mermaid
flowchart TB
    subgraph SOURCELAYER["Existing CCTV & VMS Infrastructure Across Gujarat"]
        VMS1["Milestone XProtect Corporate<br/>(Ahmedabad SmartCity)"]
        VMS2["Genetec Security Center<br/>(Gandhinagar Security Zone)"]
        VMS3["HikCentral Professional<br/>(Surat Traffic Division)"]
        VMS4["Matrix SATATYA SAMAS<br/>(Gujarat State Highway Corridor)"]
        VMS5["Sentinel Grid / ONVIF Profile T<br/>(Edge NVRs & Standalone Cameras)"]
    end

    subgraph ADAPTERLAYER["SentinelX Heterogeneous Federation Layer (Section 38)"]
        AD1["Milestone MIP SDK / REST Adapter"]
        AD2["Genetec Security Center Web API Adapter"]
        AD3["Hikvision ISAPI / OpenAPIs Adapter"]
        AD4["Matrix SAMAS SDK Adapter"]
        AD5["Universal ONVIF / RTSP Stream Ingest"]
    end

    subgraph STREAMNORMALIZER["Stream Gateway & Media Pipeline"]
        NORM["PTS (Presentation Timestamp) Synchronizer & Stream Normalizer<br/>• Forced RTSP over TCP<br/>• Atomic Reference Counter (Zero Duplicate Decoders)<br/>• H.264 / H.265 Transmuxing"]
        HLS_CDN["HLS / WebRTC Live Proxy (Low Latency < 1.2s)"]
    end

    subgraph AIPROCESSING["AI Inference & Analytics Engine"]
        DET["YOLO Vehicle Detector (Edge / GPU)"]
        OCR["PaddleOCR / CRNN (Indian HSRP Optimized)"]
        TRACK["ByteTrack / BoT-SORT Multi-Object Tracker"]
    end

    subgraph EVENTBUS["Distributed Event Streaming (Kafka)"]
        KAFKA["Apache Kafka Topics:<br/>cctv.streams.raw | cctv.anpr.events | cctv.alerts.priority"]
    end

    VMS1 --> AD1
    VMS2 --> AD2
    VMS3 --> AD3
    VMS4 --> AD4
    VMS5 --> AD5

    AD1 --> NORM
    AD2 --> NORM
    AD3 --> NORM
    AD4 --> NORM
    AD5 --> NORM

    NORM --> HLS_CDN
    NORM --> DET
    DET --> TRACK
    TRACK --> OCR
    OCR --> EVENTBUS
```

---

## 3. MoRTH VAHAN 4.0 Surepass National Registry Integration Flow

Illustrates how SentinelX validates vehicle identity, flags stolen vehicles, cross-checks RC chassis/engine numbers, and extracts traffic violation histories directly from the National Register of Motor Vehicles.

```mermaid
sequenceDiagram
    autonumber
    participant ANPR as ANPR Engine / Investigator
    participant Core as SentinelX Ingest & Rule Engine
    participant Cache as Redis VAHAN Cache
    participant Surepass as Surepass MoRTH Gateway API
    participant Watchlist as Watchlist & Alert Engine
    participant UI as Command Center UI

    ANPR->>Core: Plate Detected: GJ01AB1234 (Camera: CAM-AHM-001)
    Core->>Cache: Lookup cached RC (vahan:GJ01AB1234)
    
    alt In Cache & TTL Valid (< 24 hrs)
        Cache-->>Core: Return cached VAHAN Dossier
    else Cache Miss / Forced Re-query
        Core->>Surepass: POST /api/v1/rc-verification<br/>Auth: Bearer Token<br/>Payload: {"plate_number": "GJ01AB1234"}
        Surepass-->>Core: 200 OK: Full RC JSON<br/>{owner: "Gaurav", make: "Royal Enfield", reg_date: "1995-10-12",<br/>chassis: "...623H", engine: "SB484623H", insurance_valid: true,<br/>pucc_no: "GJ00101200040930", e_challans: 4}
        Core->>Cache: Store with 24-hr TTL
    end

    Core->>Watchlist: Match against Hotlists (Stolen, Wanted, Impounded)
    alt Watchlist Match Found
        Watchlist->>Watchlist: Match: Stolen Bullet Case FIR-402/2026
        Watchlist-->>UI: HIGH PRIORITY RED ALERT (Sound + Drawer + Banner)
    else Clean Vehicle
        Watchlist-->>UI: Telemetry Update: Clean Scan
    end

    UI->>UI: Display Owner Name, Masked Chassis, Engine Number, e-Challans (₹3,500 pending)
```

---

## 4. Real-Time Watchlist Detection & Alert Dispatch Workflow

Demonstrates instantaneous threat detection, role-based alert dispatching, and auditor-compliant officer acknowledgment workflows.

```mermaid
flowchart TD
    A[CCTV Frame Decoded at Edge / Gateway] --> B[AI Pipeline Localizes License Plate: GJ01AB1234]
    B --> C{Watchlist In-Memory Evaluator}
    
    C -->|No Match| D[Write to ClickHouse Analytics Lake]
    
    C -->|MATCH FOUND| E[Classify Alert Severity & Priority Tier]
    
    E --> F1[TIER 1: HIGH - Red Alert<br/>Stolen Vehicle / Terror Suspect / Hit & Run]
    E --> F2[TIER 2: MEDIUM - Amber Alert<br/>Expired Registration / Suspicious Cluster]
    E --> F3[TIER 3: LOW - Yellow Alert<br/>Unpaid e-Challan / Speed Advisory]

    F1 --> G[Broadcast via WebSocket & Server-Sent Events (SSE)]
    F2 --> G
    F3 --> G

    G --> H[Command Center Video Wall Flash Banner]
    G --> I[Investigator Audio Chime & Active Alert Drawer]
    G --> J[SMS / Police Wireless Notification to Nearest PCR Van]

    I --> K[Officer Inspects Alert Card: Vehicle, Camera, Snapshot, GPS]
    K --> L[Officer Clicks 'Acknowledge' with Operational Notes]
    L --> M[Cryptographic Audit Trail Written: Section 65B SHA-256 Stamp]
    M --> N[Alert Transitioned from 'NEW' to 'ACKNOWLEDGED']
```

---

## 5. Section 65B Digital Evidence Chain-of-Custody Hashing Workflow

Guarantees full evidentiary admissibility in Indian courts under **Section 65B of the Indian Evidence Act (Bharatiya Sakshya Adhiniyam, 2023)**.

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Investigating Officer (Inspector V. K. Patel)
    participant UI as Investigation Workspace
    participant API as SentinelX Evidence Locker
    participant HashEngine as Cryptographic SHA-256 Engine
    participant S3 as MinIO / S3 Encrypted Storage
    participant Audit as Immutable Audit Log (PostgreSQL)

    Officer->>UI: Select Sighting Snapshots (7 Cameras, GJ01AB1234)
    Officer->>UI: Click "Export Forensic Dossier (Section 65B)"
    UI->>API: POST /api/v1/investigations/INV-2026-0402/export
    
    API->>S3: Retrieve pristine original frame buffers & metadata
    S3-->>API: Raw JPGs + PTS timestamps + Camera calibration
    
    loop For each evidence item
        API->>HashEngine: Compute SHA-256 Hash of raw binary + timestamp
        HashEngine-->>API: HASH: 8f4c28...e739a1
    end

    API->>HashEngine: Generate Merkle Root & Digital Certificate
    HashEngine-->>API: Dossier Fingerprint: 4a2b91...cd88e0

    API->>Audit: Append immutable audit record:<br/>- Officer: Inspector V. K. Patel (GJ-INV-402)<br/>- Action: SECTION_65B_EXPORT<br/>- Master Hash: 4a2b91...cd88e0<br/>- IP: 103.250.160.189<br/>- Client Fingerprint: Chrome 128 / macOS
    
    API-->>UI: Generate Section 65B Signed Forensic Dossier PDF
    UI-->>Officer: Download Court-Ready PDF with QR Code Verification & Hashes
```

---

## 6. Statewide Scalability Deployment Topology (80,000 Cameras)

```mermaid
graph TD
    subgraph DCCC["33 District Command & Control Centers (DCCC)"]
        D1["Ahmedabad DCCC (18,000 Cams)<br/>Edge Ingest + YOLO Worker Pool"]
        D2["Surat DCCC (12,000 Cams)<br/>Edge Ingest + YOLO Worker Pool"]
        D3["Vadodara DCCC (8,000 Cams)<br/>Edge Ingest + YOLO Worker Pool"]
        D4["Other 30 Districts (42,000 Cams)<br/>Regional Edge Gateways"]
    end

    subgraph WAN["Gujarat State Wide Area Network (GSWAN 10Gbps)"]
        GSWAN["GSWAN High-Speed Backbone (Encrypted IPsec Mesh)"]
    end

    subgraph SDC["State Data Center (SDC) — Gandhinagar"]
        LB["Load Balancers & Ingress (Nginx / HAProxy)"]
        
        subgraph KAFKACLUSTER["Kafka Streaming Tier"]
            K1["Broker 1 (Ahmedabad/Surat)"]
            K2["Broker 2 (Central/North)"]
            K3["Broker 3 (Saurashtra/Kutch)"]
        end

        subgraph FASTAPICLUSTER["SentinelX API Microservices"]
            API1["Core API 1"]
            API2["Core API 2"]
            API3["Core API 3"]
        end

        subgraph DATASTORE["Tiered Big Data Storage Engine"]
            PG["PostgreSQL Primary + 4 Read Replicas (GIS / PostGIS)"]
            CH["ClickHouse Multi-Node Cluster (ANPR Time-Series Lake)"]
            OS["OpenSearch Cluster (Fuzzy LPR & Attribute Search)"]
            S3["Distributed S3 / MinIO Cluster (Immutable Snapshots)"]
        end
    end

    subgraph CONSUMERS["Clients & Tactical Operators"]
        HQ["State Police Headquarters (Gandhinagar DGP Control)"]
        PCR["Field PCR Vans & Mobile Terminals"]
        CRIME["CID Crime & Anti-Terrorism Squad (ATS)"]
    end

    D1 --> GSWAN
    D2 --> GSWAN
    D3 --> GSWAN
    D4 --> GSWAN

    GSWAN --> LB
    LB --> KAFKACLUSTER
    KAFKACLUSTER --> FASTAPICLUSTER
    FASTAPICLUSTER --> DATASTORE

    FASTAPICLUSTER --> HQ
    FASTAPICLUSTER --> PCR
    FASTAPICLUSTER --> CRIME
```
