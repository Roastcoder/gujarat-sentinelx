# GUJARAT SENTINELX: High-Level Design (HLD) & Architecture Document
**System Name:** Gujarat SentinelX — Statewide CCTV Intelligence, GIS & Cross-Camera Investigation Platform  
**Target Authority:** Government of Gujarat — Home Department & Gujarat Police  
**Hackathon Target:** Gujarat CCTV Hackathon 2026  
**Document Code:** GDJ-SENX-HLD-01  
**Version:** 1.0 (Production Blueprint)  
**Status:** Approved & Verified  

---

## 1. Executive Summary & Purpose

The **Gujarat SentinelX** platform is an enterprise-grade, vendor-agnostic intelligence and investigation platform engineered to unify Gujarat's vast, fragmented surveillance ecosystem. 

Gujarat currently possesses upwards of **80,000 CCTV cameras** deployed across 33 districts, smart cities (Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar), state highways, toll plazas, and police stations. These cameras are tethered to heterogeneous Video Management Systems (VMS) such as Milestone XProtect, Genetec Security Center, Matrix SATATYA, HikCentral, Dahua, and standalone NVRs.

Prior to SentinelX, tracking a suspect vehicle across jurisdictions required manual coordination between control rooms, physical USB video handoffs, and days of painstaking footage review—violating the critical **"Golden Hour"** of law enforcement.

**SentinelX solves this fundamental challenge without a disruptive "rip-and-replace" of existing infrastructure.** It deploys a federated integration layer that normalizes RTSP/HLS streams and metadata, applies high-throughput AI analytics, correlates cross-camera sightings into continuous GIS trajectories, integrates directly with the **MoRTH VAHAN 4.0** national vehicle registry, and generates court-admissible forensic dossiers compliant with **Section 65B of the Indian Evidence Act**.

---

## 2. System Design Goals & Principles

| Design Goal | Target Specification | Architectural Strategy |
|---|---|---|
| **Zero Rip-and-Replace** | Integrate 100% of existing VMS | Modular adapter architecture for Milestone, Genetec, Matrix, HikCentral, and ONVIF Profile T. |
| **Statewide Scale** | 80,000 Concurrent Cameras | Hierarchical 2-tier edge/regional compute model (33 District Centers) + Kafka distributed streaming. |
| **Instant Journey Correlation** | < 1.0s query latency | Pre-indexed spatio-temporal graphs in ClickHouse and Redis; PostGIS spatial indexing. |
| **High Accuracy ANPR** | > 98% accuracy on Indian HSRP plates | Fine-tuned PaddleOCR / CRNN + ByteTrack multi-frame temporal voting. |
| **Government Interoperability** | Native MoRTH VAHAN 4.0 sync | Real-time REST gateway to Surepass KYC API with 24-hr TTL caching and failover mock mode. |
| **Court Admissibility** | Section 65B Compliance | Cryptographic SHA-256 tamper-evident digital stamps on all video frames and export dossiers. |
| **High Availability & Fault Tolerance** | 99.98% uptime SLA | Multi-node active-active API deployment, Kafka partition replication, and Read-Replica DBs. |

---

## 3. C4 Architecture Model

### 3.1 C4 Level 1: System Context Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    GUJARAT SURVEILLANCE ECOSYSTEM                                  |
|                                                                                                    |
|  [Ahmedabad SafeCity]    [Surat Traffic VMS]    [Rajkot SmartCity]    [State Highway Patrol RTSP]  |
|  (Milestone / Genetec)    (HikCentral / Dahua)    (Matrix / ONVIF)      (Edge Cameras / NVRs)      |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                      GUJARAT SENTINELX SYSTEM                                      |
|                                                                                                    |
|  • Heterogeneous VMS Federation Layer        • Real-Time Stream Gateway & Transcoder               |
|  • YOLO + PaddleOCR AI Analytics Engine      • Spatio-Temporal Cross-Camera Journey Correlator      |
|  • MoRTH VAHAN 4.0 & e-Challan Gateway       • Real-Time Alert & Watchlist Engine                  |
|  • Section 65B Forensic Evidence Locker      • Immutable Cryptographic Audit Log                   |
+----------------------------------------------------------------------------------------------------+
                   │                                                  │
                   ▼                                                  ▼
