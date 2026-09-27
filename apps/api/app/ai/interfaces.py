"""
Modular AI Provider Interfaces (Section 20 & 21)
Defines abstract contracts for Detection, Tracking, ANPR/OCR, Face Recognition, and Embeddings.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float
    confidence: float

class DetectionResult(BaseModel):
    label: str  # car, truck, bus, motorcycle, person, bicycle
    confidence: float
    bbox: BoundingBox
    attributes: Dict[str, Any] = Field(default_factory=dict)  # color, make, model

class TrackedObject(BaseModel):
    track_id: str
    label: str
    bbox: BoundingBox
    velocity_kmh: Optional[float] = None
    pts_ms: float
    camera_code: str
    dwell_time_ms: float = 0.0

class ANPRResult(BaseModel):
    raw_text: str
    normalized_plate: str  # e.g., GJ01AB1234
    confidence: float
    bbox: BoundingBox
    plate_color: str = "WHITE"  # WHITE (Private), YELLOW (Commercial), GREEN (EV)
    state_code: str = "GJ"

class FaceResult(BaseModel):
    face_id: str
    confidence: float
    bbox: BoundingBox
    feature_vector: Optional[List[float]] = None
    redacted_preview_url: Optional[str] = None

class DetectionProvider(ABC):
    """Abstract provider for vehicle and object detection."""
    @abstractmethod
    async def detect(self, frame_data: Any, camera_code: str, pts_ms: float) -> List[DetectionResult]:
        pass

class TrackingProvider(ABC):
    """Abstract provider for temporal object tracking across frames using PTS."""
    @abstractmethod
    async def update(
        self,
        detections: List[DetectionResult],
        camera_code: str,
        pts_ms: float,
        delta_t_ms: float
    ) -> List[TrackedObject]:
        pass

    @abstractmethod
    def reset_tracker(self, camera_code: str):
        """Called upon scene cut / loop discontinuity to reset tracker state."""
        pass

class ANPRProvider(ABC):
    """Abstract provider for License Plate Recognition / OCR."""
    @abstractmethod
    async def extract_plate(
        self,
        crop_data: Any,
        camera_code: str,
        pts_ms: float
    ) -> Optional[ANPRResult]:
        pass

    @staticmethod
    def normalize_plate(raw_text: str) -> str:
        """Standardizes Indian vehicle registration format: GJ01AB1234."""
        cleaned = "".join(c for c in raw_text.upper() if c.isalnum())
        return cleaned

class FaceRecognitionProvider(ABC):
    """Abstract provider for facial recognition with privacy/audit controls."""
    @abstractmethod
    async def analyze_faces(
        self,
        frame_data: Any,
        camera_code: str,
        pts_ms: float
    ) -> List[FaceResult]:
        pass

class EmbeddingProvider(ABC):
    """Abstract provider for vehicle feature extraction for cross-camera Re-ID."""
    @abstractmethod
    async def generate_embedding(self, vehicle_crop: Any) -> List[float]:
        pass
