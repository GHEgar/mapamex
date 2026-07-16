"""indices GIST faltantes en todas las columnas de geometria

La auditoria de render (2026-07-16) encontro 92 de 135 tablas de capas sin
indice espacial: cada GetMap escaneaba la tabla completa (demografia.poblacion
1.33s/render, feminicidio 2.46s). Crea GIST en toda columna de geometry_columns
que no tenga uno, solo sobre tablas base y vistas materializadas, y corre
ANALYZE al final. Idempotente (IF NOT EXISTS + prefijo sidx_).

Revision ID: 0025_gist_indexes
Revises: 0024_layers_tiled
Create Date: 2026-07-16
"""
from alembic import op
import sqlalchemy as sa


revision = "0025_gist_indexes"
down_revision = "0024_layers_tiled"
branch_labels = None
depends_on = None

EXCLUDED_SCHEMAS = ["public", "tiger", "tiger_data", "topology"]

MISSING_GIST_SQL = sa.text(
    """
    SELECT DISTINCT g.f_table_schema, g.f_table_name, g.f_geometry_column
    FROM geometry_columns g
    JOIN pg_class c ON c.relname = g.f_table_name
    JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = g.f_table_schema
    WHERE g.f_table_schema NOT IN :excluded
      AND c.relkind IN ('r', 'm')
      AND NOT EXISTS (
          SELECT 1
          FROM pg_index i
          JOIN pg_class ic ON ic.oid = i.indexrelid
          JOIN pg_am am ON am.oid = ic.relam AND am.amname = 'gist'
          JOIN pg_attribute a ON a.attrelid = i.indrelid
              AND a.attnum = ANY(i.indkey)
              AND a.attname = g.f_geometry_column
          WHERE i.indrelid = c.oid
      )
    ORDER BY 1, 2, 3
    """
).bindparams(sa.bindparam("excluded", expanding=True))

OUR_INDEXES_SQL = sa.text(
    """
    SELECT schemaname, indexname
    FROM pg_indexes
    WHERE indexname LIKE 'sidx\\_%%'
      AND schemaname NOT IN :excluded
      AND indexdef ILIKE '%%USING gist%%'
    """
).bindparams(sa.bindparam("excluded", expanding=True))


def _index_name(table: str, column: str) -> str:
    return f"sidx_{table}_{column}"[:63]


def upgrade() -> None:
    conn = op.get_bind()
    rows = conn.execute(MISSING_GIST_SQL, {"excluded": EXCLUDED_SCHEMAS}).fetchall()
    for schema, table, column in rows:
        name = _index_name(table, column)
        conn.execute(
            sa.text(
                f'CREATE INDEX IF NOT EXISTS "{name}" '
                f'ON "{schema}"."{table}" USING gist ("{column}")'
            )
        )
    for schema, table in sorted({(r[0], r[1]) for r in rows}):
        conn.execute(sa.text(f'ANALYZE "{schema}"."{table}"'))


def downgrade() -> None:
    conn = op.get_bind()
    rows = conn.execute(OUR_INDEXES_SQL, {"excluded": EXCLUDED_SCHEMAS}).fetchall()
    for schema, index in rows:
        conn.execute(sa.text(f'DROP INDEX IF EXISTS "{schema}"."{index}"'))
