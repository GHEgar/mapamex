from sqlalchemy import Column, Date, ForeignKey, Integer, PrimaryKeyConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class VisorApiKeyUsoDiario(Base):
    __tablename__ = "visor_api_keys_uso_diario"
    __table_args__ = (
        PrimaryKeyConstraint("api_key_id", "dia", name="pk_visor_api_keys_uso_diario"),
    )

    api_key_id = Column(
        Integer,
        ForeignKey("visor_api_keys.id", ondelete="CASCADE"),
        nullable=False,
    )
    dia = Column(Date, nullable=False)
    requests = Column(Integer, nullable=False, default=0)
    errores = Column(Integer, nullable=False, default=0)
    bytes_out = Column(Integer, nullable=False, default=0)

    api_key = relationship("VisorApiKey", back_populates="uso_diario")
