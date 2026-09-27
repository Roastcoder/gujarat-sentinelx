# 21 — DEPLOYMENT ARCHITECTURE (DOCKER & KUBERNETES)
**Platform:** Gujarat SentinelX  

---

## 1. Local Development (Docker Compose)
SentinelX packages the entire stack for turnkey local evaluation:
```bash
# Start all microservices in containers
docker compose up -d

# Verify services
docker compose ps
```
Services included:
- `api` (FastAPI backend on port 8000)
- `web` (Next.js frontend on port 3000)
- `postgres` (PostgreSQL 15 + PostGIS on port 5432)
- `redis` (Port 6379)
- `kafka` (Port 9092)
- `opensearch` (Port 9200)
- `clickhouse` (Port 8123)
- `minio` (Port 9000/9001)

---

## 2. Production Enterprise Deployment (Kubernetes)
In production, SentinelX is deployed across sovereign government cloud (e.g. Gujarat SDC Kubernetes cluster):
- Stateless FastAPI API pods managed via Horizontal Pod Autoscalers (HPA: 10 – 40 pods based on CPU/memory load).
- State-managed StatefulSets for ClickHouse sharding and Kafka brokers.
- Ingress-NGINX with TLS termination and DDoS rate-limiting.
