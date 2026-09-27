# 12 — VMS INTEGRATION & ADAPTER ARCHITECTURE
**Platform:** Gujarat SentinelX  
**Authority:** Government of Gujarat — Home Department & Gujarat Police  

---

## 1. Adapter Layer Overview
SentinelX implements the **VMSProvider** abstraction pattern to interface with heterogeneous Video Management Systems without polluting core business logic with vendor-specific SDKs.

```
+----------------------------------------------------------------------------------------------------+
|                                    HETEROGENEOUS VMS PROVIDERS                                     |
|  [Sentinel Grid]      [Milestone XProtect]      [Genetec Omnicast]     [HikCentral]    [Matrix]    |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                  SENTINELX VMS ADAPTER INTERFACE                                   |
|  • discover_cameras()     • get_stream_url(cam_id)    • get_ptz_profile()    • get_health()       |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                   NORMALIZED CAMERA REGISTRY & API                                 |
|  Stream Gateway  ──>  FastAPI API Core  ──>  MapLibre GIS  ──>  Command Center Player              |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Integrated Camera Feeds (Sentinel Camera Grid Catalogue)
The hackathon prototype integrates the 30 official Gujarat cameras discovered dynamically from `cctv.corp8.cloud/cameras.json`:

| ID | Name | Jurisdiction / City | Primary Protocol |
|---|---|---|---|
| `cam01` | 01 Chiman bhai Bridge | Ahmedabad (Sabarmati) | HLS / RTSP TCP:8554 |
| `cam02` | 02 Janpath | Ahmedabad (Ashram Road) | HLS / RTSP TCP:8554 |
| `cam03` | 03 O.N.G.C. Office | Ahmedabad (Chandkheda) | HLS / RTSP TCP:8554 |
| `cam04` | 04 Paldi Circle | Ahmedabad (Paldi) | HLS / RTSP TCP:8554 |
| `cam05` | 05 Visat teen Rasta | Ahmedabad (Visat) | HLS / RTSP TCP:8554 |
| `cam06` | 06 Timbavadi gate-Junagadh | Junagadh | HLS / RTSP TCP:8554 |
| `cam07` | 07 hero-showroom-gir-somnath | Gir Somnath | HLS / RTSP TCP:8554 |
| `cam08` | 08 majewadi-gate-junagadh | Junagadh | HLS / RTSP TCP:8554 |
| `cam09` | 09 new-bypass-circle-junagadh | Junagadh | HLS / RTSP TCP:8554 |
| `cam10` | 10 char-chowk-road-junagadh | Junagadh | HLS / RTSP TCP:8554 |
| `cam11` | 11 dolatpara-junagadh | Junagadh | HLS / RTSP TCP:8554 |
| `cam12` | 12 Tri Mandir Adalaj Tollnaka | Gandhinagar / Adalaj | HLS / RTSP TCP:8554 |
| `cam13` | 13 CN Vidhyalaya | Ahmedabad (Ambawadi) | HLS / RTSP TCP:8554 |
| `cam14` | 14 Delight RLVD | Ahmedabad | HLS / RTSP TCP:8554 |
| `cam15` | 15 Suvidha park | Ahmedabad | HLS / RTSP TCP:8554 |
| `cam16` | 16 Visat P2 | Ahmedabad | HLS / RTSP TCP:8554 |
| `cam17` | 17 Rajkot Bus Port CCTV | Rajkot Central | HLS / RTSP TCP:8554 |
| `cam18` | 18 Rajkot CCTV | Rajkot Urban | HLS / RTSP TCP:8554 |
| `cam19` | 19 KHAPARIA GRAM PANCHAYAT | Navsari (Gandevi) | HLS / RTSP TCP:8554 |
| `cam20` | 20 Mohanpura | Ahmedabad | HLS / RTSP TCP:8554 |
| `cam21` | 23 Patan Dethali Char Rasta | Patan | HLS / RTSP TCP:8554 |
| `cam22` | 28 BK Mervada tran Rasta | Banaskantha | HLS / RTSP TCP:8554 |
| `cam23` | 30 kheram | Gujarat Rural | HLS / RTSP TCP:8554 |
| `cam24` | 33 dehgam | Gandhinagar (Dehgam) | HLS / RTSP TCP:8554 |
| `cam25` | 34 dhanori | Navsari | HLS / RTSP TCP:8554 |
| `cam26` | 35 TANKAL | Surat Region | HLS / RTSP TCP:8554 |
| `cam27` | 36 bilimora | Navsari (Bilimora) | HLS / RTSP TCP:8554 |
| `cam28` | 37 bilimora | Navsari (Bilimora) | HLS / RTSP TCP:8554 |
| `cam29` | 38 bilimora | Navsari (Bilimora) | HLS / RTSP TCP:8554 |
| `cam30` | Gandhidham Rambaugh p2 | Kutch (Gandhidham) | HLS / RTSP TCP:8554 |

---

## 3. Third-Party Municipal & Police VMS Connectors
1. **Milestone XProtect Integration:** Ingests cameras across Ahmedabad Safe City via Milestone Integration Platform (MIP) REST SDK.
2. **Genetec Omnicast Integration:** Connects high-security government zone cameras across Gandhinagar Sachivalaya via Genetec Web SDK.
3. **HikCentral ISAPI Connector:** Connects Surat Traffic Surveillance ANPR posts.
4. **Matrix SATATYA Connector:** Connects State Highway patrol corridors via ONVIF Profile S/G.
