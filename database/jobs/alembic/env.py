from logging.config import fileConfig
import os

from sqlalchemy import engine_from_config, pool

from alembic import context


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def _build_url() -> str:
    direct = os.getenv("DATABASE_URL")
    if direct:
        return direct
    user = os.getenv("DATABASE_DB_USER")
    pwd = os.getenv("DATABASE_DB_PASSWORD")
    host = os.getenv("DATABASE_DB_HOST")
    port = os.getenv("DATABASE_DB_PORT", "5432")
    db = os.getenv("DATABASE_DB_NAME")
    sslmode = os.getenv("DATABASE_DB_SSLMODE", "require")
    if not (user and pwd and host and db):
        raise RuntimeError(
            "Conexion Database no configurada. Setear DATABASE_URL o "
            "DATABASE_DB_USER/PASSWORD/HOST/NAME en el entorno."
        )
    return f"postgresql://{user}:{pwd}@{host}:{port}/{db}?sslmode={sslmode}"


target_url = _build_url()
config.set_main_option("sqlalchemy.url", target_url)

VERSION_TABLE = "alembic_version_database"
VERSION_TABLE_SCHEMA = "visor"
VERSION_NUM_LENGTH = 255


def _ensure_version_num_capacity(connection) -> None:
    connection.exec_driver_sql(
        f"""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = '{VERSION_TABLE_SCHEMA}'
                  AND table_name = '{VERSION_TABLE}'
                  AND column_name = 'version_num'
                  AND character_maximum_length < {VERSION_NUM_LENGTH}
            ) THEN
                ALTER TABLE {VERSION_TABLE_SCHEMA}.{VERSION_TABLE}
                    ALTER COLUMN version_num TYPE VARCHAR({VERSION_NUM_LENGTH});
            END IF;
        END $$;
        """
    )


def run_migrations_offline() -> None:
    context.configure(
        url=target_url,
        target_metadata=None,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        version_table=VERSION_TABLE,
        version_table_schema=VERSION_TABLE_SCHEMA,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        _ensure_version_num_capacity(connection)
        context.configure(
            connection=connection,
            target_metadata=None,
            version_table=VERSION_TABLE,
            version_table_schema=VERSION_TABLE_SCHEMA,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
