#!/bin/sh
set -e

./scripts/validate-production-env.sh

# Apply committed migrations (production-safe; will not drop data).
# `prisma db push` is a dev command and can silently drop columns — do not use here.
export DATABASE_URL="file:/app/data/photobook.db"
DB_FILE="/app/data/photobook.db"

# Baselining: earlier releases of this app used `prisma db push`, which creates
# tables but never records anything in the `_prisma_migrations` table. When we
# switch to `migrate deploy`, Prisma would try to re-run the init migration on
# a schema that already exists and crash with P3005.
#
# If the DB file exists and has application tables but no `_prisma_migrations`
# table, mark every committed migration as already applied. This runs exactly
# once (on the first post-upgrade boot); after that the table exists and we
# take the normal migrate-deploy path.
if [ -f "$DB_FILE" ]; then
  HAS_APP_TABLE=$(sqlite3 "$DB_FILE" "SELECT name FROM sqlite_master WHERE type='table' AND name='Album' LIMIT 1;" 2>/dev/null || true)
  HAS_MIGRATIONS_TABLE=$(sqlite3 "$DB_FILE" "SELECT name FROM sqlite_master WHERE type='table' AND name='_prisma_migrations' LIMIT 1;" 2>/dev/null || true)

  if [ -n "$HAS_APP_TABLE" ] && [ -z "$HAS_MIGRATIONS_TABLE" ]; then
    echo "Baselining existing database (previously managed by 'db push')..."
    for migration_dir in prisma/migrations/*/; do
      name=$(basename "$migration_dir")
      [ "$name" = "migrations" ] && continue
      echo "  Marking $name as applied"
      ./node_modules/.bin/prisma migrate resolve --applied "$name"
    done
    echo "Baseline complete"
  fi
fi

# Call the prisma binary directly rather than via `npx`: npm is removed from
# the runner image (its bundled deps are a recurring source of scanner CVEs
# that no package.json change can reach), so `npx` does not exist here.
echo "Applying database migrations..."
./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma
echo "Database ready"

# Start the application
exec node server.js
