#!/bin/bash
# =============================================================================
# scripts/migrate.sh
#
# Orquestador one-button para la migracion MinIO -> SeaweedFS.
# Detecta el entorno y se comporta:
#   - GCP (todos los repos colocados en /MapaMex/*): automatico. Actualiza los
#     .env de los consumidores y reinicia.
#   - Administracion (VMs separadas, solo storage aqui): semi-automatico.
#     Hace lo que puede en este host e imprime las instrucciones exactas
#     para los otros VMs.
#
# Override manual: MIGRATE_MODE=gcp|admin
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

ENV_FILE="${ENV_FILE:-.env}"
CONFIG_FILE="$PROJECT_DIR/config/identities.json"

GREEN=$'\033[32m'
YELLOW=$'\033[33m'
RED=$'\033[31m'
BOLD=$'\033[1m'
RESET=$'\033[0m'

step()  { echo ""; echo "${BOLD}${GREEN}==> $1${RESET}"; }
info()  { echo "${YELLOW}    $1${RESET}"; }
warn()  { echo "${YELLOW}[!] $1${RESET}"; }
err()   { echo "${RED}[ERROR] $1${RESET}" >&2; }
ok()    { echo "${GREEN}[OK] $1${RESET}"; }

MAPAMEX_ROOT="${MAPAMEX_ROOT:-}"
if [ -z "$MAPAMEX_ROOT" ]; then
    for candidate in "/MapaMex" "/home/egar/MapaMex"; do
        if [ -d "$candidate" ]; then
            MAPAMEX_ROOT="$candidate"
            break
        fi
    done
fi

CONSUMER_REPOS=(
    "$MAPAMEX_ROOT/cms"
    "$MAPAMEX_ROOT/database"
    "$MAPAMEX_ROOT/gateway"
)

detect_mode() {
    if [ -n "${MIGRATE_MODE:-}" ]; then
        echo "$MIGRATE_MODE"
        return
    fi
    [ -z "$MAPAMEX_ROOT" ] && { echo "admin"; return; }
    local found=0
    for r in "${CONSUMER_REPOS[@]}"; do
        [ -d "$r" ] && found=$((found+1))
    done
    if [ "$found" -ge 2 ]; then
        echo "gcp"
    else
        echo "admin"
    fi
}

# -----------------------------------------------------------------------------
# Fase 0: pre-flight
# -----------------------------------------------------------------------------
step "Fase 0 — Pre-flight"

MODE=$(detect_mode)
info "Modo detectado: $MODE"
info "Override: export MIGRATE_MODE=gcp|admin"

if [ ! -f "$ENV_FILE" ]; then
    err "No existe $ENV_FILE. Corre 'make setup' primero."
    exit 1
fi
set -a; . "$ENV_FILE"; set +a

require_var() {
    eval "val=\${$1:-}"
    if [ -z "$val" ]; then
        err "Variable $1 no esta definida en $ENV_FILE."
        exit 1
    fi
}
require_var STORAGE_ADMIN_ACCESS_KEY
require_var STORAGE_ADMIN_SECRET_KEY
require_var STORAGE_BUCKETS
ok "$ENV_FILE valido"

MINIO_VOLUME_DEFAULT="${MIGRATE_MINIO_VOLUME:-storage_minio_data}"
HAS_MINIO_DATA=0
if docker volume inspect "$MINIO_VOLUME_DEFAULT" >/dev/null 2>&1; then
    HAS_MINIO_DATA=1
    ok "Volumen MinIO '$MINIO_VOLUME_DEFAULT' encontrado (se migrara su contenido)"
else
    warn "Volumen '$MINIO_VOLUME_DEFAULT' no existe — la fase de mirror se SALTARA (instalacion limpia)"
fi

# -----------------------------------------------------------------------------
# Fase 1: snapshot de seguridad
# -----------------------------------------------------------------------------
step "Fase 1 — Snapshot de seguridad"

