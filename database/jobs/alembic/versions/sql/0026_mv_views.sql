DROP VIEW IF EXISTS demografia.edad_mediana CASCADE;
CREATE VIEW demografia.edad_mediana AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM demografia.edad_mediana_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS demografia.poblacion CASCADE;
CREATE VIEW demografia.poblacion AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.poblacion_total,
       d.poblacion_mujeres,
       d.poblacion_hombres,
       d.poblacion_respecto_jalisco,
       d.clave_municipio
  FROM demografia.poblacion_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS demografia.poblacion_hombres CASCADE;
CREATE VIEW demografia.poblacion_hombres AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM demografia.poblacion_hombres_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS demografia.poblacion_mujeres CASCADE;
CREATE VIEW demografia.poblacion_mujeres AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM demografia.poblacion_mujeres_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS demografia.porcentaje_poblacional_municipal_en_entidad CASCADE;
CREATE VIEW demografia.porcentaje_poblacional_municipal_en_entidad AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM demografia.porcentaje_poblacional_municipal_en_entidad_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS demografia.razon_dependencia CASCADE;
CREATE VIEW demografia.razon_dependencia AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM demografia.razon_dependencia_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS demografia.razon_dependencia_adulta CASCADE;
CREATE VIEW demografia.razon_dependencia_adulta AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM demografia.razon_dependencia_adulta_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS demografia.razon_dependencia_infantil CASCADE;
CREATE VIEW demografia.razon_dependencia_infantil AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM demografia.razon_dependencia_infantil_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS demografia.tasa_fecundidad CASCADE;
CREATE VIEW demografia.tasa_fecundidad AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.poblacion_mujeres_15_49,
       d.nacimientos,
       d.tasa_fecundidad_general
  FROM demografia.tasa_fecundidad_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.brecha_salarial CASCADE;
CREATE VIEW desarrollo_social.brecha_salarial AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.brecha_salarial,
       d.salario_promedio_diario_mujeres,
       d.salario_promedio_diario_hombres
  FROM desarrollo_social.brecha_salarial_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.carencia_acceso_alimentacion CASCADE;
CREATE VIEW desarrollo_social.carencia_acceso_alimentacion AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.carencia_acceso_alimentacion_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.carencia_acceso_seguridad_social CASCADE;
CREATE VIEW desarrollo_social.carencia_acceso_seguridad_social AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.carencia_acceso_seguridad_social_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.carencia_acceso_servicios_salud CASCADE;
CREATE VIEW desarrollo_social.carencia_acceso_servicios_salud AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.carencia_acceso_servicios_salud_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.carencia_calidad_espacios_vivienda CASCADE;
CREATE VIEW desarrollo_social.carencia_calidad_espacios_vivienda AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.carencia_calidad_espacios_vivienda_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.carencia_servicios_basicos_vivienda CASCADE;
CREATE VIEW desarrollo_social.carencia_servicios_basicos_vivienda AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.carencia_servicios_basicos_vivienda_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.feminicidios CASCADE;
CREATE VIEW desarrollo_social.feminicidios AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.nivel_jerarquico,
       d.modalidad,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM desarrollo_social.feminicidios_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.nacimientos_adolescentes CASCADE;
CREATE VIEW desarrollo_social.nacimientos_adolescentes AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.nacimientos_madre_adelocente,
       d.tasa_fecundidad_adolecente,
       d.porcentaje_con_edad_mayor_25,
       d.clave_municipio
  FROM desarrollo_social.nacimientos_adolescentes_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.nacimientos_infantiles CASCADE;
CREATE VIEW desarrollo_social.nacimientos_infantiles AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.nacimientos,
       d.tasa_fecundidad_especifica,
       d.porcentaje_con_edad_mayor_18,
       d.clave_municipio
  FROM desarrollo_social.nacimientos_infantiles_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.no_pobre_y_no_vulnerable CASCADE;
CREATE VIEW desarrollo_social.no_pobre_y_no_vulnerable AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.no_pobre_y_no_vulnerable_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.poblacion_con_al_menos_una_carencia_social CASCADE;
CREATE VIEW desarrollo_social.poblacion_con_al_menos_una_carencia_social AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.poblacion_con_al_menos_una_carencia_social_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.poblacion_con_tres_o_mas_carencias_sociales CASCADE;
CREATE VIEW desarrollo_social.poblacion_con_tres_o_mas_carencias_sociales AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.poblacion_con_tres_o_mas_carencias_sociales_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_extrema_ingresos CASCADE;
CREATE VIEW desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_extrema_ingresos AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_extrema_ingresos_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_ingresos CASCADE;
CREATE VIEW desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_ingresos AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_ingresos_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.pobreza CASCADE;
CREATE VIEW desarrollo_social.pobreza AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.pobreza_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.pobreza_extrema CASCADE;
CREATE VIEW desarrollo_social.pobreza_extrema AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.pobreza_extrema_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.pobreza_moderada CASCADE;
CREATE VIEW desarrollo_social.pobreza_moderada AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.pobreza_moderada_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.rezago_educativo CASCADE;
CREATE VIEW desarrollo_social.rezago_educativo AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.rezago_educativo_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.vulnerables_por_carencia_social CASCADE;
CREATE VIEW desarrollo_social.vulnerables_por_carencia_social AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.vulnerables_por_carencia_social_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS desarrollo_social.vulnerables_por_ingreso CASCADE;
CREATE VIEW desarrollo_social.vulnerables_por_ingreso AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.personas,
       d.porcentaje,
       d.carencias_promedio
  FROM desarrollo_social.vulnerables_por_ingreso_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS economia.ocupacion_informal CASCADE;
