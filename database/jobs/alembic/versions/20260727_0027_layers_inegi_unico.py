"""visor.layers e initial_layer_order con ids canonicos sin sufijo IIEG/INEGI

Revision ID: 0027_layers_inegi_unico
Revises: 0026_inegi_unico
Create Date: 2026-07-27
"""
from alembic import op


revision = "0027_layers_inegi_unico"
down_revision = "0026_inegi_unico"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    bind.exec_driver_sql(
        """
        UPDATE visor.layers
           SET id = 'limite_estatal',
               label = 'Límites estatales',
               geoserver_layer = 'limite_estatal',
               wms_group = 'limite_estatal',
               sort_order = 5
         WHERE id = 'limite_inegi';
        """
    )
    bind.exec_driver_sql(
        """
        UPDATE visor.layers
           SET label = 'Límites municipales',
               wms_group = 'limite_municipal'
         WHERE id = 'limite_municipal';
        """
    )
    bind.exec_driver_sql(
        "UPDATE visor.layers SET wms_group = 'regiones' WHERE id = 'regiones';"
    )
    bind.exec_driver_sql(
        """
        UPDATE visor.initial_layer_order
           SET layer_id = 'limite_estatal'
         WHERE layer_id = 'limite_iieg';
        """
    )
    bind.exec_driver_sql(
        "DELETE FROM visor.layers WHERE id IN ('limite_iieg', 'limite_municipal_inegi');"
    )


def downgrade() -> None:
    raise NotImplementedError(
        "0027 borra las filas IIEG de visor.layers (limite_iieg, limite_municipal_inegi) "
        "con toda su configuracion. Para revertir hay que restaurar el respaldo previo: "
        "database/backups/inegi-unico/pre-inegi-unico_visor.sql.gz."
    )
