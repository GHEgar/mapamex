#!/usr/bin/env bash
# Migracion idempotente de produccion: bootstrap baseline + alembic upgrade head.
#
# Hace en orden:
#   A. Bootstrap v1.4.0+: schema visor.*, seed de layers, alembic upgrade head.
#
# Idempotente. Re-ejecutable cada vez que hagas deploy con migraciones nuevas.
# Aplica TODAS las migraciones alembic pendientes.
#
# Uso:
#   ./scripts/prod-migration.sh                     # bootstrap + alembic
#   ./scripts/prod-migration.sh --dry-run           # no aplica cambios
#   ./scripts/prod-migration.sh --layers-json /path # override del baseline JSON

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

DRY_RUN=0
LAYERS_JSON="$REPO_ROOT/jobs/bootstrap/layers_export.json"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run)  DRY_RUN=1; shift ;;
        --layers-json) LAYERS_JSON="$2"; shift 2 ;;
        -h|--help)  sed -n '2,18p' "$0"; exit 0 ;;
        *) echo "Argumento desconocido: $1" >&2; exit 1 ;;
    esac
done

[ -f "$REPO_ROOT/.env" ] || { echo "ERROR: $REPO_ROOT/.env no existe" >&2; exit 1; }
set -a; source "$REPO_ROOT/.env"; set +a

: "${POSTGRES_USER:?POSTGRES_USER no esta en .env}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD no esta en .env}"
: "${POSTGRES_DB:?POSTGRES_DB no esta en .env}"

echo "================================================================"
echo " PROD MIGRATION v1.4.0"
echo "================================================================"
echo "  DB:             $POSTGRES_DB"
echo "  Dry-run:        $([ $DRY_RUN -eq 1 ] && echo si || echo NO)"
echo "  Layers JSON:    $LAYERS_JSON"
echo "================================================================"
echo

if [ $DRY_RUN -eq 0 ]; then
    echo "=== Pre. Sincronizando imagen de jobs con el repo ==="
    docker compose build jobs
    docker compose up -d jobs
    echo
fi

echo "=== A. Bootstrap v1.4.0 + seed + migrate + stamp ==="
BOOTSTRAP_ARGS=(--layers-json "$LAYERS_JSON")
[ $DRY_RUN -eq 1 ] && BOOTSTRAP_ARGS+=(--dry-run)

"$SCRIPT_DIR/bootstrap-v14.sh" "${BOOTSTRAP_ARGS[@]}"

echo
echo "================================================================"
echo " VALIDACION POST-MIGRACION"
echo "================================================================"
if [ $DRY_RUN -eq 1 ]; then
    echo " (saltada en --dry-run)"
else
    docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" postgres-primary \
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT
  (SELECT COUNT(*) FROM visor.layers)              AS layers,
  (SELECT COUNT(*) FROM visor.layer_metadata)      AS metadata,
  (SELECT COUNT(*) FROM visor.layer_stats)         AS stats,
  (SELECT COUNT(*) FROM visor.workspaces)          AS workspaces,
  (SELECT COUNT(*) FROM visor.initial_layer_order) AS initial_order,
  (SELECT layer_count FROM visor.layer_tree_cache WHERE id=1) AS cache,
  (SELECT etag FROM visor.layer_tree_cache WHERE id=1)        AS etag;" 2>&1 || true
fi

echo
echo "================================================================"
echo " PROD MIGRATION v1.4.0 COMPLETADA"
echo "================================================================"
echo
echo " Validacion adicional opcional:"
echo "   - Smoke test del endpoint:"
echo "        curl -sI https://<dominio>/visor/api/layers/tree | grep -i etag"
echo
echo " Post-migracion:"
echo "   - Deployar cms con DATABASE_GIS_URL apuntando a este cluster."
echo "   - Ver PASOS SIGUIENTES que imprimio bootstrap-v14 arriba."
echo
echo "================================================================"