snapshot_minio() {
    local minio_container="storage-minio"
    local backup_dir="${BACKUP_DIR:-$PROJECT_DIR/backups}"
    local date
    date=$(date +%Y-%m-%d)
    local timestamp
    timestamp=$(date +%Y-%m-%d_%H-%M-%S)
    local archive="${backup_dir}/monthly/backup-PREMIGRATE-${timestamp}.tar.gz"
    local tmpdir="${backup_dir}/monthly/.premigrate-${timestamp}"

    if [ -z "${MIGRATE_MINIO_ACCESS_KEY:-}" ] || [ -z "${MIGRATE_MINIO_SECRET_KEY:-}" ]; then
        warn "MIGRATE_MINIO_ACCESS_KEY/SECRET_KEY no definidas — snapshot via mc no posible."
        warn "El volumen storage_minio_data sigue siendo tu red de salvataje (mc mirror lo lee directo)."
        return 0
    fi

    local network
    network=$(docker inspect "$minio_container" -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}' 2>/dev/null | head -n 1)
    if [ -z "$network" ]; then
        warn "No se pudo determinar la red de $minio_container. Snapshot SKIPPED."
        return 0
    fi

    mkdir -p "$tmpdir" "${backup_dir}/logs"
    info "Mirror buckets de MinIO viejo a $tmpdir..."
    local mc_image="${MC_IMAGE:-pgsty/mc:RELEASE.2026-04-17T00-00-00Z}"
    local fail=0
    for bucket in $STORAGE_BUCKETS; do
        info "  - $bucket"
        if ! docker run --rm \
            --network "$network" \
            -v "${tmpdir}:/backup" \
            --entrypoint=/bin/sh \
            "$mc_image" -c "
                mc alias set old http://${minio_container}:9000 '${MIGRATE_MINIO_ACCESS_KEY}' '${MIGRATE_MINIO_SECRET_KEY}' >/dev/null && \
                mc ls old/${bucket} >/dev/null 2>&1 || { echo 'bucket no existe en MinIO viejo, skip'; exit 0; } && \
                mkdir -p /backup/${bucket} && \
                mc mirror old/${bucket} /backup/${bucket}
            " 2>&1 | tail -3; then
            fail=$((fail+1))
        fi
    done

    info "Comprimiendo a $archive..."
    tar -czf "$archive" -C "$tmpdir" . 2>/dev/null
    docker run --rm -v "${tmpdir}:/cleanup" alpine find /cleanup -mindepth 1 -delete >/dev/null 2>&1 || true
    rmdir "$tmpdir" 2>/dev/null || true

    if [ -s "$archive" ]; then
        local size
        size=$(du -h "$archive" | cut -f1)
        ok "Snapshot tar.gz: $archive ($size)"
    else
        warn "El tar.gz quedo vacio. El volumen storage_minio_data sigue intacto."
    fi
}

if [ "$HAS_MINIO_DATA" = "1" ] && docker ps --format '{{.Names}}' | grep -qx storage-minio; then
    info "MinIO esta corriendo. Disparando snapshot..."
    snapshot_minio
elif [ "$HAS_MINIO_DATA" = "1" ]; then
    info "Volumen existe pero el contenedor storage-minio no esta corriendo."
    info "El mirror leera el volumen directamente. Si quieres un tar.gz adicional, levanta MinIO primero."
else
    info "Nada que respaldar (no hay MinIO previo)."
fi

# -----------------------------------------------------------------------------
# Fase 2: generar identities + arrancar SeaweedFS
# -----------------------------------------------------------------------------
step "Fase 2 — Generar identities.json y arrancar SeaweedFS"

if [ -s "$CONFIG_FILE" ]; then
    warn "$CONFIG_FILE ya existe. Se preservaran las passwords existentes."
    info "Para forzar rotacion: 'make rotate-seaweedfs' (rota TODOS) o 'make rotate-seaweedfs BUCKET=...'"
fi

docker compose --env-file "$ENV_FILE" -f docker-compose.yml --profile init run --rm storage-init
ok "identities.json generado/actualizado"

docker compose --env-file "$ENV_FILE" -f docker-compose.yml up -d
info "Esperando healthcheck (max ~2 min)..."
TRIES=0
until [ "$(docker inspect -f '{{.State.Health.Status}}' storage-seaweedfs 2>/dev/null || echo missing)" = "healthy" ]; do
    TRIES=$((TRIES+1))
    if [ "$TRIES" -gt 40 ]; then
        err "SeaweedFS no se volvio healthy. Revisa: docker logs storage-seaweedfs"
        exit 1
    fi
    sleep 3
done
ok "SeaweedFS healthy"

# -----------------------------------------------------------------------------
# Fase 3: mirror MinIO -> SeaweedFS
# -----------------------------------------------------------------------------
if [ "$HAS_MINIO_DATA" = "1" ]; then
    step "Fase 3 — Mirror MinIO -> SeaweedFS"
    if [ -z "${MIGRATE_MINIO_ACCESS_KEY:-}" ] || [ -z "${MIGRATE_MINIO_SECRET_KEY:-}" ]; then
        err "MIGRATE_MINIO_ACCESS_KEY/SECRET_KEY requeridas en $ENV_FILE para la fase de mirror."
        info "Agregalas (root del MinIO viejo) y vuelve a correr 'make migrate'."
        exit 1
    fi
    ENV_FILE="$ENV_FILE" bash "$SCRIPT_DIR/migrate-from-minio.sh"
    ok "Mirror completo"
else
    step "Fase 3 — Mirror MinIO -> SeaweedFS (SALTADA)"
    info "No habia volumen MinIO. SeaweedFS arranca con buckets vacios."
fi

# -----------------------------------------------------------------------------
# Fase 4: extraer secrets para propagacion
# -----------------------------------------------------------------------------
step "Fase 4 — Extraer secrets de identities.json"

