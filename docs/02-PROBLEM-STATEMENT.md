# 02 — PROBLEM STATEMENT: CCTV FRAGMENTATION IN STATEWIDE SURVEILLANCE
**Authority:** Government of Gujarat — Home Department & Gujarat Police  

---

## 1. The Challenge of Heterogeneous CCTV Infrastructure
Gujarat's urban development, Smart Cities missions (Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar), State Highway corridors, and police jurisdictions operate thousands of CCTV cameras. However, the ecosystem is severely fragmented:
- **Multiple Proprietary VMS Vendors:** Milestone XProtect, Genetec Omnicast, Matrix SATATYA, HikCentral, Dahua DSS.
- **Incompatible Stream Protocols:** RTSP, ONVIF Profile S/G/T, HLS, WebRTC, proprietary SDKs.
- **Siloed Databases & Metadata:** ANPR detections in Ahmedabad Safe City do not correlate with Gandhinagar Secretariat cameras or highway toll plaza NVRs.
- **Manual, Slow Investigations:** Tracking a suspect vehicle across jurisdictions currently demands manual coordination across separate control rooms, taking hours or days.

## 2. The Core Investigation Question
During critical law enforcement incidents (e.g. felony escape, kidnappings, hit-and-run, stolen vehicles), investigators need instant answers:
1. *Where was this registration number detected?*
2. *At what exact timestamps did it pass each camera checkpoint?*
3. *What path/route did the vehicle traverse across jurisdictions?*
4. *What photographic evidence and plate confidence scores exist?*
5. *Is this vehicle flagged on active police watchlists?*

## 3. The SentinelX Solution
Deploy **Gujarat SentinelX** as a federated intelligence and cross-camera correlation layer above existing VMS infrastructure.
