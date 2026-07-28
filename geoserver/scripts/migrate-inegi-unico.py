#!/usr/bin/env python3
"""Aplica en GeoServer los cambios de INEGI unico (PLAN-INEGI-UNICO.md, Fase 2).

Por defecto solo inspecciona y reporta que cambiaria. Con --apply ejecuta.
Es idempotente: cada paso comprueba el estado antes de actuar.

Requiere correr DESPUES de las migraciones 0026-0029 de database/jobs, porque
las vistas nuevas deben existir antes de recargar el catalogo.

Uso, desde la raiz del proyecto:
    python3 geoserver/scripts/migrate-inegi-unico.py
    python3 geoserver/scripts/migrate-inegi-unico.py --apply
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

CAPAS_CONVERTIDAS = [
    'demografia.edad_mediana',
    'demografia.poblacion',
    'demografia.poblacion_hombres',
    'demografia.poblacion_mujeres',
    'demografia.porcentaje_poblacional_municipal_en_entidad',
    'demografia.razon_dependencia',
    'demografia.razon_dependencia_adulta',
    'demografia.razon_dependencia_infantil',
    'demografia.tasa_fecundidad',
    'desarrollo_social.brecha_salarial',
    'desarrollo_social.carencia_acceso_alimentacion',
    'desarrollo_social.carencia_acceso_seguridad_social',
    'desarrollo_social.carencia_acceso_servicios_salud',
    'desarrollo_social.carencia_calidad_espacios_vivienda',
    'desarrollo_social.carencia_servicios_basicos_vivienda',
    'desarrollo_social.feminicidios',
    'desarrollo_social.nacimientos_adolescentes',
    'desarrollo_social.nacimientos_infantiles',
    'desarrollo_social.no_pobre_y_no_vulnerable',
    'desarrollo_social.poblacion_con_al_menos_una_carencia_social',
    'desarrollo_social.poblacion_con_tres_o_mas_carencias_sociales',
    'desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_extrema_ingresos',
    'desarrollo_social.poblacion_ingreso_inferior_linea_pobreza_ingresos',
    'desarrollo_social.pobreza',
    'desarrollo_social.pobreza_extrema',
    'desarrollo_social.pobreza_moderada',
    'desarrollo_social.rezago_educativo',
    'desarrollo_social.vulnerables_por_carencia_social',
    'desarrollo_social.vulnerables_por_ingreso',
    'economia.ocupacion_informal',
    'economia.tasa_desocupacion',
    'economia.trabajadores_asegurados',
    'economia.trabajadores_asegurados_hombres',
    'economia.trabajadores_asegurados_mujeres',
    'gobierno_y_ciudadania.egresos_deuda_publica',
    'gobierno_y_ciudadania.egresos_totales',
    'gobierno_y_ciudadania.ingresos_financiamiento',
    'gobierno_y_ciudadania.ingresos_participaciones',
    'gobierno_y_ciudadania.ingresos_totales',
    'gobierno_y_ciudadania.ingresos_totales_reales_per_capita_precios_2023',
    'gobierno_y_ciudadania.ingresos_totales_reales_precios_2023',
    'gobierno_y_ciudadania.porcentaje_egresos_deuda_publica',
    'gobierno_y_ciudadania.porcentaje_ingresos_financiamiento',
    'gobierno_y_ciudadania.porcentaje_ingresos_participaciones',
    'gobierno_y_ciudadania.porcentaje_ingresos_propios',
    'seguridad_y_proteccion_ciudadana.datos_delitos_abuso_sexual_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_feminicidio_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_homicidio_doloso_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_lesiones_dolosas_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_robo_autopartes_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_robo_casa_habitacion_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_robo_coche_cuatro_ruedas_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_robo_institucion_bancaria_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_robo_motocicleta_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_robo_negocio_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_robo_transeunte_via_publica_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_robo_transportista_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_violacion_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_violencia_familiar_secretariado',
    'seguridad_y_proteccion_ciudadana.datos_delitos_violencia_genero_no_familiar_secretariado',
    'seguridad_y_proteccion_ciudadana.personas_desaparecidas',
    'seguridad_y_proteccion_ciudadana.personas_desaparecidas_hombres',
    'seguridad_y_proteccion_ciudadana.personas_desaparecidas_mujeres',
    'seguridad_y_proteccion_ciudadana.personas_localizadas',
    'seguridad_y_proteccion_ciudadana.personas_localizadas_hombres',
    'seguridad_y_proteccion_ciudadana.personas_localizadas_mujeres',
]


WS_TEMATICOS = sorted({c.split('.')[0] for c in CAPAS_CONVERTIDAS}) 

FEATURETYPES_A_BORRAR = [
    'limite_estatal_inegi_secundario',
    'limite_estatal_inegi',
    'limite_municipal_inegi',
]

GRUPOS_A_BORRAR = ['mapa_base_iieg', 'limite_iieg', 'limite_inegi']

MIEMBROS_LIMITES_ESTATALES = [
    ('layer', 'general:limite_estatal', 'general:limite_estatal'),
    ('layer', 'general:limite_estatal_secundario', 'general:limite_estatal_secundario'),
]

MIEMBROS_MAPA_BASE = [
    ('layer', 'general:curvas_de_nivel', 'general:curvas_de_nivel'),
    ('layer', 'general:carretera_2012', 'general:atlas_carreteras'),
    ('layer', 'general:caminos_2012', 'general:caminos_2012'),
    ('layer', 'general:aeropuertos', 'general:aeropuertos'),
    ('layer', 'general:cabeceras_municipales', 'general:cabecera_municipal'),
    ('layerGroup', 'general:limites_estatales', None),
    ('layer', 'general:limite_municipal', 'general:limite_municipal'),
    ('layer', 'general:regiones', 'general:regiones'),
    ('layer', 'general:cuerpos_de_agua_50k', 'general:cuerpos_de_agua_50k'),
]

LIMPIA_SLD = r"""
import glob, re, xml.etree.ElementTree as ET

