import json
import logging

from fastapi import APIRouter, Depends, Response
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.settings import get_settings
from app.core.time import utcnow
from app.models.evento import Evento
from app.models.home_section import HomeSection
from app.schemas.basemap import BasemapPublicResponse
from app.schemas.evento import EventoPublicResponse
from app.schemas.home_section import SECTION_SCHEMAS, HomePublicResponse
from app.services.basemap_service import list_active_basemaps
from app.services.visor_public_cache import (
    get_cached_basemaps,
    get_cached_eventos,
    get_cached_home,
    get_versions,
    store_cached_basemaps,
    store_cached_eventos,
    store_cached_home,
)

logger = logging.getLogger(__name__)

visor_router = APIRouter(tags=["visor público"])


def _json_response(payload_json: str) -> Response:
    return Response(content=payload_json, media_type='application/json')


@visor_router.get("/cache-version")
async def cache_version():
    return get_versions()


@visor_router.get("/eventos", response_model=list[EventoPublicResponse])
async def eventos_visibles(db: Session = Depends(get_db)):
    version, cached = get_cached_eventos()
    if cached is not None:
        return _json_response(cached)

    ahora = utcnow()
    eventos = (
        db.query(Evento)
        .filter(
            Evento.estado == 'published',
            Evento.activo.is_(True),
            or_(Evento.fecha_inicio.is_(None), Evento.fecha_inicio <= ahora),
            or_(Evento.fecha_fin.is_(None), Evento.fecha_fin >= ahora),
        )
        .order_by(Evento.orden.asc(), Evento.id.asc())
        .all()
    )
    serialized = []
    for e in eventos:
        try:
            serialized.append(
                EventoPublicResponse.model_validate(e).model_dump(by_alias=True, mode='json')
            )
        except Exception as exc:
            logger.warning('Evento %s omitido del listado público: %s', getattr(e, 'id', '?'), exc)
    payload_json = json.dumps(serialized, default=str)
    store_cached_eventos(version, payload_json)
    return _json_response(payload_json)


@visor_router.get("/home", response_model=HomePublicResponse)
async def home_publicado(db: Session = Depends(get_db)):
    version, cached = get_cached_home()
    if cached is not None:
        return _json_response(cached)

    field = "payload_draft" if get_settings().environment != "production" else "payload_published"
    secciones = {s.key: getattr(s, field) for s in db.query(HomeSection).all()}
    sanitized = {}
    for key, schema_cls in SECTION_SCHEMAS.items():
        raw = secciones.get(key) or {}
        try:
            sanitized[key] = schema_cls.model_validate(raw)
        except Exception:
            sanitized[key] = schema_cls()
    response = HomePublicResponse(**sanitized)
    payload_json = response.model_dump_json(by_alias=True)
    store_cached_home(version, payload_json)
    return _json_response(payload_json)


@visor_router.get("/basemaps", response_model=list[BasemapPublicResponse])
async def basemaps_publicos(db: Session = Depends(get_db)):
    version, cached = get_cached_basemaps()
    if cached is not None:
        return _json_response(cached)

    basemaps = list_active_basemaps(db)
    serialized = []
    for b in basemaps:
        try:
            serialized.append(
                BasemapPublicResponse.model_validate(b).model_dump(by_alias=True, mode='json')
            )
        except Exception as exc:
            logger.warning('Mapa base %s omitido del listado público: %s', getattr(b, 'id', '?'), exc)
    payload_json = json.dumps(serialized, default=str)
    store_cached_basemaps(version, payload_json)
    return _json_response(payload_json)
