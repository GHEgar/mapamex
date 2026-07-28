DROP MATERIALIZED VIEW IF EXISTS demografia.edad_mediana_datos CASCADE;
CREATE MATERIALIZED VIEW demografia.edad_mediana_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT poblacion_conapo.fecha
                   FROM demografia.poblacion_conapo
                  WHERE poblacion_conapo.variable::text = 'edad_mediana'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN demografia.poblacion_conapo a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'edad_mediana'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON demografia.edad_mediana_datos (clave_municipio);
CREATE INDEX ON demografia.edad_mediana_datos (fecha);
ANALYZE demografia.edad_mediana_datos;

DROP MATERIALIZED VIEW IF EXISTS demografia.poblacion_datos CASCADE;
CREATE MATERIALIZED VIEW demografia.poblacion_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT poblacion_conapo.fecha
                   FROM demografia.poblacion_conapo) f
        ), datos_pivot AS (
         SELECT poblacion_conapo.clave_municipio,
            poblacion_conapo.fecha,
            poblacion_conapo.clave_entidad,
            max(
                CASE
                    WHEN poblacion_conapo.variable::text = 'poblacion'::text THEN poblacion_conapo.valor
                    ELSE NULL::numeric
                END) AS poblacion_total,
            max(
                CASE
                    WHEN poblacion_conapo.variable::text = 'poblacion_mujeres'::text THEN poblacion_conapo.valor
                    ELSE NULL::numeric
                END) AS poblacion_mujeres,
            max(
                CASE
                    WHEN poblacion_conapo.variable::text = 'poblacion_hombres'::text THEN poblacion_conapo.valor
                    ELSE NULL::numeric
                END) AS poblacion_hombres,
            max(
                CASE
                    WHEN poblacion_conapo.variable::text = 'porcentaje_poblacional_municipal_en_entidad'::text THEN poblacion_conapo.valor
                    ELSE NULL::numeric
                END) AS poblacion_respecto_jalisco
           FROM demografia.poblacion_conapo
          GROUP BY poblacion_conapo.clave_municipio, poblacion_conapo.fecha, poblacion_conapo.clave_entidad
        )
 SELECT base.clave_geo AS clave_municipio,
    base.nombre,
    base.fecha,
    a.clave_entidad,
    a.poblacion_total,
    a.poblacion_mujeres,
    a.poblacion_hombres,
    a.poblacion_respecto_jalisco
   FROM base
     LEFT JOIN datos_pivot a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON demografia.poblacion_datos (clave_municipio);
CREATE INDEX ON demografia.poblacion_datos (fecha);
ANALYZE demografia.poblacion_datos;

DROP MATERIALIZED VIEW IF EXISTS demografia.poblacion_hombres_datos CASCADE;
CREATE MATERIALIZED VIEW demografia.poblacion_hombres_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT poblacion_conapo.fecha
                   FROM demografia.poblacion_conapo
                  WHERE poblacion_conapo.variable::text = 'poblacion_hombres'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN demografia.poblacion_conapo a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'poblacion_hombres'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON demografia.poblacion_hombres_datos (clave_municipio);
CREATE INDEX ON demografia.poblacion_hombres_datos (fecha);
ANALYZE demografia.poblacion_hombres_datos;

DROP MATERIALIZED VIEW IF EXISTS demografia.poblacion_mujeres_datos CASCADE;
CREATE MATERIALIZED VIEW demografia.poblacion_mujeres_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT poblacion_conapo.fecha
                   FROM demografia.poblacion_conapo
                  WHERE poblacion_conapo.variable::text = 'poblacion_mujeres'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN demografia.poblacion_conapo a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'poblacion_mujeres'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON demografia.poblacion_mujeres_datos (clave_municipio);
CREATE INDEX ON demografia.poblacion_mujeres_datos (fecha);
ANALYZE demografia.poblacion_mujeres_datos;

DROP MATERIALIZED VIEW IF EXISTS demografia.porcentaje_poblacional_municipal_en_entidad_datos CASCADE;
CREATE MATERIALIZED VIEW demografia.porcentaje_poblacional_municipal_en_entidad_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT poblacion_conapo.fecha
                   FROM demografia.poblacion_conapo
                  WHERE poblacion_conapo.variable::text = 'porcentaje_poblacional_municipal_en_entidad'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN demografia.poblacion_conapo a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'porcentaje_poblacional_municipal_en_entidad'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON demografia.porcentaje_poblacional_municipal_en_entidad_datos (clave_municipio);
CREATE INDEX ON demografia.porcentaje_poblacional_municipal_en_entidad_datos (fecha);
ANALYZE demografia.porcentaje_poblacional_municipal_en_entidad_datos;

DROP MATERIALIZED VIEW IF EXISTS demografia.razon_dependencia_datos CASCADE;
CREATE MATERIALIZED VIEW demografia.razon_dependencia_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT poblacion_conapo.fecha
                   FROM demografia.poblacion_conapo
                  WHERE poblacion_conapo.variable::text = 'razon_dependencia'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN demografia.poblacion_conapo a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'razon_dependencia'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON demografia.razon_dependencia_datos (clave_municipio);
CREATE INDEX ON demografia.razon_dependencia_datos (fecha);
ANALYZE demografia.razon_dependencia_datos;

DROP MATERIALIZED VIEW IF EXISTS demografia.razon_dependencia_adulta_datos CASCADE;
CREATE MATERIALIZED VIEW demografia.razon_dependencia_adulta_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT poblacion_conapo.fecha
                   FROM demografia.poblacion_conapo
                  WHERE poblacion_conapo.variable::text = 'razon_dependencia_adulta'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN demografia.poblacion_conapo a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'razon_dependencia_adulta'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON demografia.razon_dependencia_adulta_datos (clave_municipio);
CREATE INDEX ON demografia.razon_dependencia_adulta_datos (fecha);
ANALYZE demografia.razon_dependencia_adulta_datos;

DROP MATERIALIZED VIEW IF EXISTS demografia.razon_dependencia_infantil_datos CASCADE;
CREATE MATERIALIZED VIEW demografia.razon_dependencia_infantil_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT poblacion_conapo.fecha
                   FROM demografia.poblacion_conapo
                  WHERE poblacion_conapo.variable::text = 'razon_dependencia_infantil'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN demografia.poblacion_conapo a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'razon_dependencia_infantil'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON demografia.razon_dependencia_infantil_datos (clave_municipio);
CREATE INDEX ON demografia.razon_dependencia_infantil_datos (fecha);
ANALYZE demografia.razon_dependencia_infantil_datos;

DROP MATERIALIZED VIEW IF EXISTS demografia.tasa_fecundidad_datos CASCADE;
CREATE MATERIALIZED VIEW demografia.tasa_fecundidad_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT tasa_fecundidad_tabla.fecha
                   FROM demografia.tasa_fecundidad_tabla) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.poblacion_mujeres_15_49,
    a.nacimientos,
    a.tasa_fecundidad_general
   FROM base
     LEFT JOIN demografia.tasa_fecundidad_tabla a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON demografia.tasa_fecundidad_datos (clave_municipio);
CREATE INDEX ON demografia.tasa_fecundidad_datos (fecha);
ANALYZE demografia.tasa_fecundidad_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.brecha_salarial_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.brecha_salarial_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT brecha_salarial_tabla.fecha
                   FROM desarrollo_social.brecha_salarial_tabla) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.brecha_salarial,
    a.salario_promedio_diario_mujeres,
    a.salario_promedio_diario_hombres
   FROM base
     LEFT JOIN desarrollo_social.brecha_salarial_tabla a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.brecha_salarial_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.brecha_salarial_datos (fecha);
ANALYZE desarrollo_social.brecha_salarial_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.carencia_acceso_alimentacion_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.carencia_acceso_alimentacion_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Carencia por acceso a la alimentación'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Carencia por acceso a la alimentación'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.carencia_acceso_alimentacion_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.carencia_acceso_alimentacion_datos (fecha);
ANALYZE desarrollo_social.carencia_acceso_alimentacion_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.carencia_acceso_seguridad_social_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.carencia_acceso_seguridad_social_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Carencia por acceso a la seguridad social'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Carencia por acceso a la seguridad social'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.carencia_acceso_seguridad_social_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.carencia_acceso_seguridad_social_datos (fecha);
ANALYZE desarrollo_social.carencia_acceso_seguridad_social_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.carencia_acceso_servicios_salud_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.carencia_acceso_servicios_salud_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Carencia por acceso a los servicios de salud'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Carencia por acceso a los servicios de salud'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.carencia_acceso_servicios_salud_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.carencia_acceso_servicios_salud_datos (fecha);
ANALYZE desarrollo_social.carencia_acceso_servicios_salud_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.carencia_calidad_espacios_vivienda_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.carencia_calidad_espacios_vivienda_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Carencia por calidad y espacios de la vivienda'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Carencia por calidad y espacios de la vivienda'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.carencia_calidad_espacios_vivienda_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.carencia_calidad_espacios_vivienda_datos (fecha);
ANALYZE desarrollo_social.carencia_calidad_espacios_vivienda_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.carencia_servicios_basicos_vivienda_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.carencia_servicios_basicos_vivienda_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Carencia por acceso a los servicios básicos en la vivienda'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Carencia por acceso a los servicios básicos en la vivienda'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.carencia_servicios_basicos_vivienda_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.carencia_servicios_basicos_vivienda_datos (fecha);
ANALYZE desarrollo_social.carencia_servicios_basicos_vivienda_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.feminicidios_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.feminicidios_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT feminicidios_secretariado.fecha
                   FROM desarrollo_social.feminicidios_secretariado
                  WHERE feminicidios_secretariado.nivel_jerarquico::text = 'delito'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.nivel_jerarquico,
    a.modalidad,
    a.carpetas_investigacion,
    a.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN desarrollo_social.feminicidios_secretariado a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.nivel_jerarquico::text = 'delito'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.feminicidios_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.feminicidios_datos (fecha);
ANALYZE desarrollo_social.feminicidios_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.nacimientos_adolescentes_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.nacimientos_adolescentes_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT nacimientos_adolescentes_tabla.fecha
                   FROM desarrollo_social.nacimientos_adolescentes_tabla) f
        ), datos_pivot AS (
         SELECT nacimientos_adolescentes_tabla.clave_municipio,
            nacimientos_adolescentes_tabla.fecha,
            nacimientos_adolescentes_tabla.clave_entidad,
            max(
                CASE
                    WHEN nacimientos_adolescentes_tabla.variable::text = 'nacimientos_madres_15_19'::text THEN nacimientos_adolescentes_tabla.valor
                    ELSE NULL::numeric
                END) AS nacimientos_madre_adelocente,
            max(
                CASE
                    WHEN nacimientos_adolescentes_tabla.variable::text = 'tasa_especifica_fecundidad_madres_15_19'::text THEN nacimientos_adolescentes_tabla.valor
                    ELSE NULL::numeric
                END) AS tasa_fecundidad_adolecente,
            max(
                CASE
                    WHEN nacimientos_adolescentes_tabla.variable::text = 'porcentaje_padres_25_y_mas_madres_15_19'::text THEN nacimientos_adolescentes_tabla.valor
                    ELSE NULL::numeric
                END) AS porcentaje_con_edad_mayor_25
           FROM desarrollo_social.nacimientos_adolescentes_tabla
          GROUP BY nacimientos_adolescentes_tabla.clave_municipio, nacimientos_adolescentes_tabla.fecha, nacimientos_adolescentes_tabla.clave_entidad
        )
 SELECT base.clave_geo AS clave_municipio,
    base.nombre,
    base.fecha,
    a.clave_entidad,
    a.nacimientos_madre_adelocente,
    a.tasa_fecundidad_adolecente,
    a.porcentaje_con_edad_mayor_25
   FROM base
     LEFT JOIN datos_pivot a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.nacimientos_adolescentes_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.nacimientos_adolescentes_datos (fecha);
ANALYZE desarrollo_social.nacimientos_adolescentes_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.nacimientos_infantiles_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.nacimientos_infantiles_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT nacimientos_adolescentes_tabla.fecha
                   FROM desarrollo_social.nacimientos_adolescentes_tabla) f
        ), datos_pivot AS (
         SELECT nacimientos_adolescentes_tabla.clave_municipio,
            nacimientos_adolescentes_tabla.fecha,
            nacimientos_adolescentes_tabla.clave_entidad,
            max(
                CASE
                    WHEN nacimientos_adolescentes_tabla.variable::text = 'nacimientos_madres_10_14'::text THEN nacimientos_adolescentes_tabla.valor
                    ELSE NULL::numeric
                END) AS nacimientos,
            max(
                CASE
                    WHEN nacimientos_adolescentes_tabla.variable::text = 'tasa_especifica_fecundidad_madres_10_14'::text THEN nacimientos_adolescentes_tabla.valor
                    ELSE NULL::numeric
                END) AS tasa_fecundidad_especifica,
            max(
                CASE
                    WHEN nacimientos_adolescentes_tabla.variable::text = 'porcentaje_padres_18_y_mas_madres_10_14'::text THEN nacimientos_adolescentes_tabla.valor
                    ELSE NULL::numeric
                END) AS porcentaje_con_edad_mayor_18
           FROM desarrollo_social.nacimientos_adolescentes_tabla
          GROUP BY nacimientos_adolescentes_tabla.clave_municipio, nacimientos_adolescentes_tabla.fecha, nacimientos_adolescentes_tabla.clave_entidad
        )
 SELECT base.clave_geo AS clave_municipio,
    base.nombre,
    base.fecha,
    a.clave_entidad,
    a.nacimientos,
    a.tasa_fecundidad_especifica,
    a.porcentaje_con_edad_mayor_18
   FROM base
     LEFT JOIN datos_pivot a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.nacimientos_infantiles_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.nacimientos_infantiles_datos (fecha);
ANALYZE desarrollo_social.nacimientos_infantiles_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.no_pobre_y_no_vulnerable_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.no_pobre_y_no_vulnerable_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'No pobre y no vulnerable'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'No pobre y no vulnerable'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.no_pobre_y_no_vulnerable_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.no_pobre_y_no_vulnerable_datos (fecha);
ANALYZE desarrollo_social.no_pobre_y_no_vulnerable_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.poblacion_con_al_menos_una_carencia_social_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.poblacion_con_al_menos_una_carencia_social_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Población con al menos una carencia social'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Población con al menos una carencia social'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.poblacion_con_al_menos_una_carencia_social_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.poblacion_con_al_menos_una_carencia_social_datos (fecha);
ANALYZE desarrollo_social.poblacion_con_al_menos_una_carencia_social_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.poblacion_con_tres_o_mas_carencias_sociales_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.poblacion_con_tres_o_mas_carencias_sociales_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Población con tres o más carencias sociales'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Población con tres o más carencias sociales'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.poblacion_con_tres_o_mas_carencias_sociales_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.poblacion_con_tres_o_mas_carencias_sociales_datos (fecha);
ANALYZE desarrollo_social.poblacion_con_tres_o_mas_carencias_sociales_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_extrema_ingresos_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_extrema_ingresos_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Población con ingreso inferior a la línea de pobreza extrema por ingresos'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Población con ingreso inferior a la línea de pobreza extrema por ingresos'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_extrema_ingresos_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_extrema_ingresos_datos (fecha);
ANALYZE desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_extrema_ingresos_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_ingresos_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_ingresos_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Población con ingreso inferior a la línea de pobreza por ingresos'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Población con ingreso inferior a la línea de pobreza por ingresos'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_ingresos_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_ingresos_datos (fecha);
ANALYZE desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_ingresos_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.pobreza_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.pobreza_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Pobreza'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Pobreza'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.pobreza_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.pobreza_datos (fecha);
ANALYZE desarrollo_social.pobreza_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.pobreza_extrema_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.pobreza_extrema_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Pobreza extrema'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Pobreza extrema'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.pobreza_extrema_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.pobreza_extrema_datos (fecha);
ANALYZE desarrollo_social.pobreza_extrema_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.pobreza_moderada_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.pobreza_moderada_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Pobreza moderada'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Pobreza moderada'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.pobreza_moderada_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.pobreza_moderada_datos (fecha);
ANALYZE desarrollo_social.pobreza_moderada_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.rezago_educativo_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.rezago_educativo_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Rezago educativo'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Rezago educativo'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.rezago_educativo_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.rezago_educativo_datos (fecha);
ANALYZE desarrollo_social.rezago_educativo_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.vulnerables_por_carencia_social_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.vulnerables_por_carencia_social_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Vulnerables por carencia social'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Vulnerables por carencia social'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.vulnerables_por_carencia_social_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.vulnerables_por_carencia_social_datos (fecha);
ANALYZE desarrollo_social.vulnerables_por_carencia_social_datos;

DROP MATERIALIZED VIEW IF EXISTS desarrollo_social.vulnerables_por_ingreso_datos CASCADE;
CREATE MATERIALIZED VIEW desarrollo_social.vulnerables_por_ingreso_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT pobreza_multidimensional.fecha
                   FROM desarrollo_social.pobreza_multidimensional
                  WHERE pobreza_multidimensional.variable::text = 'Vulnerables por ingreso'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.personas,
    a.porcentaje,
    a.carencias_promedio
   FROM base
     LEFT JOIN desarrollo_social.pobreza_multidimensional a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'Vulnerables por ingreso'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON desarrollo_social.vulnerables_por_ingreso_datos (clave_municipio);
CREATE INDEX ON desarrollo_social.vulnerables_por_ingreso_datos (fecha);
ANALYZE desarrollo_social.vulnerables_por_ingreso_datos;

