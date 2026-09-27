# 17 — SECURITY ARCHITECTURE & ACCESS GOVERNANCE
**Platform:** Gujarat SentinelX  

---

## 1. Authentication & Session Security
- **JWT Cryptography:** HMAC-SHA256 signed access tokens with 8-hour expiry.
- **Password Protection:** Cryptographic salt-and-hash via `bcrypt` (work factor 12).
- **Session Management:** Revocation capabilities and automatic session timeout.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Permission | Super Admin | State Admin | District Admin | Investigator | Operator | Auditor |
|---|---|---|---|---|---|---|
| View Live Video Wall | Yes | Yes | Yes | Yes | Yes | No |
| Search Plates & Journeys | Yes | Yes | Yes | Yes | No | Read-Only |
| Create Investigations | Yes | Yes | Yes | Yes | No | No |
| Acknowledge Alerts | Yes | Yes | Yes | Yes | Yes | No |
| Modify Camera Registry | Yes | Yes | District Only | No | No | No |
| Inspect Audit Logs | Yes | Yes | No | No | No | Full Access |
