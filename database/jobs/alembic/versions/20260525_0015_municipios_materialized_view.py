"""materialized view visor.municipios (unifica MapaMex + INEGI desde mapa_base)

Revision ID: 0015_municipios_materialized_view
Revises: 0014_layer_highlight_variant
Create Date: 2026-05-25
"""
from alembic import op


revision = "0015_municipios_materialized_view"
down_revision = "0014_layer_highlight_variant"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE MATERIALIZED VIEW IF NOT EXISTS visor.municipios AS
        SELECT
            mapamex.clave_geo::text AS clave_geo,
            mapamex.nombre,
            mapamex.region,
            mapamex.area_km2,
            mapamex.area_ha,
            mapamex.geom AS geom_mapamex,
            inegi.geom AS geom_inegi
        FROM mapa_base.limite_municipal mapamex
        LEFT JOIN mapa_base.limite_municipal_inegi inegi
            ON mapamex.clave_geo::bpchar = inegi.clave_geo::text
        WITH DATA;
        """
    )
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_visor_municipios_clave "
        "ON visor.municipios (clave_geo);"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_visor_municipios_geom_mapamex "
        "ON visor.municipios USING GIST (geom_mapamex);"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_visor_municipios_geom_inegi "
        "ON visor.municipios USING GIST (geom_inegi);"
    )


def downgrade() -> None:
    op.execute("DROP MATERIALIZED VIEW IF EXISTS visor.municipios;")
