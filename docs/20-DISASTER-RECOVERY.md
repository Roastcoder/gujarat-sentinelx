# 20 — DISASTER RECOVERY & CONTINUITY OF OPERATIONS
**Platform:** Gujarat SentinelX  

---

## 1. High Availability Topology
- **Primary Site:** State Data Center (SDC), Gandhinagar.
- **Secondary DR Site:** Disaster Recovery Center (DRC), GIFT City / Vadodara.
- **RTO (Recovery Time Objective):** < 30 seconds for automatic read-replica failover.
- **RPO (Recovery Point Objective):** < 5 seconds via synchronous PostgreSQL Patroni replication and Kafka multi-datacenter mirroring.

---

## 2. Failover Orchestration
In the event of catastrophic infrastructure loss at the SDC:
1. DNS health probes reroute API and Command Center web traffic to the secondary cluster.
2. The standby PostgreSQL instance is promoted to primary master.
3. Edge gateways buffer up to 48 hours of detection metadata locally on district NVRs until central Kafka broker connectivity is re-established.
