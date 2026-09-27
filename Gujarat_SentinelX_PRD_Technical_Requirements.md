# Gujarat SentinelX

## Gujarat CCTV Hackathon 2026 --- Project PRD & Technical Requirements

**Version:** 1.0\
**Project Type:** Government CCTV Integration, Analytics & Investigation
Platform\
**Target Scale:** Approximately 80,000 cameras\
**Hackathon Prototype:** Approximately 50 heterogeneous camera feeds

------------------------------------------------------------------------

## 1. Executive Summary

**Gujarat SentinelX** is a hybrid CCTV integration and intelligence
platform designed to connect heterogeneous cameras and existing VMS
infrastructure from multiple vendors and departments into a unified,
GIS-enabled investigation platform.

### Core capabilities

-   Centralized camera registry
-   GIS-based camera visualization
-   Multi-VMS and protocol integration
-   Live video monitoring
-   Vehicle detection
-   ANPR/LPR
-   Cross-camera vehicle tracking
-   Historical event search
-   Vehicle journey reconstruction
-   Watchlist alerts
-   Investigation workspace
-   Evidence management
-   System health monitoring
-   RBAC and audit logging
-   Edge/regional processing
-   Architecture scalable to approximately 80,000 cameras

> **Core principle:** Integrate existing infrastructure instead of
> replacing it.

------------------------------------------------------------------------

# 2. Problem Statement

The CCTV ecosystem can contain:

-   Multiple camera vendors
-   Multiple VMS platforms
-   Different protocols
-   Multiple departments and jurisdictions
-   Different network architectures
-   Different storage systems
-   Different camera capabilities
-   Inconsistent metadata

This creates:

1.  Fragmented CCTV infrastructure
2.  Difficult cross-camera investigation
3.  Limited unified search
4.  Poor GIS visibility
5.  Interoperability challenges
6.  Network and processing scalability challenges
7.  High investigation time

The platform should allow an investigator to answer:

> Where was this vehicle detected?

> When was it detected?

> Which cameras saw it?

> What route did it take?

> What evidence is available?

------------------------------------------------------------------------

# 3. Product Vision

Create a state-level CCTV intelligence layer above existing camera and
VMS infrastructure.

``` text
Existing Cameras / VMS
        |
        v
+-----------------------+
|   SentinelX Platform  |
+-----------------------+
        |
  +-----+------+---------+
  |            |         |
Registry       GIS      AI
  |            |         |
  +------------+---------+
             |
       Event Intelligence
             |
       Investigation
```

------------------------------------------------------------------------

# 4. Goals

## Primary Goals

-   Create a unified camera registry.
-   Map cameras geographically.
-   Integrate heterogeneous video sources.
-   Provide live CCTV viewing.
-   Detect vehicles automatically.
-   Perform ANPR/LPR.
-   Track vehicles across cameras.
-   Build vehicle journey history.
-   Search historical events.
-   Generate watchlist alerts.
-   Provide investigation workflows.
-   Demonstrate approximately 50-camera integration.
-   Design a scalable architecture for approximately 80,000 cameras.
-   Implement security, access control and auditability.

## Non-Goals

The initial prototype will not attempt to:

-   Replace every existing VMS
-   Deploy statewide infrastructure
-   Build every possible AI analytics feature
-   Make facial recognition the primary capability
-   Build proprietary VMS software
-   Store all raw video centrally by default

------------------------------------------------------------------------

# 5. Target Users

  User                     Primary Access
  ------------------------ ----------------------------------------------
  State Administrator      Statewide cameras, analytics, infrastructure
  District Administrator   District cameras, events, alerts
  Investigation Officer    Vehicle search, routes, evidence
  Control Room Operator    Live feeds and alerts
  System Administrator     Users, VMS, cameras, configuration
  Auditor                  Audit and access logs

------------------------------------------------------------------------

# 6. Participant Journey

