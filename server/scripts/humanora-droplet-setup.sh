#!/usr/bin/env bash
# Humanora API: one-shot setup for a fresh Ubuntu 24.04 DigitalOcean droplet (Sydney, syd1).
# Run as root:  bash humanora-droplet-setup.sh api.humanora.com.au
# Afterwards, edit /etc/humanora/api.env (secrets) then: systemctl restart humanora-api
set -euo pipefail

DOMAIN="${1:?Usage: bash humanora-droplet-setup.sh <api-domain, e.g. api.humanora.com.au>}"
APP_DIR=/opt/humanora
DATA_DIR=/var/lib/humanora
ENV_FILE=/etc/humanora/api.env
REPO=https://github.com/sventer667/psychsafe-web.git

echo "== 1. Base packages, firewall =="
apt-get update -y
apt-get install -y curl git ufw debian-keyring debian-archive-keyring apt-transport-https gnupg
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "== 2. Node 22 (needed for node:sqlite) =="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "== 3. Caddy (automatic HTTPS) =="
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
apt-get update -y
apt-get install -y caddy
cat > /etc/caddy/Caddyfile <<EOF
${DOMAIN} {
  reverse_proxy 127.0.0.1:4000
}
EOF
systemctl reload caddy || systemctl restart caddy

echo "== 4. App user, code, build =="
id humanora >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin humanora
mkdir -p "$DATA_DIR" /etc/humanora
if [ -d "$APP_DIR/.git" ]; then git -C "$APP_DIR" pull; else git clone "$REPO" "$APP_DIR"; fi
cd "$APP_DIR/server"
npm install
npm run build
chown -R humanora:humanora "$APP_DIR" "$DATA_DIR"

echo "== 5. Environment file (fill in the secrets) =="
if [ ! -f "$ENV_FILE" ]; then
cat > "$ENV_FILE" <<'EOF'
PORT=4000
NODE_ENV=production
DATABASE_PATH=/var/lib/humanora/humanora.db
# Copy every value below from the Render connexus-api service > Environment
JWT_SECRET=
CLIENT_URL=https://connexus-app.onrender.com
APP_URL=https://connexus-app.onrender.com
API_URL=https://api.humanora.com.au
EMAIL_FROM=Humanora <hello@humanora.com.au>
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PREVIEW_ACCESS_SECRET=
MAINTENANCE_MODE=true
EOF
chmod 600 "$ENV_FILE"
fi

echo "== 6. systemd service =="
cat > /etc/systemd/system/humanora-api.service <<EOF
[Unit]
Description=Humanora API
After=network.target

[Service]
User=humanora
WorkingDirectory=$APP_DIR/server
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=3
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable humanora-api

echo "== 7. Nightly local backup (7 days kept) =="
cat > /usr/local/bin/humanora-backup.sh <<'EOF'
#!/usr/bin/env bash
set -e
mkdir -p /var/backups/humanora
node -e "const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('/var/lib/humanora/humanora.db');d.exec(\"VACUUM INTO '/var/backups/humanora/humanora-\$(date +%F).db'\".replace('\$(date +%F)', new Date().toISOString().slice(0,10)))"
find /var/backups/humanora -name '*.db' -mtime +7 -delete
EOF
chmod +x /usr/local/bin/humanora-backup.sh
echo "15 2 * * * root /usr/local/bin/humanora-backup.sh" > /etc/cron.d/humanora-backup

echo
echo "DONE. Next:"
echo "  1. nano $ENV_FILE   (fill in secrets)"
echo "  2. systemctl start humanora-api && systemctl status humanora-api"
echo "  3. curl https://${DOMAIN}/api/health   (once the DNS A record points here)"
