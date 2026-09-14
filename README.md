# 📈 ShareMarket Pro / ScalpingPro

**High-Frequency Derivatives Trading Terminal & AI Quantitative Strategy Engine**  
Seamlessly integrated with **Angel One SmartAPI** (MPIN & RFC-6238 Auto-TOTP), **Google Gemini AI**, and **Razorpay**.

🔗 **Repository:** [https://github.com/helpdeskdcp/scalpingpro.git](https://github.com/helpdeskdcp/scalpingpro.git)

---

## 🚀 Key Features

- **Angel One SmartAPI Live Trading**: Real-time authentication using **Client Code**, **MPIN**, and **Base32 TOTP Secret** (RFC-6238 pyotp-compatible with countdown timer and automated OTP generation).
- **F&O Options Matrix & Greeks**: Live strike pricing, open interest (OI), put-call ratio (PCR), delta, theta, vega, and gamma.
- **SEBI-Compliant Probabilistic AI Advisor**: Google Gemini powered regime detection with strict statistical win probability and risk-reward modeling.
- **Good-Till-Triggered (GTT) & Trailing Stop Loss**: Automated server-side execution and order trailing.
- **One-Click Strategy Backtest**: Historical option simulation across 6M, 1Y, and 3Y timeframes.
- **Multi-Channel Alerts**: Webhook dispatch for Telegram and WhatsApp notifications.
- **Razorpay Subscription Gateway**: Integrated trial and plan upgrades.

---

## ⚙️ Environment Variables Setup (`.env`)

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

Configure your credentials in `.env`:

```env
# ================================================================
# Angel One SmartAPI Credentials (Live / Sandbox)
# ================================================================
ANGELONE_API_KEY=your_smartapi_api_key_here
ANGELONE_CLIENT_CODE=your_angelone_client_code
ANGELONE_MPIN=your_4_or_6_digit_mpin
ANGELONE_TOTP_SECRET=your_base32_totp_secret_key
ANGELONE_AUTO_TOTP=true
ANGELONE_IS_LIVE=false

# ================================================================
# Google Gemini AI Strategy Advisor
# ================================================================
GEMINI_API_KEY=your_gemini_api_key_here

# ================================================================
# Razorpay Payment Gateway (Live / Test)
# ================================================================
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ================================================================
# Server Port
# ================================================================
PORT=3000
NODE_ENV=production
```

### 🔐 How to Get Angel One MPIN & TOTP Secret Key:
1. Log into your [Angel One SmartAPI Portal](https://smartapi.angelbroking.com/).
2. Navigate to your app to copy your **API Key** and **Client Code**.
3. Under Security / 2FA settings in Angel One, enable TOTP to receive your **Base32 TOTP Secret Key** (e.g., `JBSWY3DPEHPK3PXP`).
4. Set your **MPIN** (the 4-digit PIN you use on Angel One mobile app).
5. With `ANGELONE_AUTO_TOTP=true`, the server and terminal will automatically compute the 6-digit rolling TOTP code every 30 seconds.

---

## 🐧 Debian & Ubuntu One-Click Setup Script

We provide a production-ready automated deployment script `setup-debian.sh` tested on **Debian 11/12** and **Ubuntu 20.04/22.04/24.04**.

### 1. Run the Automated Installer:

```bash
# Clone the repository (if not already done)
git clone https://github.com/helpdeskdcp/scalpingpro.git
cd scalpingpro

# Make script executable and run with sudo
chmod +x setup-debian.sh
sudo ./setup-debian.sh
```

The script will automatically:
1. Update system packages and install prerequisites (`curl`, `git`, `build-essential`, `ufw`).
2. Install **Node.js 22 LTS** and **NPM**.
3. Install project dependencies and compile the production bundle (`npm run build`).
4. Generate `.env` from `.env.example`.
5. Install and configure **Systemd service (`scalpingpro.service`)** to start on system boot.
6. Open firewall port `3000`.

### 2. Manage the Systemd Service on Debian:

```bash
# Check service status
sudo systemctl status scalpingpro

# Restart service after updating .env
sudo systemctl restart scalpingpro

# View live application & trading logs
sudo journalctl -u scalpingpro -f

# Stop service
sudo systemctl stop scalpingpro
```

---

## 🛠️ Manual Installation (Any OS / Alternative)

If you prefer to install manually:

```bash
# 1. Install Node.js 22 LTS and npm
# 2. Install dependencies
npm install

# 3. Development Mode (with hot reload)
npm run dev

# 4. Production Build & Start
npm run build
npm start
```

---

## 📦 Deploying with PM2 (Optional)

If you prefer PM2 over systemd:

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## 🔄 How to Push Full Project Updates to GitHub

To push all updates, scripts, and fixes to `https://github.com/helpdeskdcp/scalpingpro.git`:

```bash
# 1. Check git status
git status

# 2. Add all changed and newly created files
git add .

# 3. Commit the changes
git commit -m "feat: Add Angel One MPIN/TOTP env support, Debian setup script, and backtest engine fixes"

# 4. Set remote URL (if not already configured)
git remote set-url origin https://github.com/helpdeskdcp/scalpingpro.git

# 5. Push updates to main branch
git branch -M main
git push -u origin main
```

---

## 📜 SEBI Regulatory Compliance Notice

Derivatives and intraday scalping involve substantial risk of loss. According to SEBI's study, 9 out of 10 individual traders in equity F&O incur net losses. This application is an analytical, algorithmic execution interface designed for educational and automated risk management. Zero profits are guaranteed.
