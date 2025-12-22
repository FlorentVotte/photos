#!/bin/bash

# Sync script for cron job
# Run this via: ./scripts/sync.sh
# Or add to crontab: */30 * * * * /path/to/photobook/scripts/sync.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Log file
LOG_FILE="$PROJECT_DIR/sync.log"

echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting sync..." >> "$LOG_FILE"

# Run the sync
if npx tsx sync/index.ts >> "$LOG_FILE" 2>&1; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Sync completed successfully" >> "$LOG_FILE"
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Sync failed" >> "$LOG_FILE"
    exit 1
fi

# Keep only last 1000 lines of log
tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
