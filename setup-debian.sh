#!/usr/bin/env bash
# ==============================================================================
# ShareMarket Pro / ScalpingPro - Debian & Ubuntu Automated Setup Script
# Repository: https://github.com/helpdeskdcp/scalpingpro.git
# Supported OS: Debian 11 (Bullseye), Debian 12 (Bookworm), Ubuntu 20.04/22.04/24.04
# ==============================================================================

set -e

# ANSI Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "======================================================================"
echo "    🚀 ShareMarket Pro / ScalpingPro - Production Debian Setup       "
echo "    Automated Installation & Deployment for Angel One SmartAPI        "
echo "======================================================================"
echo -e "${NC}"

# 1. Check Root / Sudo privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this script with sudo or as root.${NC}"
  echo -e "${YELLOW}Usage: sudo bash setup-debian.sh${NC}"
  exit 1
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURRENT_USER="${SUDO_USER:-$USER}"

echo -e "${BLUE}[STEP 1/6] Updating APT packages & installing prerequisites...${NC}"
apt-get update -y
apt-get install -y curl git build-essential ufw ca-certificates gnupg lsb-release

echo -e "${BLUE}[STEP 2/6] Installing Node.js 22 LTS via NodeSource...${NC}"
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg --yes
NODE_MAJOR=22
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
apt-get update -y
apt-get install -y nodejs

echo -e "${GREEN}✓ Node.js version:${NC} $(node -v)"
echo -e "${GREEN}✓ NPM version:${NC} $(npm -v)"

# Install PM2 globally for zero-downtime process management
echo -e "${BLUE}[STEP 3/6] Installing PM2 process manager globally...${NC}"
npm install -g pm2

# 4. Install Project Dependencies and Build
echo -e "${BLUE}[STEP 4/6] Installing NPM project dependencies & compiling...${NC}"
cd "$APP_DIR"
chown -R "$CURRENT_USER:$CURRENT_USER" "$APP_DIR"

# Run npm install as the non-root user to avoid permission conflicts
sudo -u "$CURRENT_USER" npm install

# Check .env file
if [ ! -f "$APP_DIR/.env" ]; then
  echo -e "${YELLOW}[CONFIG] .env file not found. Creating from .env.example...${NC}"
  sudo -u "$CURRENT_USER" cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo -e "${GREEN}✓ Created $APP_DIR/.env${NC}"
  echo -e "${CYAN}Please make sure to fill in your Angel One MPIN, TOTP Secret & API Key in .env!${NC}"
else
  echo -e "${GREEN}✓ Existing .env file detected.${NC}"
fi

# Build production bundle
echo -e "${BLUE}[STEP 5/6] Building production client assets & server bundle...${NC}"
sudo -u "$CURRENT_USER" npm run build

# 6. Setup Systemd Service
echo -e "${BLUE}[STEP 6/6] Configuring Systemd Service (scalpingpro.service)...${NC}"
SERVICE_FILE="/etc/systemd/system/scalpingpro.service"

cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=ShareMarket Pro / ScalpingPro Trading Terminal
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
EnvironmentFile=-$APP_DIR/.env
ExecStart=$(which node) $APP_DIR/dist/server.cjs
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=scalpingpro

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable scalpingpro
systemctl restart scalpingpro

# Configure Firewall for Port 3000
if command -v ufw >/dev/null 2>&1; then
  ufw allow 3000/tcp comment 'ScalpingPro Terminal Port' || true
fi

echo -e "\n${GREEN}${BOLD}======================================================================${NC}"
echo -e "${GREEN}${BOLD}    ✅ INSTALLATION & DEPLOYMENT COMPLETE SUCCESSFULLY!              ${NC}"
echo -e "${GREEN}${BOLD}======================================================================${NC}"
echo -e "\n${BOLD}Service Status:${NC}"
systemctl status scalpingpro --no-pager -n 5

echo -e "\n${CYAN}${BOLD}Useful Management Commands:${NC}"
echo -e "  • ${YELLOW}systemctl restart scalpingpro${NC}  -> Restart service"
echo -e "  • ${YELLOW}systemctl status scalpingpro${NC}   -> Check live service status"
echo -e "  • ${YELLOW}journalctl -u scalpingpro -f${NC}   -> View live logs (Angel One / Orders)"
echo -e "  • ${YELLOW}nano $APP_DIR/.env${NC}             -> Edit Angel One MPIN & TOTP keys"
echo -e "\n${GREEN}🌐 Access your trading terminal at: ${BOLD}http://localhost:3000${NC} (or your server's public IP on port 3000)\n"
