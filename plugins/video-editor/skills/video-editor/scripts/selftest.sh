#!/usr/bin/env bash
# selftest.sh: prove the whole editor works on this computer with a made-up 5-second clip.
#
# Usage: selftest.sh [work dir]   (default: ~/video-editor-selftest)
# A synthetic voice says a line with a filler and a restart in it; the editor should cut both,
# caption the rest, render, master and pass QA. Takes about 4 minutes in a fresh session.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
work="${1:-$HOME/video-editor-selftest}"
rm -rf "$work" && mkdir -p "$work"

bash "$here/setup.sh"
ffmpeg -hide_banner -v error -y \
  -f lavfi -i "testsrc2=size=720x1280:rate=30" \
  -f lavfi -i "flite=text='Um. Wait, let me start over. This is a quick test of the video editor. It should keep this line.':voice=slt" \
  -map 0:v -map 1:a -shortest -c:v libx264 -pix_fmt yuv420p -c:a aac "$work/test-take.mp4"

python3 -I "$here/prepare.py" "$work/test-take.mp4" "$work/project"
bash "$here/transcribe.sh" "$work/project"
python3 -I "$here/suggest_cut.py" "$work/project"
python3 -I "$here/render_cut.py" "$work/project"
mkdir -p "$work/project/reel"
echo '{"hook": ["Self test", "it works"], "key_words": ["editor"]}' > "$work/project/reel/plan.json"
bash "$here/render.sh" "$work/project" selftest --draft
python3 -I "$here/qa.py" "$work/project" "$work/project/final/selftest.mp4"
echo "Self test passed: $work/project/final/selftest.mp4"
