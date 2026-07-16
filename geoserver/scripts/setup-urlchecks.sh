#!/bin/bash
# Configura los URLChecks que permiten a GeoServer leer ExternalGraphic desde
# buckets internos del Storage (SeaweedFS) cuando renderea SLDs.
#
# Idempotente: POST devuelve 201 al crear y 409 si ya existe. Ambos se
# consideran exito. Solo escupe a stdout cuando crea uno nuevo.
#
# PENDIENTE: cuando estos URLChecks se persistan via configuracion declarativa
# (ej. provisioning del volumen geoserver_data en el bootstrap de produccion),
# remover este script y la invocacion desde el target `up` del Makefile.
set +H
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  . "$PROJECT_DIR/.env"
  set +a
fi

GEOSERVER_URL="http://localhost:8080/geoserver"
AUTH="${GEOSERVER_ADMIN_USER}:${GEOSERVER_ADMIN_PASSWORD}"

URLCHECKS=(
  "storage_visor|Storage SeaweedFS interno (bucket visor)|^http://storage-seaweedfs:8333/visor/.+$"
  "storage_mapamex_leyendas|Storage SeaweedFS interno (bucket mapamex, prefijo leyendas/)|^http://storage-seaweedfs:8333/mapamex/leyendas/.+$"
)

ensure_urlcheck() {
  local name="$1" description="$2" regex="$3"
  local payload
  payload=$(printf '{"regexUrlCheck":{"name":"%s","description":"%s","enabled":true,"regex":"%s"}}' \
    "$name" "$description" "$regex")
  local code
  code=$(curl -s -o /dev/null --max-time 10 -w "%{http_code}" \
    -u "$AUTH" -H "Content-Type: application/json" -X POST \
    "$GEOSERVER_URL/rest/urlchecks" -d "$payload")
  case "$code" in
    201) echo "  + $name (creado)" ;;
    409) ;;
    *)   echo "  ✗ $name (HTTP $code)" >&2; return 1 ;;
  esac
}

echo "Configurando URLChecks de GeoServer..."
for entry in "${URLCHECKS[@]}"; do
  IFS='|' read -r name description regex <<< "$entry"
  ensure_urlcheck "$name" "$description" "$regex" || exit 1
done
echo "URLChecks OK."
