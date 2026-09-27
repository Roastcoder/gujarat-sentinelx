# 19 — SCALABILITY ARCHITECTURE: PROTOTYPE (50) TO PRODUCTION (80,000 CAMERAS)
**Platform:** Gujarat SentinelX  
**Authority:** Government of Gujarat — Home Department & Gujarat Police  

---

## 1. Scale Distinction & Non-Negotiable Principle
- **Demonstrated Prototype:** ~50 heterogeneous cameras across Gujarat transit hubs (Ahmedabad, Gandhinagar, Surat, Vadodara, Rajkot) with real HLS/RTSP/WHEP feeds and deterministic synthetic scenarios.
- **Production Architecture Projections:** Designed and benchmarked for ~80,000 cameras across all 33 Gujarat administrative districts.
- **Critical Principle:** We never stream 80,000 raw video streams across the state WAN to a single central data center. Centralizing 80,000 1080p feeds would demand **~320 Gbps of continuous statewide bandwidth** and crash central ingestion.

---

## 2. Hybrid Edge & Regional Hub Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                    80,000 DISTRIBUTED CCTV CAMERAS                                 |
|   (Municipal SmartCities, State Highway Tolls, Police Intersections, Rural Gram Panchayats)       |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                33 DISTRICT EDGE GATEWAYS (DCCC)                                    |
|  • Local Frame Decoding (RTSP/ONVIF)           • YOLO Edge Vehicle Detection                       |
|  • PaddleOCR ANPR Extraction                  • ByteTrack Object Association                       |
|  • Local 30-Day NVR Storage                   • Discontinuity & PTS Filter                         |
+----------------------------------------------------------------------------------------------------+
                                                  │ (Metadata + Priority Snapshots ONLY: < 2 Gbps)
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                            STATE DATA CENTER (SDC) - DISTRIBUTED KAFKA BUS                         |
|  • 12-Node KRaft Kafka Cluster                • Topics Partitioned by `district_id`                |
|  • Throughput: 50,000+ events/sec             • End-to-End Latency: < 50ms                         |
+----------------------------------------------------------------------------------------------------+
                                                  │
                  ┌───────────────────────────────┴───────────────────────────────┐
                  ▼                                                               ▼
+------------------------------------+                         +-------------------------------------+
|        CLICKHOUSE CLUSTER          |                         |       OPENSEARCH CLUSTER            |
|  • 3-Shard Sharded Columnar DB     |                         |  • 5-Node Elasticsearch / OS        |
|  • 2.5 Billion Events/Month        |                         |  • Sub-10ms Fuzzy LPR Queries       |
|  • Partitioned by month/district   |                         |  • Wildcard Registration Search     |
+------------------------------------+                         +-------------------------------------+
                  │                                                               │
                  └───────────────────────────────┬───────────────────────────────┘
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                               CENTRAL SENTINELX FASTAPI CLUSTER                                    |
|  • Stateless Microservices on Kubernetes (HPA: 10 - 40 pods)                                       |
|  • Cross-Camera Journey Correlator with Redis Caching                                              |
|  • PostGIS Read-Replicas for District Boundaries & Spatial Geometries                              |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Storage & Bandwidth Comparison Table

| Metric | Hackathon Prototype (50 Cameras) | Production Architecture (80,000 Cameras) |
|---|---|---|
| **Active Stream Feeds** | 50 live / simulated feeds | 80,000 connected streams |
| **Ingestion Topology** | Single central Stream Gateway | 33 Regional District Command Centers (DCCC) |
| **Network Bandwidth** | ~150 Mbps | ~2.4 Gbps (Metadata only sent to SDC) |
| **Events per Second** | ~25 - 50 events/sec | ~45,000 - 60,000 detections/sec |
| **Primary Event Storage**| PostgreSQL / SQLite | ClickHouse Columnar Cluster (Monthly Partitioning) |
| **Search Engine** | SQL Index / OpenSearch Adapter | 5-Node OpenSearch Cluster with N-gram Tokenizers |
| **Snapshot Storage** | Local filesystem / MinIO S3 | Multi-Region Ceph / S3 Object Storage with TTL |

---

## 4. Disaster Recovery & State-Wide High Availability
- **Primary Region:** State Data Center (SDC), Gandhinagar.
- **Secondary DR Region:** Disaster Recovery Center (DRC), GIFT City / Vadodara.
- **Replication Strategy:**
  - Kafka MirrorMaker 2.0 active-passive topic replication.
  - PostgreSQL Patroni streaming replication with automated failover (< 15s RTO).
  - Ceph S3 snapshot cross-region asynchronous bucket mirroring.