DROP MATERIALIZED VIEW IF EXISTS economia.ocupacion_informal_datos CASCADE;
CREATE MATERIALIZED VIEW economia.ocupacion_informal_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT ocupacion_ilmm.fecha
                   FROM economia.ocupacion_ilmm
                  WHERE ocupacion_ilmm.variable::text = 'porcentaje_ocupacion_informal'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor,
    a.error_estandar
   FROM base
     LEFT JOIN economia.ocupacion_ilmm a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'porcentaje_ocupacion_informal'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON economia.ocupacion_informal_datos (clave_municipio);
CREATE INDEX ON economia.ocupacion_informal_datos (fecha);
ANALYZE economia.ocupacion_informal_datos;

DROP MATERIALIZED VIEW IF EXISTS economia.tasa_desocupacion_datos CASCADE;
CREATE MATERIALIZED VIEW economia.tasa_desocupacion_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT ocupacion_ilmm.fecha
                   FROM economia.ocupacion_ilmm
                  WHERE ocupacion_ilmm.variable::text = 'tasa_desocupacion'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor,
    a.error_estandar
   FROM base
     LEFT JOIN economia.ocupacion_ilmm a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'tasa_desocupacion'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON economia.tasa_desocupacion_datos (clave_municipio);
CREATE INDEX ON economia.tasa_desocupacion_datos (fecha);
ANALYZE economia.tasa_desocupacion_datos;

DROP MATERIALIZED VIEW IF EXISTS economia.trabajadores_asegurados_datos CASCADE;
CREATE MATERIALIZED VIEW economia.trabajadores_asegurados_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT asegurados_imss.fecha
                   FROM economia.asegurados_imss) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.total,
    a.total_mujeres,
    a.total_hombres,
    a.total_no_binario,
    a.porcentaje_mujeres,
    a.porcentaje_hombres
   FROM base
     LEFT JOIN economia.asegurados_imss a ON base.clave_geo::text = a.clave_municipio::text AND base.fecha::text = a.fecha::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON economia.trabajadores_asegurados_datos (clave_municipio);
CREATE INDEX ON economia.trabajadores_asegurados_datos (fecha);
ANALYZE economia.trabajadores_asegurados_datos;

DROP MATERIALIZED VIEW IF EXISTS economia.trabajadores_asegurados_hombres_datos CASCADE;
CREATE MATERIALIZED VIEW economia.trabajadores_asegurados_hombres_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT asegurados_imss.fecha
                   FROM economia.asegurados_imss) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.total_hombres,
    a.porcentaje_hombres
   FROM base
     LEFT JOIN economia.asegurados_imss a ON base.clave_geo::text = a.clave_municipio::text AND base.fecha::text = a.fecha::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON economia.trabajadores_asegurados_hombres_datos (clave_municipio);
CREATE INDEX ON economia.trabajadores_asegurados_hombres_datos (fecha);
ANALYZE economia.trabajadores_asegurados_hombres_datos;

DROP MATERIALIZED VIEW IF EXISTS economia.trabajadores_asegurados_mujeres_datos CASCADE;
CREATE MATERIALIZED VIEW economia.trabajadores_asegurados_mujeres_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT asegurados_imss.fecha
                   FROM economia.asegurados_imss) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.total_mujeres,
    a.porcentaje_mujeres
   FROM base
     LEFT JOIN economia.asegurados_imss a ON base.clave_geo::text = a.clave_municipio::text AND base.fecha::text = a.fecha::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON economia.trabajadores_asegurados_mujeres_datos (clave_municipio);
CREATE INDEX ON economia.trabajadores_asegurados_mujeres_datos (fecha);
ANALYZE economia.trabajadores_asegurados_mujeres_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.egresos_deuda_publica_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.egresos_deuda_publica_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales
                  WHERE finanzas_municipales.variable::text = 'egresos_deuda_publica'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN gobierno_y_ciudadania.finanzas_municipales a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'egresos_deuda_publica'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.egresos_deuda_publica_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.egresos_deuda_publica_datos (fecha);
ANALYZE gobierno_y_ciudadania.egresos_deuda_publica_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.egresos_totales_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.egresos_totales_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales
                  WHERE finanzas_municipales.variable::text = 'egresos_totales'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN gobierno_y_ciudadania.finanzas_municipales a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'egresos_totales'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.egresos_totales_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.egresos_totales_datos (fecha);
ANALYZE gobierno_y_ciudadania.egresos_totales_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.ingresos_financiamiento_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.ingresos_financiamiento_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales
                  WHERE finanzas_municipales.variable::text = 'ingresos_financiamiento'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN gobierno_y_ciudadania.finanzas_municipales a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'ingresos_financiamiento'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.ingresos_financiamiento_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.ingresos_financiamiento_datos (fecha);
ANALYZE gobierno_y_ciudadania.ingresos_financiamiento_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.ingresos_participaciones_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.ingresos_participaciones_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales
                  WHERE finanzas_municipales.variable::text = 'ingresos_participaciones'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN gobierno_y_ciudadania.finanzas_municipales a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'ingresos_participaciones'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.ingresos_participaciones_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.ingresos_participaciones_datos (fecha);
ANALYZE gobierno_y_ciudadania.ingresos_participaciones_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.ingresos_totales_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.ingresos_totales_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales
                  WHERE finanzas_municipales.variable::text = 'ingresos_totales'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN gobierno_y_ciudadania.finanzas_municipales a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'ingresos_totales'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.ingresos_totales_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.ingresos_totales_datos (fecha);