BLOQUE = re.compile(
    r'[ \t]*<sld:Geometry>\s*'
    r'<ogc:Function name="property">\s*'
    r'<ogc:Function name="env">\s*'
    r'<ogc:Literal>geom</ogc:Literal>\s*'
    r'<ogc:Literal>geom_iieg</ogc:Literal>\s*'
    r'</ogc:Function>\s*'
    r'</ogc:Function>\s*'
    r'</sld:Geometry>\n?',
    re.DOTALL,
)

APLICAR = %s
tocados = bloques = 0
fallos = []
for f in sorted(glob.glob('/opt/geoserver/data_dir/workspaces/*/styles/*.sld')):
    src = open(f, encoding='utf-8').read()
    if 'geom_iieg' not in src:
        continue
    nuevo, n = BLOQUE.subn('', src)
    if 'geom_iieg' in nuevo:
        fallos.append(f + ': quedaron referencias')
        continue
    try:
        ET.fromstring(nuevo)
    except ET.ParseError as e:
        fallos.append('%%s: XML invalido (%%s)' %% (f, e))
        continue
    if APLICAR:
        open(f, 'w', encoding='utf-8').write(nuevo)
    tocados += 1
    bloques += n
print(json.dumps({'slds': tocados, 'bloques': bloques, 'fallos': fallos}))
"""


class GeoServer:
    def __init__(self, base: str, user: str, password: str):
        self.base = base.rstrip('/')
        self.auth = base64.b64encode(f'{user}:{password}'.encode()).decode()

    def request(self, method: str, path: str, body=None, ctype='application/json'):
        req = urllib.request.Request(self.base + path, method=method)
        req.add_header('Authorization', 'Basic ' + self.auth)
        data = None
        if body is not None:
            req.add_header('Content-Type', ctype)
            data = json.dumps(body).encode() if ctype == 'application/json' else body.encode()
        try:
            with urllib.request.urlopen(req, data, timeout=120) as resp:
                txt = resp.read().decode()
                return resp.status, (json.loads(txt) if txt.strip().startswith(('{', '[')) else txt)
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode()[:300]

    def existe(self, path: str) -> bool:
        return self.request('GET', path)[0] == 200


def cargar_env(ruta: Path) -> dict:
    valores = {}
    if not ruta.exists():
        return valores
    for linea in ruta.read_text().splitlines():
        linea = linea.strip()
        if not linea or linea.startswith('#') or '=' not in linea:
            continue
        k, v = linea.split('=', 1)
        valores[k.strip()] = v.strip().strip('"').strip("'")
    return valores


def sld_pendientes(aplicar: bool) -> dict:
    payload = 'import json\n' + (LIMPIA_SLD % ('True' if aplicar else 'False'))
    out = subprocess.run(
        ['docker', 'exec', '-i', 'geoserver', 'python3', '-'],
        input=payload, capture_output=True, text=True,
    )
    if out.returncode != 0:
        return {'error': (out.stderr or out.stdout)[:300]}
    try:
        return json.loads(out.stdout.strip().splitlines()[-1])
    except (ValueError, IndexError):
        return {'error': out.stdout[:300]}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='ejecuta los cambios (por defecto solo reporta)')
    ap.add_argument('--geoserver-url', default='http://127.0.0.1:8080/geoserver')
    args = ap.parse_args()

    raiz = Path(__file__).resolve().parents[2]
    env = cargar_env(raiz / 'geoserver' / '.env')
    user = os.environ.get('GEOSERVER_ADMIN_USER') or env.get('GEOSERVER_ADMIN_USER')
    pwd = os.environ.get('GEOSERVER_ADMIN_PASSWORD') or env.get('GEOSERVER_ADMIN_PASSWORD')
    if not user or not pwd:
        print('ERROR: faltan GEOSERVER_ADMIN_USER / GEOSERVER_ADMIN_PASSWORD', file=sys.stderr)
        return 2

    gs = GeoServer(args.geoserver_url + '/rest', user, pwd)
    modo = 'APLICANDO' if args.apply else 'INSPECCION (usa --apply para ejecutar)'
    print(f'GeoServer: {args.geoserver_url}  |  modo: {modo}\n')

    pendientes = 0

    print('1. SLDs con env(geom, geom_iieg)')
    res = sld_pendientes(args.apply)
    if 'error' in res:
        print(f'   ERROR: {res["error"]}')
        return 1
    if res['fallos']:
        for f in res['fallos']:
            print(f'   FALLO {f}')
        return 1
    if res['slds']:
        pendientes += 1
        verbo = 'limpiados' if args.apply else 'por limpiar'
        print(f'   {res["slds"]} SLDs {verbo} ({res["bloques"]} bloques <Geometry>)')
    else:
        print('   ya aplicado (0 SLDs con geom_iieg)')

    print('\n2. Layer group limites_estatales -> par frontal + secundario')
    st, cur = gs.request('GET', '/workspaces/general/layergroups/limites_estatales.json')
    if st != 200:
        print('   ERROR: no existe el grupo limites_estatales')
        return 1
    lg = cur['layerGroup']
    pub = lg.get('publishables', {}).get('published', [])
    pub = pub if isinstance(pub, list) else [pub]
    actuales = [p['name'] for p in pub]
    esperados = [n for _, n, _ in MIEMBROS_LIMITES_ESTATALES]
    if actuales == esperados and lg.get('mode') == 'SINGLE':
        print('   ya aplicado')
    else:
        pendientes += 1
        print(f'   actual: {actuales}')
        print(f'   nuevo:  {esperados} (modo SINGLE)')
        if args.apply:
            lg['mode'] = 'SINGLE'
            lg['title'] = 'Limites estatales'
            lg['publishables'] = {'published': [{'@type': t, 'name': n} for t, n, _ in MIEMBROS_LIMITES_ESTATALES]}
            lg['styles'] = {'style': [({'name': s} if s else '') for _, _, s in MIEMBROS_LIMITES_ESTATALES]}
            for k in ('dateCreated', 'dateModified'):
                lg.pop(k, None)
            st, out = gs.request('PUT', '/workspaces/general/layergroups/limites_estatales.json', {'layerGroup': lg})
            print(f'   PUT -> {st} {out if st >= 400 else ""}')

    print('\n3. Layer group mapa_base')
    if gs.existe('/workspaces/general/layergroups/mapa_base.json'):
        print('   ya aplicado')
    else:
        pendientes += 1
        print('   por crear a partir de mapa_base_iieg, agregando limite_municipal y regiones')
        if args.apply:
            st, cur = gs.request('GET', '/workspaces/general/layergroups/mapa_base_iieg.json')
            if st != 200:
                print('   ERROR: no existe mapa_base_iieg para copiar')
                return 1
            lg = cur['layerGroup']
            lg['name'] = 'mapa_base'
            lg['title'] = 'Mapa base'
            lg['publishables'] = {'published': [{'@type': t, 'name': n} for t, n, _ in MIEMBROS_MAPA_BASE]}
            lg['styles'] = {'style': [({'name': s} if s else '') for _, _, s in MIEMBROS_MAPA_BASE]}
            for k in ('dateCreated', 'dateModified', 'id'):
                lg.pop(k, None)
            st, out = gs.request('POST', '/workspaces/general/layergroups.json', {'layerGroup': lg})
            print(f'   POST -> {st} {out if st >= 400 else ""}')

    print('\n4. Layer groups obsoletos')
    for g in GRUPOS_A_BORRAR:
        path = f'/workspaces/general/layergroups/{g}.json'
        if not gs.existe(path):
            print(f'   {g}: ya borrado')
            continue
        pendientes += 1
        print(f'   {g}: por borrar')
        if args.apply:
            st, out = gs.request('DELETE', path)
            print(f'      DELETE -> {st} {out if st >= 400 else ""}')

    print('\n5. Featuretypes huerfanos (sus tablas ya no existen tras 0026)')
    for ft in FEATURETYPES_A_BORRAR:
        path = f'/workspaces/general/datastores/general/featuretypes/{ft}.json'
        if not gs.existe(path):
            print(f'   {ft}: ya borrado')
            continue
        pendientes += 1
        print(f'   {ft}: por borrar')
        if args.apply:
            st, out = gs.request('DELETE', path + '?recurse=true')
            print(f'      DELETE -> {st} {out if st >= 400 else ""}')

    print('\n6. Hillshade')
    store_inegi = '/workspaces/raster/coveragestores/hillshade%20inegi'
    if gs.existe(f'{store_inegi}/coverages/hillshade_cog.json'):
        print('   coverage hillshade_cog: ya aplicado')
    elif gs.existe(f'{store_inegi}/coverages/hillshade_inegi_cog.json'):
        pendientes += 1
        print('   hillshade_inegi_cog -> hillshade_cog: por renombrar')
        if args.apply:
            st, cur = gs.request('GET', f'{store_inegi}/coverages/hillshade_inegi_cog.json')
            cov = cur['coverage']
            cov['name'] = 'hillshade_cog'
            cov['title'] = 'Relieve (hillshade)'
            for k in ('dateCreated', 'dateModified'):
                cov.pop(k, None)
            st, out = gs.request('PUT', f'{store_inegi}/coverages/hillshade_inegi_cog.json', {'coverage': cov})
            print(f'      PUT -> {st} {out if st >= 400 else ""}')
    else:
        print('   ADVERTENCIA: no encuentro ni hillshade_cog ni hillshade_inegi_cog')

    store_mapamex = '/workspaces/raster/coveragestores/hillshade_mapamex.json'
    if gs.existe(store_mapamex):
        pendientes += 1
        print('   store hillshade_mapamex: por borrar (apunta al tif IIEG republicado)')
        if args.apply:
            st, out = gs.request('DELETE', store_mapamex + '?recurse=true')
            print(f'      DELETE -> {st} {out if st >= 400 else ""}')
    else:
        print('   store hillshade_mapamex: ya borrado')

    print('\n7. Tile layer huerfano raster:hillshade_iieg_cog')
    gwc = GeoServer(args.geoserver_url, user, pwd)
    st, capas_gwc = gwc.request('GET', '/gwc/rest/layers.json')
    capas_gwc = capas_gwc if isinstance(capas_gwc, list) else []
    if 'raster:hillshade_iieg_cog' in capas_gwc:
        pendientes += 1
        print('   por borrar')
        if args.apply:
            st, out = gwc.request('DELETE', '/gwc/rest/layers/raster:hillshade_iieg_cog')
            print(f'      DELETE -> {st}')
    else:
        print('   no existe en este entorno (nada que hacer)')

    print('\n8. Recarga del catalogo')
    if args.apply:
        st, _ = gs.request('POST', '/reload')
        print(f'   POST /reload -> {st}')
    else:
        print('   se hara al aplicar')

    print('\n9. Truncado de cache GWC de las capas convertidas')
    gwc = GeoServer(args.geoserver_url, user, pwd)
    st, capas_gwc = gwc.request('GET', '/gwc/rest/layers.json')
    capas_gwc = set(capas_gwc) if isinstance(capas_gwc, list) else set()
    objetivo = [c.replace('.', ':', 1) for c in CAPAS_CONVERTIDAS]
    a_truncar = [c for c in objetivo if c in capas_gwc]
    print(f'   {len(a_truncar)} capas convertidas tienen cache en GWC')
    if args.apply:
        for capa in a_truncar:
            st, _ = gwc.request(
                'POST', '/gwc/rest/masstruncate',
                f'<truncateLayer><layerName>{capa}</layerName></truncateLayer>',
                ctype='text/xml',
            )
            if st >= 400:
                print(f'      {capa} -> {st}')
        print('   truncado listo; el seeder nocturno repuebla')

    print()
    if args.apply:
        print('Aplicado. Recuerda actualizar GWC_SEED_LAYERS en geoserver/.env a')
        print('   "general:curvas_de_nivel=11-15 raster:hillshade_cog=6-14"')
    elif pendientes:
        print(f'{pendientes} pasos pendientes. Corre con --apply para ejecutarlos.')
    else:
        print('Todo aplicado, no hay nada que hacer.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
