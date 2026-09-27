from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class InvestigationEvidenceCreate(BaseModel):
    evidence_type: str = "SNAPSHOT"
    title: str
    description: Optional[str] = None
    file_url: str
    camera_id: Optional[str] = None
    detection_id: Optional[str] = None
    captured_at: Optional[datetime] = None
    chain_of_custody: Optional[str] = "Captured via SentinelX ANPR Engine"

class InvestigationEvidenceResponse(BaseModel):
    id: str
    investigation_id: str
    evidence_type: str
    title: str
    description: Optional[str] = None
    file_url: str
    camera_id: Optional[str] = None
    detection_id: Optional[str] = None
    captured_at: datetime
    chain_of_custody: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InvestigationNoteCreate(BaseModel):
    author_name: str
    note: str

class InvestigationNoteResponse(BaseModel):
    id: str
    investigation_id: str
    author_name: str
    note: str
    created_at: datetime

    class Config:
        from_attributes = True

class InvestigationCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "HIGH"
    target_plates: Optional[str] = None

class InvestigationResponse(BaseModel):
    id: str
    case_number: str
    title: str
    description: Optional[str] = None
    officer_id: Optional[str] = None
    officer_name: str
    priority: str
    status: str
    target_plates: Optional[str] = None
    evidence: List[InvestigationEvidenceResponse] = []
    notes: List[InvestigationNoteResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
