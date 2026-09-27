from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.audit import AuditLog

router = APIRouter()

@router.get("/logs")
async def list_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = None,
    username: Optional[str] = None,
    resource: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    query = select(AuditLog).order_by(AuditLog.timestamp.desc())

    if action:
        query = query.where(AuditLog.action == action.upper())
    if username:
        query = query.where(AuditLog.username.ilike(f"%{username}%"))
    if resource:
        query = query.where(AuditLog.resource.ilike(f"%{resource}%"))

    total = (await db.execute(select(func.count(AuditLog.id)))).scalar() or 0
    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    logs = result.scalars().all()

    items = [
        {
            "id": l.id,
            "username": l.username,
            "action": l.action,
            "resource": l.resource,
            "resource_id": l.resource_id,
            "case_id": l.case_id,
            "ip_address": l.ip_address,
            "user_agent": l.user_agent,
            "details": l.details,
            "result": l.result,
            "timestamp": l.timestamp.isoformat()
        } for l in logs
    ]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": items
    }
