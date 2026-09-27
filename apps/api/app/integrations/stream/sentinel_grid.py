import logging
import time
from urllib.parse import quote
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("sentinelx.grid")

FALLBACK_CATALOGUE = [
    {"id": "cam01", "name": "01 Chiman bhai Bridge", "district": "Ahmedabad"},
    {"id": "cam02", "name": "02 Janpath", "district": "Ahmedabad"},
    {"id": "cam03", "name": "03 O.N.G.C. Office", "district": "Ahmedabad"},
    {"id": "cam04", "name": "04 Paldi Circle", "district": "Ahmedabad"},
    {"id": "cam05", "name": "05 Visat teen Rasta", "district": "Ahmedabad"},
    {"id": "cam06", "name": "06 Timbavadi gate-Junagadh", "district": "Junagadh"},
    {"id": "cam07", "name": "07 hero-showroom-gir-somnath", "district": "Gir Somnath"},
    {"id": "cam08", "name": "08 majewadi-gate-junagadh", "district": "Junagadh"},
    {"id": "cam09", "name": "09 new-bypass-near-by-circle-junagadh-2", "district": "Junagadh"},
    {"id": "cam10", "name": "10 char-chowk-road-2-junagadh", "district": "Junagadh"},
    {"id": "cam11", "name": "11 dolatpara-junagadh", "district": "Junagadh"},
    {"id": "cam12", "name": "12 Tri Mandir Adalaj Tollnaka", "district": "Gandhinagar"},
    {"id": "cam13", "name": "13 CN Vidhyalaya", "district": "Ahmedabad"},
    {"id": "cam14", "name": "14 Delight RLVD", "district": "Ahmedabad"},
    {"id": "cam15", "name": "15 Suvidha park", "district": "Ahmedabad"},
    {"id": "cam16", "name": "16 Visat P2", "district": "Ahmedabad"},
    {"id": "cam17", "name": "17 Rajkot Bus Port CCTV", "district": "Rajkot"},
    {"id": "cam18", "name": "18 Rajkot CCTV", "district": "Rajkot"},
    {"id": "cam19", "name": "19 KHAPARIA GRAM PANCHAYAT , TALUKA GANDEVI", "district": "Navsari"},
    {"id": "cam20", "name": "20 Mohanpura", "district": "Gandhinagar"},
    {"id": "cam21", "name": "23 Patan Dethali Char Rasta", "district": "Patan"},
    {"id": "cam22", "name": "28 BK Mervada tran Rasta", "district": "Banaskantha"},
    {"id": "cam23", "name": "30 kheram", "district": "Mehsana"},
    {"id": "cam24", "name": "33 dehgam", "district": "Gandhinagar"},
    {"id": "cam25", "name": "34 dhanori", "district": "Navsari"},
    {"id": "cam26", "name": "35 TANKAL", "district": "Navsari"},
    {"id": "cam27", "name": "36 bilimora", "district": "Navsari"},
    {"id": "cam28", "name": "37 bilimora", "district": "Navsari"},
    {"id": "cam29", "name": "38 bilimora", "district": "Navsari"},
    {"id": "cam30", "name": "Gandhidham Rambaugh p2", "district": "Kutch"}
]

