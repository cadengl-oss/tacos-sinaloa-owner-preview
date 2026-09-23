#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT/tools/release-config.env"
BASE_URL="${BASE_URL:-https://tacos.pilotsalesdistribution.com}"
EXPECTED_RELEASE="${EXPECTED_RELEASE:-v6.13}"
EXPECTED_ASSET_TOKEN="${EXPECTED_ASSET_TOKEN:-20260922-v613}"
STAMP="${AUDIT_STAMP:-$(date -u +%Y%m%dT%H%M%SZ)}"
OUT="${AUDIT_OUT:-$ROOT/audit-output/$STAMP}"

mkdir -p "$OUT"

echo "== content validators =="
python3 "$ROOT/tools/validate-menu.py"
python3 "$ROOT/tools/validate-reviews.py"

echo "== static checks =="
python3 -m py_compile "$ROOT/server.py"
rm -rf "$ROOT/__pycache__"
git -C "$ROOT" diff --check

echo "== endpoint/header checks =="
for path in / /healthz /robots.txt /sitemap.xml /favicon.ico /content/menu.json /content/reviews.json; do
  code="$(curl -fsS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 15 "$BASE_URL$path" || true)"
  [[ "$code" == "200" ]] || { echo "FAIL $path HTTP $code" >&2; exit 1; }
done

headers="$(mktemp)"
trap 'rm -f "$headers"' EXIT
curl -fsSI --connect-timeout 5 --max-time 15 "$BASE_URL/" >"$headers"
for header in content-security-policy strict-transport-security x-content-type-options x-frame-options referrer-policy permissions-policy; do
  grep -qi "^$header:" "$headers" || { echo "FAIL missing header $header" >&2; exit 1; }
done

echo "== browser/release audit =="
(
  cd "$ROOT"
  BASE_URL="$BASE_URL" EXPECTED_RELEASE="$EXPECTED_RELEASE" EXPECTED_ASSET_TOKEN="$EXPECTED_ASSET_TOKEN" AUDIT_OUT="$OUT" node tools/release-audit.cjs
)


BASELINE_DIR="${VISUAL_BASELINE_DIR:-/home/president/Work/tacos-sinaloa-visual-baselines/${VISUAL_BASELINE_RELEASE}}"
if [[ -d "$BASELINE_DIR" ]]; then
  echo "== visual regression =="
  "$ROOT/tools/visual-regression.sh" "$BASELINE_DIR" "$OUT" "${MAX_VISUAL_DIFF_RATIO:-0.01}"
else
  echo "WARN visual baseline not found: $BASELINE_DIR" >&2
fi

echo "RELEASE_CHECK=PASS"
echo "output=$OUT"
