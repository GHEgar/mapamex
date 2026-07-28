"""INEGI unico: limites canonicos, regiones por dissolve y MVs tematicas sin geometria duplicada

Revision ID: 0026_inegi_unico
Revises: 0025_gist_indexes
Create Date: 2026-07-27
"""
from pathlib import Path

from alembic import op


revision = "0026_inegi_unico"
down_revision = "0025_gist_indexes"
branch_labels = None
depends_on = None


SQL_DIR = Path(__file__).resolve().parent / "sql"

THEMATIC_VIEWS = [
    "demografia.edad_mediana",
    "demografia.poblacion",
    "demografia.poblacion_hombres",
    "demografia.poblacion_mujeres",
    "demografia.porcentaje_poblacional_municipal_en_entidad",
    "demografia.razon_dependencia",
    "demografia.razon_dependencia_adulta",
    "demografia.razon_dependencia_infantil",
    "demografia.tasa_fecundidad",
    "desarrollo_social.brecha_salarial",
    "desarrollo_social.carencia_acceso_alimentacion",
    "desarrollo_social.carencia_acceso_seguridad_social",
    "desarrollo_social.carencia_acceso_servicios_salud",
    "desarrollo_social.carencia_calidad_espacios_vivienda",
    "desarrollo_social.carencia_servicios_basicos_vivienda",
    "desarrollo_social.feminicidios",
    "desarrollo_social.nacimientos_adolescentes",
    "desarrollo_social.nacimientos_infantiles",
    "desarrollo_social.no_pobre_y_no_vulnerable",
    "desarrollo_social.poblacion_con_al_menos_una_carencia_social",
    "desarrollo_social.poblacion_con_tres_o_mas_carencias_sociales",
    "desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_extrema_ingresos",
    "desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_ingresos",
    "desarrollo_social.pobreza",
    "desarrollo_social.pobreza_extrema",
    "desarrollo_social.pobreza_moderada",
    "desarrollo_social.rezago_educativo",
    "desarrollo_social.vulnerables_por_carencia_social",
    "desarrollo_social.vulnerables_por_ingreso",
    "economia.ocupacion_informal",
    "economia.tasa_desocupacion",
    "economia.trabajadores_asegurados",
    "economia.trabajadores_asegurados_hombres",
    "economia.trabajadores_asegurados_mujeres",
    "gobierno_y_ciudadania.egresos_deuda_publica",
    "gobierno_y_ciudadania.egresos_totales",
    "gobierno_y_ciudadania.ingresos_financiamiento",
    "gobierno_y_ciudadania.ingresos_participaciones",
    "gobierno_y_ciudadania.ingresos_totales",
    "gobierno_y_ciudadania.ingresos_totales_reales_per_capita_precios_2023",
    "gobierno_y_ciudadania.ingresos_totales_reales_precios_2023",
    "gobierno_y_ciudadania.porcentaje_egresos_deuda_publica",
    "gobierno_y_ciudadania.porcentaje_ingresos_financiamiento",
    "gobierno_y_ciudadania.porcentaje_ingresos_participaciones",
    "gobierno_y_ciudadania.porcentaje_ingresos_propios",
    "seguridad_y_proteccion_ciudadana.datos_delitos_abuso_sexual_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_feminicidio_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_homicidio_doloso_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_lesiones_dolosas_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_robo_autopartes_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_robo_casa_habitacion_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_robo_coche_cuatro_ruedas_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_robo_institucion_bancaria_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_robo_motocicleta_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_robo_negocio_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_robo_transeunte_via_publica_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_robo_transportista_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_violacion_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_violencia_familiar_secretariado",
    "seguridad_y_proteccion_ciudadana.datos_delitos_violencia_genero_no_familiar_secretariado",
    "seguridad_y_proteccion_ciudadana.personas_desaparecidas",
    "seguridad_y_proteccion_ciudadana.personas_desaparecidas_hombres",
    "seguridad_y_proteccion_ciudadana.personas_desaparecidas_mujeres",
    "seguridad_y_proteccion_ciudadana.personas_localizadas",
    "seguridad_y_proteccion_ciudadana.personas_localizadas_hombres",
    "seguridad_y_proteccion_ciudadana.personas_localizadas_mujeres",
]

