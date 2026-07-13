#!/usr/bin/env bash
# One-time bootstrap on the production droplet (DigitalOcean / VPS).
# Run as root: bash bootstrap-server.sh
set -euo pipefail

DOMAIN="${DOMAIN:-zyrowaste.com}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/zyrowaste}"
EMAIL="${CERTBOT_EMAIL:-admin@${DOMAIN}}"

echo "==> Installing Docker + Compose plugin"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

apt-get update -y
apt-get install -y rsync curl ufw git

echo "==> Firewall (22, 80, 443)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable || true

mkdir -p "${DEPLOY_PATH}/infrastructure/nginx/ssl" \
         "${DEPLOY_PATH}/scripts/jenkins" \
         /var/www/certbot

echo "==> Place repo files under ${DEPLOY_PATH}"
echo "    Required: docker-compose.prod.yml, infrastructure/nginx/zyrowaste.conf, .env.production"

if [[ ! -f "${DEPLOY_PATH}/.env.production" ]]; then
  cat > "${DEPLOY_PATH}/.env.production" <<'EOF'
# Copy from .env.production.example and fill secrets
GROQ_API_KEY=
JWT_SECRET=
POSTGRES_USER=zyrowaste
POSTGRES_PASSWORD=CHANGE_ME_STRONG
POSTGRES_DB=zyrowaste
DATABASE_URL=postgresql+psycopg2://zyrowaste:CHANGE_ME_STRONG@postgres:5432/zyrowaste
CORS_ORIGINS=https://zyrowaste.com,https://www.zyrowaste.com
FRONTEND_IMAGE=ghcr.io/zyrowaste/frontend
BACKEND_IMAGE=ghcr.io/zyrowaste/backend
IMAGE_TAG=latest
EOF
  chmod 600 "${DEPLOY_PATH}/.env.production"
  echo "Created template ${DEPLOY_PATH}/.env.production — EDIT SECRETS NOW"
fi

echo "==> Initial HTTP-only start tip (before certs):"
echo "    Temporarily comment ssl_* lines / use HTTP-only server, OR run certbot standalone once."
echo ""
echo "==> Issue TLS certificate (DNS A/AAAA must already point to this server):"
cat <<EOF
# Stop anything on :80 briefly if needed, then:
docker run --rm -p 80:80 -v ${DEPLOY_PATH}/infrastructure/nginx/ssl:/etc/letsencrypt \\
  certbot/certbot certonly --standalone -d ${DOMAIN} -d www.${DOMAIN} \\
  --email ${EMAIL} --agree-tos --non-interactive

# Certs land in: ${DEPLOY_PATH}/infrastructure/nginx/ssl/live/${DOMAIN}/
EOF

echo "==> After .env.production is filled and images exist:"
echo "    cd ${DEPLOY_PATH} && docker compose -f docker-compose.prod.yml up -d"
echo "Done bootstrap."