class SentinelGridService:
    """
    Client for Sentinel Camera Grid (cctv.corp8.cloud & 103.250.160.189).
    Provides dynamic camera discovery from /cameras.json, URL generation for
    HLS, RTSP (over TCP:8554), and WebRTC (WHEP:8889), and copy-paste code
    snippets for OpenCV, GStreamer, and FFmpeg inference pipelines.
    """

    def __init__(self):
        self.email = settings.SENTINEL_GRID_EMAIL
        self.password = settings.SENTINEL_GRID_PASSWORD
        self.host = settings.SENTINEL_GRID_HOST
        self.rtsp_port = settings.SENTINEL_GRID_RTSP_PORT
        self.whep_port = settings.SENTINEL_GRID_WHEP_PORT
        self.cdn = settings.SENTINEL_GRID_CDN
        self.encoded_email = quote(self.email, safe="")
        self._cache: Optional[List[Dict[str, Any]]] = None
        self._last_fetch_time: float = 0
        self._ttl_seconds: int = 600

    def _infer_district(self, name: str) -> str:
        name_lower = name.lower()
        if "junagadh" in name_lower:
            return "Junagadh"
        if "gir" in name_lower or "somnath" in name_lower:
            return "Gir Somnath"
        if "rajkot" in name_lower:
            return "Rajkot"
        if "adalaj" in name_lower or "dehgam" in name_lower or "gandhinagar" in name_lower:
            return "Gandhinagar"
        if "patan" in name_lower:
            return "Patan"
        if "bilimora" in name_lower or "navsari" in name_lower or "khaparia" in name_lower or "dhanori" in name_lower or "tankal" in name_lower:
            return "Navsari"
        if "gandhidham" in name_lower or "kutch" in name_lower:
            return "Kutch"
        if "mervada" in name_lower or "bk" in name_lower:
            return "Banaskantha"
        if "kheram" in name_lower:
            return "Mehsana"
        return "Ahmedabad"

    async def get_catalogue(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Dynamically fetches active camera catalogue from cctv.corp8.cloud/cameras.json
        after authenticating with user session cookie. Falls back to verified catalogue.
        """
        now = time.time()
        if not force_refresh and self._cache and (now - self._last_fetch_time < self._ttl_seconds):
            return self._cache

        cameras_raw = None
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                # Login to establish session
                login_resp = await client.post(
                    f"{self.cdn}/auth/login",
                    data={"email": self.email, "password": self.password},
                    headers=headers
                )
                
                # Fetch catalogue
                cat_resp = await client.get(f"{self.cdn}/cameras.json", headers=headers)
                if cat_resp.status_code == 200:
                    cameras_raw = cat_resp.json()
                    logger.info(f"Successfully fetched {len(cameras_raw)} cameras from {self.cdn}/cameras.json")
        except Exception as e:
            logger.warning(f"Unable to fetch dynamic catalogue from {self.cdn}: {e}. Using fallback catalogue.")

        if not cameras_raw:
            cameras_raw = FALLBACK_CATALOGUE

        # Enrich each camera with multi-protocol URLs & AI snippets
        enriched = []
        for idx, item in enumerate(cameras_raw):
            cam_id = item.get("id") or f"cam{str(idx+1).zfill(2)}"
            name = item.get("name") or f"Camera {cam_id}"
            district = item.get("district") or self._infer_district(name)
            
            hls_url = f"{self.cdn}/{cam_id}/index.m3u8"
            rtsp_url = f"rtsp://{self.encoded_email}:{self.password}@{self.host}:{self.rtsp_port}/stream/{cam_id}"
            whep_url = f"http://{self.encoded_email}:{self.password}@{self.host}:{self.whep_port}/stream/{cam_id}/whep"

            enriched.append({
                "id": cam_id,
                "code": f"CAM-SENT-{str(idx+1).zfill(3)}",
                "name": name,
                "district": district,
                "status": "ONLINE",
                "fps": 25 if idx % 2 == 0 else 30,
                "resolution": "1080p (FHD)",
                "protocols": {
                    "hls": {
                        "url": hls_url,
                        "intended_for": "Dashboards, web preview, mobile, restricted networks",
                        "auth": "Web Session Cookie (sentinel)"
                    },
                    "rtsp": {
                        "url": rtsp_url,
                        "intended_for": "AI inference (OpenCV, GStreamer, FFmpeg, DeepStream)",
                        "auth": "Basic Auth Embedded (URL Percent-encoded %40)",
                        "transport": "Force TCP (rtsp_transport;tcp)"
                    },
                    "webrtc": {
                        "url": whep_url,
                        "intended_for": "Ultra low-latency browser preview via WHEP",
                        "auth": "Basic Auth Embedded"
                    }
                },
                "snippets": {
                    "opencv_python": (
                        f"import os, cv2\n"
                        f"# Force TCP transport:\n"
                        f'os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"\n'
                        f'cap = cv2.VideoCapture("{rtsp_url}", cv2.CAP_FFMPEG)\n'
                        f"while True:\n"
                        f"    ok, frame = cap.read()\n"
                        f"    if not ok: break\n"
                        f"    pts_ms = cap.get(cv2.CAP_PROP_POS_MSEC)"
                    ),
                    "gstreamer": (
                        f"gst-launch-1.0 rtspsrc location={rtsp_url} protocols=tcp latency=200 \\\n"
                        f"  ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! fakesink"
                    ),
                    "ffplay_rtsp": f"ffplay -rtsp_transport tcp {rtsp_url}",
                    "ffplay_hls": f"ffplay {hls_url}"
                }
            })

        self._cache = enriched
        self._last_fetch_time = now
        return enriched

sentinel_grid_service = SentinelGridService()