+------------------------------------+             +------------------------------------+
|   GOVERNMENT NATIONAL REGISTRIES   |             |   TACTICAL LAW ENFORCEMENT USERS   |
|  • MoRTH VAHAN 4.0 (Surepass API)  |             |  • State Police Command Center     |
|  • National e-Challan Portal       |             |  • District Superintendents (SP)   |
|  • CCTNS (Criminal Crime Database) |             |  • Field PCR Vans & Mobile Units   |
+------------------------------------+             +------------------------------------+
```

---

### 3.2 C4 Level 2: Container Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                          CLIENT CONTAINER                                          |
|  Next.js 14 Web Application (App Router, Tailwind CSS, Lucide Icons, MapLibre GL Vector GIS)       |
+----------------------------------------------------------------------------------------------------+
                                                  │ HTTPS / WebSocket (WSS)
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                         INGRESS & SECURITY                                         |
|  Nginx Reverse Proxy / Load Balancer (TLS 1.3 Termination, Rate Limiting, CORS, GovNet VPN Mesh)   |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                      APPLICATION CONTAINER (API)                                   |
|  FastAPI 0.110+ Microservices Cluster (Python 3.11/3.14)                                           |
|  • Endpoints: /vehicles, /cameras, /live, /vms, /alerts, /investigations, /health, /audit-logs     |
|  • Core Services: JourneyService, AlertService, AuditService, StreamService, VahanService          |
|  • Background Workers: Async Celery / APScheduler for Watchlist sweeps & Kafka ingestion           |
+----------------------------------------------------------------------------------------------------+
                   │                              │                               │
        ┌──────────┴──────────┐        ┌──────────┴──────────┐        ┌───────────┴──────────┐
        ▼                     ▼        ▼                     ▼        ▼                      ▼
+---------------+     +---------------+ +---------------+ +---------------+ +----------------+
|  POSTGRESQL   |     |     REDIS     | |  CLICKHOUSE   | |  OPENSEARCH   | |   MINIO / S3   |
|   + POSTGIS   |     |   CACHE &     | |  ANPR TIME-   | |  FUZZY LPR    | |  EVIDENCE LOCK |
| Relational &  |     |   BROKER      | |  SERIES LAKE  | |  SEARCH       | |  SHA-256 Court |
| Spatial Index |     | Realtime WSS  | | 50k events/s  | | Levenshtein   | | Snapshots      |
+---------------+     +---------------+ +---------------+ +---------------+ +----------------+
```

---

### 3.3 C4 Level 3: Component Architecture (Core API)

1. **Ingest & Stream Manager (`app/services/stream_service.py`):**
   - Connects to RTSP/HLS feeds using TCP transport.
   - Maintains an atomic reference counter so that 10 officers viewing the same camera share 1 single stream decode, reducing network load by 90%.
   - Handles Presentation Timestamps (PTS) to prevent video frame drift.

2. **Cross-Camera Journey Correlator (`app/services/journey_service.py`):**
   - Executes multi-point spatio-temporal correlation.
   - Calculates hop distance, elapsed time, and transit velocity ($v = \frac{\Delta d}{\Delta t}$) between consecutive camera detections.
   - Detects anomalous velocity patterns (e.g. speeding getaway or loitering).
   - Assembles GeoJSON LineString vectors and numbered waypoint sequence.

3. **MoRTH VAHAN 4.0 Gateway (`app/integrations/vahan/surepass.py`):**
   - Connects to the official Surepass MoRTH REST endpoint with bearer token authentication.
   - Fetches registered owner, vehicle make/model, class, insurance policy, PUCC validity, and pending e-Challan records.
   - Masked display for sensitive chassis and engine numbers with audit-logged officer reveals.

