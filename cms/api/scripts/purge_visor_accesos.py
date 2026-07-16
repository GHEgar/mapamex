"""Purga registros de acceso al embed visor más antiguos que la retención configurada.

Variables de entorno:
    VISOR_ACCESOS_RETENTION_DAYS (default 90)
"""
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.visor_api_key_acceso import VisorApiKeyAcceso


def main() -> None:
    retention_days = int(os.environ.get('VISOR_ACCESOS_RETENTION_DAYS', '90'))
    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
    session = SessionLocal()
    try:
        deleted = (
            session.query(VisorApiKeyAcceso)
            .filter(VisorApiKeyAcceso.timestamp < cutoff)
            .delete(synchronize_session=False)
        )
        session.commit()
        print(
            f"[purge_visor_accesos] retention={retention_days}d cutoff={cutoff.isoformat()} deleted={deleted}",
            flush=True,
        )
    finally:
        session.close()


if __name__ == '__main__':
    main()