CREATE VIEW economia.ocupacion_informal AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor,
       d.error_estandar
  FROM economia.ocupacion_informal_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS economia.tasa_desocupacion CASCADE;
CREATE VIEW economia.tasa_desocupacion AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor,
       d.error_estandar
  FROM economia.tasa_desocupacion_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS economia.trabajadores_asegurados CASCADE;
CREATE VIEW economia.trabajadores_asegurados AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.total,
       d.total_mujeres,
       d.total_hombres,
       d.total_no_binario,
       d.porcentaje_mujeres,
       d.porcentaje_hombres
  FROM economia.trabajadores_asegurados_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS economia.trabajadores_asegurados_hombres CASCADE;
CREATE VIEW economia.trabajadores_asegurados_hombres AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.total_hombres,
       d.porcentaje_hombres
  FROM economia.trabajadores_asegurados_hombres_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS economia.trabajadores_asegurados_mujeres CASCADE;
CREATE VIEW economia.trabajadores_asegurados_mujeres AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.total_mujeres,
       d.porcentaje_mujeres
  FROM economia.trabajadores_asegurados_mujeres_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.egresos_deuda_publica CASCADE;
CREATE VIEW gobierno_y_ciudadania.egresos_deuda_publica AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM gobierno_y_ciudadania.egresos_deuda_publica_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.egresos_totales CASCADE;
CREATE VIEW gobierno_y_ciudadania.egresos_totales AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM gobierno_y_ciudadania.egresos_totales_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.ingresos_financiamiento CASCADE;
CREATE VIEW gobierno_y_ciudadania.ingresos_financiamiento AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM gobierno_y_ciudadania.ingresos_financiamiento_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.ingresos_participaciones CASCADE;
CREATE VIEW gobierno_y_ciudadania.ingresos_participaciones AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM gobierno_y_ciudadania.ingresos_participaciones_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.ingresos_totales CASCADE;
CREATE VIEW gobierno_y_ciudadania.ingresos_totales AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM gobierno_y_ciudadania.ingresos_totales_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.ingresos_totales_reales_per_capita_precios_2023 CASCADE;
CREATE VIEW gobierno_y_ciudadania.ingresos_totales_reales_per_capita_precios_2023 AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.ingresos_totales_reales,
       d.ingresos_totales,
       d.ingresos_reales_per_capita,
       d.clave_municipio
  FROM gobierno_y_ciudadania.ingresos_totales_reales_per_capita_precios_2023_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.ingresos_totales_reales_precios_2023 CASCADE;
CREATE VIEW gobierno_y_ciudadania.ingresos_totales_reales_precios_2023 AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.valor
  FROM gobierno_y_ciudadania.ingresos_totales_reales_precios_2023_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.porcentaje_egresos_deuda_publica CASCADE;
CREATE VIEW gobierno_y_ciudadania.porcentaje_egresos_deuda_publica AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.egresos_totales,
       d.egresos_para_pago_deuda_publica,
       d.porcentaje_egresos_por_pago_deuda_publica,
       d.clave_municipio
  FROM gobierno_y_ciudadania.porcentaje_egresos_deuda_publica_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.porcentaje_ingresos_financiamiento CASCADE;
CREATE VIEW gobierno_y_ciudadania.porcentaje_ingresos_financiamiento AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.ingresos_totales,
       d.ingresos_por_financiamiento,
       d.porcentaje_de_ingresos_por_financiamiento,
       d.clave_municipio
  FROM gobierno_y_ciudadania.porcentaje_ingresos_financiamiento_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.porcentaje_ingresos_participaciones CASCADE;
CREATE VIEW gobierno_y_ciudadania.porcentaje_ingresos_participaciones AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.ingresos_totales,
       d.ingresos_por_participaciones,
       d.porcentaje_de_ingresos_por_participaciones,
       d.clave_municipio
  FROM gobierno_y_ciudadania.porcentaje_ingresos_participaciones_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS gobierno_y_ciudadania.porcentaje_ingresos_propios CASCADE;
