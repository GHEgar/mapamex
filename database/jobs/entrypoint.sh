#!/bin/sh
set -e

printenv | grep -E '^(DATABASE_|AO_|VISOR_AO_)' > /etc/environment

tail -F /var/log/cron.log &

exec "$@"
