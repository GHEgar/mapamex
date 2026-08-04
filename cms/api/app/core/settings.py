import json
import os
from functools import lru_cache
from typing import Literal

from dotenv import load_dotenv
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_env_file = os.getenv("CMS_ENV_FILE")
if _env_file and os.path.isfile(_env_file):
    load_dotenv(_env_file, override=False)


class Settings(BaseSettings):
    environment: Literal["development", "staging", "production"] = "development"
    project_name: str = "Cms"
    database_url: str
    database_gis_url: str | None = None
    database_pool_size: int = 1
    database_max_overflow: int = 1
    database_connect_timeout: int = 3
    database_pool_recycle: int = 1800
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    redis_url: str
    storage_endpoint: str
    storage_public_endpoint: str
    storage_use_ssl: bool = False
    storage_verify_ssl: bool = True
    cors_origins: list[str]
    admin_prefix: str = "/api/administrador"
    web_prefix: str = "/api/portal"
    visor_public_prefix: str = "/api/visor"
    public_prefix: str = "/api/public"
    cookie_name: str = "access_token"
    cookie_max_age: int = 1800
    cookie_domain: str | None = None
    cookie_secure: bool = False
    cookie_httponly: bool = True
    cookie_samesite: str = "lax"
    refresh_cookie_name: str = "refresh_token"
    refresh_token_expire_minutes: int = 480
    csrf_secret_key: str
    csrf_token_expire_minutes: int = 60
    docs_url: str | None = None
    redoc_url: str | None = None
    openapi_url: str | None = None

    geoserver_url: str | None = None
    geoserver_user: str | None = None
    geoserver_password: str | None = None
    geoserver_timeout: float = 10.0

    visor_backend_url: str | None = None
    visor_internal_token: str | None = None

    discord_webhook_visor: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    @model_validator(mode="after")
    def enforce_production_defaults(self):
        if self.environment == "production":
            self.docs_url = None
            self.redoc_url = None
            self.openapi_url = None
            self.cookie_secure = True
            if "*" in self.cors_origins:
                raise ValueError("CORS_ORIGINS no puede contener '*' en production")
        return self

    model_config = SettingsConfigDict(env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()

