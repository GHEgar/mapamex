"""limite_estatal apunta al layer group consolidado de GeoServer

Revision ID: 0029_limite_estatal_geoserver
Revises: 0028_infobox_limite_estatal
Create Date: 2026-07-27
"""
from alembic import op


revision = "0029_limite_estatal_geoserver"
down_revision = "0028_infobox_limite_estatal"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.get_bind().exec_driver_sql(
        """
        UPDATE visor.layers
           SET geoserver_layer = 'limites_estatales',
               wfs_layer_name = 'general:limite_estatal'
         WHERE id = 'limite_estatal';
        """
    )


def downgrade() -> None:
    op.get_bind().exec_driver_sql(
        """
        UPDATE visor.layers
           SET geoserver_layer = 'limite_estatal',
               wfs_layer_name = 'general:limite_estatal_inegi'
         WHERE id = 'limite_estatal';
        """
    )
