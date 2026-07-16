#!/bin/sh
set -u

GEOSERVER_URL="${GEOSERVER_URL:-http://localhost:8080/geoserver}"
AUTH="${GEOSERVER_ADMIN_USER}:${GEOSERVER_ADMIN_PASSWORD}"
GRIDSET="${SEED_GRIDSET:-WebMercatorQuad}"
FORMAT="${SEED_FORMAT:-image/png}"
THREADS="${SEED_THREADS:-2}"
BOUNDS="${SEED_BOUNDS:--11766470.18,2149050.11,-11295588.73,2601813.23}"
EXPIRE_CLIENTS="${SEED_EXPIRE_CLIENTS:-86400}"
SEED_LAYERS="${SEED_LAYERS:-general:curvas_de_nivel=11-15 raster:hillshade_mapamex_cog=6-14 raster:hillshade_inegi_cog=6-14}"
SEED_LAYERS_FILE="${SEED_LAYERS_FILE:-}"

if [ -n "$SEED_LAYERS_FILE" ] && [ -f "$SEED_LAYERS_FILE" ]; then
  SEED_LAYERS="$SEED_LAYERS $(tr '\n' ' ' < "$SEED_LAYERS_FILE")"
fi

OLDIFS="$IFS"
IFS=','
set -- $BOUNDS
IFS="$OLDIFS"
MINX="$1"; MINY="$2"; MAXX="$3"; MAXY="$4"

wait_for_geoserver() {
  attempt=0
  max_attempts=24
  until http_code=$(curl -s -o /dev/null --max-time 10 -w "%{http_code}" -u "$AUTH" "$GEOSERVER_URL/gwc/rest/gridsets") && [ "$http_code" = "200" ]; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge "$max_attempts" ]; then
      echo "GWC REST no respondio 200 despues de $((max_attempts * 5))s (ultimo code=$http_code)." >&2
      exit 1
    fi
    sleep 5
  done
}

build_payload() {
  layer="$1"
  zmin="$2"
  zmax="$3"
  cat <<EOF
<seedRequest>
  <name>$layer</name>
  <gridSetId>$GRIDSET</gridSetId>
  <bounds><coords><double>$MINX</double><double>$MINY</double><double>$MAXX</double><double>$MAXY</double></coords></bounds>
  <zoomStart>$zmin</zoomStart>
  <zoomStop>$zmax</zoomStop>
  <format>$FORMAT</format>
  <type>seed</type>
  <threadCount>$THREADS</threadCount>
</seedRequest>
EOF
}

ensure_expire_clients() {
  layer="$1"
  config=$(curl -s --max-time 15 -u "$AUTH" "$GEOSERVER_URL/gwc/rest/layers/$layer.xml")
  case "$config" in
    *"<expireClients>$EXPIRE_CLIENTS</expireClients>"*) return 0 ;;
    *"<expireClients>"*) ;;
    *) return 0 ;;
  esac
  updated=$(printf '%s' "$config" | sed "s|<expireClients>[0-9]*</expireClients>|<expireClients>$EXPIRE_CLIENTS</expireClients>|")
  http_code=$(curl -s -o /dev/null --max-time 30 -w "%{http_code}" -u "$AUTH" \
    -X PUT -H "Content-Type: application/xml" -d "$updated" \
    "$GEOSERVER_URL/gwc/rest/layers/$layer.xml")
  if [ "$http_code" = "200" ]; then
    echo "expireClients=$EXPIRE_CLIENTS aplicado: $layer"
  else
    echo "expireClients FALLO: $layer (http=$http_code)" >&2
  fi
}

wait_for_geoserver

failures=0
for entry in $SEED_LAYERS; do
  layer="${entry%=*}"
  zrange="${entry#*=}"
  zmin="${zrange%-*}"
  zmax="${zrange#*-}"
  ensure_expire_clients "$layer"
  payload=$(build_payload "$layer" "$zmin" "$zmax")
  http_code=$(curl -s -o /dev/null --max-time 30 -w "%{http_code}" -u "$AUTH" \
    -X POST -H "Content-Type: application/xml" -d "$payload" \
    "$GEOSERVER_URL/gwc/rest/seed/$layer.xml")
  if [ "$http_code" = "200" ]; then
    echo "seed encolado: $layer z$zmin-$zmax ($GRIDSET)"
  else
    echo "seed FALLO: $layer (http=$http_code)" >&2
    failures=$((failures + 1))
  fi
done

exit "$failures"
