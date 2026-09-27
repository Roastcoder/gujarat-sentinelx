# 18 — PRIVACY, RETENTION & DATA GOVERNANCE
**Platform:** Gujarat SentinelX  

---

## 1. Principles of Data Minimization
- **Metadata Over Raw Video:** The platform prioritizes ingesting tabular event metadata (plate string, timestamp, camera coordinate, speed) over centralizing raw video footage.
- **30-Day Circular Retention:** Routine CCTV stream data expires automatically after 30 days unless flagged as critical evidence under a formal police FIR/case docket.

---

## 2. Chain of Custody & Judicial Admissibility
- Evidence snapshots attached to an investigation are stamped with the originating camera's hardware identifier, firmware version, monotonic PTS, GPS coordinates, and an immutable SHA-256 cryptographic hash compliant with Indian Evidence Act digital forensics guidelines.
