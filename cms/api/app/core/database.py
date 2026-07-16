from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .settings import get_settings

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


database_engine = None
DatabaseSessionLocal = None
DatabaseBase = declarative_base()


def _ensure_database_engine():
    global database_engine, DatabaseSessionLocal
    if database_engine is None:
        if not settings.database_gis_url:
            raise RuntimeError("DATABASE_GIS_URL no esta configurado")
        database_engine = create_engine(
            settings.database_gis_url,
            pool_pre_ping=True,
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
            pool_recycle=settings.database_pool_recycle,
            connect_args={"connect_timeout": settings.database_connect_timeout},
        )
        DatabaseSessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=database_engine
        )


def get_database_db():
    _ensure_database_engine()
    db = DatabaseSessionLocal()
    try:
        yield db
    finally:
        db.close()
