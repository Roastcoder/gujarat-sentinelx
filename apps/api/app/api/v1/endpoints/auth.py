from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, decode_token
from app.core.config import settings
from app.core.errors import SentinelXException
from app.models.user import User, Role
from app.schemas.auth import LoginRequest, Token, UserResponse
from app.services.audit_service import log_audit_action

router = APIRouter()

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        # In demo mode, fallback to default investigator user if no token provided
        if settings.DEMO_MODE:
            res = await db.execute(select(User).where(User.username == "investigator"))
            user = res.scalar_one_or_none()
            if user:
                return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated or invalid",
        )
    return user

@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.username == login_data.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.hashed_password):
        await log_audit_action(
            db,
            action="LOGIN",
            username=login_data.username,
            ip_address=request.client.host if request.client else "127.0.0.1",
            result="DENIED",
            details="Invalid username or password attempt"
        )
        raise SentinelXException(
            code="INVALID_CREDENTIALS",
            message="Invalid officer username or password",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    # Fetch role name
    role_res = await db.execute(select(Role).where(Role.id == user.role_id))
    role = role_res.scalar_one_or_none()
    role_name = role.name if role else "Operator"

    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()

    token_data = {
        "sub": user.id,
        "username": user.username,
        "role": role_name,
        "badge": user.badge_number,
    }
    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(token_data, expires_delta=expires)

    await log_audit_action(
        db,
        action="LOGIN",
        username=user.username,
        user_id=user.id,
        ip_address=request.client.host if request.client else "127.0.0.1",
        result="SUCCESS",
        details=f"Officer logged into Command Center with role {role_name}"
    )

    return Token(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_info={
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": role_name,
            "badge_number": user.badge_number,
            "department": user.department,
        }
    )

@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await log_audit_action(
        db,
        action="LOGOUT",
        username=current_user.username,
        user_id=current_user.id,
        ip_address=request.client.host if request.client else "127.0.0.1",
        result="SUCCESS",
        details="Officer logged out"
    )
    return {"status": "success", "message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    role_res = await db.execute(select(Role).where(Role.id == current_user.role_id))
    role = role_res.scalar_one_or_none()
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        badge_number=current_user.badge_number,
        department=current_user.department,
        role=role.name if role else "Operator",
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )
