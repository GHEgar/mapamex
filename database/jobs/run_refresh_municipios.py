import os
import sys

from sqlalchemy import create_engine, text

from core.utils.logger import Logger


def main() -> int:
    url = os.getenv('DATABASE_URL') or _build_url_from_parts()
    if not url:
        Logger.error('DATABASE_URL no configurado')
        return 1

    Logger.info('🔄  Refreshing visor.municipios materialized view...')
    engine = create_engine(url)
    try:
        with engine.begin() as conn:
            conn.execute(text('REFRESH MATERIALIZED VIEW CONCURRENTLY visor.municipios'))
            count = conn.execute(
                text('SELECT COUNT(*) FROM visor.municipios')
            ).scalar()
        Logger.info(f'✅  visor.municipios refreshed ({count} municipios)')
        return 0
    except Exception as exc:
        Logger.error(f'❌  Refresh fallo: {exc}')
        return 1
    finally:
        engine.dispose()


def _build_url_from_parts() -> str | None:
    user = os.getenv('DATABASE_DB_USER')
    pwd = os.getenv('DATABASE_DB_PASSWORD')
    host = os.getenv('DATABASE_DB_HOST')
    port = os.getenv('DATABASE_DB_PORT', '5432')
    db = os.getenv('DATABASE_DB_NAME')
    sslmode = os.getenv('DATABASE_DB_SSLMODE', 'require')
    if not (user and pwd and host and db):
        return None
    return f'postgresql://{user}:{pwd}@{host}:{port}/{db}?sslmode={sslmode}'


if __name__ == '__main__':
    sys.exit(main())
