import hashlib
import json
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.consts.databases import DatabaseType
from app.databases.factory import DatabaseFactory
from app.repositories.municipios_repository import MunicipiosRepository
from app.utils.api_responses import api_responses

router = APIRouter(prefix='/municipios', tags=['Municipios'])


def _get_session() -> Session:
    conn = DatabaseFactory.get_connection(DatabaseType.VISOR)
    return conn.get_session()


def _hash_payload(payload) -> str:
    raw = json.dumps(payload, sort_keys=True, separators=(',', ':')).encode()
    return hashlib.sha256(raw).hexdigest()[:16]


@router.get(
    '/',
    responses=api_responses(500),
    operation_id='list_municipios',
    summary='Lista de municipios de Jalisco con clave y nombre',
    description=(
        "Devuelve la lista completa de municipios (~125) con su clave INEGI de 3 dígitos, "
        "nombre, región y áreas. Los datos vienen de la vista materializada "
        "`visor.municipios`, construida sobre `mapa_base.limite_municipal` (base "
        "geoestadística INEGI). Soporta `If-None-Match` con ETag. "
        "La MV se refresca mensualmente (1º a las 05:00) desde database-jobs."
    ),
)
def list_municipios(
    response: Response,
    if_none_match: Optional[str] = Header(default=None),
):
    with _get_session() as session:
        items = MunicipiosRepository.list_all(session)
    payload = {'items': items, 'count': len(items)}
    etag = _hash_payload(payload)
    response.headers['ETag'] = etag
    response.headers['Cache-Control'] = 'public, max-age=3600'
    if if_none_match and if_none_match == etag:
        response.status_code = 304
        return Response(status_code=304, headers={'ETag': etag})
    return payload


@router.get(
    '/geometries',
    responses=api_responses(400, 500),
    operation_id='get_municipios_geometries',
    summary='Geometrías GeoJSON + WKT unión simplificado de los municipios seleccionados',
    description=(
        "Devuelve un `FeatureCollection` GeoJSON con las geometrías detalladas de los "
        "municipios (EPSG:3857 para máscara visual en OpenLayers) **más** el campo "
        "`unionWkt`: el WKT del polígono unión simplificado (`ST_SimplifyPreserveTopology` "
        "con tolerancia 50m) en EPSG:6368, listo para usar como `INTERSECTS(geom, …)` "
        "en CQL_FILTER de WMS. El WKT simplificado evita explosión de URL al combinar "
        "varios municipios."
    ),
)
def get_geometries(
    response: Response,
    claves: str = Query(description='Claves de municipios separadas por coma (ej. 014,067)'),
    source: Optional[str] = Query(
        default=None,
        deprecated=True,
        description='Obsoleto: se ignora. Existía para elegir entre las bases MapaMex e INEGI.',
    ),
):
    claves_list = [c.strip() for c in (claves or '').split(',') if c.strip()]
    if not claves_list:
        raise HTTPException(status_code=400, detail='Parámetro `claves` requerido')
    if len(claves_list) > 200:
        raise HTTPException(status_code=400, detail='Máximo 200 claves por request')
    with _get_session() as session:
        features = MunicipiosRepository.get_geometries(session, claves_list)
        union_wkt, tolerance_used = MunicipiosRepository.get_union_wkt(
            session, claves_list, tolerance_m=50.0, max_size_bytes=8000,
        )
        union_bbox = MunicipiosRepository.get_union_bbox(session, claves_list)
    response.headers['Cache-Control'] = 'public, max-age=3600'
    return {
        'type': 'FeatureCollection',
        'features': features,
        'unionWkt': union_wkt,
        'unionSrid': 6368,
        'unionToleranceMeters': tolerance_used,
        'unionIsEnvelope': tolerance_used == -1.0,
        'unionBbox': union_bbox,
    }
