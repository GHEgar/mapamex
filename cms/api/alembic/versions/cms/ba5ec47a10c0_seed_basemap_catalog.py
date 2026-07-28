"""seed basemap catalog + max_zoom

Revision ID: ba5ec47a10c0
Revises: ba5e0a5eba5e
Create Date: 2026-07-27 12:00:00.000000

"""
import sqlalchemy as sa
from alembic import op


revision = 'ba5ec47a10c0'
down_revision = 'ba5e0a5eba5e'
branch_labels = None
depends_on = None


OSM_ATTR = (
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
)
CARTO_ATTR = (
    OSM_ATTR + ' &copy; <a href="https://carto.com/attributions">CARTO</a>'
)

CATALOG = [
    {
        'slug': 'osm',
        'label': 'OpenStreetMap',
        'type': 'xyz',
        'url': 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        'attributions': OSM_ATTR,
        'max_zoom': 19,
        'orden': 3,
        'activo': True,
    },
    {
        'slug': 'carto_positron',
        'label': 'Carto Positron (escala de grises)',
        'type': 'xyz',
        'url': 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'attributions': CARTO_ATTR,
        'max_zoom': 20,
        'orden': 4,
        'activo': True,
    },
    {
        'slug': 'carto_dark_matter',
        'label': 'Carto Dark Matter (oscuro)',
        'type': 'xyz',
        'url': 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'attributions': CARTO_ATTR,
        'max_zoom': 20,
        'orden': 5,
        'activo': True,
    },
    {
        'slug': 'esri_world_imagery',
        'label': 'Satelite (Esri World Imagery)',
        'type': 'xyz',
        'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        'attributions': (
            'Tiles &copy; <a href="https://www.esri.com">Esri</a> — Source: Esri, Maxar, '
            'Earthstar Geographics, and the GIS User Community'
        ),
        'max_zoom': 19,
        'orden': 6,
        'activo': True,
    },
    {
        'slug': 'esri_world_topo',
        'label': 'Topografico (Esri World Topo)',
        'type': 'xyz',
        'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        'attributions': (
            'Tiles &copy; <a href="https://www.esri.com">Esri</a> — Esri, HERE, Garmin, '
            'Intermap, INCREMENT P, GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, '
            'Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), OpenStreetMap contributors'
        ),
        'max_zoom': 19,
        'orden': 7,
        'activo': True,
    },
    {
        'slug': 'opentopomap',
        'label': 'OpenTopoMap (senderismo)',
        'type': 'xyz',
        'url': 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        'attributions': (
            OSM_ATTR + ', <a href="https://opentopomap.org">OpenTopoMap</a> '
            '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        ),
        'max_zoom': 17,
        'orden': 8,
        'activo': True,
    },
    {
        'slug': 'openseamap',
        'label': 'Cartas nauticas (OpenSeaMap)',
        'type': 'xyz',
        'url': 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        'attributions': (
            OSM_ATTR + ' &copy; <a href="https://www.openseamap.org">OpenSeaMap</a> contributors'
        ),
        'labels_url': 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
        'label_zoom_threshold': 1,
        'max_zoom': 18,
        'orden': 9,
        'activo': True,
    },
    {
        'slug': 'openrailwaymap',
        'label': 'Vias ferroviarias (OpenRailwayMap)',
        'type': 'xyz',
        'url': 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'attributions': (
            CARTO_ATTR + ' &copy; <a href="https://www.openrailwaymap.org">OpenRailwayMap</a> '
            '(<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>)'
        ),
        'labels_url': 'https://{a-c}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
        'label_zoom_threshold': 1,
        'max_zoom': 19,
        'orden': 10,
        'activo': True,
    },
    {
        'slug': 'waymarked_trails',
        'label': 'Rutas de senderismo (Waymarked Trails)',
        'type': 'xyz',
        'url': 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        'attributions': (
            OSM_ATTR + ', <a href="https://opentopomap.org">OpenTopoMap</a> '
            '&copy; <a href="https://waymarkedtrails.org">Waymarked Trails</a> '
            '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        ),
        'labels_url': 'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png',
        'label_zoom_threshold': 1,
        'max_zoom': 17,
        'orden': 11,
        'activo': True,
    },
    {
        'slug': 'opensnowmap',
        'label': 'Pistas de esqui (OpenSnowMap)',
        'type': 'xyz',
        'url': 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        'attributions': (
            OSM_ATTR + ' &copy; <a href="https://www.opensnowmap.org">OpenSnowMap</a> '
            '(<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>)'
        ),
        'labels_url': 'https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png',
        'label_zoom_threshold': 1,
        'max_zoom': 18,
        'orden': 12,
        'activo': True,
    },
    {
        'slug': 'cyclosm',
        'label': 'Infraestructura ciclista (CyclOSM)',
        'type': 'xyz',
        'url': 'https://{a-c}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        'attributions': (
            OSM_ATTR + ' | <a href="https://www.cyclosm.org">CyclOSM</a>, hospedado por '
            '<a href="https://openstreetmap.fr">OpenStreetMap France</a>'
        ),
        'max_zoom': 20,
        'orden': 13,
        'activo': True,
    },
    {
        'slug': 'strava_heatmap',
        'label': 'Mapa de calor (Strava)',
        'type': 'xyz',
        'url': 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'attributions': (
            CARTO_ATTR + ' &copy; <a href="https://www.strava.com">Strava</a>'
        ),
        'labels_url': 'https://heatmap-external-{a-c}.strava.com/tiles/all/hot/{z}/{x}/{y}.png',
        'label_zoom_threshold': 1,
        'max_zoom': 15,
        'orden': 14,
        'activo': True,
    },
    {
        'slug': 'nasa_gibs',
        'label': 'Imagenes NASA (GIBS Blue Marble)',
        'type': 'xyz',
        'url': (
            'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/'
            'BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg'
        ),
        'attributions': (
            'Imagenes cortesia de <a href="https://earthdata.nasa.gov/gibs">NASA EOSDIS GIBS</a>'
        ),
        'max_zoom': 8,
        'orden': 15,
        'activo': True,
    },
    {
        'slug': 'waze',
        'label': 'Trafico (Waze)',
        'type': 'xyz',
        'url': 'https://worldtiles{1-4}.waze.com/tiles/{z}/{x}/{y}.png',
        'attributions': '&copy; <a href="https://www.waze.com">Waze</a> — mapa comunitario',
        'max_zoom': 19,
        'orden': 16,
        'activo': True,
    },
]

