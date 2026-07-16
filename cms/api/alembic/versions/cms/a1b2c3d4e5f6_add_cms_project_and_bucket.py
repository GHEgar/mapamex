from alembic import op
import sqlalchemy as sa


revision = 'a1b2c3d4e5f6'
down_revision = 'f4a5b6c7d8e9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        sa.text("""
            INSERT INTO projects (slug, name, description, is_active, created_at)
            VALUES
                ('cms', 'Cms', 'Panel de administracion del ecosistema MapaMex', true, NOW()),
                ('mapamex',     'MapaMex',     'Assets institucionales compartidos (logos, fuentes, iconos)', true, NOW())
            ON CONFLICT (slug) DO NOTHING
        """)
    )

    op.execute(
        sa.text("""
            INSERT INTO media_buckets (project_id, storage_bucket, access_key_ref, display_name, is_public, is_active, created_at)
            SELECT p.id, b.storage_bucket, b.access_key_ref, b.display_name, b.is_public, true, NOW()
            FROM (VALUES
                ('cms', 'cms', 'STORAGE_CMS', 'Assets administrativos privados', false),
                ('mapamex',     'mapamex',     'STORAGE_MapaMex',     'Assets institucionales MapaMex (avatars genericos)', true)
            ) AS b(project_slug, storage_bucket, access_key_ref, display_name, is_public)
            JOIN projects p ON p.slug = b.project_slug
            ON CONFLICT DO NOTHING
        """)
    )

    op.execute(
        sa.text("""
            UPDATE media_buckets
            SET storage_bucket = 'database',
                access_key_ref = 'STORAGE_DATABASE',
                is_active = false
            WHERE storage_bucket = 'dateengine'
        """)
    )

    op.execute(
        sa.text("""
            UPDATE media_buckets
            SET storage_bucket = 'sieej'
            WHERE storage_bucket = 'sieej-diccionarios'
        """)
    )


def downgrade() -> None:
    op.execute(
        sa.text("""
            UPDATE media_buckets
            SET storage_bucket = 'sieej-diccionarios'
            WHERE storage_bucket = 'sieej'
        """)
    )

    op.execute(
        sa.text("""
            UPDATE media_buckets
            SET storage_bucket = 'dateengine',
                access_key_ref = 'STORAGE_DATEENGINE',
                is_active = true
            WHERE storage_bucket = 'database'
        """)
    )

    op.execute(
        sa.text("""
            DELETE FROM media_buckets
            WHERE storage_bucket IN ('cms', 'mapamex')
        """)
    )

    op.execute(
        sa.text("""
            DELETE FROM projects WHERE slug IN ('cms', 'mapamex')
        """)
    )
