#!/usr/bin/env bash
# optimize-images.sh — batch-convert images to WebP (or AVIF) at a max width,
# then report before/after sizes and warn on anything over a weight budget.
#
# Usage:
#   optimize-images.sh <src-dir-or-file> <out-dir> [--width 2000] [--q 78]
#                       [--avif] [--budget-kb 200]
# Examples:
#   optimize-images.sh raw/ public/themes --width 1600 --q 78
#   optimize-images.sh hero.png public --width 2000 --q 82 --budget-kb 200
set -euo pipefail

[ $# -ge 2 ] || { sed -n '2,11p' "$0"; exit 2; }
SRC="$1"; OUTDIR="$2"; shift 2

WIDTH=2000; Q=78; FMT=webp; BUDGET=300
while [ $# -gt 0 ]; do
  case "$1" in
    --width)     WIDTH="$2"; shift 2;;
    --q)         Q="$2";     shift 2;;
    --avif)      FMT=avif;   shift 1;;
    --budget-kb) BUDGET="$2"; shift 2;;
    *) echo "unknown arg: $1" >&2; exit 2;;
  esac
done

if [ "$FMT" = avif ]; then command -v avifenc >/dev/null || { echo "avifenc not found" >&2; exit 1; }
else command -v cwebp >/dev/null || { echo "cwebp not found" >&2; exit 1; }; fi

mkdir -p "$OUTDIR"
# Collect inputs (file or directory).
if [ -f "$SRC" ]; then FILES=("$SRC")
else
  FILES=()
  while IFS= read -r -d '' f; do FILES+=("$f"); done \
    < <(find "$SRC" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) -print0)
fi
[ "${#FILES[@]}" -gt 0 ] || { echo "no images found in $SRC" >&2; exit 1; }

over=0
for f in "${FILES[@]}"; do
  base=$(basename "${f%.*}")
  out="$OUTDIR/$base.$FMT"
  before=$(du -k "$f" | cut -f1)
  if [ "$FMT" = avif ]; then
    avifenc --min 24 --max 30 -s 6 "$f" "$out" >/dev/null 2>&1
  else
    cwebp -quiet -q "$Q" -resize "$WIDTH" 0 "$f" -o "$out"
  fi
  after=$(du -k "$out" | cut -f1)
  flag=""
  if [ "$after" -gt "$BUDGET" ]; then flag="  ⚠ over ${BUDGET}KB budget"; over=$((over+1)); fi
  printf "  %-40s %5sKB → %5sKB%s\n" "$base.$FMT" "$before" "$after" "$flag"
done

echo "Done: ${#FILES[@]} image(s) → $OUTDIR (.$FMT). Over budget: $over"
echo "Tip: drop --q by 3-5 or reduce --width for anything flagged. Keep a 4K variant for heroes."
exit "$over"
