"""cve_ent en visor.layers: entidad federativa del tema (NULL = global)

Revision ID: 0030_layers_cve_ent
Revises: 0029_limite_estatal_geoserver
Create Date: 2026-08-03
"""
from alembic import op


revision = "0030_layers_cve_ent"
down_revision = "0029_limite_estatal_geoserver"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    bind.exec_driver_sql(
        "ALTER TABLE visor.layers ADD COLUMN cve_ent varchar(2)"
    )
    bind.exec_driver_sql(
        """
        ALTER TABLE visor.layers
          ADD CONSTRAINT ck_layers_cve_ent_format
          CHECK (cve_ent IS NULL OR cve_ent ~ '^(0[1-9]|[12][0-9]|3[0-2])$')
        """
    )
    bind.exec_driver_sql(
        """
        UPDATE visor.layers
           SET cve_ent = '14', updated_at = NOW()
         WHERE node_type = 'tema' AND deleted_at IS NULL
           AND id IN ('base_layers','general','demografia','salud','economia','educacion',
                      'desarrollo','recursos-y-calidad-de-vida','seguridad','gobierno')
        """
    )
    bind.exec_driver_sql(
        """
        UPDATE visor.layers
           SET cve_ent = '24', updated_at = NOW()
         WHERE id = 'san-luis-potosi'
        """
    )


def downgrade() -> None:
    bind = op.get_bind()
    bind.exec_driver_sql(
        "ALTER TABLE visor.layers DROP CONSTRAINT IF EXISTS ck_layers_cve_ent_format"
    )
    bind.exec_driver_sql(
        "ALTER TABLE visor.layers DROP COLUMN IF EXISTS cve_ent"
    )
