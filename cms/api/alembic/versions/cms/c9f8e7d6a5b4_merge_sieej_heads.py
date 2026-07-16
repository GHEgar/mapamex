"""merge heads: drop_colibri_portal_sieej + add_cambios_pendientes_envio_sieej

Unifica las dos ramas que salieron de f9c0d1e2f3a4 (quedaron 2 heads).
Las ramas son disjuntas: a0b1c2d3e4f5 agrega una columna a sieej.envio_formulario
(schema sieej) y z0a1b2c3d4e5 dropea tablas de colibri/portal/sieej en public;
no tocan el mismo objeto, por lo que el merge es seguro y no requiere operaciones.

Revision ID: c9f8e7d6a5b4
Revises: z0a1b2c3d4e5, a0b1c2d3e4f5
Create Date: 2026-07-15
"""

revision = "c9f8e7d6a5b4"
down_revision = ("z0a1b2c3d4e5", "a0b1c2d3e4f5")
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
