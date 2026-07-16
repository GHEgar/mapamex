#!/usr/bin/env bash
# Corre el suite de pytest del backend reproduciendo el entorno de CI.
#
# Estrategia: arranca un contenedor desechable a partir de la imagen
# `cms-api:latest` (build del Dockerfile) con env vars de test
# (sqlite:///:memory:, secrets dummy, ENV=test). Si pytest no esta instalado
# en la imagen lo agrega al vuelo. Si la imagen no existe, intenta `pytest`
# del PATH local.
#
# Variables opcionales:
#   PYTEST_ARGS  flags extra para pytest (default: "-q")
#   API_IMAGE    nombre de la imagen (default: cms-api:latest)

set -e

API_IMAGE="${API_IMAGE:-cms-api:local}"
PYTEST_ARGS="${PYTEST_ARGS:--q}"

API_DIR="$(cd "$(dirname "$0")/.." && pwd)"

TEST_ENV=(
    -e ENV=test
    -e PROJECT_NAME=cms-test
    -e "DATABASE_URL=sqlite:///:memory:"
    -e SECRET_KEY=test-secret-key-do-not-use-in-production
    -e CSRF_SECRET_KEY=test-csrf-secret-key-do-not-use-in-production
    -e "REDIS_URL=redis://localhost:6379/0"
    -e 'CORS_ORIGINS=["http://localhost:3000"]'
    -e STORAGE_ENDPOINT=localhost:9000
    -e STORAGE_PUBLIC_ENDPOINT=localhost:9000
    -e STORAGE_USE_SSL=false
    -e STORAGE_PORTAL_ACCESS_KEY=test-portal
    -e STORAGE_PORTAL_SECRET_KEY=test-portal-secret
    -e STORAGE_VISOR_ACCESS_KEY=test-visor
    -e STORAGE_VISOR_SECRET_KEY=test-visor-secret
    -e STORAGE_CMS_ACCESS_KEY=test-cms
    -e STORAGE_CMS_SECRET_KEY=test-cms-secret
    -e STORAGE_MAPAMEX_ACCESS_KEY=test-mapamex
    -e STORAGE_MAPAMEX_SECRET_KEY=test-mapamex-secret
)

if docker image inspect "$API_IMAGE" >/dev/null 2>&1; then
    # Container temporal sobre la imagen prod-ish. Instala pytest al vuelo si
    # la imagen no lo trae (la imagen `production` del Dockerfile no incluye
    # los `[dev]` extras). Monta el codigo en /app para que recoja los
    # cambios locales sin rebuild.
    PYTEST_CHECK='python -c "import pytest" 2>/dev/null || pip install -q pytest pytest-asyncio >/dev/null'
    exec docker run --rm \
        "${TEST_ENV[@]}" \
        -v "$API_DIR:/app" \
        -w /app \
        --entrypoint sh \
        "$API_IMAGE" \
        -c "$PYTEST_CHECK && pytest $PYTEST_ARGS"
fi

# Fallback local: necesita un venv con las deps instaladas.
if command -v pytest >/dev/null 2>&1; then
    cd "$API_DIR"
    exec env \
        ENV=test \
        PROJECT_NAME=cms-test \
        DATABASE_URL='sqlite:///:memory:' \
        SECRET_KEY=test-secret-key-do-not-use-in-production \
        CSRF_SECRET_KEY=test-csrf-secret-key-do-not-use-in-production \
        REDIS_URL='redis://localhost:6379/0' \
        CORS_ORIGINS='["http://localhost:3000"]' \
        STORAGE_ENDPOINT=localhost:9000 \
        STORAGE_PUBLIC_ENDPOINT=localhost:9000 \
        STORAGE_USE_SSL=false \
        STORAGE_PORTAL_ACCESS_KEY=test-portal \
        STORAGE_PORTAL_SECRET_KEY=test-portal-secret \
        STORAGE_VISOR_ACCESS_KEY=test-visor \
        STORAGE_VISOR_SECRET_KEY=test-visor-secret \
        STORAGE_CMS_ACCESS_KEY=test-cms \
        STORAGE_CMS_SECRET_KEY=test-cms-secret \
        STORAGE_MAPAMEX_ACCESS_KEY=test-mapamex \
        STORAGE_MAPAMEX_SECRET_KEY=test-mapamex-secret \
        pytest $PYTEST_ARGS
fi

echo "[run-tests] No pude correr pytest:" >&2
echo "[run-tests]   - imagen Docker '${API_IMAGE}' no existe (corre 'make cms-build' o 'make cms-up' desde la raiz)" >&2
echo "[run-tests]   - y 'pytest' no esta en el PATH" >&2
echo "[run-tests] Soluciones:" >&2
echo "[run-tests]   make cms-build   # (raiz del monorepo) build + arranca el entorno dev" >&2
echo "[run-tests]   o crea un venv:  cd api && python -m venv .venv && source .venv/bin/activate && pip install -e '.[dev]'" >&2
exit 1