The platform maps to the challenge's seven-stage flow:

``` text
Step 1 → Understand Challenge
Step 2 → Explore Integration Models
Step 3 → Choose Challenge
Step 4 → Technical Evaluation / Test Case
Step 5 → Prepare & Submit
Step 6 → Plan for Scale
Step 7 → Evaluation & Recognition
```

------------------------------------------------------------------------

# 7. Functional Requirements

## 7.1 Camera Registry

This is the mandatory foundation.

### Features

-   Add camera
-   Edit camera
-   Deactivate camera
-   Camera status
-   Camera location
-   Vendor/model
-   VMS mapping
-   Protocol
-   Resolution/FPS
-   Camera capabilities
-   Department/district
-   Retention policy
-   Last heartbeat

### Camera fields

``` text
Camera ID
Camera Name
Department
District
Police Station
Zone
Latitude
Longitude
Vendor
Model
VMS
Protocol
Stream Endpoint
Resolution
FPS
PTZ Support
ANPR Support
Audio Support
Night Vision
Status
Installation Date
Retention Period
Created At
Updated At
```

------------------------------------------------------------------------

# 8. GIS Module

The GIS module must display:

-   Camera locations
-   Camera status
-   Vehicle events
-   Alerts
-   Vehicle routes
-   District boundaries
-   Police stations
-   Important locations

### Camera popup

``` text
CAM-AHM-00182

Status: ONLINE
Vendor: XYZ
VMS: ABC
ANPR: Enabled
Last Event: 09:17:31

[View Live]
[View Events]
[Camera Details]
[Nearby Cameras]
```

### Recommended technology

-   MapLibre GL
-   PostgreSQL/PostGIS

------------------------------------------------------------------------

# 9. VMS Integration Layer

The platform must support heterogeneous infrastructure.

### Protocols / integration methods

-   RTSP
-   ONVIF
-   HLS
-   WebRTC
-   Vendor APIs
-   Existing VMS APIs

### Adapter architecture

``` text
Vendor A ----+
Vendor B ----+
Vendor C ----+
ONVIF -------+
RTSP --------+--> Adapter Layer --> Normalized Camera API
HLS ---------+
```

The adapter layer prevents vendor-specific logic from spreading
throughout the application.

------------------------------------------------------------------------

# 10. Live Video Module

### Requirements

-   Live stream
-   Multi-camera grid
-   Full screen
-   Camera switching
-   Stream health
-   Connection status
-   Latency indicator
-   Snapshot
-   Timestamp
-   Camera metadata

Example:

``` text
+-------------+-------------+
| Camera 001  | Camera 002  |
| LIVE        | LIVE        |
+-------------+-------------+
| Camera 003  | Camera 004  |
| LIVE        | LIVE        |
+-------------+-------------+
```

------------------------------------------------------------------------

# 11. AI Video Analytics

The first AI priority is vehicle intelligence.

``` text
Video
  |
Frame Decoder
  |
Vehicle Detection
  |
Vehicle Tracking
  |
Plate Detection
  |
OCR
  |
Vehicle Attributes
  |
Event Creation
```

### Vehicle attributes

-   Registration number
-   Vehicle type
-   Vehicle color
-   Direction
-   Timestamp
-   Camera
-   Confidence
-   Tracking ID

### Recommended technologies

-   PyTorch
-   YOLO
-   OpenCV
-   PaddleOCR or equivalent OCR
-   ByteTrack / BoT-SORT

------------------------------------------------------------------------

# 12. ANPR / LPR

### Input

Camera video.

### Output

``` json
{
  "plate": "GJ01AB1234",
  "confidence": 0.967,
  "camera_id": "CAM-AHM-00182",
  "timestamp": "2026-09-25T09:17:31Z",
  "vehicle_type": "SUV"
}
```

### Requirements

-   Plate detection
-   OCR
-   Confidence score
-   Indian registration format support
-   Snapshot
-   Timestamp
-   Camera location
-   Event storage

