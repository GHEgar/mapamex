#!/bin/sh
set -e

CONFIG=/etc/seaweedfs/identities.json

if [ ! -s "$CONFIG" ]; then
    echo "[storage-seaweedfs] ERROR: $CONFIG missing or empty." >&2
    echo "[storage-seaweedfs] Run 'make storage-init-seaweedfs' before 'make storage-deploy' (monorepo root)." >&2
    echo "[storage-seaweedfs] Without this file the S3 endpoint falls open." >&2
    exit 1
fi

exec weed server "$@"
