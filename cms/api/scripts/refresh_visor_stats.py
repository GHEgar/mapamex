"""Recomputa los rollups diarios persistentes de visor-stats.

Pensado para invocarse desde cron cada 30 minutos:
    */30 * * * * cd /app && python scripts/refresh_visor_stats.py
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.services.visor_telemetry import rollup_stats


def main() -> None:
    session = SessionLocal()
    try:
        refreshed = rollup_stats(session)
        print(
            f"[refresh_visor_stats] rolled_up={','.join(refreshed)}",
            flush=True,
        )
    finally:
        session.close()


if __name__ == "__main__":
    main()
