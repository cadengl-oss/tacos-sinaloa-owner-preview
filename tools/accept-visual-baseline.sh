#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT/tools/release-config.env"
RELEASE="${1:-$VISUAL_BASELINE_RELEASE}"
BASELINE_ROOT="${BASELINE_ROOT:-/home/president/Work/tacos-sinaloa-visual-baselines}"
TARGET="$BASELINE_ROOT/$RELEASE"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

BASE_URL="${BASE_URL:-https://tacos.pilotsalesdistribution.com}" EXPECTED_RELEASE="${EXPECTED_RELEASE}" EXPECTED_ASSET_TOKEN="${EXPECTED_ASSET_TOKEN}" AUDIT_OUT="$TMP" node "$ROOT/tools/release-audit.cjs"

mkdir -p "$TARGET"
for name in mobile.png tablet.png desktop.png audit.json; do
  cp "$TMP/$name" "$TARGET/$name"
done
printf '%s
' "release=$RELEASE" "accepted_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >"$TARGET/MANIFEST.txt"
sha256sum "$TARGET"/mobile.png "$TARGET"/tablet.png "$TARGET"/desktop.png >"$TARGET/SHA256SUMS"
echo "VISUAL_BASELINE_ACCEPTED=$TARGET"