INSERT_SQL = sa.text(
    "INSERT INTO basemaps (slug, label, type, url, attributions, labels_url, "
    "label_zoom_threshold, max_zoom, orden, activo, created_at, updated_at) "
    "VALUES (:slug, :label, CAST(:type AS basemap_type), :url, :attributions, :labels_url, "
    ":label_zoom_threshold, :max_zoom, :orden, :activo, NOW(), NOW()) "
    "ON CONFLICT ON CONSTRAINT uq_basemaps_slug DO NOTHING"
)


def upgrade() -> None:
    op.add_column('basemaps', sa.Column('max_zoom', sa.Integer(), nullable=True))

    conn = op.get_bind()
    for bm in CATALOG:
        conn.execute(
            INSERT_SQL,
            {
                'slug': bm['slug'],
                'label': bm['label'],
                'type': bm['type'],
                'url': bm['url'],
                'attributions': bm.get('attributions'),
                'labels_url': bm.get('labels_url'),
                'label_zoom_threshold': bm.get('label_zoom_threshold'),
                'max_zoom': bm.get('max_zoom'),
                'orden': bm['orden'],
                'activo': bm['activo'],
            },
        )

    conn.execute(sa.text("UPDATE basemaps SET orden = 99 WHERE slug = 'sin_visor'"))


def downgrade() -> None:
    conn = op.get_bind()
    slugs = tuple(bm['slug'] for bm in CATALOG)
    conn.execute(
        sa.text("DELETE FROM basemaps WHERE slug IN :slugs").bindparams(
            sa.bindparam('slugs', value=slugs, expanding=True)
        )
    )
    conn.execute(sa.text("UPDATE basemaps SET orden = 2 WHERE slug = 'sin_visor'"))
    op.drop_column('basemaps', 'max_zoom')