ANALYZE gobierno_y_ciudadania.ingresos_totales_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.ingresos_totales_reales_per_capita_precios_2023_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.ingresos_totales_reales_per_capita_precios_2023_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales) f
        ), datos_pivot AS (
         SELECT finanzas_municipales.clave_municipio,
            finanzas_municipales.fecha,
            finanzas_municipales.clave_entidad,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'ingresos_totales_reales_precios_2023'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS ingresos_totales_reales,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'ingresos_totales'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS ingresos_totales,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'ingresos_totales_reales_per_capita_precios_2023'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS ingresos_reales_per_capita
           FROM gobierno_y_ciudadania.finanzas_municipales
          GROUP BY finanzas_municipales.clave_municipio, finanzas_municipales.fecha, finanzas_municipales.clave_entidad
        )
 SELECT base.clave_geo AS clave_municipio,
    base.nombre,
    base.fecha,
    a.clave_entidad,
    a.ingresos_totales_reales,
    a.ingresos_totales,
    a.ingresos_reales_per_capita
   FROM base
     LEFT JOIN datos_pivot a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.ingresos_totales_reales_per_capita_precios_2023_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.ingresos_totales_reales_per_capita_precios_2023_datos (fecha);
ANALYZE gobierno_y_ciudadania.ingresos_totales_reales_per_capita_precios_2023_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.ingresos_totales_reales_precios_2023_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.ingresos_totales_reales_precios_2023_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales
                  WHERE finanzas_municipales.variable::text = 'ingresos_totales_reales_precios_2023'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.valor
   FROM base
     LEFT JOIN gobierno_y_ciudadania.finanzas_municipales a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.variable::text = 'ingresos_totales_reales_precios_2023'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.ingresos_totales_reales_precios_2023_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.ingresos_totales_reales_precios_2023_datos (fecha);
ANALYZE gobierno_y_ciudadania.ingresos_totales_reales_precios_2023_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.porcentaje_egresos_deuda_publica_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.porcentaje_egresos_deuda_publica_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales) f
        ), datos_pivot AS (
         SELECT finanzas_municipales.clave_municipio,
            finanzas_municipales.fecha,
            finanzas_municipales.clave_entidad,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'egresos_totales'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS egresos_totales,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'egresos_deuda_publica'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS egresos_para_pago_deuda_publica,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'porcentaje_egresos_deuda_publica'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS porcentaje_egresos_por_pago_deuda_publica
           FROM gobierno_y_ciudadania.finanzas_municipales
          GROUP BY finanzas_municipales.clave_municipio, finanzas_municipales.fecha, finanzas_municipales.clave_entidad
        )
 SELECT base.clave_geo AS clave_municipio,
    base.nombre,
    base.fecha,
    a.clave_entidad,
    a.egresos_totales,
    a.egresos_para_pago_deuda_publica,
    a.porcentaje_egresos_por_pago_deuda_publica
   FROM base
     LEFT JOIN datos_pivot a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.porcentaje_egresos_deuda_publica_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.porcentaje_egresos_deuda_publica_datos (fecha);
ANALYZE gobierno_y_ciudadania.porcentaje_egresos_deuda_publica_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.porcentaje_ingresos_financiamiento_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.porcentaje_ingresos_financiamiento_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales) f
        ), datos_pivot AS (
         SELECT finanzas_municipales.clave_municipio,
            finanzas_municipales.fecha,
            finanzas_municipales.clave_entidad,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'ingresos_totales'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS ingresos_totales,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'ingresos_financiamiento'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS ingresos_por_financiamiento,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'porcentaje_ingresos_financiamiento'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS porcentaje_de_ingresos_por_financiamiento
           FROM gobierno_y_ciudadania.finanzas_municipales
          GROUP BY finanzas_municipales.clave_municipio, finanzas_municipales.fecha, finanzas_municipales.clave_entidad
        )
 SELECT base.clave_geo AS clave_municipio,
    base.nombre,
    base.fecha,
    a.clave_entidad,
    a.ingresos_totales,
    a.ingresos_por_financiamiento,
    a.porcentaje_de_ingresos_por_financiamiento
   FROM base
     LEFT JOIN datos_pivot a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.porcentaje_ingresos_financiamiento_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.porcentaje_ingresos_financiamiento_datos (fecha);
ANALYZE gobierno_y_ciudadania.porcentaje_ingresos_financiamiento_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.porcentaje_ingresos_participaciones_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.porcentaje_ingresos_participaciones_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales) f
        ), datos_pivot AS (
         SELECT finanzas_municipales.clave_municipio,
            finanzas_municipales.fecha,
            finanzas_municipales.clave_entidad,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'ingresos_totales'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS ingresos_totales,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'ingresos_participaciones'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS ingresos_por_participaciones,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'porcentaje_ingresos_participaciones'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS porcentaje_de_ingresos_por_participaciones
           FROM gobierno_y_ciudadania.finanzas_municipales
          GROUP BY finanzas_municipales.clave_municipio, finanzas_municipales.fecha, finanzas_municipales.clave_entidad
        )
 SELECT base.clave_geo AS clave_municipio,
    base.nombre,
    base.fecha,
    a.clave_entidad,
    a.ingresos_totales,
    a.ingresos_por_participaciones,
    a.porcentaje_de_ingresos_por_participaciones
   FROM base
     LEFT JOIN datos_pivot a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.porcentaje_ingresos_participaciones_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.porcentaje_ingresos_participaciones_datos (fecha);
ANALYZE gobierno_y_ciudadania.porcentaje_ingresos_participaciones_datos;

DROP MATERIALIZED VIEW IF EXISTS gobierno_y_ciudadania.porcentaje_ingresos_propios_datos CASCADE;
CREATE MATERIALIZED VIEW gobierno_y_ciudadania.porcentaje_ingresos_propios_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT finanzas_municipales.fecha
                   FROM gobierno_y_ciudadania.finanzas_municipales) f
        ), datos_pivot AS (
         SELECT finanzas_municipales.clave_municipio,
            finanzas_municipales.fecha,
            finanzas_municipales.clave_entidad,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'ingresos_totales'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS ingresos_totales,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'ingresos_propios'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS ingresos_propios,
            max(
                CASE
                    WHEN finanzas_municipales.variable::text = 'porcentaje_ingresos_propios'::text THEN finanzas_municipales.valor
                    ELSE NULL::numeric
                END) AS porcentaje_ingresos_propios
           FROM gobierno_y_ciudadania.finanzas_municipales
          GROUP BY finanzas_municipales.clave_municipio, finanzas_municipales.fecha, finanzas_municipales.clave_entidad
        )
 SELECT base.clave_geo AS clave_municipio,
    base.nombre,
    base.fecha,
    a.clave_entidad,
    a.ingresos_totales,
    a.ingresos_propios,
    a.porcentaje_ingresos_propios
   FROM base
     LEFT JOIN datos_pivot a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON gobierno_y_ciudadania.porcentaje_ingresos_propios_datos (clave_municipio);
