from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas._camel import CamelCaseInput

BasemapType = Literal["xyz", "wms", "none"]


class BasemapBase(CamelCaseInput):
    label: str = Field(..., min_length=1, max_length=120)
    type: BasemapType = "xyz"
    url: str | None = None
    attributions: str | None = None
    subdomains: list[str] | None = None
    labels_url: str | None = Field(default=None, serialization_alias="labelsUrl")
    label_zoom_threshold: int | None = Field(default=None, serialization_alias="labelZoomThreshold")
    wms_params: dict | None = Field(default=None, serialization_alias="wmsParams")
    thumbnail_url: str | None = Field(default=None, serialization_alias="thumbnailUrl")
    orden: int = 0
    activo: bool = True


class BasemapCreate(BasemapBase):
    slug: str = Field(..., min_length=1, max_length=60, pattern=r"^[a-z0-9_-]+$")


class BasemapUpdate(CamelCaseInput):
    slug: str | None = Field(default=None, min_length=1, max_length=60, pattern=r"^[a-z0-9_-]+$")
    label: str | None = Field(default=None, min_length=1, max_length=120)
    type: BasemapType | None = None
    url: str | None = None
    attributions: str | None = None
    subdomains: list[str] | None = None
    labels_url: str | None = Field(default=None, serialization_alias="labelsUrl")
    label_zoom_threshold: int | None = Field(default=None, serialization_alias="labelZoomThreshold")
    wms_params: dict | None = Field(default=None, serialization_alias="wmsParams")
    thumbnail_url: str | None = Field(default=None, serialization_alias="thumbnailUrl")
    orden: int | None = None
    activo: bool | None = None


class BasemapResponse(BaseModel):
    id: int
    slug: str
    label: str
    type: BasemapType
    url: str | None = None
    attributions: str | None = None
    subdomains: list[str] | None = None
    labels_url: str | None = Field(default=None, serialization_alias="labelsUrl")
    label_zoom_threshold: int | None = Field(default=None, serialization_alias="labelZoomThreshold")
    wms_params: dict | None = Field(default=None, serialization_alias="wmsParams")
    thumbnail_url: str | None = Field(default=None, serialization_alias="thumbnailUrl")
    orden: int
    activo: bool
    created_at: datetime = Field(..., serialization_alias="createdAt")
    updated_at: datetime = Field(..., serialization_alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class BasemapPublicResponse(BaseModel):
    slug: str
    label: str
    type: BasemapType
    url: str | None = None
    attributions: str | None = None
    subdomains: list[str] | None = None
    labels_url: str | None = Field(default=None, serialization_alias="labelsUrl")
    label_zoom_threshold: int | None = Field(default=None, serialization_alias="labelZoomThreshold")
    wms_params: dict | None = Field(default=None, serialization_alias="wmsParams")
    thumbnail_url: str | None = Field(default=None, serialization_alias="thumbnailUrl")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class BasemapReorderItem(CamelCaseInput):
    id: int
    orden: int


class BasemapReorderRequest(BaseModel):
    items: list[BasemapReorderItem]
