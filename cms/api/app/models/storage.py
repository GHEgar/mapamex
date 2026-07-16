from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.core.time import utcnow


class StorageFolder(Base):
    __tablename__ = "storage_folders"
    __table_args__ = (
        UniqueConstraint("bucket_id", "path", name="uq_storage_folders_bucket_path"),
    )

    id = Column(Integer, primary_key=True, index=True)
    bucket_id = Column(
        Integer,
        ForeignKey("storage_buckets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String, nullable=False)
    path = Column(String, nullable=False, index=True)
    parent = Column(String, nullable=True)


class StorageFile(Base):
    __tablename__ = "storage_files"

    id = Column(Integer, primary_key=True, index=True)
    bucket_id = Column(Integer, ForeignKey("storage_buckets.id"), nullable=True, index=True)
    name = Column(String, nullable=False, index=True)
    original_name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    size = Column(Integer, nullable=False)
    url = Column(String, nullable=False)
    thumbnail = Column(String, nullable=True)
    folder = Column(String, default="/", nullable=False, index=True)
    uploaded_by = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    uploaded_at = Column(DateTime, default=utcnow, nullable=False)
    metadata_json = Column("metadata", JSON, default=dict)

    uploaded_by_user = relationship("Usuario", back_populates="storage_uploads")
    bucket = relationship("StorageBucket", foreign_keys=[bucket_id])