------------------------------------------------------------------------

# 13. Vehicle Tracking

This is the core investigation workflow.

### Input

``` text
GJ01AB1234
```

### Output

``` text
17 detections
7 cameras
5 locations
1 route
```

### Timeline

``` text
08:42:17  Camera A
08:47:52  Camera B
08:53:31  Camera F
09:01:12  Camera K
09:17:31  Camera Q
```

------------------------------------------------------------------------

# 14. Journey Reconstruction

The system creates a connected vehicle journey:

``` text
Vehicle
   |
Camera
   |
Timestamp
   |
Location
   |
Next Camera
   |
Next Timestamp
```

### Journey information

-   First detection
-   Last detection
-   Total cameras
-   Total events
-   Estimated distance
-   Elapsed time
-   Route
-   Evidence references

### GIS route

``` text
Camera A
   |
Camera B
   |
Camera F
   |
Camera K
   |
Camera Q
```

------------------------------------------------------------------------

# 15. Investigation Search

Search should support:

### Vehicle number

``` text
GJ01AB1234
```

### Time

``` text
25 September
08:00 - 12:00
```

### Location

``` text
Ahmedabad
```

### Vehicle attributes

``` text
White
SUV
```

### Camera

``` text
CAM-AHM-00182
```

------------------------------------------------------------------------

# 16. Advanced Search

Example:

``` text
Vehicle: GJ01AB1234
Date: 25 September 2026
Time: 08:00-12:00
District: Ahmedabad
Vehicle Type: SUV
```

Expected result:

``` text
23 Events
8 Cameras
1 Route
```

------------------------------------------------------------------------

# 17. Event Management

Every detection becomes a normalized event.

### Event fields

``` text
Event ID
Camera ID
Timestamp
Object Type
Vehicle Number
Vehicle Type
Color
Confidence
Latitude
Longitude
Image Reference
Video Reference
Tracking ID
Created At
```

### Example event

``` json
{
  "event_id": "EVT-928172",
  "camera_id": "CAM-AHM-182",
  "timestamp": "2026-09-25T08:42:17Z",
  "object_type": "vehicle",
  "plate": "GJ01AB1234",
  "plate_confidence": 0.967,
  "vehicle_type": "SUV",
  "tracking_id": "TRK-12882"
}
```

------------------------------------------------------------------------

# 18. Alert Engine

### Alert types

-   Watchlist vehicle
-   High-priority investigation match
-   Camera offline
-   VMS disconnected
-   AI detection
-   System health issue

### Example

``` text
WATCHLIST MATCH

Vehicle: GJ01AB1234
Camera: CAM-AHM-182
Time: 09:17:31
Confidence: 96.7%

[VIEW]
[INVESTIGATE]
```

------------------------------------------------------------------------

# 19. Watchlist Management

Authorized users can create:

``` text
Watchlist Name
Vehicle Number
Reason
Priority
Start Date
Expiry Date
Created By
Status
```

Matching events generate alerts.

------------------------------------------------------------------------

# 20. Command Center Dashboard

### KPI cards

``` text
TOTAL CAMERAS     80,000+
ONLINE             76,420
OFFLINE             3,580
LIVE EVENTS        12,482
VEHICLES TODAY      2.4M
ALERTS                327
```

### Main sections

-   GIS map
-   Live events
-   Recent alerts
-   System health
-   Camera status
-   Investigation shortcuts
-   Vehicle search

------------------------------------------------------------------------

# 21. Evidence Management

Each investigation should provide:

-   Snapshot
-   Video reference
-   Camera ID
-   Timestamp
-   Location
-   Detection confidence
-   Event ID
-   Investigation/case reference

Actions:

``` text
[View Evidence]
[Open Camera]
[Open Map]
[View Timeline]
```

------------------------------------------------------------------------

# 22. Investigation Timeline

Example:

