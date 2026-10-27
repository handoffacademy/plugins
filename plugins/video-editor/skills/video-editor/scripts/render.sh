#!/usr/bin/env bash
# render.sh: build the composition, check it, render it with HyperFrames and master the sound.
#
# Usage: render.sh <project dir> <name> [--draft]
# Writes <project>/final/<name>.mp4 (1080x1920, 30 fps, -14 LUFS, true peak -1.5 dBTP).
# --draft renders faster at lower quality, for a first look. Rendering takes about 9 seconds per second
# of video on a 2-CPU cloud computer, so a 45-second video takes about 7 minutes.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
source "$here/env.sh"

project="$(cd "$1" && pwd)"
name="$2"
quality="looks"
if [ "${3:-}" = "--draft" ]; then quality="draft"; fi
hf() { npx -y "hyperframes@$HF_VERSION" "$@"; }

if [ ! -f "$project/reel/hyperframes.json" ] && [ ! -f "$project/reel/meta.json" ]; then
  plan_backup=""
  if [ -f "$project/reel/plan.json" ]; then plan_backup="$(mktemp)"; cp "$project/reel/plan.json" "$plan_backup"; fi
  rm -rf "$project/reel.tmp"
  (cd "$project" && hf init reel.tmp --non-interactive --example=blank --resolution portrait --skip-skills > "$project/edit/init.log" 2>&1) \
    || { tail -20 "$project/edit/init.log"; exit 1; }
  mkdir -p "$project/reel"
  cp -R "$project/reel.tmp/." "$project/reel/"
  rm -rf "$project/reel.tmp"
  if [ -n "$plan_backup" ]; then cp "$plan_backup" "$project/reel/plan.json"; fi
fi

python3 -I "$here/build_reel.py" "$project" ${BRAND:+--brand "$BRAND"}
(cd "$project/reel" && hf lint) || { echo "lint found problems: fix the plan or the brand file, then run this again"; exit 1; }
(cd "$project/reel" && hf render --fps 30 --workers 1 --quality "$quality" --output "$project/edit/render.mp4" > "$project/edit/render.log" 2>&1) \
  || { tail -30 "$project/edit/render.log"; exit 1; }
mkdir -p "$project/final"
bash "$here/master.sh" "$project/edit/render.mp4" "$project/final/$name.mp4"
echo "finished: $project/final/$name.mp4"
