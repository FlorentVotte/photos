#!/bin/sh
set -e

# Initialize database if it doesn't exist
DB_PATH="/app/data/photobook.db"

if [ ! -f "$DB_PATH" ]; then
  echo "Initializing database..."
  npx prisma db push
  echo "Database initialized successfully"
fi

# Start the application
exec node server.js
