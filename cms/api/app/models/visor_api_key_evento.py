from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.core.time import utcnow


class VisorApiKeyEvento(Base):
    __tablename__ = "visor_api_keys_eventos"

    id = Column(Integer, primary_key=True, index=True)
    api_key_id = Column(
        Integer,
        ForeignKey("visor_api_keys.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    evento = Column(String(30), nullable=False, index=True)
    actor_user_id = Column(
        Integer,
        ForeignKey("usuarios.id", ondelete="SET NULL"),
        nullable=True,
    )
    payload = Column(JSONB, nullable=True)
    creado_en = Column(DateTime, nullable=False, default=utcnow, index=True)

    api_key = relationship("VisorApiKey", back_populates="eventos")
