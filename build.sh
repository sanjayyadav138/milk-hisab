#!/usr/bin/env bash
# ==============================================================================
# Milk Hisab (मिल्क हिसाब) - Production Build Script
# Compiles & Builds Frontend (React + Vite) and Backend (FastAPI + Python)
# ==============================================================================

set -e # Exit immediately on error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   🥛 Milk Hisab (मिल्क हिसाब) - Production Build   ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Resolve project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"
echo -e "📂 Working Directory: ${ROOT_DIR}\n"

# ------------------------------------------------------------------------------
# 1. Dependency Pre-Checks
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[1/4] Checking System Dependencies...${NC}"

# Check for Python
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo -e "${RED}❌ Error: Python 3 is required but not installed.${NC}"
    exit 1
fi
echo -e "  ✓ Python: $($PYTHON_CMD --version)"

# Check for Node.js & NPM
if ! command -v node &>/dev/null; then
    echo -e "${RED}❌ Error: Node.js is required but not installed.${NC}"
    exit 1
fi
echo -e "  ✓ Node: $(node --version)"

if command -v npm.cmd &>/dev/null; then
    NPM_CMD="npm.cmd"
elif command -v npm &>/dev/null; then
    NPM_CMD="npm"
else
    echo -e "${RED}❌ Error: npm is required but not installed.${NC}"
    exit 1
fi
echo -e "  ✓ npm: $($NPM_CMD --version)"

# ------------------------------------------------------------------------------
# 2. Build & Setup Backend
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/4] Setting up Backend (FastAPI)...${NC}"
cd "${ROOT_DIR}/backend"

# Setup virtual environment if not in a container
if [ -z "$IN_DOCKER" ]; then
    if [ ! -d "venv" ]; then
        echo -e "  📦 Creating Python virtual environment in backend/venv..."
        $PYTHON_CMD -m venv venv
    fi

    # Activate venv (cross-platform handling)
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
        PIP_CMD="pip"
        PY_RUNNER="python"
    elif [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
        PIP_CMD="pip"
        PY_RUNNER="python"
    else
        PIP_CMD="$PYTHON_CMD -m pip"
        PY_RUNNER="$PYTHON_CMD"
    fi
else
    PIP_CMD="pip"
    PY_RUNNER="$PYTHON_CMD"
fi

echo -e "  📥 Installing backend requirements..."
$PIP_CMD install --upgrade pip --quiet
$PIP_CMD install -r requirements.txt --prefer-binary --quiet

echo -e "  🧪 Verifying backend models & database..."
$PY_RUNNER -c "from app.main import app; print('  ✓ Backend app & database verified successfully!')"

# ------------------------------------------------------------------------------
# 3. Build Frontend (React + Vite + TypeScript)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/4] Compiling & Building Frontend (React + Vite)...${NC}"
cd "${ROOT_DIR}/frontend"

if [ ! -d "node_modules" ]; then
    echo -e "  📦 Installing frontend dependencies via npm install..."
    $NPM_CMD install --silent
fi

echo -e "  ⚡ Running Vite Production Build..."
$NPM_CMD run build

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Error: Frontend build failed. dist/index.html not found.${NC}"
    exit 1
fi

echo -e "  ✓ Frontend built successfully in frontend/dist/"
ls -lh dist/index.html

# ------------------------------------------------------------------------------
# 4. Final Verification
# ------------------------------------------------------------------------------
cd "${ROOT_DIR}"
echo -e "\n${YELLOW}[4/4] Verifying Unified Production Serving...${NC}"

if [ -d "frontend/dist" ]; then
    echo -e "  ✓ SPA Static Assets ready to be served by FastAPI or Nginx."
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   ✨ Build Completed Successfully! ✨   ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "To start the production server, run:"
echo -e "  ${BLUE}./start.sh${NC} (or ${BLUE}bash start.sh${NC})\n"
