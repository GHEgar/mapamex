import json
from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Session


class MunicipiosRepository:

    @staticmethod
    def list_all(session: Session) -> list[dict]:
        result = session.execute(
            text(
                'SELECT clave_geo, nombre, region, area_km2, area_ha '
                'FROM visor.municipios '
                'ORDER BY nombre'
            )
        )
        return [
            {
                'clave': row.clave_geo,
                'nombre': row.nombre,
                'region': row.region,
                'areaKm2': float(row.area_km2) if row.area_km2 is not None else None,
                'areaHa': float(row.area_ha) if row.area_ha is not None else None,
            }
            for row in result
        ]

    @staticmethod
    def get_geometries(
        session: Session,
        claves: list[str],
        target_srid: int = 3857,
    ) -> list[dict]:
        if not claves:
            return []
        result = session.execute(
            text(
                'SELECT clave_geo, nombre, '
                'ST_AsGeoJSON(ST_Transform(geom, :srid))::json AS geometry '
                'FROM visor.municipios '
                'WHERE clave_geo = ANY(:claves) AND geom IS NOT NULL'
            ),
            {'claves': list(claves), 'srid': target_srid},
        )
        features = []
        for row in result:
            geometry = row.geometry
            if isinstance(geometry, str):
                geometry = json.loads(geometry)
            features.append({
                'type': 'Feature',
                'properties': {
                    'clave': row.clave_geo,
                    'nombre': row.nombre,
                },
                'geometry': geometry,
            })
        return features

    @staticmethod
    def get_union_wkt(
        session: Session,
        claves: list[str],
        tolerance_m: float = 50.0,
        target_srid: Optional[int] = None,
        max_size_bytes: int = 8000,
    ) -> tuple[Optional[str], Optional[float]]:
        if not claves:
            return None, None
        if target_srid:
            geom_expr = 'ST_Transform(ST_Union(ST_SimplifyPreserveTopology(geom, :tol)), :srid)'
        else:
            geom_expr = 'ST_Union(ST_SimplifyPreserveTopology(geom, :tol))'
        sql = (
            f'SELECT ST_AsText({geom_expr}) AS wkt '
            f'FROM visor.municipios '
            f'WHERE clave_geo = ANY(:claves) AND geom IS NOT NULL'
        )

        tolerances = [tolerance_m, 100.0, 250.0, 500.0, 1000.0, 2000.0, 5000.0]
        seen = set()
        ordered_tolerances = []
        for tol in tolerances:
            if tol >= tolerance_m and tol not in seen:
                ordered_tolerances.append(tol)
                seen.add(tol)

        last_wkt = None
        last_tol = None
        for tol in ordered_tolerances:
            params = {'claves': list(claves), 'tol': tol}
            if target_srid:
                params['srid'] = target_srid
            wkt = session.execute(text(sql), params).scalar()
            if not wkt:
                return None, None
            last_wkt = wkt
            last_tol = tol
            if len(wkt) <= max_size_bytes:
                return wkt, tol

        if target_srid:
            envelope_expr = 'ST_AsText(ST_Transform(ST_Envelope(ST_Union(geom)), :srid))'
        else:
            envelope_expr = 'ST_AsText(ST_Envelope(ST_Union(geom)))'
        envelope_sql = (
            f'SELECT {envelope_expr} AS wkt '
            f'FROM visor.municipios '
            f'WHERE clave_geo = ANY(:claves) AND geom IS NOT NULL'
        )
        envelope_params = {'claves': list(claves)}
        if target_srid:
            envelope_params['srid'] = target_srid
        envelope_wkt = session.execute(text(envelope_sql), envelope_params).scalar()
        if envelope_wkt and len(envelope_wkt) <= max_size_bytes:
            return envelope_wkt, -1.0

        return last_wkt, last_tol

    @staticmethod
    def get_union_bbox(
        session: Session,
        claves: list[str],
        target_srid: Optional[int] = None,
    ) -> Optional[list[float]]:
        if not claves:
            return None
        if target_srid:
            geom_expr = 'ST_Transform(ST_Envelope(ST_Union(geom)), :srid)'
        else:
            geom_expr = 'ST_Envelope(ST_Union(geom))'
        sql = (
            f'SELECT ST_XMin({geom_expr}), ST_YMin({geom_expr}), '
            f'ST_XMax({geom_expr}), ST_YMax({geom_expr}) '
            f'FROM visor.municipios '
            f'WHERE clave_geo = ANY(:claves) AND geom IS NOT NULL'
        )
        params: dict = {'claves': list(claves)}
        if target_srid:
            params['srid'] = target_srid
        row = session.execute(text(sql), params).first()
        if not row or row[0] is None:
            return None
        return [float(row[0]), float(row[1]), float(row[2]), float(row[3])]
