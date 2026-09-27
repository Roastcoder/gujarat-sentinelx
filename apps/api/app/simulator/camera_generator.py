"""
Authoritative 50-Camera Gujarat State Simulator & Catalogue Generator
Conforms to CCTV Ingest Specification Section 4, 5, 7, 13, and 47.
Exposes mixed H.264 / H.265 codecs, variable resolutions, RTSP/TCP, WHEP, and HLS.
"""

from typing import List, Dict, Any
from datetime import datetime

# 50 Strategic CCTV Corridors Across Gujarat State
GUJARAT_CAMERA_SPEC = [
    # Ahmedabad SG Highway & City Corridors (H.264 & H.265)
    {"id": "cam01", "code": "CAM-AHM-001", "name": "SG Hwy - Iscon Crossroad Junction", "location": "SG Highway, Iscon Crossroad, Satellite, Ahmedabad", "lat": 23.0287, "lon": 72.5068, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Milestone XProtect"},
    {"id": "cam02", "code": "CAM-AHM-002", "name": "SG Hwy - Prahlad Nagar Crossroad", "location": "100ft Road, Prahlad Nagar Garden, Ahmedabad", "lat": 23.0121, "lon": 72.5113, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Ahmedabad", "vms": "Milestone XProtect"},
    {"id": "cam03", "code": "CAM-AHM-003", "name": "SG Hwy - Shivranjani Crossroad", "location": "Shivranjani, Satellite, Ahmedabad", "lat": 23.0245, "lon": 72.5312, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "HikCentral"},
    {"id": "cam04", "code": "CAM-AHM-004", "name": "SG Hwy - Pakwan Dining Junction", "location": "Bodakdev, SG Highway, Ahmedabad", "lat": 23.0378, "lon": 72.5124, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Milestone XProtect"},
    {"id": "cam05", "code": "CAM-AHM-005", "name": "SG Hwy - Sindhu Bhavan Marg Entry", "location": "PRL Colony, Sindhu Bhavan Road, Bodakdev", "lat": 23.0412, "lon": 72.5034, "codec": "H.265", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Matrix Comsec"},
    {"id": "cam06", "code": "CAM-AHM-006", "name": "SG Hwy - Gurudwara Crossroad Junction", "location": "Thaltej Crossroad, SG Highway, Ahmedabad", "lat": 23.0498, "lon": 72.5178, "codec": "H.264", "res": (1280, 720), "fps": 20.0, "bitrate": 2048, "dist": "Ahmedabad", "vms": "Genetec Security Center"},
    {"id": "cam07", "code": "CAM-AHM-007", "name": "SG Hwy - Gota Flyover South Approach", "location": "Gota Bridge South, SG Highway, Ahmedabad", "lat": 23.0891, "lon": 72.5367, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Ahmedabad", "vms": "Milestone XProtect"},
    {"id": "cam08", "code": "CAM-AHM-008", "name": "SG Hwy - Gota Crossroad Chowk", "location": "Vasantnagar, Gota, Ahmedabad", "lat": 23.0967, "lon": 72.5398, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "HikCentral"},
    {"id": "cam09", "code": "CAM-AHM-009", "name": "SG Hwy - Thaltej Underpass North Exit", "location": "Thaltej Shilaj Road, SG Highway, Ahmedabad", "lat": 23.0543, "lon": 72.5198, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Milestone XProtect"},
    {"id": "cam10", "code": "CAM-AHM-010", "name": "SG Hwy - Sola Civil Hospital Junction", "location": "Sola Overbridge, Science City Road, Ahmedabad", "lat": 23.0721, "lon": 72.5276, "codec": "H.265", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Matrix Comsec"},
    {"id": "cam11", "code": "CAM-AHM-011", "name": "SG Hwy - Science City Circle Approach", "location": "Science City Road, Sola, Ahmedabad", "lat": 23.0789, "lon": 72.5187, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Genetec Security Center"},
    {"id": "cam12", "code": "CAM-AHM-012", "name": "SG Hwy - Ognaj Ring Road Intersect", "location": "SP Ring Road Junction, Ognaj, Ahmedabad", "lat": 23.1045, "lon": 72.5212, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Ahmedabad", "vms": "Milestone XProtect"},
    {"id": "cam13", "code": "CAM-AHM-013", "name": "SG Hwy - Jagatpur Godrej Garden Entry", "location": "Jagatpur Railway Crossing, Gota, Ahmedabad", "lat": 23.1112, "lon": 72.5423, "codec": "H.264", "res": (1280, 720), "fps": 20.0, "bitrate": 2048, "dist": "Ahmedabad", "vms": "HikCentral"},
    {"id": "cam14", "code": "CAM-AHM-014", "name": "SG Hwy - Vaishnodevi Circle Intersect", "location": "SP Ring Road & SG Highway, Vaishnodevi Circle", "lat": 23.1289, "lon": 72.5512, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Milestone XProtect"},
    {"id": "cam15", "code": "CAM-AHM-015", "name": "SP Ring Road - Sanand Circle Junction", "location": "Sarkhej-Sanand Highway, Sanand Circle, Ahmedabad", "lat": 22.9987, "lon": 72.4876, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Matrix Comsec"},
    {"id": "cam16", "code": "CAM-AHM-016", "name": "SP Ring Road - Bopal Crossroad Overbridge", "location": "South Bopal Road, SP Ring Road, Ahmedabad", "lat": 23.0189, "lon": 72.4798, "codec": "H.265", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Milestone XProtect"},
    {"id": "cam17", "code": "CAM-AHM-017", "name": "SP Ring Road - Shilaj Circle Overpass", "location": "Shilaj Gam Road, SP Ring Road, Ahmedabad", "lat": 23.0456, "lon": 72.4823, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Genetec Security Center"},
    {"id": "cam18", "code": "CAM-AHM-018", "name": "SP Ring Road - Zundal Circle Toll Plaza", "location": "Zundal Circle Toll Post, SP Ring Road", "lat": 23.1412, "lon": 72.5789, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Ahmedabad", "vms": "HikCentral"},
    {"id": "cam19", "code": "CAM-AHM-019", "name": "SP Ring Road - Tapovan Circle Intersect", "location": "Visat-Gandhinagar Highway, Tapovan Circle", "lat": 23.1345, "lon": 72.5923, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Milestone XProtect"},
    {"id": "cam20", "code": "CAM-AHM-020", "name": "SP Ring Road - Bhat Circle Airport Approach", "location": "Airport Road Junction, Bhat Circle, Ahmedabad", "lat": 23.1189, "lon": 72.6234, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Ahmedabad", "vms": "Matrix Comsec"},

    # Gandhinagar Capital Corridors & Secretariat (H.264 & H.265)
    {"id": "cam21", "code": "CAM-GND-021", "name": "Ahmedabad-GND Hwy - Koba Circle Post", "location": "Koba Circle, Airport-Gandhinagar Highway", "lat": 23.1612, "lon": 72.6345, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Gandhinagar", "vms": "Milestone XProtect"},
    {"id": "cam22", "code": "CAM-GND-022", "name": "Ahmedabad-GND Hwy - PDPU Bridge Junction", "location": "Bhaijipura Crossroad, Raysan, Gandhinagar", "lat": 23.1789, "lon": 72.6412, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Gandhinagar", "vms": "Genetec Security Center"},
    {"id": "cam23", "code": "CAM-GND-023", "name": "Gandhinagar Bypass - GIFT City North Gate", "location": "GIFT City Access Corridor, Gandhinagar", "lat": 23.1654, "lon": 72.6834, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Gandhinagar", "vms": "Milestone XProtect"},
    {"id": "cam24", "code": "CAM-GND-024", "name": "Gandhinagar Bypass - GIFT City South Gate", "location": "GIFT SEZ South Checkpoint, Ratanpur Road", "lat": 23.1534, "lon": 72.6789, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Gandhinagar", "vms": "Matrix Comsec"},
    {"id": "cam25", "code": "CAM-GND-025", "name": "Infocity Junction - GH-0 Circle Post", "location": "Infocity Arcade, GH Road, Sector 9, Gandhinagar", "lat": 23.1934, "lon": 72.6321, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Gandhinagar", "vms": "HikCentral"},
    {"id": "cam26", "code": "CAM-GND-026", "name": "DAIICT Crossroad - GH Road Post", "location": "Indroda Circle, GH Road, Gandhinagar", "lat": 23.1876, "lon": 72.6289, "codec": "H.265", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Gandhinagar", "vms": "Milestone XProtect"},
    {"id": "cam27", "code": "CAM-GND-027", "name": "Karmayogi Bhavan Circle - Sector 10 Chowk", "location": "Sector 10A, Gandhinagar", "lat": 23.2123, "lon": 72.6456, "codec": "H.264", "res": (1280, 720), "fps": 20.0, "bitrate": 2048, "dist": "Gandhinagar", "vms": "Genetec Security Center"},
    {"id": "cam28", "code": "CAM-GND-028", "name": "CH-0 Circle - Pathikashram North Post", "location": "CH Road & GH Road, Central Sector, Gandhinagar", "lat": 23.2189, "lon": 72.6512, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Gandhinagar", "vms": "Milestone XProtect"},
    {"id": "cam29", "code": "CAM-GND-029", "name": "CH-2 Circle - Sector 11/12 Intersect", "location": "CH Road, Sector 11, Gandhinagar", "lat": 23.2245, "lon": 72.6578, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Gandhinagar", "vms": "HikCentral"},
    {"id": "cam30", "code": "CAM-GND-030", "name": "CH-3 Circle - Sector 16/17 Chowk", "location": "CH Road, Sector 16, Gandhinagar", "lat": 23.2312, "lon": 72.6634, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Gandhinagar", "vms": "Matrix Comsec"},
    {"id": "cam31", "code": "CAM-GND-031", "name": "Vidhan Sabha Marg - Gate 1 VIP Checkpoint", "location": "Gujarat Legislative Assembly Complex, Sector 10", "lat": 23.2178, "lon": 72.6612, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Gandhinagar", "vms": "Milestone XProtect"},
    {"id": "cam32", "code": "CAM-GND-032", "name": "New Sachivalaya - Block 1 Security Gate", "location": "Swarnim Sankul 1, New Sachivalaya, Gandhinagar", "lat": 23.2156, "lon": 72.6598, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Gandhinagar", "vms": "Milestone XProtect"},
    {"id": "cam33", "code": "CAM-GND-033", "name": "Old Sachivalaya - Block 4 West Approach", "location": "Old Sachivalaya Complex, Sector 10, Gandhinagar", "lat": 23.2134, "lon": 72.6567, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Gandhinagar", "vms": "HikCentral"},
    {"id": "cam34", "code": "CAM-GND-034", "name": "Police Bhavan HQ - Main Gate Checkpost", "location": "Director General of Police HQ, Sector 18, Gandhinagar", "lat": 23.2267, "lon": 72.6534, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Gandhinagar", "vms": "Genetec Security Center"},
    {"id": "cam35", "code": "CAM-GND-035", "name": "Vidhan Sabha Marg - Sector 10 Approach", "location": "Sachivalaya Gate 1 / Sector 10 Road, Gandhinagar", "lat": 23.2165, "lon": 72.6601, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Gandhinagar", "vms": "Milestone XProtect"},

    # Vadodara Industrial Corridors & National Highway (H.264 & H.265)
    {"id": "cam36", "code": "CAM-VAD-036", "name": "NH-48 Golden Chokdi Intersect", "location": "NH-48 Golden Chokdi Toll Post, Vadodara", "lat": 22.3512, "lon": 73.2189, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Vadodara", "vms": "Milestone XProtect"},
    {"id": "cam37", "code": "CAM-VAD-037", "name": "Alkapuri Railway Underpass North", "location": "RC Dutt Road, Alkapuri, Vadodara", "lat": 22.3123, "lon": 73.1812, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Vadodara", "vms": "HikCentral"},
    {"id": "cam38", "code": "CAM-VAD-038", "name": "Sayaji Baug Central Gate Approach", "location": "Vinoba Bhave Road, Sayajiganj, Vadodara", "lat": 22.3189, "lon": 73.1912, "codec": "H.264", "res": (1280, 720), "fps": 20.0, "bitrate": 2048, "dist": "Vadodara", "vms": "Matrix Comsec"},
    {"id": "cam39", "code": "CAM-VAD-039", "name": "Makarpura GIDC Industrial Corridor Exit", "location": "Makarpura Main Road, GIDC Estate, Vadodara", "lat": 22.2512, "lon": 73.1978, "codec": "H.265", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Vadodara", "vms": "Genetec Security Center"},
    {"id": "cam40", "code": "CAM-VAD-040", "name": "Gorwa ITI Circle South Junction", "location": "Gorwa Refinery Road, Subhanpura, Vadodara", "lat": 22.3345, "lon": 73.1612, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Vadodara", "vms": "Milestone XProtect"},

    # Surat Diamond & Textile Corridors (H.264 & H.265)
    {"id": "cam41", "code": "CAM-SRT-041", "name": "Ring Road Majura Gate Flyover North", "location": "Ring Road, Majura Gate, Surat", "lat": 21.1789, "lon": 72.8234, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Surat", "vms": "Milestone XProtect"},
    {"id": "cam42", "code": "CAM-SRT-042", "name": "Athwa Gate Circle South Approach", "location": "Dumas Road, Athwa Gate, Surat", "lat": 21.1712, "lon": 72.8089, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Surat", "vms": "HikCentral"},
    {"id": "cam43", "code": "CAM-SRT-043", "name": "Surat-Dumas Road Airport Checkpoint", "location": "Airport Access Road, Dumas, Surat", "lat": 21.1189, "lon": 72.7412, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Surat", "vms": "Matrix Comsec"},
    {"id": "cam44", "code": "CAM-SRT-044", "name": "Varachha Diamond Market Chowk", "location": "Mini Bazar, Varachha Main Road, Surat", "lat": 21.2189, "lon": 72.8578, "codec": "H.265", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Surat", "vms": "Genetec Security Center"},
    {"id": "cam45", "code": "CAM-SRT-045", "name": "Udhna Darwaja BRTS Junction", "location": "Udhna Main Road, Surat", "lat": 21.1612, "lon": 72.8345, "codec": "H.264", "res": (1280, 720), "fps": 20.0, "bitrate": 2048, "dist": "Surat", "vms": "Milestone XProtect"},

    # Rajkot Saurashtra Corridors (H.264 & H.265)
    {"id": "cam46", "code": "CAM-RJK-046", "name": "150ft Ring Road - Madhapar Chowkadi", "location": "Jamnagar Highway, Madhapar, Rajkot", "lat": 22.3189, "lon": 70.7612, "codec": "H.265", "res": (2560, 1440), "fps": 30.0, "bitrate": 6144, "dist": "Rajkot", "vms": "Milestone XProtect"},
    {"id": "cam47", "code": "CAM-RJK-047", "name": "150ft Ring Road - Indira Circle Junction", "location": "University Road, Indira Circle, Rajkot", "lat": 22.2891, "lon": 70.7734, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Rajkot", "vms": "HikCentral"},
    {"id": "cam48", "code": "CAM-RJK-048", "name": "Yagnik Road - Imperial Chowk Post", "location": "Dr Yagnik Road, Jagnath Plot, Rajkot", "lat": 22.2987, "lon": 70.7989, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Rajkot", "vms": "Matrix Comsec"},
    {"id": "cam49", "code": "CAM-RJK-049", "name": "Gondal Road Overbridge Checkpoint", "location": "NH-27 Junction, Gondal Road, Rajkot", "lat": 22.2612, "lon": 70.8034, "codec": "H.265", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Rajkot", "vms": "Genetec Security Center"},
    {"id": "cam50", "code": "CAM-RJK-050", "name": "Greenland Chowkadi Ahmedabad Hwy Post", "location": "Ahmedabad-Rajkot Highway Toll Junction, Rajkot", "lat": 22.3112, "lon": 70.8389, "codec": "H.264", "res": (1920, 1080), "fps": 25.0, "bitrate": 4096, "dist": "Rajkot", "vms": "Milestone XProtect"},
]

# In-memory failure injection state
_INJECTED_FAILURES: Dict[str, Dict[str, Any]] = {}

def inject_camera_failure(camera_id: str, failure_type: str, enabled: bool = True):
    """
    Failure injection mechanism for CI, evaluation, and resilience testing.
    failure_type: 'offline', 'decoder_warning', 'pts_gap', 'scene_discontinuity'
    """
    if camera_id not in _INJECTED_FAILURES:
        _INJECTED_FAILURES[camera_id] = {}
    _INJECTED_FAILURES[camera_id][failure_type] = enabled

def clear_camera_failures():
    _INJECTED_FAILURES.clear()

def generate_catalogue_response(host: str = "103.250.160.189", base_url: str = "http://localhost:8000") -> List[Dict[str, Any]]:
    """
    Produces the authoritative /api/ingest catalogue according to Section 5.
    Exposes RTSP, WebRTC WHEP, and HLS for all 50 cameras.
    """
    cameras = []
    
    for item in GUJARAT_CAMERA_SPEC:
        cam_id = item["id"]
        failures = _INJECTED_FAILURES.get(cam_id, {})
        
        is_offline = failures.get("offline", False)
        live_status = "OFFLINE" if is_offline else "ONLINE"
        
        # Section 4 Authoritative Stream URLs:
        # RTSP: rtsp://<host>:8554/stream/<id>
        # WebRTC WHEP: http://<host>:8889/stream/<id>/whep
        # HLS: http://<host>/live/stream/<id>/index.m3u8
        rtsp_url = f"rtsp://cybersachinyadav%40gmail.com:A2ZV-8SLH-T9NF@{host}:8554/stream/{cam_id}"
        whep_url = f"http://cybersachinyadav%40gmail.com:A2ZV-8SLH-T9NF@{host}:8889/stream/{cam_id}/whep"
        hls_url = f"https://cctv.corp8.cloud/live/stream/{cam_id}/index.m3u8"
        
        width, height = item["res"]
        
        cameras.append({
            "camera_id": cam_id,
            "camera_code": item["code"],
            "name": item["name"],
            "location": item["location"],
            "latitude": item["lat"],
            "longitude": item["lon"],
            "codec": item["codec"],
            "live_status": live_status,
            "width": width,
            "height": height,
            "fps_declared": item["fps"],
            "bitrate": item["bitrate"],
            "rtsp_url": rtsp_url,
            "webrtc_url": whep_url,
            "hls_url": hls_url,
            "vms_id": item["vms"],
            "department": "Home Department",
            "district": item["dist"],
            "failure_injected": failures
        })
        
    return cameras
