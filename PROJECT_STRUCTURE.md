# GUJARAT SENTINELX: Project Structure

```
Gujarat SentinelX/
├── apps/
│   ├── api/                                # FastAPI Backend Core
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── v1/
│   │   │   │   │   ├── endpoints/
│   │   │   │   │   │   ├── auth.py         # Login, tokens, refresh, RBAC
│   │   │   │   │   │   ├── cameras.py      # Camera registry CRUD & status
│   │   │   │   │   │   ├── gis.py          # GeoJSON endpoints for cameras, routes, events
│   │   │   │   │   │   ├── vehicles.py     # Vehicle search, journey reconstruction & timeline
│   │   │   │   │   │   ├── events.py       # Normalized detection events
│   │   │   │   │   │   ├── alerts.py       # Alert engine & acknowledgement
│   │   │   │   │   │   ├── watchlists.py   # Hotlist & wanted vehicle registers
│   │   │   │   │   │   ├── investigations.py# Investigation cases & dossiers
│   │   │   │   │   │   ├── analytics.py    # Time-series aggregates & KPIs
│   │   │   │   │   │   ├── vms.py          # VMS integration adapters
│   │   │   │   │   │   ├── audit.py        # Audit trail logs
│   │   │   │   │   │   ├── system.py       # System health & diagnostics
│   │   │   │   │   │   └── demo.py         # Deterministic hackathon demo scenario
│   │   │   │   │   └── router.py           # Unified v1 router
│   │   │   │   └── websocket.py            # Realtime WebSocket / SSE hub
│   │   │   ├── core/
│   │   │   │   ├── config.py               # Pydantic v2 application settings
│   │   │   │   ├── database.py             # SQLAlchemy engine & session factory
│   │   │   │   ├── security.py             # JWT handling & bcrypt password hashing
│   │   │   │   ├── logging.py              # Structured logging & request context
│   │   │   │   └── errors.py               # Standardized error definitions & handlers
│   │   │   ├── models/                     # SQLAlchemy Models (PostgreSQL & SQLite fallback)
│   │   │   │   ├── user.py                 # Users, roles, permissions
│   │   │   │   ├── jurisdiction.py         # Departments, districts, police stations
│   │   │   │   ├── camera.py               # Cameras, capabilities, health
│   │   │   │   ├── event.py                # Detection events, ANPR, vehicle tracking
│   │   │   │   ├── watchlist.py            # Watchlists & hotlist vehicles
│   │   │   │   ├── alert.py                # System & security alerts
│   │   │   │   ├── investigation.py        # Cases, evidence items, notes
│   │   │   │   ├── audit.py                # Audit logs
│   │   │   │   └── system.py               # Component telemetry
│   │   │   ├── schemas/                    # Pydantic Request/Response DTOs
│   │   │   │   ├── auth.py
│   │   │   │   ├── camera.py
│   │   │   │   ├── gis.py
│   │   │   │   ├── vehicle.py
│   │   │   │   ├── event.py
│   │   │   │   ├── alert.py
│   │   │   │   ├── watchlist.py
│   │   │   │   ├── investigation.py
│   │   │   │   ├── analytics.py
│   │   │   │   └── system.py
│   │   │   ├── services/                   # Core Business Logic
│   │   │   │   ├── journey_service.py      # Cross-camera vehicle correlation & route engine
│   │   │   │   ├── alert_service.py        # Watchlist matcher & notification dispatcher
│   │   │   │   ├── camera_service.py       # Camera health & lifecycle
│   │   │   │   ├── audit_service.py        # Centralized audit logger
│   │   │   │   └── demo_service.py         # Hackathon scenario state machine
│   │   │   ├── integrations/               # Extensible Adapters
│   │   │   │   ├── vms/                    # MockVMS, RTSP, ONVIF adapters
│   │   │   │   ├── search/                 # OpenSearch adapter with fallback
│   │   │   │   ├── analytics/              # ClickHouse adapter with fallback
│   │   │   │   ├── stream/                 # Kafka adapter with in-memory fallback
│   │   │   │   └── storage/                # MinIO/S3 adapter with local file fallback
│   │   │   ├── main.py                     # FastAPI application entrypoint
│   │   │   └── seeder.py                   # 50 camera seed data & GJ01AB1234 demo data
│   │   ├── tests/                          # Backend Pytest Suite
│   │   ├── requirements.txt                # Python dependencies
│   │   └── Dockerfile
│   │
│   └── web/                                # Next.js Command Center Frontend
│       ├── app/
│       │   ├── layout.tsx                  # Root layout with navy theme & navigation
│       │   ├── page.tsx                    # Landing / redirect to dashboard
│       │   ├── dashboard/page.tsx          # Main Command Center (KPIs, live feed, quick search)
│       │   ├── live/page.tsx               # Live CCTV Monitoring (1/4/9/16 camera grid)
│       │   ├── map/page.tsx                # Interactive GIS Map (MapLibre GL)
│       │   ├── cameras/page.tsx            # Camera Registry management & details
│       │   ├── cameras/[id]/page.tsx
│       │   ├── vehicles/page.tsx           # Vehicle Intelligence hub
│       │   ├── vehicles/[plate]/page.tsx   # Single Vehicle Investigation (GJ01AB1234 demo)
│       │   ├── investigations/page.tsx     # Investigation Case Workspace
│       │   ├── events/page.tsx             # Normalized Event Log
│       │   ├── alerts/page.tsx             # Alert Center & Acknowledgment Drawer
│       │   ├── watchlists/page.tsx         # Watchlist Management
│       │   ├── analytics/page.tsx          # Intelligence Analytics & Charts
│       │   ├── vms/page.tsx                # VMS Integration Manager
│       │   ├── system-health/page.tsx      # System Health & Infrastructure Diagnostics
│       │   ├── users/page.tsx              # User & RBAC Management
│       │   ├── audit-logs/page.tsx         # Security & Access Audit Trail
│       │   ├── settings/page.tsx           # Platform Settings
│       │   └── login/page.tsx              # Officer Authentication
│       ├── components/
│       │   ├── ui/                         # Base UI components (buttons, cards, badges, dialogs)
│       │   ├── layout/                     # Sidebar, Topbar, DemoBanner, AlertDrawer
│       │   ├── gis/                        # MapLibre Map, CameraMarkers, RoutePolyline
│       │   ├── live/                       # VideoPlayer, CameraGrid, StreamHUD
│       │   ├── vehicle/                    # VehicleTimeline, EvidenceGallery, AttributeCard
│       │   └── common/                     # LoadingSkeleton, EmptyState, ErrorBanner
│       ├── lib/                            # API client, WebSocket client, formatters
│       ├── types/                          # TypeScript interfaces
│       ├── public/                         # Static assets, evidence snapshots, logos
│       ├── package.json
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── Dockerfile
│
├── services/
│   ├── ai-engine/                          # Pluggable AI Analytics Pipeline
│   │   ├── interfaces.py                   # DetectionProvider, OCRProvider, TrackingProvider
│   │   ├── mock_engine.py                  # High-fidelity deterministic simulator
│   │   └── yolo_engine.py                  # Real YOLO / PaddleOCR reference implementation
│   ├── stream-gateway/                     # RTSP / HLS Stream Transcoding & Proxy
│   ├── event-processor/                    # Stream ingestion & event deduplication
│   └── alert-engine/                       # Watchlist rule evaluation worker
│
├── simulator/
│   ├── camera-simulator/                   # 50 simulated camera feed nodes
│   ├── vehicle-generator/                  # Synthetic Indian vehicle trajectory generator
│   └── event-generator/                    # ANPR and telemetry generator
│
├── infrastructure/
│   ├── docker/                             # Dockerfiles for each service
│   ├── postgres/                           # PostGIS init scripts & seeders
│   ├── kafka/                              # Topic definitions & configurations
│   ├── opensearch/                         # Index templates & mappings
│   ├── clickhouse/                         # Table schemas & materialized views
│   └── minio/                              # Bucket policies
│
├── docs/
│   ├── architecture.md                     # Complete architectural blueprint
│   ├── api.md                              # OpenAPI specification & endpoint dictionary
│   ├── database.md                         # Schema relationships & indexing strategy
│   ├── deployment.md                       # Docker Compose & Kubernetes rollout
│   ├── scalability.md                      # 80,000-camera regional scaling roadmap
│   └── demo-script.md                      # 3-5 minute hackathon jury walkthrough
│
├── docker-compose.yml                      # Full multi-container composition
├── .env.example                            # Configuration environment template
├── README.md                               # Comprehensive project documentation
└── Makefile                                # Developer shortcuts (build, run, test, demo)
```
