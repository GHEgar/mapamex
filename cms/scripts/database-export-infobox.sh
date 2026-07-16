#!/bin/sh
# Exporta infobox_config de visor.layers en Database a dos archivos:
#   - <out>/infobox-<ts>.json : lectura humana, mapa { id: infobox_config }
#   - <out>/infobox-<ts>.sql  : UPDATEs idempotentes para aplicar en otra BD via
#                               scripts/database-apply-infobox.sh
#
# Solo toca la columna infobox_config; nada mas de la capa se exporta.
# Las capas destino tienen que existir con la misma id (el UPDATE
# no inserta filas nuevas: id ausente => 0 rows afectados, sin error).
#
# Variables:
#   DATABASE_URL   conexion psql (postgres://user:pass@host:port/db?sslmode=...)
#   OUT_DIR          carpeta de salida (default: ./infobox-exports/)
#
# Uso:
#   DATABASE_URL='postgres://...staging...' ./scripts/database-export-infobox.sh

set -eu

: "${DATABASE_URL:?DATABASE_URL no definido}"
OUT_DIR="${OUT_DIR:-./infobox-exports}"
PSQL_IMAGE="${PSQL_IMAGE:-postgres:18-alpine}"

psql() {
    docker run --rm -i \
        --network=host \
        --add-host=host.docker.internal:host-gateway \
        "$PSQL_IMAGE" psql "$@"
}
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
JSON_OUT="$OUT_DIR/infobox-$TIMESTAMP.json"
SQL_OUT="$OUT_DIR/infobox-$TIMESTAMP.sql"

mkdir -p "$OUT_DIR"

psql "$DATABASE_URL" -A -t -v ON_ERROR_STOP=1 -c "
SELECT COALESCE(
  jsonb_pretty(jsonb_object_agg(id, infobox_config ORDER BY id)),
  '{}'::text
)
FROM visor.layers
WHERE infobox_config IS NOT NULL
" > "$JSON_OUT"

{
    printf -- '-- infobox_config snapshot generado %s UTC desde DATABASE_URL\n' "$TIMESTAMP"
    printf -- '-- Total de capas con infobox_config:\n'
    psql "$DATABASE_URL" -A -t -v ON_ERROR_STOP=1 -c "
        SELECT '-- ' || COUNT(*)::text
        FROM visor.layers
        WHERE infobox_config IS NOT NULL
    "
    printf 'BEGIN;\n'
    psql "$DATABASE_URL" -A -t -v ON_ERROR_STOP=1 -c "
        SELECT format(
            'UPDATE visor.layers SET infobox_config = %L::jsonb, updated_at = NOW() WHERE id = %L;',
            infobox_config::text,
            id
        )
        FROM visor.layers
        WHERE infobox_config IS NOT NULL
        ORDER BY id
    "
    printf 'COMMIT;\n'
} > "$SQL_OUT"

UPDATE_COUNT=$(grep -c '^UPDATE' "$SQL_OUT" || true)

echo "Export listo:"
echo "  JSON: $JSON_OUT"
echo "  SQL:  $SQL_OUT"
echo "  Capas con infobox_config: $UPDATE_COUNT"
echo
echo "Siguiente paso (en la VM de prod):"
echo "  DATABASE_URL='postgres://...prod...' \\"
echo "    ./scripts/database-apply-infobox.sh $SQL_OUT"