``` text
09:17:31 ─ Camera 182
              |
09:21:44 ─ Camera 194
              |
09:28:12 ─ Camera 211
              |
09:36:51 ─ Camera 307
```

Each event must be expandable.

------------------------------------------------------------------------

# 23. User & Role Management

### Roles

  Role             Access
  ---------------- -----------------
  Super Admin      Everything
  State Admin      Statewide
  District Admin   District
  Investigator     Investigation
  Operator         Live monitoring
  Auditor          Logs/reports

### Requirements

-   RBAC
-   Permission management
-   MFA support
-   Session management
-   Access logging
-   Session timeout

------------------------------------------------------------------------

# 24. Audit Log

Every sensitive action should generate:

``` text
User
Action
Timestamp
IP
Resource
Investigation/Case ID
Result
```

Example:

``` text
Officer A
Viewed vehicle GJ01AB1234
25-09-2026 09:18
Case: INV-2026-1821
```

------------------------------------------------------------------------

# 25. Security Requirements

### Required

-   HTTPS/TLS
-   Encryption at rest
-   RBAC
-   MFA
-   Secure API authentication
-   API rate limiting
-   Audit logs
-   Secrets management
-   Network segmentation
-   Secure VMS integration
-   Input validation
-   SQL injection protection
-   XSS protection
-   CSRF protection
-   Secure file handling
-   Session timeout

------------------------------------------------------------------------

# 26. Privacy Requirements

The system should implement:

### Data minimization

Only retain data required for the defined operational purpose.

### Retention policy

``` text
Raw Video
    |
Retention Policy
    |
Automatic Expiry
```

### Access control

Sensitive investigations require appropriate authorization.

### Auditability

Sensitive data access must be logged.

------------------------------------------------------------------------

# 27. Scalability Architecture

The platform should not depend on continuously sending all 80,000 raw
streams to one central AI cluster.

### Hybrid architecture

``` text
80,000 Cameras
       |
+------+------+
|             |
Edge         Existing VMS
|             |
+------+------+
       |
Regional Processing
       |
+------+-------+---------+
|              |         |
AI           Kafka     Storage
|              |         |
+------+-------+---------+
       |
Central Platform
       |
+------+------+------+
|      |      |      |
GIS  Search Analytics Alerts
```

------------------------------------------------------------------------

# 28. Edge Processing

Edge/regional processing may perform:

-   Video decoding
-   Vehicle detection
-   ANPR
-   Object tracking
-   Event extraction

Central platform receives primarily:

``` text
Metadata
+
Events
+
Snapshots
+
Required video evidence
```

This reduces bandwidth and central processing pressure.

------------------------------------------------------------------------

# 29. Data Architecture

## PostgreSQL + PostGIS

For:

-   Camera registry
-   Users
-   Roles
-   Locations
-   GIS
-   Configuration

## ClickHouse

For:

-   High-volume vehicle events
-   Detection analytics
-   Time-series queries

## OpenSearch

For:

-   Vehicle search
-   Event search
-   Investigation search
-   Full-text search

## Redis

For:

-   Cache
-   Session state
-   Realtime state

## Kafka

For:

-   Event streaming
-   AI pipeline
-   Integration messaging

## S3 / MinIO

For:

-   Snapshots
-   Evidence
-   Video clips

------------------------------------------------------------------------

# 30. Core Database Tables

``` text
users
roles
permissions
user_roles

departments
districts
police_stations

cameras
camera_capabilities
camera_health

vms_servers
vms_integrations
camera_vms_mapping

camera_events
vehicle_detections
anpr_detections
vehicle_tracks

watchlists
watchlist_vehicles
alerts

investigations
investigation_events
evidence

audit_logs

system_health
```

------------------------------------------------------------------------

# 31. Key Database Schema

## cameras

``` text
id
camera_code
name
vendor
model
vms_id
latitude
longitude
district_id
department_id
protocol
stream_url
status
anpr_enabled
created_at
updated_at
```

