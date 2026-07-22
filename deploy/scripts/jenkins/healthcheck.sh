#!/usr/bin/env bash
# Smoke checks against public domain after deploy.
set -euo pipefail

HEALTH_URL="${1:-https://zyrowaste.com/api/health}"
SITE_URL="${2:-https://zyrowaste.com/}"
RETRIES="${3:-30}"
SLEEP_SECS="${4:-10}"

echo "==> Health: ${HEALTH_URL} (retries=${RETRIES})"

ok=0
for i in $(seq 1 "${RETRIES}"); do
  code=$(curl -k -s -o /tmp/zyrowaste_health.json -w "%{http_code}" --max-time 15 "${HEALTH_URL}" || echo "000")
  body=$(cat /tmp/zyrowaste_health.json 2>/dev/null || true)
  if [[ "${code}" == "200" ]] && echo "${body}" | grep -qi 'healthy'; then
    echo "API healthy (attempt ${i}): ${body}"
    ok=1
    break
  fi
  echo "Attempt ${i}/${RETRIES}: HTTP ${code} body=${body}"
  sleep "${SLEEP_SECS}"
done

if [[ "${ok}" != "1" ]]; then
  echo "ERROR: API health check failed"
  exit 1
fi

site_code=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time 15 "${SITE_URL}" || echo "000")
if [[ "${site_code}" != "200" && "${site_code}" != "301" && "${site_code}" != "302" ]]; then
  echo "ERROR: Site check failed HTTP ${site_code} for ${SITE_URL}"
  exit 1
fi

echo "Site OK HTTP ${site_code} — ${SITE_URL}"
echo "Smoke checks passed"
