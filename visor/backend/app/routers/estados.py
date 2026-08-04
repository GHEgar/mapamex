import hashlib
import json
from typing import Optional

from fastapi import APIRouter, Header, Response
from sqlalchemy.orm import Session

from app.consts.databases import DatabaseType
from app.databases.factory import DatabaseFactory
from app.repositories.estados_repository import EstadosRepository
from app.utils.api_responses import api_responses

router = APIRouter(prefix='/estados', tags=['Estados'])


def _get_session() -> Session:
    conn = DatabaseFactory.get_connection(DatabaseType.VISOR)
    return conn.get_session()


def _hash_payload(payload) -> str:
    raw = json.dumps(payload, sort_keys=True, separators=(',', ':')).encode()
    return hashlib.sha256(raw).hexdigest()[:16]


@router.get(
    '/',
    responses=api_responses(500),
    operation_id='list_estados',
    summary='Lista de estados con temas asignados en el visor',
    description=(
        "Devuelve las entidades federativas que tienen al menos un tema asignado en "
        "`visor.layers`, con su clave INEGI de 2 dígitos (`cveEnt`), nombre y extent "
        "`[minx, miny, maxx, maxy]` en EPSG:4326. Los nombres y extents vienen de "
        "`mapa_base.entidades` (base geoestadística INEGI). Soporta `If-None-Match` con ETag."
    ),
)
def list_estados(
    response: Response,
    if_none_match: Optional[str] = Header(default=None),
):
    with _get_session() as session:
        items = EstadosRepository.list_with_layers(session)
    payload = {'items': items, 'count': len(items)}
    etag = _hash_payload(payload)
    response.headers['ETag'] = etag
    response.headers['Cache-Control'] = 'public, max-age=3600'
    if if_none_match and if_none_match == etag:
        response.status_code = 304
        return Response(status_code=304, headers={'ETag': etag})
    return payload
