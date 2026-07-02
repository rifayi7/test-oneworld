#!/usr/bin/env bash
# encode-scrub.sh — encode a source video into all-intra HEVC + H.264 for
# scroll-scrubbing (every frame a keyframe, so seeks decode instantly).
# Produces <out>.mp4 (H.264) and <out>-hevc.mp4 (HEVC, hvc1-tagged for Safari).
#
# Usage:
#   encode-scrub.sh <input> <out-basename> [--width 1280] [--fps 24] [--crf 18]
# Example:
#   encode-scrub.sh media-src/master.mp4 public/spotlight-scrub
#
# The fps MUST match the client scrub fps (utils/videoScrub.ts). Default 24.
set -euo pipefail

command -v ffmpeg  >/dev/null || { echo "ffmpeg not found"  >&2; exit 1; }
command -v ffprobe >/dev/null || { echo "ffprobe not found" >&2; exit 1; }

[ $# -ge 2 ] || { sed -n '2,12p' "$0"; exit 2; }
IN="$1"; OUT="$2"; shift 2
[ -f "$IN" ] || { echo "input not found: $IN" >&2; exit 1; }

WIDTH=1280; FPS=24; CRF=18
while [ $# -gt 0 ]; do
  case "$1" in
    --width) WIDTH="$2"; shift 2;;
    --fps)   FPS="$2";   shift 2;;
    --crf)   CRF="$2";   shift 2;;
    *) echo "unknown arg: $1" >&2; exit 2;;
  esac
done

H264="${OUT}.mp4"
HEVC="${OUT}-hevc.mp4"
VF="scale=${WIDTH}:-2,fps=${FPS}"

echo "→ H.264 all-intra  ($WIDTH px, ${FPS}fps, crf $CRF) → $H264"
ffmpeg -y -loglevel error -i "$IN" -an -vf "$VF" \
  -c:v libx264 -preset slow -crf "$CRF" \
  -x264-params "keyint=1:min-keyint=1:no-scenecut=1:bframes=0" \
  -pix_fmt yuv420p -movflags +faststart "$H264"

echo "→ HEVC all-intra   (hvc1 for Safari) → $HEVC"
ffmpeg -y -loglevel error -i "$IN" -an -vf "$VF" \
  -c:v libx265 -preset slow -crf "$((CRF + 2))" \
  -x265-params "keyint=1:min-keyint=1:no-scenecut=1:bframes=0" \
  -tag:v hvc1 -pix_fmt yuv420p -movflags +faststart "$HEVC"

# Verify all-intra (has_b_frames must be 0) and report.
for f in "$H264" "$HEVC"; do
  probe=$(ffprobe -v error -select_streams v:0 \
    -show_entries stream=codec_name,width,height,r_frame_rate,has_b_frames \
    -of default=noprint_wrappers=1:nokey=0 "$f")
  bframes=$(echo "$probe" | awk -F= '/has_b_frames/{print $2}')
  size=$(ls -lh "$f" | awk '{print $5}')
  echo "  $f  ($size)"
  echo "$probe" | sed 's/^/    /'
  [ "$bframes" = "0" ] || echo "    ⚠ has_b_frames=$bframes (NOT all-intra — scrubbing will stutter)"
done
echo "Done. Wire paths into content.ts and gate playback behind prefers-reduced-motion."
