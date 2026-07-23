from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role, verify_csrf
from app.api.rate_limit import rate_limit
from app.models.user import Usuario
from app.schemas.basemap import (
    BasemapCreate,
    BasemapReorderRequest,
    BasemapResponse,
    BasemapUpdate,
)
from app.services import basemap_service
from app.services.visor_public_cache import notify_basemaps_changed

router = APIRouter(prefix="/visor", tags=["visor-basemaps"])

_require_admin = require_role(["tetlamamakani"])
_write_rate_limit = rate_limit(max_requests=120, window_seconds=60.0)


@router.get("/basemaps", response_model=list[BasemapResponse])
async def list_basemaps(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(_require_admin),
):
    return basemap_service.list_basemaps(db)


@router.post("/basemaps", response_model=BasemapResponse, status_code=201)
async def create_basemap(
    payload: BasemapCreate,
    db: Session = Depends(get_db),
    _csrf: Usuario = Depends(verify_csrf),
    _admin: Usuario = Depends(_require_admin),
    _rl: Usuario = Depends(_write_rate_limit),
):
    entity = basemap_service.create_basemap(db, payload)
    notify_basemaps_changed()
    return entity


@router.put("/basemaps/{basemap_id}", response_model=BasemapResponse)
async def update_basemap(
    basemap_id: int,
    payload: BasemapUpdate,
    db: Session = Depends(get_db),
    _csrf: Usuario = Depends(verify_csrf),
    _admin: Usuario = Depends(_require_admin),
    _rl: Usuario = Depends(_write_rate_limit),
):
    entity = basemap_service.update_basemap(db, basemap_id, payload)
    notify_basemaps_changed()
    return entity


@router.delete("/basemaps/{basemap_id}", status_code=204)
async def delete_basemap(
    basemap_id: int,
    db: Session = Depends(get_db),
    _csrf: Usuario = Depends(verify_csrf),
    _admin: Usuario = Depends(_require_admin),
    _rl: Usuario = Depends(_write_rate_limit),
):
    basemap_service.delete_basemap(db, basemap_id)
    notify_basemaps_changed()


@router.post("/basemaps/reorder", status_code=204)
async def reorder_basemaps(
    payload: BasemapReorderRequest,
    db: Session = Depends(get_db),
    _csrf: Usuario = Depends(verify_csrf),
    _admin: Usuario = Depends(_require_admin),
    _rl: Usuario = Depends(_write_rate_limit),
):
    basemap_service.reorder_basemaps(db, [(i.id, i.orden) for i in payload.items])
    notify_basemaps_changed()
