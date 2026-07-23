from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.basemap import Basemap
from app.schemas.basemap import BasemapCreate, BasemapUpdate


def list_basemaps(db: Session) -> list[Basemap]:
    return db.query(Basemap).order_by(Basemap.orden.asc(), Basemap.id.asc()).all()


def list_active_basemaps(db: Session) -> list[Basemap]:
    return (
        db.query(Basemap)
        .filter(Basemap.activo.is_(True))
        .order_by(Basemap.orden.asc(), Basemap.id.asc())
        .all()
    )


def get_basemap(db: Session, basemap_id: int) -> Basemap:
    entity = db.get(Basemap, basemap_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Mapa base no encontrado")
    return entity


def create_basemap(db: Session, payload: BasemapCreate) -> Basemap:
    entity = Basemap(**payload.model_dump())
    db.add(entity)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"slug '{payload.slug}' ya existe",
        ) from exc
    db.refresh(entity)
    return entity


def update_basemap(db: Session, basemap_id: int, payload: BasemapUpdate) -> Basemap:
    entity = get_basemap(db, basemap_id)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(entity, field, value)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="slug duplicado",
        ) from exc
    db.refresh(entity)
    return entity


def delete_basemap(db: Session, basemap_id: int) -> None:
    entity = get_basemap(db, basemap_id)
    db.delete(entity)
    db.commit()


def reorder_basemaps(db: Session, items: list[tuple[int, int]]) -> None:
    if not items:
        return
    ids = [bid for bid, _ in items]
    found = {b.id: b for b in db.query(Basemap).filter(Basemap.id.in_(ids)).all()}
    missing = [bid for bid in ids if bid not in found]
    if missing:
        raise HTTPException(
            status_code=404,
            detail=f"Mapas base no encontrados: {missing}",
        )
    for bid, order in items:
        found[bid].orden = order
    db.commit()
