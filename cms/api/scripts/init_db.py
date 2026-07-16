import os
import subprocess
import sys
from pathlib import Path

from sqlalchemy import func

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import Usuario

API_ROOT = Path(__file__).parent.parent


def aplicar_migraciones():
    print("Aplicando migraciones Alembic (schema cms)...")
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        cwd=API_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr, file=sys.stderr)
        raise RuntimeError("Alembic upgrade fallo")
    print("✓ Migraciones cms aplicadas")
    print()
    print("ℹ Las migraciones del schema visor.* viven en database.")
    print("  Aplicalas desde alli con: cd ../database && make migrate")


def crear_usuario_admin(db):
    print("Creando usuario administrador...")

    admin_username = (os.getenv("ADMIN_USERNAME", "admin") or "").strip().lower()
    admin_email = (os.getenv("ADMIN_EMAIL", "admin@mapamex.com") or "").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_password:
        print("ADMIN_PASSWORD no está definida en variables de entorno. Omitiendo creación de admin.")
        return

    admin = (
        db.query(Usuario)
        .filter(
            (func.lower(Usuario.username) == admin_username)
            | (func.lower(Usuario.email) == admin_email)
        )
        .first()
    )

    if not admin:
        admin = Usuario(
            username=admin_username,
            email=admin_email,
            name="Administrador",
            hashed_password=hash_password(admin_password),
            role="tetlamamakani",
        )
        db.add(admin)
        db.commit()
        print(f"✓ Usuario admin creado (usuario: {admin_username})")
    else:
        print(f"✓ Usuario admin ya existe (usuario: {admin.username})")


def crear_usuarios_ejemplo(db):
    if os.getenv("CREATE_SAMPLE_USERS", "false").lower() != "true":
        return

    print("Creando usuarios de ejemplo...")

    editora_password = os.getenv("SAMPLE_EDITORA_PASSWORD")

    if not editora_password:
        print("SAMPLE_EDITORA_PASSWORD no definida. Omitiendo usuario de ejemplo.")
        return

    usuario_existente = (
        db.query(Usuario)
        .filter(
            (func.lower(Usuario.username) == "editora1")
            | (func.lower(Usuario.email) == "editora@mapamex.com")
        )
        .first()
    )
    if not usuario_existente:
        nuevo_usuario = Usuario(
            username="editora1",
            email="editora@mapamex.com",
            name="María Editora",
            hashed_password=hash_password(editora_password),
            role="editora",
        )
        db.add(nuevo_usuario)
        db.commit()
    print("✓ Usuarios de ejemplo creados")


def main():
    print("=" * 60)
    print("Inicializando base de datos — Cms API")
    print("=" * 60)
    print()

    aplicar_migraciones()

    db = SessionLocal()

    try:
        crear_usuario_admin(db)
        crear_usuarios_ejemplo(db)

        print()
        print("=" * 60)
        print("✓ Inicialización completada exitosamente")
        print("=" * 60)
        print()

    except Exception as e:
        print(f"❌ Error durante la inicialización: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
