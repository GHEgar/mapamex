from sqlalchemy import text
from sqlalchemy.orm import Session


class EstadosRepository:

    @staticmethod
    def list_with_layers(session: Session) -> list[dict]:
        result = session.execute(
            text(
                'SELECT cve_ent, nombre, '
                'ST_XMin(extent) AS minx, ST_YMin(extent) AS miny, '
                'ST_XMax(extent) AS maxx, ST_YMax(extent) AS maxy '
                'FROM ('
                'SELECT cve_ent, nombre, ST_Extent(ST_Transform(geom, 4326)) AS extent '
                'FROM mapa_base.entidades '
                'WHERE geom IS NOT NULL AND cve_ent IN ('
                'SELECT DISTINCT cve_ent FROM visor.layers '
                "WHERE node_type = 'tema' AND deleted_at IS NULL AND cve_ent IS NOT NULL"
                ') '
                'GROUP BY cve_ent, nombre'
                ') AS agg '
                'ORDER BY nombre'
            )
        )
        return [
            {
                'cveEnt': row.cve_ent,
                'nombre': row.nombre,
                'extent': [
                    float(row.minx),
                    float(row.miny),
                    float(row.maxx),
                    float(row.maxy),
                ],
            }
            for row in result
        ]
