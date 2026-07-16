#!/bin/sh
set -e

umask 077

VERBOSE_FLAG=""
if [ "${DEBUG:-0}" -eq 1 ]; then
    VERBOSE_FLAG="-v"
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
BACKUP_DBS="${BACKUP_DBS:-$POSTGRES_DB}"

mkdir -p "$BACKUP_DIR"

echo "postgres-primary:5432:*:${POSTGRES_USER}:${POSTGRES_PASSWORD}" > ~/.pgpass
chmod 600 ~/.pgpass

for DB in $BACKUP_DBS; do
    FILENAME="${DB}_${TIMESTAMP}.sql.gz"
    FILEPATH="${BACKUP_DIR}/${FILENAME}"

    pg_dump $VERBOSE_FLAG \
        "host=postgres-primary port=5432 user=$POSTGRES_USER dbname=$DB sslmode=verify-ca sslrootcert=/certs/ca.crt" \
        --format=custom \
        --compress=5 \
        -f "$FILEPATH"

    chmod 600 "$FILEPATH"

    if [ -n "${BACKUP_UID}" ] && [ -n "${BACKUP_GID}" ]; then
        chown "${BACKUP_UID}:${BACKUP_GID}" "$FILEPATH"
    fi

    echo "Backup created: $FILEPATH"
done

rm -f ~/.pgpass

/scripts/cleanup.sh
