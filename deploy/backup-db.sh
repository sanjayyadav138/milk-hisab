#!/usr/bin/env bash
# ==============================================================================
# Milk Hisab (मिल्क हिसाब) - Automated SQLite Safe Backup Script
# Place in crontab to run daily at 2:00 AM:
# 0 2 * * * /var/www/milkhisab/deploy/backup-db.sh >> /var/log/milkhisab/backup.log 2>&1
# ==============================================================================

set -e

BACKUP_DIR="/var/backups/milkhisab"
DB_PATH="/var/www/milkhisab/backend/doodh_ledger.db"
PYTHON_BIN="/var/www/milkhisab/backend/venv/bin/python"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/doodh_ledger_${TIMESTAMP}.db"

echo "[$(date)] Starting Milk Hisab SQLite backup..."

# Use Python's sqlite3 safe online backup API (handles WAL mode cleanly)
$PYTHON_BIN -c "
import sqlite3
source = sqlite3.connect('${DB_PATH}')
dest = sqlite3.connect('${BACKUP_FILE}')
with dest:
    source.backup(dest)
dest.close()
source.close()
print('✓ SQLite backup completed successfully.')
"

# Compress backup
gzip -f "$BACKUP_FILE"
echo "[$(date)] Backup compressed: ${BACKUP_FILE}.gz"

# Retain only last 30 days of backups
find "$BACKUP_DIR" -type f -name "doodh_ledger_*.db.gz" -mtime +30 -exec rm {} \;
echo "[$(date)] Old backups older than 30 days cleaned up."
