#!/usr/bin/env bash
# transcribe.sh: word-level timings for the staged take, with HyperFrames' local whisper.
#
# Usage: transcribe.sh <project dir> [language]   (language: en by default; es, pt, fr ... use the multilingual model)
# Writes <project>/edit/transcript.json (HyperFrames' own file) and <project>/edit/words_source.json
# ({"words": [{"text", "start", "end"}]}) for suggest_cut.py. The first run in a new session builds whisper
# and downloads the model (about 3 minutes); later runs in the same session take seconds.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
source "$here/env.sh"

project="$1"
lang="${2:-en}"
edit="$project/edit"
model="small.en"
[ "$lang" = "en" ] || model="small"

(cd "$edit" && npx -y "hyperframes@$HF_VERSION" transcribe voice16k.wav --model "$model" --language "$lang" --json \
  2> transcribe.log > transcribe.out) || { tail -20 "$edit/transcribe.log"; exit 1; }

python3 -I - "$edit" <<'PY'
import json, sys
from pathlib import Path
edit = Path(sys.argv[1])
raw = json.loads((edit / "transcript.json").read_text())
items = raw["words"] if isinstance(raw, dict) else raw
words = [{"text": w["text"].strip(), "start": round(float(w["start"]), 3), "end": round(float(w["end"]), 3)}
         for w in items if str(w.get("text", "")).strip()]
words.sort(key=lambda w: w["start"])
(edit / "words_source.json").write_text(json.dumps({"words": words}, indent=1))
print(f"{len(words)} words: " + " ".join(w["text"] for w in words))
PY
