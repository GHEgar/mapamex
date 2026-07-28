"""valueMap del InfoBox de limite_estatal sin la dicotomia IIEG/INEGI

Revision ID: 0028_infobox_limite_estatal
Revises: 0027_layers_inegi_unico
Create Date: 2026-07-27
"""
from alembic import op


revision = "0028_infobox_limite_estatal"
down_revision = "0027_layers_inegi_unico"
branch_labels = None
depends_on = None


UPGRADE_SQL = """
UPDATE visor.layers
   SET infobox_config = jsonb_set(
           infobox_config::jsonb,
           '{headerTransform,valueMap}',
           (
               SELECT jsonb_object_agg(key, 'Límite estatal')
                 FROM jsonb_each_text(infobox_config::jsonb #> '{headerTransform,valueMap}')
                WHERE strpos(key, 'I I E G') = 0
           )
       )
 WHERE id = 'limite_estatal'
   AND infobox_config::jsonb #> '{headerTransform,valueMap}' IS NOT NULL;
"""


def upgrade() -> None:
    op.get_bind().exec_driver_sql(UPGRADE_SQL)


def downgrade() -> None:
    raise NotImplementedError(
        "0028 reescribe el valueMap del InfoBox de limite_estatal. Para revertir hay que "
        "restaurar el respaldo previo: database/backups/inegi-unico/pre-inegi-unico_visor.sql.gz."
    )
