#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE="${STAGING_REMOTE:-pse-vps}"
REMOTE_DIR="${STAGING_REMOTE_DIR:-/srv/pse/tacos-sinaloa-staging}"
SERVICE="${STAGING_SERVICE:-tacos-sinaloa-staging.service}"
PUBLIC_URL="${STAGING_PUBLIC_URL:-https://staging-tacos.pilotsalesdistribution.com}"
TMP="/tmp/tacos-sinaloa-staging-deploy-$$"

cd "$ROOT"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "STAGING_DEPLOY=FAIL working tree is dirty; commit the preview first" >&2
  exit 2
fi

release="$(git rev-parse --short HEAD)"
echo "Deploying preview commit $release to $PUBLIC_URL"

git archive HEAD | ssh "$REMOTE" "rm -rf '$TMP' && mkdir -p '$TMP' && tar -x -C '$TMP'"

ssh "$REMOTE" "set -e
  ts=\$(date -u +%Y%m%dT%H%M%SZ)
  sudo mkdir -p /srv/pse/backups
  if [ -d '$REMOTE_DIR' ]; then
    sudo cp -a '$REMOTE_DIR' /srv/pse/backups/tacos-staging-\$ts
  fi
  sudo rsync -a --delete '$TMP/' '$REMOTE_DIR/'
  sudo chown -R root:root '$REMOTE_DIR'
  sudo chmod -R a+rX '$REMOTE_DIR'
  rm -rf '$TMP'
  sudo systemctl restart '$SERVICE'
  sleep 1
  curl -fsS http://127.0.0.1:4189/healthz
"

echo
curl -fsS "$PUBLIC_URL/healthz"
echo
headers="$(curl -fsSI "$PUBLIC_URL/")"
grep -qi '^x-robots-tag: noindex, nofollow, noarchive' <<<"$headers" || {
  echo "STAGING_DEPLOY=FAIL missing noindex guard" >&2
  exit 3
}
grep -qi '^x-pse-environment: staging' <<<"$headers" || {
  echo "STAGING_DEPLOY=FAIL missing staging environment header" >&2
  exit 4
}

echo "STAGING_DEPLOY=PASS commit=$release url=$PUBLIC_URL"
