from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_fastapi_instrumentator import metrics as fastapi_metrics

from app.api import metrics as metrics_module
from app.api.deps import require_staff
from app.api.routes import (
    storage,
    storage_buckets,
    actividad,
    auth,
    basemaps,
    borradores,
    bulk_ingest,
    eventos,
    geoserver,
    home,
    layer_metadata,
    layers,
    visor_api_keys,
    visor_api_keys_internal,
    visor_events_public,
    visor_mcp_internal,
    visor_shares,
    visor_stats,
    projects,
    public,
    symbols,
    users,
)
from app.core.settings import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        lifespan=lifespan,
        docs_url=settings.docs_url,
        redoc_url=settings.redoc_url,
        openapi_url=settings.openapi_url,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    Instrumentator(
        excluded_handlers=["^/metrics$", "^/health$", "^/$"],
        should_group_status_codes=True,
        should_ignore_untemplated=True,
    ).add(
        fastapi_metrics.requests()
    ).add(
        fastapi_metrics.latency(buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10))
    ).instrument(app)

    app.include_router(auth.router, prefix=settings.admin_prefix)

    staff_dep = [Depends(require_staff)]
    app.include_router(users.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(actividad.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(projects.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(storage_buckets.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(storage.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(borradores.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(layers.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(bulk_ingest.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(layer_metadata.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(symbols.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(geoserver.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(eventos.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(basemaps.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(home.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(visor_shares.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(visor_api_keys.router, prefix=settings.admin_prefix, dependencies=staff_dep)
    app.include_router(visor_api_keys_internal.router, prefix=settings.admin_prefix)
    app.include_router(visor_mcp_internal.router, prefix=settings.admin_prefix)
    app.include_router(visor_stats.router, prefix=settings.admin_prefix, dependencies=staff_dep)

    app.include_router(public.visor_router, prefix=settings.visor_public_prefix)
    app.include_router(storage.public_router)
    app.include_router(symbols.visor_router, prefix=settings.visor_public_prefix)
    app.include_router(visor_events_public.router, prefix=settings.public_prefix)
    app.include_router(metrics_module.router)

    @app.get("/", tags=["health"])
    async def healthcheck():
        return {
            "status": "ok",
            "project": settings.project_name,
        }

    @app.get("/health", tags=["health"])
    async def health():
        return {"status": "healthy"}

    return app


app = create_app()
