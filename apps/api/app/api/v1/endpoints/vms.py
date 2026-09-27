from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter()

@router.get("/integrations")
async def list_vms_integrations() -> List[Dict[str, Any]]:
    return [
        {
            "id": "vms-sentinel-grid",
            "name": "Sentinel CCTV Camera Grid (Official Hackathon Grid)",
            "vendor": "Sentinel Cloud Gateway",
            "host": "cctv.corp8.cloud / 103.250.160.189",
            "protocols": ["HLS", "RTSP (TCP:8554)", "WebRTC (WHEP:8889)"],
            "status": "CONNECTED",
            "camera_count": 30,
            "latency_ms": 32,
            "auth_type": "URL-Embedded %40 Email + Access Password",
            "features": ["Live Stream", "H.264/H.265 Auto-Detect", "Monotonic PTS Tracking"]
        },
        {
            "id": "vms-milestone-ahm",
            "name": "Milestone XProtect Corporate - Ahmedabad SmartCity",
            "vendor": "Milestone Systems",
            "host": "vms-ahm-01.police.gujarat.gov.in",
            "protocols": ["RTSP", "REST API", "ONVIF"],
            "status": "CONNECTED",
            "camera_count": 18,
            "latency_ms": 24,
            "auth_type": "OAuth 2.0 Mutual TLS",
            "features": ["Live Stream", "PTZ Control", "ANPR Edge Push", "Historical Playback"]
        },
        {
            "id": "vms-genetec-gnd",
            "name": "Genetec Omnicast - Gandhinagar Security Zone",
            "vendor": "Genetec",
            "host": "vms-gnd-01.police.gujarat.gov.in",
            "protocols": ["RTSP", "WebRTC", "SIP Audio"],
            "status": "CONNECTED",
            "camera_count": 15,
            "latency_ms": 19,
            "auth_type": "Certificate-based API Key",
            "features": ["Live Stream", "High-Definition ANPR", "PTZ Presets", "Vehicle Telemetry"]
        },
        {
            "id": "vms-hikcentral-srt",
            "name": "HikCentral Enterprise - Surat Traffic Division",
            "vendor": "Hikvision",
            "host": "vms-srt-01.traffic.gujarat.gov.in",
            "protocols": ["RTSP", "HLS", "ISAPI"],
            "status": "CONNECTED",
            "camera_count": 12,
            "latency_ms": 28,
            "auth_type": "Digest Authentication",
            "features": ["Live Stream", "Speed Violation Events", "Signal Jump Detection"]
        },
        {
            "id": "vms-matrix-state",
            "name": "Matrix SATATYA SAMAS - Gujarat State Highway Corridor",
            "vendor": "Matrix Comsec (Gujarat)",
            "host": "matrix-sh-gateway.gujarat.gov.in",
            "protocols": ["ONVIF Profile S/G/T", "RTSP"],
            "status": "CONNECTED",
            "camera_count": 5,
            "latency_ms": 35,
            "auth_type": "WS-UsernameToken",
            "features": ["Highway ANPR", "Toll Crossings", "Heavy Vehicle Lane Compliance"]
        }
    ]

@router.get("/status")
async def get_vms_gateway_status() -> Dict[str, Any]:
    return {
        "gateway_version": "SentinelX-Adapter-v2.6",
        "active_adapters": 5,
        "total_managed_streams": 50,
        "stream_health_pct": 96.0,
        "transcoding_pipeline": "FFmpeg / GStreamer H.264/H.265 PTS-Normalized",
        "tcp_enforced": True,
        "reconnect_policy": "Exponential backoff (2s - 30s cap)"
    }

from app.integrations.vms.adapters import vms_federation

@router.get("/adapters")
async def list_vms_adapters() -> List[Dict[str, Any]]:
    """List registered modular VMS adapters (Milestone, Genetec, Matrix, HikCentral, ONVIF)."""
    return vms_federation.list_adapters()

@router.get("/adapters/health")
async def get_vms_adapters_health() -> List[Dict[str, Any]]:
    """Get real-time connector health across all federated VMS platforms."""
    return await vms_federation.get_aggregated_health()