4. **Watchlist & Alert Engine (`app/services/alert_service.py`):**
   - Evaluates ANPR events against high-priority hotlists (Stolen, Wanted, Impounded).
   - Generates priority-tiered alerts (High, Medium, Low) and broadcasts via WebSocket.
   - Enforces investigator acknowledgment workflow with audit logging.

5. **Forensic Evidence & Chain of Custody Locker (`app/services/audit_service.py`):**
   - Computes SHA-256 cryptographic hashes for each evidence snapshot.
   - Compiles court-ready Section 65B Indian Evidence Act certificates with investigator digital signatures and Merkle root hashes.

---

## 4. Subsystem Deep-Dive

### 4.1 Heterogeneous VMS Federation Layer (Section 38)

SentinelX sits above disparate municipal and departmental VMS installations across Gujarat:

```
[Ahmedabad Smart City]  --> Milestone MIP SDK Adapter   -->\
[Gandhinagar Security]  --> Genetec Web API Adapter     ----> [SentinelX Stream Normalizer]
[Surat Traffic Police]  --> Hikvision ISAPI Adapter     -->/  (Forced RTSP over TCP, PTS sync,
[State Highway Corridor]--> Matrix SATATYA SDK Adapter  -->/   H.264/H.265 transmuxing)
[District Police NVRs]  --> Universal ONVIF Profile T   -->/
```

- **Protocol Normalization:** Translates proprietary VMS protocols into standardized RTSP/HLS and WebRTC streams.
- **PTZ Pass-Through:** Forwards ONVIF PTZ commands (Pan/Tilt/Zoom) from the SentinelX dashboard directly to target field cameras.
- **Failover & Reconnect:** Automated exponential backoff reconnect logic ensures resilient operation across intermittent 4G/optical links.

---

### 4.2 Spatio-Temporal Journey Reconstruction Algorithm

When an investigator enters target plate `GJ01AB1234`:

1. **Temporal Retrieval:** Query ClickHouse for all detection records matching `registration_plate = 'GJ01AB1234'` ordered by `detected_at ASC`.
2. **Spatial Topology Enrichment:** Join detections with PostgreSQL `cameras` table to retrieve `latitude`, `longitude`, `district`, `police_station_id`, and `heading_angle`.
3. **Hop Vector Computation:** For each consecutive pair of detections $(C_i, C_{i+1})$:
   $$\Delta d = \text{HaversineDistance}(C_i, C_{i+1})$$
   $$\Delta t = t_{i+1} - t_i$$
   $$v_{\text{avg}} = \frac{\Delta d}{\Delta t} \times 3.6 \quad (\text{km/h})$$
4. **GIS Vector Synthesis:** Generate MapLibre GL GeoJSON feature collection containing:
   - LineString connecting all camera coordinates with glowing direction line.
   - Point features for each numbered camera waypoint with camera ID, timestamp, speed, and thumbnail preview.
5. **National Registry Fusion:** In parallel, query the MoRTH VAHAN 4.0 Surepass gateway to enrich the trajectory with legal vehicle ownership, insurance status, and outstanding traffic violations.

---

## 5. Big Data & Multi-Tier Storage Topology

