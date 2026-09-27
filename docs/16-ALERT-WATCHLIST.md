# 16 — REAL-TIME WATCHLIST & ALERT ENGINE
**Platform:** Gujarat SentinelX  

---

## 1. Hotlist Matching Architecture
Incoming ANPR events are stripped of whitespace and dashes (`GJ 01 AB 1234` → `GJ01AB1234`) and matched against active state hotlists in sub-millisecond memory lookups.

## 2. Priority Classifications & Actions
- **CRITICAL:** High-risk felony suspects, armed escapes, Amber alerts. Broadcasts immediate visual radar cue and audio alert to all active command terminals.
- **HIGH:** Active case getaway vehicles (e.g. `GJ01AB1234` - Jewellery heist). Generates persistent alert card requiring officer acknowledgment.
- **MEDIUM / LOW:** Stolen vehicles, expired road tax, repeated over-speeding (>100 km/h on SG Highway). Logged for patrol unit interdiction.

## 3. Acknowledgment & Audit Lifecycle
An alert transitions from `NEW` → `ACKNOWLEDGED` when a control room officer inputs resolution notes. The officer's identity, badge number, timestamp, and notes are immutably logged.
