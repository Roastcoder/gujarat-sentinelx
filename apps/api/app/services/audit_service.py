from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog
from app.core.logging import logger

async def log_audit_action(
    db: AsyncSession,
    action: str,
    username: str = "Control Room Officer",
    user_id: Optional[str] = None,
    resource: Optional[str] = None,
    resource_id: Optional[str] = None,
    case_id: Optional[str] = None,
    ip_address: Optional[str] = "127.0.0.1",
    user_agent: Optional[str] = "SentinelX Command Center",
    details: Optional[str] = None,
    result: str = "SUCCESS"
) -> AuditLog:
    try:
        log_entry = AuditLog(
            user_id=user_id,
            username=username,
            action=action,
            resource=resource,
            resource_id=resource_id,
            case_id=case_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
            result=result
        )
        db.add(log_entry)
        await db.commit()
        await db.refresh(log_entry)
        logger.info(f"AUDIT: [{result}] {username} executed {action} on {resource}:{resource_id}")
        return log_entry
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}")
        return None
