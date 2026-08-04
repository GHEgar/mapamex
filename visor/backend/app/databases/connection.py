from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
from app.config import settings
from app.utils.logger import Logger

class PostgresConnection:
    def __init__(self, db_url: str, pool_size: int = 2, max_overflow: int = 1):
        self.db_url = db_url
        self.engine = create_engine(
            self.db_url,
            pool_pre_ping=True,
            pool_size=pool_size,
            max_overflow=max_overflow,
            connect_args={'connect_timeout': settings.DB_CONNECT_TIMEOUT},
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    @contextmanager
    def get_session(self):
        session = self.SessionLocal()
        try:
            yield session
        except Exception as e:
            Logger.error(f"Error en la base de datos: {str(e)}")
            session.rollback()
            raise
        finally:
            session.close()
