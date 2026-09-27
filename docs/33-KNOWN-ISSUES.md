# 33 — KNOWN ISSUES & MITIGATIONS: GUJARAT SENTINELX

| ID | Issue Description | Severity | Impact | Mitigation / Status |
|---|---|---|---|---|
| **ISS-001** | `cctv.corp8.cloud` HLS index access via raw curl returns "browser required" Cloudflare challenge on non-browser clients | LOW | Affects automated server-side headless scraping without cookies | Use authenticated session cookies (`sentinel=...`) acquired via `/auth/login`, or browser-native Hls.js client, or direct RTSP TCP connection to `103.250.160.189:8554`. |
| **ISS-002** | Python 3.14 deprecation warnings on `datetime.utcnow()` and `on_event` | TRIVIAL | Console logs during development | Added clean warning filters in `pytest.ini` and standard lifespan handlers. |
| **ISS-003** | Mixed H.264/H.265 stream join warnings: `Could not find ref with POC` | TRIVIAL | Temporary log notice during initial GOP sync | Handled gracefully as non-fatal per integrator specification; auto-corrects on first IDR frame. |
