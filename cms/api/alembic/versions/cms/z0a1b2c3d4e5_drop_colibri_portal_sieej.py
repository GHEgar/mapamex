"""Drop colibri, portal, and sieej tables

Revision ID: z0a1b2c3d4e5
Revises: f9c0d1e2f3a4
Create Date: 2026-07-15

Elimina todas las tablas de colibri (reportes), portal (pages, menu_items)
y sieej (formularios, envios, catalogos, grupos) tras remover su codigo.
Tambien elimina los project seeds de portal y sieej.
"""
from alembic import op
import sqlalchemy as sa

revision = "z0a1b2c3d4e5"
down_revision = "f9c0d1e2f3a4"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Idempotente: IF EXISTS + CASCADE, porque las tablas de SIEEJ viven en el
    # schema `sieej` (no en public) y en una BD desde cero pueden no existir.

    # --- Colibri (reportes) + Portal (public) ---
    for _t in (
        "reporte_actividad", "colibri_routes", "reportes", "reporte_tipos",
        "reporte_grupos", "direcciones_organizacionales", "source_apps",
        "menu_items", "pages",
    ):
        op.execute(f'DROP TABLE IF EXISTS "{_t}" CASCADE')

    # --- SIEEJ: eliminar el schema completo cubre todas sus tablas ---
    op.execute("DROP SCHEMA IF EXISTS sieej CASCADE")

    # Por si alguna tabla de SIEEJ quedó en public
    for _t in (
        "envio_archivos", "envio_eventos", "envio_formularios", "formularios",
        "grupos", "catalogo_calidad_datos", "catalogo_categoria_datos",
        "catalogo_ejes_estrategicos", "catalogo_herramientas_gestion",
        "catalogo_objetivo_uso", "catalogo_periodicidad", "catalogo_unidad_admin",
        "catalogo_usuarios_datos",
    ):
        op.execute(f'DROP TABLE IF EXISTS "{_t}" CASCADE')

    # --- Project seeds: remove portal and sieej ---
    op.execute(
        "DELETE FROM user_projects WHERE project_id IN "
        "(SELECT id FROM projects WHERE slug IN ('portal', 'sieej'))"
    )
    op.execute("DELETE FROM projects WHERE slug IN ('portal', 'sieej')")


def downgrade() -> None:
    pass
