#!/usr/bin/env bash
# Rollback frontend/backend to .previous_tag on the production host.
set -euo pipefail

: "${DEPLOY_PATH:=/opt/zyrowaste}"
: "${PROD_HOST:?}"
: "${FRONTEND_IMAGE:?}"
: "${BACKEND_IMAGE:?}"
: "${SSH_USER:=root}"
: "${COMPOSE_PROJECT:=zyrowaste}"

REMOTE="${SSH_USER}@${PROD_HOST}"
COMPOSE_FILE="docker-compose.prod.yml"

echo "==> Rollback on ${REMOTE}"

ssh -o StrictHostKeyChecking=accept-new "${REMOTE}" bash -s <<REMOTE_RB
set -euo pipefail
cd '${DEPLOY_PATH}'
PREV=\$(cat .previous_tag 2>/dev/null || echo none)
if [[ "\$PREV" == "none" || -z "\$PREV" ]]; then
  echo "No previous tag recorded — cannot auto-rollback"
  exit 1
fi
echo "Rolling back to tag \$PREV"
set -a
source .env.production
set +a
export FRONTEND_IMAGE='${FRONTEND_IMAGE}'
export BACKEND_IMAGE='${BACKEND_IMAGE}'
export IMAGE_TAG="\$PREV"
export COMPOSE_PROJECT_NAME='${COMPOSE_PROJECT}'
docker compose -f '${COMPOSE_FILE}' --env-file .env.production pull frontend backend || true
docker compose -f '${COMPOSE_FILE}' --env-file .env.production up -d --no-deps --force-recreate backend frontend
docker compose -f '${COMPOSE_FILE}' --env-file .env.production up -d nginx
echo "\$PREV" > .current_tag
echo "Rollback complete: \$PREV"
REMOTE_RB
