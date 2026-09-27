import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.errors import SentinelXException
from app.models.investigation import Investigation, InvestigationEvidence, InvestigationNote
from app.models.user import User
from app.schemas.investigation import (
    InvestigationResponse,
    InvestigationCreate,
    InvestigationEvidenceCreate,
    InvestigationEvidenceResponse,
    InvestigationNoteCreate,
    InvestigationNoteResponse,
)
from app.api.v1.endpoints.auth import get_current_user
from app.services.audit_service import log_audit_action

router = APIRouter()

@router.get("", response_model=List[InvestigationResponse])
async def list_investigations(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Investigation)
        .options(
            selectinload(Investigation.evidence),
            selectinload(Investigation.notes)
        )
        .order_by(Investigation.created_at.desc())
    )
    result = await db.execute(stmt)
    cases = result.scalars().all()

    items = []
    for c in cases:
        ev_items = [InvestigationEvidenceResponse.from_orm(e) for e in c.evidence]
        nt_items = [InvestigationNoteResponse.from_orm(n) for n in c.notes]
        items.append(
            InvestigationResponse(
                id=c.id,
                case_number=c.case_number,
                title=c.title,
                description=c.description,
                officer_id=c.officer_id,
                officer_name=c.officer_name,
                priority=c.priority,
                status=c.status,
                target_plates=c.target_plates,
                evidence=ev_items,
                notes=nt_items,
                created_at=c.created_at,
                updated_at=c.updated_at
            )
        )
    return items

@router.post("", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
async def create_investigation(
    data: InvestigationCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    case_num = f"INV-2026-{str(uuid.uuid4())[:4].upper()}"
    inv = Investigation(
        case_number=case_num,
        title=data.title,
        description=data.description,
        officer_id=current_user.id,
        officer_name=current_user.full_name,
        priority=data.priority,
        status="OPEN",
        target_plates=data.target_plates,
    )
    db.add(inv)
    await db.commit()
    await db.refresh(inv)

    await log_audit_action(
        db,
        action="CREATE_INVESTIGATION",
        username=current_user.username,
        user_id=current_user.id,
        resource="Investigation",
        resource_id=inv.case_number,
        result="SUCCESS",
        details=f"Created investigation case {inv.case_number}: {inv.title}"
    )

    return InvestigationResponse(
        id=inv.id,
        case_number=inv.case_number,
        title=inv.title,
        description=inv.description,
        officer_id=inv.officer_id,
        officer_name=inv.officer_name,
        priority=inv.priority,
        status=inv.status,
        target_plates=inv.target_plates,
        evidence=[],
        notes=[],
        created_at=inv.created_at,
        updated_at=inv.updated_at
    )

@router.get("/{id}", response_model=InvestigationResponse)
async def get_investigation(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Investigation)
        .options(
            selectinload(Investigation.evidence),
            selectinload(Investigation.notes)
        )
        .where(Investigation.id == id)
    )
    result = await db.execute(stmt)
    inv = result.scalar_one_or_none()
    if not inv:
        raise SentinelXException(code="INVESTIGATION_NOT_FOUND", message=f"Case '{id}' not found", status_code=404)

    return InvestigationResponse(
        id=inv.id,
        case_number=inv.case_number,
        title=inv.title,
        description=inv.description,
        officer_id=inv.officer_id,
        officer_name=inv.officer_name,
        priority=inv.priority,
        status=inv.status,
        target_plates=inv.target_plates,
        evidence=[InvestigationEvidenceResponse.from_orm(e) for e in inv.evidence],
        notes=[InvestigationNoteResponse.from_orm(n) for n in inv.notes],
        created_at=inv.created_at,
        updated_at=inv.updated_at
    )

@router.post("/{id}/evidence", response_model=InvestigationEvidenceResponse)
async def add_evidence(
    id: str,
    ev_in: InvestigationEvidenceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    inv = await db.get(Investigation, id)
    if not inv:
        raise SentinelXException(code="INVESTIGATION_NOT_FOUND", message=f"Case '{id}' not found", status_code=404)

    ev = InvestigationEvidence(
        investigation_id=inv.id,
        evidence_type=ev_in.evidence_type,
        title=ev_in.title,
        description=ev_in.description,
        file_url=ev_in.file_url,
        camera_id=ev_in.camera_id,
        detection_id=ev_in.detection_id,
        captured_at=ev_in.captured_at or datetime.utcnow(),
        chain_of_custody=ev_in.chain_of_custody
    )
    db.add(ev)
    await db.commit()
    await db.refresh(ev)

    await log_audit_action(
        db,
        action="ATTACH_EVIDENCE",
        username=current_user.username,
        user_id=current_user.id,
        resource="Evidence",
        resource_id=ev.id,
        case_id=inv.case_number,
        result="SUCCESS"
    )

    return InvestigationEvidenceResponse.from_orm(ev)

@router.post("/{id}/notes", response_model=InvestigationNoteResponse)
async def add_note(
    id: str,
    note_in: InvestigationNoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    inv = await db.get(Investigation, id)
    if not inv:
        raise SentinelXException(code="INVESTIGATION_NOT_FOUND", message=f"Case '{id}' not found", status_code=404)

    note = InvestigationNote(
        investigation_id=inv.id,
        author_name=current_user.full_name or note_in.author_name,
        note=note_in.note
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)

    return InvestigationNoteResponse.from_orm(note)
