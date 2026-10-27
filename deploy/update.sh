#!/usr/bin/env bash
# ==============================================================================
# Milk Hisab (मिल्क हिसाब) - Zero-Downtime Server Update Script
# Usage: bash /var/www/milkhisab/deploy/update.sh
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/var/www/milkhisab"
cd "$APP_DIR"

echo -e "${BLUE}=== Pulling Latest Changes from GitHub ===${NC}"
git pull origin main

echo -e "${YELLOW}=== Updating Python Backend ===${NC}"
cd "${APP_DIR}/backend"
./venv/bin/pip install -r requirements.txt --prefer-binary --quiet

echo -e "${YELLOW}=== Compiling Frontend ===${NC}"
cd "${APP_DIR}/frontend"
npm run build

echo -e "${YELLOW}=== Reloading Services ===${NC}"
sudo systemctl restart milkhisab
sudo systemctl reload nginx

echo -e "\n${GREEN}✓ Update Complete! Milk Hisab is running the latest version.${NC}\n"