RENAMES = [
    ("limite_municipal_inegi", "limite_municipal"),
    ("limite_estatal_inegi", "limite_estatal"),
]

CONSTRAINT_RENAMES = [
    ("limite_municipal", "limite_municipal_inegi_pkey", "limite_municipal_pkey"),
    ("limite_municipal", "limite_municipal_inegi_fid_not_null", "limite_municipal_fid_not_null"),
    ("limite_estatal", "limite_estatal_inegi_pkey", "limite_estatal_pkey"),
    ("limite_estatal", "limite_estatal_inegi_fid_not_null", "limite_estatal_fid_not_null"),
]

INDEX_RENAMES = [
    ("sidx_limite_municipal_inegi_geom", "sidx_limite_municipal_geom"),
    ("sidx_limite_estatal_inegi_geom", "sidx_limite_estatal_geom"),
]

REGIONES_REBUILD = """
    TRUNCATE mapa_base.regiones;
    INSERT INTO mapa_base.regiones (fid, geom, region, area_km2, area_ha, municipios)
    SELECT row_number() OVER (ORDER BY region),
           ST_Multi(ST_Union(geom))::geometry(MultiPolygon, 6368),
           region,
           ROUND((ST_Area(ST_Union(geom)) / 1000000)::numeric, 3),
           ST_Area(ST_Union(geom)) / 10000,
           string_agg(nombre, ', ' ORDER BY clave_geo)
      FROM mapa_base.limite_municipal
     GROUP BY region;
"""

MUNICIPIOS_MV = """
    CREATE MATERIALIZED VIEW visor.municipios AS
    SELECT clave_geo::text AS clave_geo,
           nombre,
           region,
           area_km2,
           area_ha,
           geom
      FROM mapa_base.limite_municipal
    WITH DATA;
"""


def _run_sql_file(bind, filename):
    bind.exec_driver_sql((SQL_DIR / filename).read_text())


def upgrade() -> None:
    bind = op.get_bind()

    for name in THEMATIC_VIEWS:
        bind.exec_driver_sql("DROP MATERIALIZED VIEW IF EXISTS %s CASCADE" % name)
    bind.exec_driver_sql("DROP MATERIALIZED VIEW IF EXISTS visor.municipios CASCADE")

    bind.exec_driver_sql("DROP TABLE IF EXISTS mapa_base.limite_municipal CASCADE")
    bind.exec_driver_sql("DROP TABLE IF EXISTS mapa_base.limite_estatal CASCADE")

    for old, new in RENAMES:
        bind.exec_driver_sql(
            "ALTER TABLE mapa_base.%s RENAME TO %s" % (old, new)
        )
    for table, old, new in CONSTRAINT_RENAMES:
        bind.exec_driver_sql(
            "ALTER TABLE mapa_base.%s RENAME CONSTRAINT %s TO %s" % (table, old, new)
        )
    for old, new in INDEX_RENAMES:
        bind.exec_driver_sql("ALTER INDEX mapa_base.%s RENAME TO %s" % (old, new))

    bind.exec_driver_sql(REGIONES_REBUILD)
    bind.exec_driver_sql("ANALYZE mapa_base.regiones")

    bind.exec_driver_sql(MUNICIPIOS_MV)
    bind.exec_driver_sql(
        "CREATE UNIQUE INDEX idx_visor_municipios_clave ON visor.municipios (clave_geo)"
    )
    bind.exec_driver_sql(
        "CREATE INDEX idx_visor_municipios_geom ON visor.municipios USING GIST (geom)"
    )
    bind.exec_driver_sql("ANALYZE visor.municipios")

    _run_sql_file(bind, "0026_mv_datos.sql")
    _run_sql_file(bind, "0026_mv_views.sql")


def downgrade() -> None:
    raise NotImplementedError(
        "0026 elimina las tablas IIEG (mapa_base.limite_municipal/limite_estatal) y no "
        "son reconstruibles desde la propia base. Para revertir hay que restaurar el "
        "respaldo previo: database/backups/inegi-unico/."
    )
