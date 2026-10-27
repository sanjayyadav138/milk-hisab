#!/usr/bin/env bash
# ==============================================================================
# Milk Hisab (मिल्क हिसाब) - Production Startup Script
# Starts Unified Production Server (FastAPI + Built Frontend)
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   🥛 Starting Milk Hisab Production Server          ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "  🌐 Host: ${HOST}"
echo -e "  🔌 Port: ${PORT}"

# Activate virtual environment if present
if [ -f "backend/venv/bin/activate" ]; then
    source backend/venv/bin/activate
elif [ -f "backend/venv/Scripts/activate" ]; then
    source backend/venv/Scripts/activate
fi

cd "${ROOT_DIR}/backend"

export FRONTEND_DIST_DIR="${ROOT_DIR}/frontend/dist"

echo -e "\n${GREEN}🚀 Server is running at http://${HOST}:${PORT}${NC}"
echo -e "👉 Open in browser: http://localhost:${PORT}"
echo -e "📚 API Docs: http://localhost:${PORT}/docs\n"

# Exec uvicorn
exec uvicorn app.main:app --host "$HOST" --port "$PORT"
