#!/bin/sh
set -e

# Apply database migrations (creates DB if it doesn't exist, updates schema if it does)
DB_PATH="/app/data/photobook.db"

echo "Applying database migrations..."
npx prisma db push --skip-generate --url "file:${DB_PATH}"
echo "Database ready"

# Start the application
exec node server.js
