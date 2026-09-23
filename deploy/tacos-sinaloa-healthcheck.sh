#!/usr/bin/env bash
set -euo pipefail

PUBLIC_BASE="https://tacos.pilotsalesdistribution.com"
ORIGIN_BASE="http://127.0.0.1:4188"
STATE_DIR="/var/lib/pse"
STATE_FILE="$STATE_DIR/tacos-sinaloa-health.json"
TMP_HEADERS="$(mktemp)"
trap 'rm -f "$TMP_HEADERS"' EXIT

check_code() {
  local url="$1" expected="${2:-200}" code
  code="$(curl -fsS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "$url" || true)"
  if [[ "$code" != "$expected" ]]; then
    echo "FAIL url=$url expected=$expected got=${code:-000}" >&2
    return 1
  fi
}

check_code "$ORIGIN_BASE/healthz"
check_code "$PUBLIC_BASE/healthz"
check_code "$PUBLIC_BASE/robots.txt"
check_code "$PUBLIC_BASE/sitemap.xml"
check_code "$PUBLIC_BASE/favicon.ico"
check_code "$PUBLIC_BASE/content/menu.json"
check_code "$PUBLIC_BASE/content/reviews.json"

curl -fsSI --connect-timeout 5 --max-time 15 "$PUBLIC_BASE/" >"$TMP_HEADERS"
for header in   "content-security-policy:"   "strict-transport-security:"   "x-content-type-options:"   "x-frame-options:"   "referrer-policy:"   "permissions-policy:"; do
  if ! grep -qi "^$header" "$TMP_HEADERS"; then
    echo "FAIL missing_header=$header" >&2
    exit 1
  fi
done

mkdir -p "$STATE_DIR"
now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf '{"status":"ok","checked_at":"%s","public":"%s","origin":"%s"}\n'   "$now" "$PUBLIC_BASE" "$ORIGIN_BASE" >"$STATE_FILE"
chmod 0644 "$STATE_FILE"
echo "PASS tacos-sinaloa checked_at=$now"
