#!/usr/bin/env bash
# ==============================================================================
# ScalpingPro & Angel One SmartAPI Production Setup Script for Debian / Ubuntu VPS
# One-Key Systematic Installer & Updater
# Usage:
#   chmod +x deploy.sh
#   sudo ./deploy.sh
# ==============================================================================

set -euo pipefail

# Visual styling
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "==================================================================="
echo "  🚀 SCALPING PRO & ANGEL ONE SMARTAPI - DEBIAN VPS INSTALLER     "
echo "==================================================================="
echo -e "${NC}"

# Check for root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this script with sudo or as root.${NC}"
  exit 1
fi

APP_DIR=$(pwd)
APP_NAME="scalping-pro"
PORT=3000

echo -e "${GREEN}[1/7] Updating Debian System Packages...${NC}"
apt-get update -y
apt-get install -y curl wget git build-essential ufw nginx

echo -e "${GREEN}[2/7] Checking & Installing Node.js 20 LTS...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 20 ]]; then
  echo -e "${YELLOW}Installing Node.js 20 LTS from NodeSource...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo -e "Node.js version: ${BOLD}$(node -v)${NC}"
echo -e "NPM version: ${BOLD}$(npm -v)${NC}"

echo -e "${GREEN}[3/7] Installing PM2 Process Manager...${NC}"
npm install -g pm2

echo -e "${GREEN}[4/7] Installing Project Dependencies & Building App...${NC}"
cd "$APP_DIR"
npm install --production=false
npm run build

echo -e "${GREEN}[5/7] Setting up Environment Configuration...${NC}"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${YELLOW}Created .env from .env.example. Please update your Angel One API keys & JWT secrets in .env!${NC}"
  else
    cat <<EOF > .env
PORT=3000
NODE_ENV=production
ANGEL_API_KEY=
ANGEL_CLIENT_CODE=
ANGEL_PASSWORD=
ANGEL_TOTP_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF
    echo -e "${YELLOW}Generated clean .env configuration file.${NC}"
  fi
fi

echo -e "${GREEN}[6/7] Configuring Nginx Reverse Proxy on Port 80...${NC}"
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"

cat <<EOF > "$NGINX_CONF"
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket support for 100ms real-time scalping feed
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
EOF

# Enable site in nginx
ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$APP_NAME"
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo -e "${GREEN}[7/7] Launching App via PM2 Daemon with Auto-Restart...${NC}"
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start npm --name "$APP_NAME" -- run start
pm2 save
pm2 startup systemd -u root --hp /root || true

# Setup UFW firewall
echo -e "${GREEN}Configuring UFW Firewall (SSH, HTTP, HTTPS)...${NC}"
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
ufw --force enable || true

SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "${CYAN}${BOLD}"
echo "==================================================================="
echo "  🎉 DEBIAN VPS ONE-KEY DEPLOYMENT SUCCESSFUL!                     "
echo "==================================================================="
echo -e "${NC}"
echo -e "Access your Terminal at: ${GREEN}${BOLD}http://${SERVER_IP}${NC}"
echo -e "PM2 Status: ${BOLD}pm2 status${NC}"
echo -e "Real-time Logs: ${BOLD}pm2 logs ${APP_NAME}${NC}"
echo -e "Restart Server: ${BOLD}pm2 restart ${APP_NAME}${NC}"
echo -e "To configure SSL Certbot: ${BOLD}apt-get install -y certbot python3-certbot-nginx && certbot --nginx${NC}"
echo ""
