#!/usr/bin/env bash
# ==============================================================================
# Milk Hisab (मिल्क हिसाब) - Automated AWS EC2 Server Setup Script
# Target OS: Ubuntu 22.04 LTS / 24.04 LTS
# Usage: sudo bash setup-ec2.sh
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root (sudo bash setup-ec2.sh)${NC}"
  exit 1
fi

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   🥛 Milk Hisab - AWS EC2 Automated Provisioning   ${NC}"
echo -e "${BLUE}======================================================${NC}"

APP_DIR="/var/www/milkhisab"
LOG_DIR="/var/log/milkhisab"
REPO_URL="https://github.com/sanjayyadav138/milk-hisab.git"
TARGET_USER="ubuntu"

# ------------------------------------------------------------------------------
# 1. System Package Updates & Tools
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[1/7] Updating apt repositories and packages...${NC}"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo -e "  📥 Installing core build tools, Python, Nginx & Certbot..."
apt-get install -y --no-install-recommends \
    git curl ufw \
    python3 python3-pip python3-venv python3-dev build-essential \
    nginx certbot python3-certbot-nginx

# ------------------------------------------------------------------------------
# 2. Install Node.js 20 LTS (NodeSource)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/7] Installing Node.js 20 LTS...${NC}"
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo -e "  ✓ Node: $(node -v) | npm: $(npm -v)"

# ------------------------------------------------------------------------------
# 3. Create Directories & Clone/Sync Repository
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/7] Setting up application repository at ${APP_DIR}...${NC}"
mkdir -p "$APP_DIR"
mkdir -p "$LOG_DIR"
mkdir -p "/var/backups/milkhisab"

chown -R $TARGET_USER:$TARGET_USER "$APP_DIR" "$LOG_DIR" "/var/backups/milkhisab"

if [ ! -d "${APP_DIR}/.git" ]; then
    echo -e "  Cloning repository..."
    sudo -u $TARGET_USER git clone "$REPO_URL" "$APP_DIR"
else
    echo -e "  Pulling latest changes from git..."
    cd "$APP_DIR"
    sudo -u $TARGET_USER git pull origin main
fi

# ------------------------------------------------------------------------------
# 4. Setup Backend Environment (Python + Gunicorn)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/7] Setting up Python backend virtual environment...${NC}"
cd "${APP_DIR}/backend"

if [ ! -d "venv" ]; then
    sudo -u $TARGET_USER python3 -m venv venv
fi

sudo -u $TARGET_USER ./venv/bin/pip install --upgrade pip --quiet
sudo -u $TARGET_USER ./venv/bin/pip install -r requirements.txt --prefer-binary --quiet

# Verify backend
sudo -u $TARGET_USER ./venv/bin/python -c "from app.main import app; print('  ✓ Backend imports verified!')"

# ------------------------------------------------------------------------------
# 5. Build Frontend (React + Vite)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/7] Compiling Frontend for Production...${NC}"
cd "${APP_DIR}/frontend"

sudo -u $TARGET_USER npm ci --silent || sudo -u $TARGET_USER npm install --silent
sudo -u $TARGET_USER npm run build

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Frontend build failed! dist/index.html missing.${NC}"
    exit 1
fi
echo -e "  ✓ Frontend compiled successfully."

# ------------------------------------------------------------------------------
# 6. Configure Systemd Service & Nginx
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[6/7] Configuring Systemd and Nginx...${NC}"

# Install Systemd service
cp "${APP_DIR}/deploy/milkhisab.service" /etc/systemd/system/milkhisab.service
systemctl daemon-reload
systemctl enable milkhisab.service
systemctl restart milkhisab.service

# Install Nginx configuration
cp "${APP_DIR}/deploy/nginx.conf" /etc/nginx/sites-available/milkhisab
ln -sf /etc/nginx/sites-available/milkhisab /etc/nginx/sites-enabled/milkhisab
rm -f /etc/nginx/sites-enabled/default

# Test Nginx
nginx -t
systemctl reload nginx

# ------------------------------------------------------------------------------
# 7. Configure Firewall (UFW)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[7/7] Configuring UFW Firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   ✨ Milk Hisab Deployed Successfully on EC2! ✨   ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "  Backend Service: systemctl status milkhisab"
echo -e "  Nginx Service:   systemctl status nginx"
echo -e "  Logs:            tail -f ${LOG_DIR}/error.log"
echo -e "\n${BLUE}Next Step: SSL Certificate with Let's Encrypt${NC}"
echo -e "Once your GoDaddy DNS (milkhisab.in) points to this server's Public IP, run:"
echo -e "  ${YELLOW}sudo certbot --nginx -d milkhisab.in -d www.milkhisab.in${NC}\n"