declare -A SECRETS
for bucket in $STORAGE_BUCKETS; do
    SECRETS[$bucket]=$(jq -r ".identities[] | select(.name == \"${bucket}-user\") | .credentials[0].secretKey // \"\"" "$CONFIG_FILE")
    if [ -z "${SECRETS[$bucket]}" ]; then
        err "No se encontro secret para ${bucket}-user en $CONFIG_FILE"
        exit 1
    fi
done
ok "Secrets extraidos para ${#SECRETS[@]} buckets"

# -----------------------------------------------------------------------------
# Fase 5: propagacion (GCP) o instrucciones (admin)
# -----------------------------------------------------------------------------
step "Fase 5 — Propagacion a consumidores"

print_creds() {
    echo ""
    echo "  ${BOLD}Credenciales nuevas:${RESET}"
    for bucket in $STORAGE_BUCKETS; do
        echo "    STORAGE_${bucket^^}_ACCESS_KEY=${bucket}-user"
        echo "    STORAGE_${bucket^^}_SECRET_KEY=${SECRETS[$bucket]}"
    done
    echo "    STORAGE_ENDPOINT=storage-seaweedfs:8333"
    echo "    STORAGE_PUBLIC_ENDPOINT=/storage"
    echo ""
}

update_cms() {
    local env_file="$1"
    [ ! -f "$env_file" ] && return
    info "Actualizando $env_file..."
    # Endpoint
    sed -i -E \
        -e 's|^STORAGE_HOST_IP=.*|STORAGE_HOST_IP=storage-seaweedfs|' \
        -e 's|^STORAGE_ENDPOINT=.*|STORAGE_ENDPOINT=storage-seaweedfs:8333|' \
        "$env_file"
    # Por cada bucket, sustituir el SECRET_KEY
    for bucket in visor cms mapamex; do
        if [ -n "${SECRETS[$bucket]:-}" ]; then
            local var="STORAGE_${bucket^^}_SECRET_KEY"
            sed -i -E "s|^${var}=.*|${var}=${SECRETS[$bucket]}|" "$env_file"
        fi
    done
    ok "$(basename "$env_file") actualizado"
}

update_database() {
    local env_file="$MAPAMEX_ROOT/database/.env"
    [ ! -f "$env_file" ] && return
    info "Actualizando $env_file..."
    for var in "${!SECRETS[@]}"; do
        if [ -n "${SECRETS[$var]}" ]; then
            sed -i -E "s|^${var}=.*|${var}=${SECRETS[$var]}|" "$env_file"
        fi
    done
    ok "database/.env actualizado"
}

if [ "$MODE" = "gcp" ]; then
    info "Modo GCP: actualizando .env de consumidores in-place (raiz: $MAPAMEX_ROOT)..."
    for f in "$MAPAMEX_ROOT/cms/.env.production" "$MAPAMEX_ROOT/cms/.env.staging" "$MAPAMEX_ROOT/cms/.env.development"; do
        update_cms "$f"
    done
    update_database

    print_creds

    step "Fase 6 — Reiniciar consumidores"
    info "Ejecuta (manual, requiere docker compose en cada repo):"
    cat <<EOF

  cd $MAPAMEX_ROOT/gateway && \\
    sed -i 's|STORAGE_HOST=storage-minio:9000|STORAGE_HOST=storage-seaweedfs:8333|' .env.production && \\
    docker compose up -d nginx

  cd $MAPAMEX_ROOT/cms && docker compose up -d --force-recreate
  cd $MAPAMEX_ROOT/database && docker compose up -d --force-recreate

  curl -I https://mapamex.jalisco.gob.mx/storage/mapamex/v1/logo.svg   # smoke test
EOF
else
    cat <<EOF

  ${BOLD}${YELLOW}Modo ADMINISTRACION (semi-automatico).${RESET}
  Storage y gateway viven en S1; los consumidores en otros servidores.
  Sigue los pasos del runbook desde la VM correspondiente:

  ${BOLD}docs/migracion-runbook.md${RESET}

EOF
    print_creds
    info "Copia las creds de arriba y aplicalas segun el runbook."
fi

# -----------------------------------------------------------------------------
step "Migracion completa"
echo ""
echo "  ${BOLD}Estado actual:${RESET}"
echo "    - SeaweedFS healthy en storage-seaweedfs:8333"
echo "    - config/identities.json escrito"
[ "$HAS_MINIO_DATA" = "1" ] && echo "    - Datos migrados de MinIO"
[ "$MODE" = "gcp" ] && echo "    - .env de consumidores actualizados"
echo ""
echo "  ${BOLD}Que NO se hizo automaticamente:${RESET}"
echo "    - Apagar MinIO viejo (lo dejas hasta confirmar smoke tests)"
echo "    - Reiniciar el gateway (ver comandos arriba)"
echo "    - Reiniciar consumidores (ver comandos arriba)"
echo ""