## vehicle_detections

``` text
id
camera_id
tracking_id
plate_number
plate_confidence
vehicle_type
vehicle_color
latitude
longitude
timestamp
snapshot_url
video_reference
created_at
```

## alerts

``` text
id
type
priority
camera_id
vehicle_detection_id
watchlist_id
status
created_at
acknowledged_by
acknowledged_at
```

------------------------------------------------------------------------

# 32. API Requirements

## Authentication

``` http
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

## Cameras

``` http
GET /api/cameras
GET /api/cameras/:id
POST /api/cameras
PUT /api/cameras/:id
DELETE /api/cameras/:id
```

## GIS

``` http
GET /api/gis/cameras
GET /api/gis/events
GET /api/gis/routes/:vehicle
```

## Vehicles

``` http
GET /api/vehicles/:plate
GET /api/vehicles/:plate/timeline
GET /api/vehicles/:plate/route
```

## Events

``` http
GET /api/events
GET /api/events/:id
```

## Alerts

``` http
GET /api/alerts
POST /api/alerts/:id/acknowledge
```

## Watchlists

``` http
GET /api/watchlists
POST /api/watchlists
POST /api/watchlists/:id/vehicles
```

------------------------------------------------------------------------

# 33. Real-Time Architecture

Use WebSockets for live updates.

``` text
AI Detection
      |
    Kafka
      |
Event Processor
      |
WebSocket Gateway
      |
Dashboard
```

Example:

``` text
Camera
  |
AI
  |
ANPR
  |
Kafka
  |
Alert Engine
  |
WebSocket
  |
Officer Dashboard
```

------------------------------------------------------------------------

# 34. Technology Stack

## Frontend

-   Next.js
-   TypeScript
-   React
-   Tailwind CSS
-   MapLibre GL
-   WebSocket

## Backend

-   Python
-   FastAPI

## AI

-   PyTorch
-   YOLO
-   OpenCV
-   PaddleOCR or equivalent
-   ByteTrack / BoT-SORT

## Streaming

-   FFmpeg
-   GStreamer
-   RTSP
-   WebRTC
-   HLS
-   ONVIF

## Infrastructure

-   Docker
-   Kubernetes
-   Kafka
-   Redis

## Databases

-   PostgreSQL
-   PostGIS
-   ClickHouse
-   OpenSearch

## Storage

-   S3-compatible storage
-   MinIO

------------------------------------------------------------------------

# 35. Frontend Pages

``` text
/login

/dashboard

/cameras
/cameras/:id

/map

/live

/events

/vehicles
/vehicles/:plate

/investigations
/investigations/:id

/watchlists

/alerts

/analytics

/vms

/system-health

/users

/audit-logs

/settings
```

------------------------------------------------------------------------

# 36. Main Navigation

``` text
Dashboard
Live Monitoring
GIS Map
Cameras
Vehicle Intelligence
Investigations
Events
Alerts
Watchlists
Analytics
VMS Integrations
System Health
Users & Roles
Audit Logs
Settings
```

------------------------------------------------------------------------

# 37. Hackathon Test Case

The prototype should support approximately 50 heterogeneous feeds.

### Test flow

``` text
50 Cameras
    |
Live Feeds
    |
Vehicle Detection
    |
ANPR
    |
Vehicle Tracking
    |
GIS
    |
Search
    |
