#!/bin/sh
set -e

# Apply pending database migrations before starting the server.
# Set SKIP_MIGRATIONS=1 to start without touching the schema.
if [ "${SKIP_MIGRATIONS:-0}" != "1" ]; then
  echo "Running database migrations..."
  (cd /migrate && node node_modules/prisma/build/index.js migrate deploy)
fi

exec "$@"