CREATE VIEW gobierno_y_ciudadania.porcentaje_ingresos_propios AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.ingresos_totales,
       d.ingresos_propios,
       d.porcentaje_ingresos_propios,
       d.clave_municipio
  FROM gobierno_y_ciudadania.porcentaje_ingresos_propios_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_abuso_sexual_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_abuso_sexual_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.nivel_jerarquico,
       d.bien_juridico,
       d.delito,
       d.modalidad,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_abuso_sexual_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_feminicidio_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_feminicidio_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_arma_de_fuego,
       d.con_arma_blanca,
       d.con_otro_elemento,
       d.no_especificado,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_feminicidio_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_homicidio_doloso_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_homicidio_doloso_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_arma_de_fuego,
       d.con_arma_blanca,
       d.con_otro_elemento,
       d.no_especificado,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_homicidio_doloso_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_lesiones_dolosas_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_lesiones_dolosas_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_arma_de_fuego,
       d.con_arma_blanca,
       d.con_otro_elemento,
       d.no_especificado,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_lesiones_dolosas_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_autopartes_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_autopartes_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_violencia,
       d.sin_violencia,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_robo_autopartes_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_casa_habitacion_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_casa_habitacion_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_violencia,
       d.sin_violencia,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_robo_casa_habitacion_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_coche_cuatro_ruedas_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_coche_cuatro_ruedas_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_violencia,
       d.sin_violencia,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_robo_coche_cuatro_ruedas_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_institucion_bancaria_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_institucion_bancaria_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_violencia,
       d.sin_violencia,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_robo_institucion_bancaria_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_motocicleta_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_motocicleta_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_violencia,
       d.sin_violencia,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_robo_motocicleta_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_negocio_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_negocio_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_violencia,
       d.sin_violencia,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_robo_negocio_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_transeunte_via_publica_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_transeunte_via_publica_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_violencia,
       d.sin_violencia,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_robo_transeunte_via_publica_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_robo_transportista_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_robo_transportista_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.bien_juridico,
       d.delito,
       d.con_violencia,
       d.sin_violencia,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_robo_transportista_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_violacion_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_violacion_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.nivel_jerarquico,
       d.bien_juridico,
       d.delito,
       d.modalidad,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_violacion_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_violencia_familiar_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_violencia_familiar_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.nivel_jerarquico,
       d.bien_juridico,
       d.delito,
       d.modalidad,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_violencia_familiar_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.datos_delitos_violencia_genero_no_familiar_secretariado CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.datos_delitos_violencia_genero_no_familiar_secretariado AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.nivel_jerarquico,
       d.bien_juridico,
       d.delito,
       d.modalidad,
       d.carpetas_investigacion,
       d.tasa_carpetas_investigacion
  FROM seguridad_y_proteccion_ciudadana.datos_delitos_violencia_genero_no_familiar_secretariado_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_desaparecidas CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.personas_desaparecidas AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fid,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.total,
       d.total_mujeres,
       d.total_hombres,
       d.tasa_total,
       d.tasa_mujeres,
       d.tasa_hombres
  FROM seguridad_y_proteccion_ciudadana.personas_desaparecidas_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_desaparecidas_hombres CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.personas_desaparecidas_hombres AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fid,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.total_hombres,
       d.tasa_hombres
  FROM seguridad_y_proteccion_ciudadana.personas_desaparecidas_hombres_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_desaparecidas_mujeres CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.personas_desaparecidas_mujeres AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fid,
       d.fecha,
       d.clave_entidad,
       d.clave_municipio,
       d.total_mujeres,
       d.tasa_mujeres
  FROM seguridad_y_proteccion_ciudadana.personas_desaparecidas_mujeres_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_localizadas CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.personas_localizadas AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fid,
       d.fecha,
       d.clave_municipio,
       d.con_vida,
       d.sin_vida,
       d.mujeres_con_vida,
       d.mujeres_sin_vida,
       d.hombres_con_vida,
       d.hombres_sin_vida,
       d.total,
       d.total_mujeres,
       d.total_hombres,
       d.tasa_total,
       d.tasa_mujeres,
       d.tasa_hombres
  FROM seguridad_y_proteccion_ciudadana.personas_localizadas_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_localizadas_hombres CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.personas_localizadas_hombres AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fid,
       d.fecha,
       d.clave_municipio,
       d.total_hombres,
       d.hombres_con_vida,
       d.hombres_sin_vida,
       d.tasa_hombres
  FROM seguridad_y_proteccion_ciudadana.personas_localizadas_hombres_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;

DROP VIEW IF EXISTS seguridad_y_proteccion_ciudadana.personas_localizadas_mujeres CASCADE;
CREATE VIEW seguridad_y_proteccion_ciudadana.personas_localizadas_mujeres AS
SELECT m.geom,
       m.nombre,
       m.region,
       d.fid,
       d.fecha,
       d.clave_municipio,
       d.total_mujeres,
       d.mujeres_con_vida,
       d.mujeres_sin_vida,
       d.tasa_mujeres
  FROM seguridad_y_proteccion_ciudadana.personas_localizadas_mujeres_datos d
  JOIN mapa_base.limite_municipal m ON m.clave_geo::text = d.clave_municipio::text;
