#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 BASELINE_DIR CANDIDATE_DIR [MAX_DIFF_RATIO]" >&2
  exit 64
fi

BASELINE="$1"
CANDIDATE="$2"
MAX_RATIO="${3:-0.01}"
FAIL=0

for name in mobile tablet desktop; do
  a="$BASELINE/$name.png"
  b="$CANDIDATE/$name.png"
  [[ -f "$a" && -f "$b" ]] || { echo "FAIL missing screenshot $name" >&2; FAIL=1; continue; }

  dims_a="$(identify -format '%wx%h' "$a")"
  dims_b="$(identify -format '%wx%h' "$b")"
  if [[ "$dims_a" != "$dims_b" ]]; then
    echo "FAIL $name dimensions baseline=$dims_a candidate=$dims_b" >&2
    FAIL=1
    continue
  fi

  pixels="$(identify -format '%[fx:w*h]' "$a")"
  diff="$(compare -metric AE -fuzz 2% "$a" "$b" null: 2>&1 || true)"
  ratio="$(awk -v d="$diff" -v p="$pixels" 'BEGIN{if(p<=0){print 1}else{printf "%.8f",d/p}}')"
  echo "$name diff_pixels=$diff ratio=$ratio threshold=$MAX_RATIO"
  awk -v r="$ratio" -v m="$MAX_RATIO" 'BEGIN{exit !(r>m)}' && FAIL=1 || true
done

if [[ "$FAIL" -ne 0 ]]; then
  echo "VISUAL_REGRESSION=FAIL" >&2
  exit 1
fi
echo "VISUAL_REGRESSION=PASS"
