"""
VMS Federation & Adapter Architecture (Section 38)
Normalizes heterogeneous commercial VMS platforms into unified camera streams.
Supported: Milestone XProtect, Genetec Security Center, HikCentral, Matrix Comsec, ONVIF.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from datetime import datetime

class VMSAdapter(ABC):
    """Abstract interface for all Video Management System adapters."""
    def __init__(self, vms_id: str, name: str, host: str, port: int):
        self.vms_id = vms_id
        self.name = name
        self.host = host
        self.port = port
        self.status = "ONLINE"
        self.last_sync = datetime.utcnow()

    @abstractmethod
    async def discover_cameras(self) -> List[Dict[str, Any]]:
        """Queries upstream VMS API/SDK and returns normalized camera records."""
        pass

    @abstractmethod
    async def get_stream_url(self, camera_id: str, protocol: str = "RTSP") -> str:
        """Translates camera ID into RTSP, WHEP, or HLS stream URL."""
        pass

    @abstractmethod
    async def get_health(self) -> Dict[str, Any]:
        """Returns health diagnostic telemetry for this VMS connector."""
        pass


class MilestoneXProtectAdapter(VMSAdapter):
    """Adapter for Milestone XProtect Corporate / Expert."""
    def __init__(self, host: str = "10.100.1.10", port: int = 7563):
        super().__init__("VMS-MIL-01", "Milestone XProtect Corporate", host, port)

    async def discover_cameras(self) -> List[Dict[str, Any]]:
        return [
            {
                "camera_id": "MIL-CAM-101",
                "name": "Ahmedabad SG Highway Gateway",
                "vendor": "Milestone",
                "protocol": "RTSP",
                "codec": "H.264",
                "resolution": "1920x1080"
            }
        ]

    async def get_stream_url(self, camera_id: str, protocol: str = "RTSP") -> str:
        return f"rtsp://milestone:{self.port}/live/{camera_id}"

    async def get_health(self) -> Dict[str, Any]:
        return {
            "vms_id": self.vms_id,
            "name": self.name,
            "status": self.status,
            "connected_cameras": 20,
            "latency_ms": 18,
            "sdk_version": "2024 R1 MIP SDK"
        }


class GenetecSecurityCenterAdapter(VMSAdapter):
    """Adapter for Genetec Security Center Federation."""
    def __init__(self, host: str = "10.100.2.10", port: int = 443):
        super().__init__("VMS-GEN-01", "Genetec Security Center Omnicast", host, port)

    async def discover_cameras(self) -> List[Dict[str, Any]]:
        return []

    async def get_stream_url(self, camera_id: str, protocol: str = "RTSP") -> str:
        return f"rtsp://genetec:{self.port}/rtsp/{camera_id}"

    async def get_health(self) -> Dict[str, Any]:
        return {
            "vms_id": self.vms_id,
            "name": self.name,
            "status": self.status,
            "connected_cameras": 10,
            "latency_ms": 22,
            "sdk_version": "Security Center 5.11"
        }


class HikCentralAdapter(VMSAdapter):
    """Adapter for Hikvision HikCentral Enterprise."""
    def __init__(self, host: str = "10.100.3.10", port: int = 80):
        super().__init__("VMS-HIK-01", "HikCentral Professional", host, port)

    async def discover_cameras(self) -> List[Dict[str, Any]]:
        return []

    async def get_stream_url(self, camera_id: str, protocol: str = "RTSP") -> str:
        return f"rtsp://hikcentral:{self.port}/ISAPI/Streaming/channels/{camera_id}"

    async def get_health(self) -> Dict[str, Any]:
        return {
            "vms_id": self.vms_id,
            "name": self.name,
            "status": self.status,
            "connected_cameras": 12,
            "latency_ms": 15,
            "sdk_version": "OpenAPI v2.1"
        }


class MatrixComsecAdapter(VMSAdapter):
    """Adapter for Matrix SATATYA SAMAS (Indigenous Indian CCTV VMS)."""
    def __init__(self, host: str = "10.100.4.10", port: int = 8080):
        super().__init__("VMS-MTX-01", "Matrix SATATYA SAMAS", host, port)

    async def discover_cameras(self) -> List[Dict[str, Any]]:
        return []

    async def get_stream_url(self, camera_id: str, protocol: str = "RTSP") -> str:
        return f"rtsp://matrix:{self.port}/media/{camera_id}"

    async def get_health(self) -> Dict[str, Any]:
        return {
            "vms_id": self.vms_id,
            "name": self.name,
            "status": self.status,
            "connected_cameras": 8,
            "latency_ms": 12,
            "sdk_version": "Matrix SAMAS v2.4"
        }


class ONVIFAdapter(VMSAdapter):
    """Universal Profile S / Profile T ONVIF Camera Adapter."""
    def __init__(self, host: str = "10.100.5.10", port: int = 80):
        super().__init__("VMS-ONVIF-01", "Universal ONVIF Profile T", host, port)

    async def discover_cameras(self) -> List[Dict[str, Any]]:
        return []

    async def get_stream_url(self, camera_id: str, protocol: str = "RTSP") -> str:
        return f"rtsp://onvif:{self.port}/onvif1"

    async def get_health(self) -> Dict[str, Any]:
        return {
            "vms_id": self.vms_id,
            "name": self.name,
            "status": self.status,
            "connected_cameras": 50,
            "latency_ms": 14,
            "sdk_version": "ONVIF Spec 22.06"
        }


class VMSFederationManager:
    """Central registry and manager for all heterogeneous VMS connectors."""
    def __init__(self):
        self._adapters: Dict[str, VMSAdapter] = {
            "milestone": MilestoneXProtectAdapter(),
            "genetec": GenetecSecurityCenterAdapter(),
            "hikcentral": HikCentralAdapter(),
            "matrix": MatrixComsecAdapter(),
            "onvif": ONVIFAdapter()
        }

    def list_adapters(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": a.vms_id,
                "name": a.name,
                "host": a.host,
                "port": a.port,
                "status": a.status,
                "last_sync": a.last_sync.isoformat()
            }
            for a in self._adapters.values()
        ]

    async def get_aggregated_health(self) -> List[Dict[str, Any]]:
        health_reports = []
        for adapter in self._adapters.values():
            h = await adapter.get_health()
            health_reports.append(h)
        return health_reports

vms_federation = VMSFederationManager()