CREATE INDEX ON gobierno_y_ciudadania.porcentaje_ingresos_propios_datos (fecha);
ANALYZE gobierno_y_ciudadania.porcentaje_ingresos_propios_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_abuso_sexual_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_abuso_sexual_secretariado_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT delitos_secretariado.fecha
                   FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
                  WHERE delitos_secretariado.nivel_jerarquico::text = 'delito'::text AND delitos_secretariado.delito::text = 'Abuso sexual'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.nivel_jerarquico,
    a.bien_juridico,
    a.delito,
    a.modalidad,
    a.carpetas_investigacion,
    a.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN seguridad_y_proteccion_ciudadana.delitos_secretariado a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.nivel_jerarquico::text = 'delito'::text AND a.delito::text = 'Abuso sexual'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_abuso_sexual_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_abuso_sexual_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_abuso_sexual_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_feminicidio_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_feminicidio_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con arma de fuego'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_arma_de_fuego,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con arma blanca'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_arma_blanca,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con otro elemento'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_otro_elemento,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'No especificado'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS no_especificado,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Feminicidio'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_arma_de_fuego,
    datos.con_arma_blanca,
    datos.con_otro_elemento,
    datos.no_especificado,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_feminicidio_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_feminicidio_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_feminicidio_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_homicidio_doloso_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_homicidio_doloso_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con arma de fuego'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_arma_de_fuego,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con arma blanca'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_arma_blanca,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con otro elemento'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_otro_elemento,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'No especificado'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS no_especificado,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Homicidio doloso'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_arma_de_fuego,
    datos.con_arma_blanca,
    datos.con_otro_elemento,
    datos.no_especificado,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_homicidio_doloso_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_homicidio_doloso_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_homicidio_doloso_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_lesiones_dolosas_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_lesiones_dolosas_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con arma de fuego'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_arma_de_fuego,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con arma blanca'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_arma_blanca,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con otro elemento'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_otro_elemento,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'No especificado'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS no_especificado,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Lesiones dolosas'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_arma_de_fuego,
    datos.con_arma_blanca,
    datos.con_otro_elemento,
    datos.no_especificado,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_lesiones_dolosas_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_lesiones_dolosas_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_lesiones_dolosas_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_autopartes_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_autopartes_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_violencia,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Sin violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS sin_violencia,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Robo de autopartes'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_violencia,
    datos.sin_violencia,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_autopartes_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_autopartes_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_robo_autopartes_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_casa_habitacion_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_casa_habitacion_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_violencia,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Sin violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS sin_violencia,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Robo a casa habitación'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_violencia,
    datos.sin_violencia,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_casa_habitacion_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_casa_habitacion_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_robo_casa_habitacion_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_coche_cuatro_ruedas_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_coche_cuatro_ruedas_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_violencia,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Sin violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS sin_violencia,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Robo de coche de cuatro ruedas'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_violencia,
    datos.sin_violencia,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_coche_cuatro_ruedas_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_coche_cuatro_ruedas_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_robo_coche_cuatro_ruedas_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_institucion_bancaria_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_institucion_bancaria_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_violencia,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Sin violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS sin_violencia,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Robo a institución bancaria'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_violencia,
    datos.sin_violencia,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_institucion_bancaria_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_institucion_bancaria_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_robo_institucion_bancaria_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_motocicleta_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_motocicleta_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_violencia,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Sin violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS sin_violencia,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Robo de motocicleta'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_violencia,
    datos.sin_violencia,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_motocicleta_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_motocicleta_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_robo_motocicleta_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_negocio_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_negocio_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_violencia,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Sin violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS sin_violencia,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Robo a negocio'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_violencia,
    datos.sin_violencia,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_negocio_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_negocio_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_robo_negocio_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_transeunte_via_publica_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_transeunte_via_publica_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_violencia,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Sin violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS sin_violencia,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Robo a transeúnte en vía pública'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_violencia,
    datos.sin_violencia,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_transeunte_via_publica_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_transeunte_via_publica_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_robo_transeunte_via_publica_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_transportista_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_transportista_secretariado_datos AS
