#!/usr/bin/env bash
# setup.sh: get Claude's cloud computer ready to edit. Safe to run again; it skips what's already there.
#
# Usage: setup.sh            (prints a checklist; exits 1 when something is missing)
# Installs into ~/.video-editor: GSAP (animation library, from npm). Warms HyperFrames (npm) and its
# headless Chrome. Transcription (whisper and its model) installs on first use in transcribe.sh.
# Needs internet access for code: npm, github.com, huggingface.co and storage.googleapis.com.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
source "$here/env.sh"
mkdir -p "$VE_HOME"
ok=0
line() { printf '%-28s %s\n' "$1" "$2"; }

if command -v ffmpeg > /dev/null && ffmpeg -hide_banner -filters 2> /dev/null | grep -q " loudnorm "; then
  line "Video tools (FFmpeg)" "ready"
else
  (sudo -n apt-get install -y -qq ffmpeg > /dev/null 2>&1 || apt-get install -y -qq ffmpeg > /dev/null 2>&1) \
    && line "Video tools (FFmpeg)" "installed" || { line "Video tools (FFmpeg)" "MISSING: couldn't install"; ok=1; }
fi

node_major="$(node -v 2> /dev/null | sed -E 's/^v([0-9]+).*/\1/')"
if [ "${node_major:-0}" -ge 22 ]; then line "Node.js 22+" "ready ($(node -v))"; else line "Node.js 22+" "MISSING (found ${node_major:-none})"; ok=1; fi

if [ -f "$VE_HOME/node_modules/gsap/dist/gsap.min.js" ] || npm i --silent --no-audit --no-fund --prefix "$VE_HOME" gsap@3 > "$VE_HOME/npm.log" 2>&1; then
  line "Animation library (GSAP)" "ready"
else
  line "Animation library (GSAP)" "MISSING: npm couldn't download it (internet access for code?)"; ok=1
fi

if npx -y "hyperframes@$HF_VERSION" --version > "$VE_HOME/hf.log" 2>&1; then
  npx -y "hyperframes@$HF_VERSION" telemetry disable > /dev/null 2>&1 || true
  line "HyperFrames $HF_VERSION" "ready"
else
  line "HyperFrames $HF_VERSION" "MISSING: npm couldn't download it"; ok=1
fi

if npx -y "hyperframes@$HF_VERSION" browser ensure > "$VE_HOME/chrome.log" 2>&1; then
  line "Renderer (headless Chrome)" "ready"
else
  line "Renderer (headless Chrome)" "MISSING: download blocked (needs storage.googleapis.com)"; ok=1
fi

if curl -sfI --max-time 10 https://huggingface.co > /dev/null; then
  line "Transcription download" "reachable (installs on the first edit, about 3 minutes)"
else
  line "Transcription download" "BLOCKED: turn on internet access for code (huggingface.co)"; ok=1
fi

[ $ok -eq 0 ] && echo "All set." || echo "Something is missing: see the lines above."
exit $ok
