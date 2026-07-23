"""add basemaps

Revision ID: ba5e0a5eba5e
Revises: c9f8e7d6a5b4
Create Date: 2026-07-23 12:00:00.000000

"""
import json

import sqlalchemy as sa
from alembic import op


revision = 'ba5e0a5eba5e'
down_revision = 'c9f8e7d6a5b4'
branch_labels = None
depends_on = None


CARTO_ATTR = (
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '
    'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
)
CARTO_SUBDOMAINS = ['a', 'b', 'c', 'd']

BASEMAP_SEED = [
    {
        'slug': 'voyager',
        'label': 'Mapa Carto Voyager',
        'type': 'xyz',
        'url': 'https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
        'attributions': CARTO_ATTR,
        'subdomains': CARTO_SUBDOMAINS,
        'labels_url': 'https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        'label_zoom_threshold': 15,
        'orden': 0,
    },
    {
        'slug': 'position',
        'label': 'Carto Light',
        'type': 'xyz',
        'url': 'https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
        'attributions': CARTO_ATTR,
        'subdomains': CARTO_SUBDOMAINS,
        'labels_url': 'https://basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        'label_zoom_threshold': 15,
        'orden': 1,
    },
    {
        'slug': 'sin_visor',
        'label': 'Sin Mapa Base',
        'type': 'none',
        'url': None,
        'attributions': None,
        'subdomains': None,
        'labels_url': None,
        'label_zoom_threshold': None,
        'orden': 2,
    },
]


def upgrade() -> None:
    op.create_table(
        'basemaps',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('slug', sa.String(length=60), nullable=False),
        sa.Column('label', sa.String(length=120), nullable=False),
        sa.Column(
            'type',
            sa.Enum('xyz', 'wms', 'none', name='basemap_type'),
            nullable=False,
            server_default='xyz',
        ),
        sa.Column('url', sa.Text(), nullable=True),
        sa.Column('attributions', sa.Text(), nullable=True),
        sa.Column('subdomains', sa.JSON(), nullable=True),
        sa.Column('labels_url', sa.Text(), nullable=True),
        sa.Column('label_zoom_threshold', sa.Integer(), nullable=True),
        sa.Column('wms_params', sa.JSON(), nullable=True),
        sa.Column('thumbnail_url', sa.Text(), nullable=True),
        sa.Column('orden', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('slug', name='uq_basemaps_slug'),
    )
    op.create_index('ix_basemaps_slug', 'basemaps', ['slug'], unique=True)

    conn = op.get_bind()
    for bm in BASEMAP_SEED:
        conn.execute(
            sa.text(
                "INSERT INTO basemaps (slug, label, type, url, attributions, subdomains, "
                "labels_url, label_zoom_threshold, orden, activo, created_at, updated_at) "
                "VALUES (:slug, :label, :type, :url, :attributions, CAST(:subdomains AS JSON), "
                ":labels_url, :label_zoom_threshold, :orden, TRUE, NOW(), NOW())"
            ),
            {
                'slug': bm['slug'],
                'label': bm['label'],
                'type': bm['type'],
                'url': bm['url'],
                'attributions': bm['attributions'],
                'subdomains': json.dumps(bm['subdomains']) if bm['subdomains'] is not None else None,
                'labels_url': bm['labels_url'],
                'label_zoom_threshold': bm['label_zoom_threshold'],
                'orden': bm['orden'],
            },
        )


def downgrade() -> None:
    op.drop_index('ix_basemaps_slug', table_name='basemaps')
    op.drop_table('basemaps')
    op.execute('DROP TYPE IF EXISTS basemap_type')