WITH datos AS (
         SELECT delitos_secretariado.clave_municipio,
            delitos_secretariado.fecha,
            max(delitos_secretariado.clave_entidad) AS clave_entidad,
            max(delitos_secretariado.bien_juridico::text) AS bien_juridico,
            max(delitos_secretariado.delito::text) AS delito,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Con violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS con_violencia,
            sum(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'modalidad'::text AND delitos_secretariado.modalidad::text = 'Sin violencia'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE 0
                END) AS sin_violencia,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.carpetas_investigacion
                    ELSE NULL::integer
                END) AS carpetas_investigacion,
            max(
                CASE
                    WHEN delitos_secretariado.nivel_jerarquico::text = 'delito'::text THEN delitos_secretariado.tasa_carpetas_investigacion
                    ELSE NULL::numeric
                END) AS tasa_carpetas_investigacion
           FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
          WHERE delitos_secretariado.delito::text = 'Robo a transportista'::text
          GROUP BY delitos_secretariado.clave_municipio, delitos_secretariado.fecha
        ), base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT datos_1.fecha
                   FROM datos datos_1) f
        )
 SELECT base.nombre,
    base.fecha,
    datos.clave_entidad,
    base.clave_geo AS clave_municipio,
    datos.bien_juridico,
    datos.delito,
    datos.con_violencia,
    datos.sin_violencia,
    datos.carpetas_investigacion,
    datos.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN datos ON base.clave_geo::bpchar = datos.clave_municipio AND base.fecha = datos.fecha
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_transportista_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_robo_transportista_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_robo_transportista_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_violacion_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_violacion_secretariado_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT delitos_secretariado.fecha
                   FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
                  WHERE delitos_secretariado.nivel_jerarquico::text = 'delito'::text AND delitos_secretariado.delito::text = 'Violación'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.nivel_jerarquico,
    a.bien_juridico,
    a.delito,
    a.modalidad,
    a.carpetas_investigacion,
    a.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN seguridad_y_proteccion_ciudadana.delitos_secretariado a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.nivel_jerarquico::text = 'delito'::text AND a.delito::text = 'Violación'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_violacion_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_violacion_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_violacion_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_violencia_familiar_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_violencia_familiar_secretariado_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT delitos_secretariado.fecha
                   FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
                  WHERE delitos_secretariado.nivel_jerarquico::text = 'delito'::text AND delitos_secretariado.delito::text = 'Violencia familiar'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.nivel_jerarquico,
    a.bien_juridico,
    a.delito,
    a.modalidad,
    a.carpetas_investigacion,
    a.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN seguridad_y_proteccion_ciudadana.delitos_secretariado a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.nivel_jerarquico::text = 'delito'::text AND a.delito::text = 'Violencia familiar'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_violencia_familiar_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_violencia_familiar_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_violencia_familiar_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_violencia_genero_no_familiar_secretariado_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.datos_delitos_violencia_genero_no_familiar_secretariado_datos AS
WITH base AS (
         SELECT b.clave_geo,
            b.nombre,
            f.fecha
           FROM mapa_base.limite_municipal b
             CROSS JOIN ( SELECT DISTINCT delitos_secretariado.fecha
                   FROM seguridad_y_proteccion_ciudadana.delitos_secretariado
                  WHERE delitos_secretariado.nivel_jerarquico::text = 'delito'::text AND delitos_secretariado.delito::text = 'Violencia de género en todas sus modalidades distinta a la violencia familiar'::text) f
        )
 SELECT base.nombre,
    base.fecha,
    a.clave_entidad,
    base.clave_geo AS clave_municipio,
    a.nivel_jerarquico,
    a.bien_juridico,
    a.delito,
    a.modalidad,
    a.carpetas_investigacion,
    a.tasa_carpetas_investigacion
   FROM base
     LEFT JOIN seguridad_y_proteccion_ciudadana.delitos_secretariado a ON base.clave_geo::bpchar = a.clave_municipio AND base.fecha = a.fecha AND a.nivel_jerarquico::text = 'delito'::text AND a.delito::text = 'Violencia de género en todas sus modalidades distinta a la violencia familiar'::text
  ORDER BY base.nombre DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_violencia_genero_no_familiar_secretariado_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.datos_delitos_violencia_genero_no_familiar_secretariado_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.datos_delitos_violencia_genero_no_familiar_secretariado_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_desaparecidas_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.personas_desaparecidas_datos AS
SELECT row_number() OVER () AS fid,
    b.nombre,
    a.fecha,
    a.clave_entidad,
    a.clave_municipio,
    a.total,
    a.total_mujeres,
    a.total_hombres,
    a.tasa_total,
    a.tasa_mujeres,
    a.tasa_hombres
   FROM mapa_base.limite_municipal b
     LEFT JOIN seguridad_y_proteccion_ciudadana.personas_desaparecidas_tabla a ON b.clave_geo::bpchar = a.clave_municipio
  WHERE a.nivel_jerarquico::text = 'variable'::text AND a.variable::text = 'Personas desaparecidas'::text
  ORDER BY b.nombre;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_desaparecidas_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_desaparecidas_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.personas_desaparecidas_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_desaparecidas_hombres_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.personas_desaparecidas_hombres_datos AS
SELECT row_number() OVER () AS fid,
    b.nombre,
    a.fecha,
    a.clave_entidad,
    a.clave_municipio,
    a.total_hombres,
    a.tasa_hombres
   FROM mapa_base.limite_municipal b
     LEFT JOIN seguridad_y_proteccion_ciudadana.personas_desaparecidas_tabla a ON b.clave_geo::bpchar = a.clave_municipio
  WHERE a.nivel_jerarquico::text = 'variable'::text AND a.variable::text = 'Personas desaparecidas'::text
  ORDER BY b.nombre;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_desaparecidas_hombres_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_desaparecidas_hombres_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.personas_desaparecidas_hombres_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_desaparecidas_mujeres_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.personas_desaparecidas_mujeres_datos AS
SELECT row_number() OVER () AS fid,
    b.nombre,
    a.fecha,
    a.clave_entidad,
    a.clave_municipio,
    a.total_mujeres,
    a.tasa_mujeres
   FROM mapa_base.limite_municipal b
     LEFT JOIN seguridad_y_proteccion_ciudadana.personas_desaparecidas_tabla a ON b.clave_geo::bpchar = a.clave_municipio
  WHERE a.nivel_jerarquico::text = 'variable'::text AND a.variable::text = 'Personas desaparecidas'::text
  ORDER BY b.nombre;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_desaparecidas_mujeres_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_desaparecidas_mujeres_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.personas_desaparecidas_mujeres_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_localizadas_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.personas_localizadas_datos AS