Alert
```

------------------------------------------------------------------------

# 38. Demo Dataset

Example cameras:

``` text
CAM-AHM-001
CAM-AHM-002
CAM-AHM-003
...
CAM-AHM-050
```

Example vehicles:

``` text
GJ01AB1234
GJ01CD4521
GJ05XY9182
GJ18AA7721
```

Controlled vehicle movements should be generated across multiple cameras
for reliable demonstration.

------------------------------------------------------------------------

# 39. Prototype Performance Targets

  Requirement                      Target
  ---------------------- ----------------
  Camera registration            \< 2 sec
  Dashboard loading              \< 3 sec
  Vehicle search                 \< 2 sec
  Event search                   \< 2 sec
  GIS route generation           \< 3 sec
  Alert generation         Near real-time
  Live event update              \< 2 sec
  Camera health update     Near real-time

These are prototype targets and should be measured rather than presented
as guaranteed production performance.

------------------------------------------------------------------------

# 40. AI Metrics

Track:

### ANPR

-   Plate detection accuracy
-   OCR confidence
-   False positives

### Vehicle detection

-   Precision
-   Recall
-   Detection confidence

### Tracking

-   ID consistency
-   Cross-camera matching accuracy
-   Tracking continuity

------------------------------------------------------------------------

# 41. System Health

Monitor:

``` text
Camera Online/Offline
Stream Latency
FPS
Packet Loss
AI Worker Health
GPU Usage
CPU Usage
Memory
Kafka Lag
Database Health
Storage
VMS Connectivity
```

------------------------------------------------------------------------

# 42. Disaster Recovery

``` text
Primary Region
      |
Replication
      |
Backup Region
```

Requirements:

-   Database backup
-   Event replication
-   Object storage replication
-   Configuration backup
-   Service failover
-   Health monitoring

------------------------------------------------------------------------

# 43. Deployment Architecture

## Development

``` text
Docker Compose
```

## Production Concept

``` text
Kubernetes
 |
 +-- API
 +-- AI Workers
 +-- Kafka
 +-- OpenSearch
 +-- PostgreSQL
 +-- ClickHouse
 +-- Redis
 +-- Object Storage
```

------------------------------------------------------------------------

# 44. MVP Priorities

## P0 --- Must Have

-   Camera Registry
-   GIS
-   50-camera test environment
-   Live streaming
-   Vehicle detection
-   ANPR
-   Event generation
-   Vehicle search
-   Cross-camera tracking
-   Route visualization
-   Alert engine
-   Basic dashboard

## P1 --- Important

-   VMS adapters
-   Watchlists
-   Investigation workspace
-   Evidence management
-   RBAC
-   Audit logs
-   System health
-   Kafka
-   OpenSearch
-   ClickHouse

## P2 --- Advanced

-   Edge AI
-   Vehicle re-identification
-   Multi-region DR
-   Automated scaling
-   Advanced analytics
-   Infrastructure monitoring
-   Advanced case management

------------------------------------------------------------------------

# 45. Hackathon Acceptance Criteria

### Test 1 --- Camera Registry

Register approximately 50 cameras.

**Expected:** Cameras appear in registry and GIS.

### Test 2 --- Heterogeneous Streams

Connect different stream types/vendors.

**Expected:** Streams are normalized and available to monitoring.

### Test 3 --- Vehicle Detection

Detect a vehicle.

**Expected:** Vehicle event generated.

### Test 4 --- ANPR

Read a number plate.

**Expected:** Plate and confidence displayed.

### Test 5 --- Vehicle Search

Search a registration number.

**Expected:** Historical detections returned.

### Test 6 --- Cross-Camera Tracking

Connect multiple detections.

**Expected:** Vehicle journey reconstructed.

### Test 7 --- GIS Route

Display journey geographically.

**Expected:** Route and timestamps visible.

### Test 8 --- Watchlist

Generate a matching vehicle event.

**Expected:** Real-time alert generated.

### Test 9 --- Evidence

Open event evidence.

**Expected:** Snapshot/video reference available.

### Test 10 --- Scalability

Demonstrate 50-camera working prototype and explain the architecture for
approximately 80,000 cameras.

------------------------------------------------------------------------

# 46. Recommended Development Roadmap

## Phase 1 --- Foundation

-   Repository setup
-   Docker
-   Next.js
-   FastAPI
-   PostgreSQL/PostGIS
-   Authentication
-   Camera registry
-   Dashboard

## Phase 2 --- GIS

-   Map
-   Camera markers
-   Camera status
-   Camera details
-   District filtering

## Phase 3 --- Video

-   RTSP
-   HLS/WebRTC
-   Stream gateway
-   50-camera simulator
-   Live monitoring

## Phase 4 --- AI

-   Vehicle detection
-   ANPR
-   OCR
-   Tracking
-   Event generation

## Phase 5 --- Investigation

-   Vehicle search
-   Event timeline
-   Cross-camera tracking
-   Route generation
-   GIS journey

## Phase 6 --- Alerts

-   Watchlists
-   Alert engine
-   WebSocket notifications

## Phase 7 --- Scale

-   Kafka
-   ClickHouse
-   OpenSearch
-   Edge architecture
-   Load testing
-   Scalability dashboard

## Phase 8 --- Security & Submission

-   RBAC
-   Audit logs
-   Security documentation
-   Architecture diagram
-   Demo script
-   Presentation
-   Final submission

------------------------------------------------------------------------

# 47. Core Product Architecture

``` text
                    NEXT.JS COMMAND CENTER
                              |
                        API / WebSocket
                              |
                         API GATEWAY
                              |
        +---------------------+----------------------+
        |                     |                      |
 Camera Registry       Investigation API        Alert Engine
        |                     |                      |
   PostgreSQL              OpenSearch               Redis
   + PostGIS                   |
                               |
                           ClickHouse
                               ^
                               |
                             Kafka
                               ^
                               |
                    +----------+----------+
                    |                     |
                AI ENGINE            EVENT ENGINE
                    |
              +-----+-----+
              |           |
             ANPR      Tracking
              |
              +-----+
                    ^
                    |
              VIDEO PIPELINE
                    ^
                    |
              RTSP / HLS / VMS
                    ^
                    |
              EXISTING CAMERAS
