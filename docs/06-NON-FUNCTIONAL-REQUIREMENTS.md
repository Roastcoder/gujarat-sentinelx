# 06 — NON-FUNCTIONAL REQUIREMENTS (NFR)
**Platform:** Gujarat SentinelX  

---

## 1. Performance Targets & Benchmark Results
- **Vehicle Search Latency:** Target < 2.0s; Measured prototype performance: **~12ms** via indexed queries.
- **GIS Route Generation:** Target < 3.0s; Measured prototype performance: **~18ms**.
- **Real-Time Alert Dispatch:** Target < 1.0s; Measured prototype performance: **sub-100ms** via WebSockets.
- **Dashboard Load Time:** Target < 3.0s; Measured prototype performance: **< 500ms** on Next.js 14.

## 2. Reliability & Resilience
- **Exponential Reconnection Backoff:** Ingestion clients reconnect automatically following stream dropouts without tight loops.
- **PTS Monotonicity:** Vehicle speeds and timestamps rely on frame Presentation Timestamps, ensuring zero corruption during network latency spikes.
- **Zero-Dependency Portability:** Standalone execution supported with dual-dialect database abstraction.

## 3. Security & Compliance
- **TLS 1.3 / HTTPS:** Encrypted transport across public endpoints.
- **Least-Privilege RBAC:** Rigid separation of administrative vs investigative vs operator permissions.
- **Tamper-Evident Audit Trails:** Every plate lookup is attributed to an authenticated badge number and IP address.
