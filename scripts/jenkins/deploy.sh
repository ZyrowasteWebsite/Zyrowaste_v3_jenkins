#!/usr/bin/env bash
# Rolling deploy to production droplet with health-gated cutover.
# Expects: ssh-agent with prod key; Docker registry login on remote (or local images via save/load).
set -euo pipefail

: "${FRONTEND_IMAGE:?}"
: "${BACKEND_IMAGE:?}"
: "${IMAGE_TAG:?}"
: "${DEPLOY_PATH:=/opt/zyrowaste}"
: "${PROD_HOST:?}"
: "${COMPOSE_PROJECT:=zyrowaste}"
: "${DOMAIN:=zyrowaste.com}"
: "${SSH_USER:=root}"

REMOTE="${SSH_USER}@${PROD_HOST}"
COMPOSE_FILE="docker-compose.prod.yml"

echo "==> Deploying Zyrowaste tag=${IMAGE_TAG} → ${REMOTE}:${DEPLOY_PATH}"

# Sync compose + nginx + scripts (secrets stay on server as .env.production)
rsync -az --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.venv' \
  --exclude 'chroma_db' \
  --exclude '.env' \
  --exclude '.env.*' \
  --include 'docker-compose.prod.yml' \
  --include 'infrastructure/***' \
  --include 'scripts/jenkins/***' \
  --exclude '*' \
  ./ "${REMOTE}:${DEPLOY_PATH}/" || true

# Ensure required files exist on remote (full sync of deploy artifacts)
ssh -o StrictHostKeyChecking=accept-new "${REMOTE}" "mkdir -p '${DEPLOY_PATH}/infrastructure/nginx/ssl' '${DEPLOY_PATH}/scripts/jenkins'"

scp -o StrictHostKeyChecking=accept-new \
  docker-compose.prod.yml \
  "${REMOTE}:${DEPLOY_PATH}/docker-compose.prod.yml"

scp -o StrictHostKeyChecking=accept-new \
  infrastructure/nginx/zyrowaste.conf \
  "${REMOTE}:${DEPLOY_PATH}/infrastructure/nginx/zyrowaste.conf"

scp -o StrictHostKeyChecking=accept-new \
  scripts/jenkins/healthcheck.sh \
  scripts/jenkins/rollback.sh \
  "${REMOTE}:${DEPLOY_PATH}/scripts/jenkins/"

# Record previous tag for rollback
ssh "${REMOTE}" bash -s <<REMOTE_PRE
set -euo pipefail
cd '${DEPLOY_PATH}'
if [[ -f .current_tag ]]; then
  cp .current_tag .previous_tag
else
  echo 'none' > .previous_tag
fi
echo '${IMAGE_TAG}' > .current_tag
REMOTE_PRE

# Pull + rolling recreate (start-first style: new containers up, then remove old)
ssh "${REMOTE}" bash -s <<REMOTE_DEPLOY
set -euo pipefail
cd '${DEPLOY_PATH}'

if [[ ! -f .env.production ]]; then
  echo "ERROR: ${DEPLOY_PATH}/.env.production missing on server. Create it before deploy."
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env.production
set +a

export FRONTEND_IMAGE='${FRONTEND_IMAGE}'
export BACKEND_IMAGE='${BACKEND_IMAGE}'
export IMAGE_TAG='${IMAGE_TAG}'
export COMPOSE_PROJECT_NAME='${COMPOSE_PROJECT}'

# Login to registry if credentials present on server
if [[ -n "\${DOCKER_REGISTRY:-}" && -n "\${DOCKER_USER:-}" && -n "\${DOCKER_PASSWORD:-}" ]]; then
  echo "\$DOCKER_PASSWORD" | docker login "\$DOCKER_REGISTRY" -u "\$DOCKER_USER" --password-stdin
fi

docker compose -f '${COMPOSE_FILE}' --env-file .env.production pull frontend backend || true

# Rolling: recreate app tiers without stopping data plane first
docker compose -f '${COMPOSE_FILE}' --env-file .env.production up -d --no-deps --force-recreate --remove-orphans backend
echo "Waiting for backend healthy..."
for i in \$(seq 1 40); do
  if docker compose -f '${COMPOSE_FILE}' --env-file .env.production ps backend | grep -qi healthy; then
    echo "Backend healthy"
    break
  fi
  if [[ \$i -eq 40 ]]; then
    echo "Backend failed healthcheck"
    docker compose -f '${COMPOSE_FILE}' --env-file .env.production logs --tail=80 backend
    exit 1
  fi
  sleep 5
done

docker compose -f '${COMPOSE_FILE}' --env-file .env.production up -d --no-deps --force-recreate --remove-orphans frontend
echo "Waiting for frontend healthy..."
for i in \$(seq 1 30); do
  if docker compose -f '${COMPOSE_FILE}' --env-file .env.production ps frontend | grep -qi healthy; then
    echo "Frontend healthy"
    break
  fi
  if [[ \$i -eq 30 ]]; then
    echo "Frontend failed healthcheck"
    docker compose -f '${COMPOSE_FILE}' --env-file .env.production logs --tail=80 frontend
    exit 1
  fi
  sleep 4
done

# Ensure data services + edge proxy are up (idempotent)
docker compose -f '${COMPOSE_FILE}' --env-file .env.production up -d postgres redis chromadb nginx

# Reload nginx config without dropping connections where possible
docker compose -f '${COMPOSE_FILE}' --env-file .env.production exec -T nginx nginx -s reload || \
  docker compose -f '${COMPOSE_FILE}' --env-file .env.production up -d --force-recreate nginx

docker image prune -f >/dev/null 2>&1 || true
echo "Deploy complete: ${IMAGE_TAG}"
REMOTE_DEPLOY

echo "==> Remote deploy finished"