SELECT row_number() OVER () AS fid,
    b.nombre,
    a.fecha,
    a.clave_municipio,
    COALESCE(sum(
        CASE
            WHEN a.subdivision::text = 'Con vida'::text THEN a.total
            ELSE 0
        END), 0::bigint) AS con_vida,
    COALESCE(sum(
        CASE
            WHEN a.subdivision::text = 'Sin vida'::text THEN a.total
            ELSE 0
        END), 0::bigint) AS sin_vida,
    COALESCE(sum(
        CASE
            WHEN a.subdivision::text = 'Con vida'::text THEN a.total_mujeres
            ELSE 0
        END), 0::bigint) AS mujeres_con_vida,
    COALESCE(sum(
        CASE
            WHEN a.subdivision::text = 'Sin vida'::text THEN a.total_mujeres
            ELSE 0
        END), 0::bigint) AS mujeres_sin_vida,
    COALESCE(sum(
        CASE
            WHEN a.subdivision::text = 'Con vida'::text THEN a.total_hombres
            ELSE 0
        END), 0::bigint) AS hombres_con_vida,
    COALESCE(sum(
        CASE
            WHEN a.subdivision::text = 'Sin vida'::text THEN a.total_hombres
            ELSE 0
        END), 0::bigint) AS hombres_sin_vida,
    COALESCE(max(
        CASE
            WHEN a.nivel_jerarquico::text = 'variable'::text THEN a.total
            ELSE NULL::integer
        END), 0) AS total,
    COALESCE(max(
        CASE
            WHEN a.nivel_jerarquico::text = 'variable'::text THEN a.total_mujeres
            ELSE NULL::integer
        END), 0) AS total_mujeres,
    COALESCE(max(
        CASE
            WHEN a.nivel_jerarquico::text = 'variable'::text THEN a.total_hombres
            ELSE NULL::integer
        END), 0) AS total_hombres,
    COALESCE(max(
        CASE
            WHEN a.nivel_jerarquico::text = 'variable'::text THEN a.tasa_total
            ELSE NULL::numeric
        END), 0::numeric) AS tasa_total,
    COALESCE(max(
        CASE
            WHEN a.nivel_jerarquico::text = 'variable'::text THEN a.tasa_mujeres
            ELSE NULL::numeric
        END), 0::numeric) AS tasa_mujeres,
    COALESCE(max(
        CASE
            WHEN a.nivel_jerarquico::text = 'variable'::text THEN a.tasa_hombres
            ELSE NULL::numeric
        END), 0::numeric) AS tasa_hombres
   FROM mapa_base.limite_municipal b
     LEFT JOIN seguridad_y_proteccion_ciudadana.personas_desaparecidas_tabla a ON b.clave_geo::bpchar = a.clave_municipio AND a.variable::text = 'Personas localizadas'::text
  GROUP BY b.clave_geo, b.nombre, a.fecha, a.clave_municipio
  ORDER BY b.nombre DESC, a.fecha DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_localizadas_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_localizadas_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.personas_localizadas_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_localizadas_hombres_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.personas_localizadas_hombres_datos AS
SELECT row_number() OVER () AS fid,
    b.nombre,
    a.fecha,
    a.clave_municipio,
    COALESCE(max(
        CASE
            WHEN a.nivel_jerarquico::text = 'variable'::text THEN a.total_hombres
            ELSE NULL::integer
        END), 0) AS total_hombres,
    COALESCE(sum(
        CASE
            WHEN a.subdivision::text = 'Con vida'::text THEN a.total_hombres
            ELSE 0
        END), 0::bigint) AS hombres_con_vida,
    COALESCE(sum(
        CASE
            WHEN a.subdivision::text = 'Sin vida'::text THEN a.total_hombres
            ELSE 0
        END), 0::bigint) AS hombres_sin_vida,
    COALESCE(max(
        CASE
            WHEN a.nivel_jerarquico::text = 'variable'::text THEN a.tasa_hombres
            ELSE NULL::numeric
        END), 0::numeric) AS tasa_hombres
   FROM mapa_base.limite_municipal b
     LEFT JOIN seguridad_y_proteccion_ciudadana.personas_desaparecidas_tabla a ON b.clave_geo::bpchar = a.clave_municipio AND a.variable::text = 'Personas localizadas'::text
  GROUP BY b.clave_geo, b.nombre, a.fecha, a.clave_municipio
  ORDER BY b.nombre DESC, a.fecha DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_localizadas_hombres_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_localizadas_hombres_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.personas_localizadas_hombres_datos;

DROP MATERIALIZED VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_localizadas_mujeres_datos CASCADE;
CREATE MATERIALIZED VIEW seguridad_y_proteccion_ciudadana.personas_localizadas_mujeres_datos AS
SELECT row_number() OVER () AS fid,
    b.nombre,
    a.fecha,
    a.clave_municipio,
    COALESCE(max(
        CASE
            WHEN a.nivel_jerarquico::text = 'variable'::text THEN a.total_mujeres
            ELSE NULL::integer
        END), 0) AS total_mujeres,
    COALESCE(sum(
        CASE
            WHEN a.subdivision::text = 'Con vida'::text THEN a.total_mujeres
            ELSE 0
        END), 0::bigint) AS mujeres_con_vida,
    COALESCE(sum(
        CASE
            WHEN a.subdivision::text = 'Sin vida'::text THEN a.total_mujeres
            ELSE 0
        END), 0::bigint) AS mujeres_sin_vida,
    COALESCE(max(
        CASE
            WHEN a.nivel_jerarquico::text = 'variable'::text THEN a.tasa_mujeres
            ELSE NULL::numeric
        END), 0::numeric) AS tasa_mujeres
   FROM mapa_base.limite_municipal b
     LEFT JOIN seguridad_y_proteccion_ciudadana.personas_desaparecidas_tabla a ON b.clave_geo::bpchar = a.clave_municipio AND a.variable::text = 'Personas localizadas'::text
  GROUP BY b.clave_geo, b.nombre, a.fecha, a.clave_municipio
  ORDER BY b.nombre DESC, a.fecha DESC;
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_localizadas_mujeres_datos (clave_municipio);
CREATE INDEX ON seguridad_y_proteccion_ciudadana.personas_localizadas_mujeres_datos (fecha);
ANALYZE seguridad_y_proteccion_ciudadana.personas_localizadas_mujeres_datos;
