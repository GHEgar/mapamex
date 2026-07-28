from sqlalchemy import JSON, Boolean, Column, DateTime, Enum, Integer, String, Text

from app.core.database import Base
from app.core.time import utcnow

BASEMAP_TYPE_ENUM = "basemap_type"
BASEMAP_TYPES = ("xyz", "wms", "none")


class Basemap(Base):
    """Mapa base configurable del visor (gestionado desde el CMS).

    El visor arma la fuente OpenLayers a partir de esta config:
      - type=xyz  -> XYZ({ url, attributions, subdomains }) + overlay de labels
                     opcional (labels_url / label_zoom_threshold).
      - type=wms  -> TileWMS({ url, ...wms_params }).
      - type=none -> sin fuente ("Sin mapa base").

    `slug` es el identificador estable que el visor persiste como `baseMapId`
    (en sesion y en enlaces compartidos); no debe cambiar a la ligera.
    """

    __tablename__ = "basemaps"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(60), unique=True, nullable=False, index=True)
    label = Column(String(120), nullable=False)
    type = Column(
        Enum(*BASEMAP_TYPES, name=BASEMAP_TYPE_ENUM),
        nullable=False,
        default="xyz",
    )
    url = Column(Text, nullable=True)
    attributions = Column(Text, nullable=True)
    subdomains = Column(JSON, nullable=True)
    labels_url = Column(Text, nullable=True)
    label_zoom_threshold = Column(Integer, nullable=True)
    max_zoom = Column(Integer, nullable=True)
    wms_params = Column(JSON, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    orden = Column(Integer, nullable=False, default=0)
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)
