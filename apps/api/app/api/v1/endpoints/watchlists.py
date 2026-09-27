from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.errors import SentinelXException
from app.models.watchlist import Watchlist, WatchlistVehicle
from app.models.user import User
from app.schemas.watchlist import (
    WatchlistResponse,
    WatchlistCreate,
    WatchlistVehicleAdd,
    WatchlistVehicleResponse,
)
from app.api.v1.endpoints.auth import get_current_user
from app.services.audit_service import log_audit_action

router = APIRouter()

@router.get("", response_model=List[WatchlistResponse])
async def list_watchlists(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Watchlist)
        .options(selectinload(Watchlist.vehicles))
        .order_by(Watchlist.created_at.desc())
    )
    result = await db.execute(stmt)
    watchlists = result.scalars().all()

    items = []
    for w in watchlists:
        v_items = [
            WatchlistVehicleResponse(
                id=v.id,
                watchlist_id=v.watchlist_id,
                plate_number=v.plate_number,
                reason=v.reason,
                case_number=v.case_number,
                priority=v.priority,
                notes=v.notes,
                is_active=v.is_active,
                added_at=v.added_at,
                expires_at=v.expires_at
            ) for v in w.vehicles if v.is_active
        ]
        items.append(
            WatchlistResponse(
                id=w.id,
                name=w.name,
                description=w.description,
                priority=w.priority,
                category=w.category,
                is_active=w.is_active,
                created_by=w.created_by,
                vehicle_count=len(v_items),
                vehicles=v_items,
                created_at=w.created_at,
                updated_at=w.updated_at
            )
        )
    return items

@router.post("", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
async def create_watchlist(
    data: WatchlistCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    wl = Watchlist(
        name=data.name,
        description=data.description,
        priority=data.priority,
        category=data.category,
        created_by=current_user.full_name,
        is_active=True
    )
    db.add(wl)
    await db.commit()
    await db.refresh(wl)

    await log_audit_action(
        db,
        action="CREATE_WATCHLIST",
        username=current_user.username,
        user_id=current_user.id,
        resource="Watchlist",
        resource_id=wl.id,
        result="SUCCESS",
        details=f"Created watchlist '{wl.name}'"
    )

    return WatchlistResponse(
        id=wl.id,
        name=wl.name,
        description=wl.description,
        priority=wl.priority,
        category=wl.category,
        is_active=wl.is_active,
        created_by=wl.created_by,
        vehicle_count=0,
        vehicles=[],
        created_at=wl.created_at,
        updated_at=wl.updated_at
    )

@router.post("/{id}/vehicles", response_model=WatchlistVehicleResponse)
async def add_vehicle_to_watchlist(
    id: str,
    v_data: WatchlistVehicleAdd,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    wl = await db.get(Watchlist, id)
    if not wl:
        raise SentinelXException(code="WATCHLIST_NOT_FOUND", message=f"Watchlist '{id}' not found", status_code=404)

    clean_plate = v_data.plate_number.replace("-", "").replace(" ", "").upper()
    wv = WatchlistVehicle(
        watchlist_id=wl.id,
        plate_number=clean_plate,
        reason=v_data.reason,
        case_number=v_data.case_number,
        priority=v_data.priority,
        notes=v_data.notes,
        expires_at=v_data.expires_at,
        is_active=True
    )
    db.add(wv)
    await db.commit()
    await db.refresh(wv)

    await log_audit_action(
        db,
        action="MODIFY_WATCHLIST",
        username=current_user.username,
        user_id=current_user.id,
        resource="WatchlistVehicle",
        resource_id=clean_plate,
        result="SUCCESS",
        details=f"Added vehicle '{clean_plate}' to watchlist '{wl.name}'"
    )

    return WatchlistVehicleResponse(
        id=wv.id,
        watchlist_id=wv.watchlist_id,
        plate_number=wv.plate_number,
        reason=wv.reason,
        case_number=wv.case_number,
        priority=wv.priority,
        notes=wv.notes,
        is_active=wv.is_active,
        added_at=wv.added_at,
        expires_at=wv.expires_at
    )