```

------------------------------------------------------------------------

# 48. Core MVP Workflow

``` text
50 CCTV Cameras
       |
Stream Gateway
       |
AI Engine
       |
+------+------+
|             |
Vehicle      ANPR
Detection    /OCR
|             |
+------+------+
       |
Event Engine
       |
Kafka
       |
+------+------+------+
|             |      |
ClickHouse OpenSearch PostGIS
|             |      |
+------+------+------+
       |
Investigation API
       |
Next.js Dashboard
       |
+------+-------+------+
|      |       |      |
Search Timeline GIS  Alerts
       |
Vehicle Journey
```

------------------------------------------------------------------------

# 49. Primary Demo Story

The entire hackathon demonstration should revolve around one vehicle.

### Input

``` text
GJ01AB1234
```

### System returns

``` text
✓ Vehicle Found
✓ 7 Cameras
✓ 17 Events
✓ 5 Locations
✓ Complete Timeline
✓ GIS Route
✓ Evidence
✓ Watchlist Status
✓ Real-Time Alert
```

### Final message

> **One vehicle. Multiple cameras. One searchable investigation
> timeline.**

------------------------------------------------------------------------

# 50. Success Definition

The prototype is successful when a judge can provide a vehicle number
and the team can demonstrate, end-to-end:

``` text
Vehicle Number
      ↓
ANPR Events
      ↓
Multiple Cameras
      ↓
Timeline
      ↓
GIS Route
      ↓
Evidence
      ↓
Watchlist
      ↓
Real-Time Alert
```

while clearly explaining how the same architecture can evolve from the
hackathon's approximately 50-camera demonstration to a distributed
deployment supporting approximately 80,000 cameras.

------------------------------------------------------------------------

## Final Product Positioning

### Gujarat SentinelX

**A unified CCTV intelligence and investigation layer for heterogeneous
camera and VMS infrastructure.**

### One-line pitch

> **Connect every camera. Understand every event. Reconstruct every
> journey.**