```
+-----------------------------------------------------------------------------------+
| LAYER               | TECHNOLOGY         | ROLE & RETENTION POLICY                |
+---------------------+--------------------+----------------------------------------+
| Relational & GIS    | PostgreSQL 16      | Camera registry, spatial boundaries,   |
|                     | + PostGIS 3.4      | users, RBAC, watchlists, audit trail.  |
|                     |                    | Retention: Permanent.                  |
+---------------------+--------------------+----------------------------------------+
| Realtime Event Bus  | Apache Kafka 3.6   | High-throughput event streaming.      |
|                     | (KRaft Mode)       | Partitions: By district & camera.      |
|                     |                    | Retention: 7 days buffer.              |
+---------------------+--------------------+----------------------------------------+
| Time-Series Lake    | ClickHouse Cluster | 50,000+ ANPR detections / second.      |
|                     |                    | Columnar compression (10:1 ratio).     |
|                     |                    | Retention: 180 days active partition.  |
+---------------------+--------------------+----------------------------------------+
| Fuzzy Plate Search  | OpenSearch 2.12    | Approximate string matching, wildcard  |
|                     |                    | plate search, OCR error correction.    |
|                     |                    | Retention: 90 days.                    |
+---------------------+--------------------+----------------------------------------+
| Digital Evidence    | MinIO / S3 Object  | Full-frame snapshots & video clips.    |
|                     | Storage (WORM)     | SHA-256 tamper-evident digital seal.   |
|                     |                    | Retention: 30 days general / 7 yrs INV |
+---------------------+--------------------+----------------------------------------+
| Realtime Caching    | Redis 7.2 Cluster  | Active session cache, rate limiting,   |
|                     |                    | WebSocket pub/sub alert broadcast.     |
+---------------------+--------------------+----------------------------------------+
```

---

## 6. Statewide Scalability Blueprint (80,000 Cameras)

### 6.1 Capacity Sizing & Calculations

| Metric | Per Camera | Statewide Total (80,000 Cameras) |
|---|---|---|
| **Peak Detection Events** | ~0.625 detections/sec | **50,000 detections/second** |
| **Kafka Event Throughput** | ~500 bytes/event | **25 MB/sec (200 Mbps network stream)** |
| **Daily Detection Events** | ~54,000 events/day | **4.32 Billion events/day** |
| **Daily ClickHouse Storage** | ~50 bytes compressed | **~216 GB/day (compressed)** |
| **Active Live Streams** | 0.05% operator concurrency | **40 to 100 simultaneous streams** |
| **Edge Compute Nodes** | 1 GPU worker per 200 cams | **400 Edge GPU Nodes across 33 DCCCs** |

### 6.2 Hierarchical 2-Tier Architecture

To eliminate statewide bandwidth bottlenecks:
- **Tier 1 (Edge / District Centers):** 33 District Command & Control Centers (DCCC) perform RTSP ingest, frame decoding, YOLO detection, and PaddleOCR inference locally. Raw 1080p video streams remain within the local LAN.
- **Tier 2 (State Data Center - Gandhinagar):** Only lightweight metadata JSON payloads (plate number, timestamp, confidence, bounding box, 20KB thumbnail) are transmitted over the Gujarat State Wide Area Network (GSWAN) to the central Kafka cluster and ClickHouse lake.

---

## 7. Security Architecture, RBAC & Governance

### 7.1 Role-Based Access Control Matrix

| Role | Vehicle Search | Live Video | Watchlist Edit | Forensic Export | Audit Logs | System Health |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Super Admin** | Yes | Yes | Yes | Yes | Full Access | Full Access |
| **District Admin** | Yes | District Only | District Only | Yes | District Only | View Only |
| **Investigator** | Yes | Yes | View Only | Yes | Self Only | View Only |
| **Operator** | Yes | Yes | No | No | No | No |
| **Auditor** | View Only | No | No | Verify Only | Full Read-Only | View Only |

### 7.2 Cryptographic Audit Logging

Every interaction on the SentinelX platform generates an immutable audit record containing:
- Authenticated Officer Identity & Badge Number
- IP Address & Cryptographic Client Fingerprint
- Exact Plate Queried or Camera Viewed
- Reason for Search (Mandatory FIR / Case File reference)
- Cryptographic SHA-256 Hash of the Audit Record chained to previous record (Blockchain-style immutability)

---

## 8. High Availability & Disaster Recovery

- **Active-Active API Deployment:** Stateless FastAPI nodes behind round-robin Nginx load balancers.
- **Database Replication:** PostgreSQL primary node in Gandhinagar SDC with streaming synchronous replication to Vadodara Disaster Recovery Center (DRC).
- **RPO (Recovery Point Objective):** $< 15\text{ seconds}$.
- **RTO (Recovery Time Objective):** $< 5\text{ minutes}$ automated failover.
