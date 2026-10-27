"""First pass at the cut: drop fillers, false starts and restarts, and shrink long pauses, on word boundaries.

Usage: python3 -I suggest_cut.py <project dir> [--pause 0.35] [--hold 1.0]

Reads edit/words_source.json ({"words": [{"text", "start", "end"}]}, source seconds) and writes
edit/edl.json: {"source": "source.mp4", "ranges": [{"start", "end", "quote", "reason"}], "removed": [...]}.
This is a suggestion. Read the transcript, then change edl.json by hand when a different take reads
better; render_cut.py only follows the ranges.

What it removes:
- fillers spoken alone: um, uh, er, erm, ah, hmm, mm, uhm;
- a restart: everything from the start of the attempt up to "let me start over", "start again", "let me
  try that again", "one more time", "take two", "sorry" or "wait" at the head of a sentence;
- a repeated opening: when the same 3+ words start again within 15 s and less than 15 words later, the
  first attempt goes and the later one stays;
- pauses longer than --pause inside a line (the cut lands in the silence, 0.08 s before and 0.12 s after).
The last kept word gets up to --hold seconds of settled picture after it, so the video never ends on a word.
"""
import json
import re
import sys
from pathlib import Path

args = sys.argv[1:]
if not args:
    sys.exit("usage: suggest_cut.py <project dir> [--pause 0.35] [--hold 1.0]")
project = Path(args[0])
opt = {args[i]: float(args[i + 1]) for i in range(1, len(args) - 1, 2)}
PAUSE = opt.get("--pause", 0.35)
HOLD = opt.get("--hold", 1.0)
PAD_IN, PAD_OUT = 0.08, 0.12

words = json.loads((project / "edit" / "words_source.json").read_text())["words"]
duration = json.loads((project / "edit" / "source.json").read_text())["duration"]
clean = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
tokens = [clean(w["text"]) for w in words]
keep = [True] * len(words)
why = [""] * len(words)

FILLERS = {"um", "uh", "er", "erm", "ah", "hmm", "mm", "uhm", "umm", "uhh"}
for i, t in enumerate(tokens):
    if t in FILLERS:
        keep[i], why[i] = False, "filler"

# An attempt starts at the first word, or after a gap of 0.6 s or more, or after sentence-ending punctuation.
def attempt_start(i: int) -> int:
    j = i
    while j > 0:
        gap = words[j]["start"] - words[j - 1]["end"]
        if gap >= 0.6 or re.search(r"[.!?]$", words[j - 1]["text"].strip()):
            break
        j -= 1
    return j

RESTARTS = [("let", "me", "start", "over"), ("start", "over"), ("start", "again"), ("let", "me", "try", "that", "again"),
            ("let", "me", "try", "again"), ("one", "more", "time"), ("take", "two"), ("sorry",), ("wait",)]
i = 0
while i < len(tokens):
    for phrase in RESTARTS:
        n = len(phrase)
        if tuple(tokens[i:i + n]) != phrase:
            continue
        head = attempt_start(i)
        only_fillers_before = not any(keep[k] for k in range(head, i))
        if n == 1:
            # "sorry" or "wait" counts only when it breaks off an earlier attempt: a comma or pause after it,
            # and nothing but fillers before it in its own attempt. "Wait until you see this" stays.
            gap_after = words[i + 1]["start"] - words[i]["end"] if i + 1 < len(words) else 1.0
            broke_off = re.search(r"[,.!?]$", words[i]["text"].strip()) or gap_after >= 0.25
            if not (broke_off and only_fillers_before and head > 0):
                continue
        # The marker at the head of an attempt throws away the attempt before it; mid-line, the line so far.
        cut_from = attempt_start(head - 1) if only_fillers_before and head > 0 else head
        for k in range(cut_from, i + n):
            keep[k], why[k] = False, f"restart ('{' '.join(phrase)}')"
        i += n - 1
        break
    i += 1

# Repeated openings: the speaker began a line, stopped, and began it again. Both copies must start an
# attempt (after a pause, a sentence end or a cut), so "it's not the light, it's not the water" stays whole.
def starts_attempt(k: int) -> bool:
    return k == 0 or attempt_start(k) == k or not keep[k - 1]

for i in range(len(tokens)):
    if not keep[i] or not starts_attempt(i):
        continue
    for j in range(i + 3, min(len(tokens), i + 16)):
        if words[j]["start"] - words[i]["start"] > 15:
            break
        if not starts_attempt(j):
            continue
        n = 0
        while j + n < len(tokens) and i + n < j and tokens[i + n] == tokens[j + n] and tokens[i + n]:
            n += 1
        if n >= 3:
            for k in range(i, j):
                if keep[k]:
                    keep[k], why[k] = False, "said again right after"
            break

kept = [k for k in range(len(words)) if keep[k]]
if not kept:
    sys.exit("nothing left to keep: check edit/words_source.json")

# Group kept words into ranges, splitting where words were removed or the pause is too long.
ranges, start = [], kept[0]
for a, b in zip(kept, kept[1:] + [None]):
    if b is not None and b == a + 1 and words[b]["start"] - words[a]["end"] <= PAUSE:
        continue
    ranges.append((start, a))
    start = b

out = []
for n, (a, b) in enumerate(ranges):
    prev_end = words[a - 1]["end"] if a > 0 else 0.0
    next_start = words[b + 1]["start"] if b + 1 < len(words) else duration
    s = max(prev_end + 0.02 if a > 0 else 0.0, words[a]["start"] - PAD_IN, 0.0)
    e = min(next_start - 0.02, words[b]["end"] + PAD_OUT, duration)
    if n == len(ranges) - 1:
        e = min(next_start - 0.05, words[b]["end"] + HOLD, duration)
    out.append({"start": round(s, 3), "end": round(e, 3),
                "quote": " ".join(w["text"].strip() for w in words[a:b + 1]),
                "reason": "kept"})

removed, run = [], None
for k, w in enumerate(words):
    if not keep[k]:
        if run and run["why"] == why[k] and k == run["last"] + 1:
            run["text"] += " " + w["text"].strip()
            run["end"], run["last"] = w["end"], k
        else:
            run = {"start": w["start"], "end": w["end"], "text": w["text"].strip(), "why": why[k], "last": k}
            removed.append(run)
for r in removed:
    r.pop("last", None)

edl = {"source": "source.mp4", "ranges": out, "removed": removed}
(project / "edit" / "edl.json").write_text(json.dumps(edl, indent=1))
total = sum(r["end"] - r["start"] for r in out)
print(f"{len(out)} pieces kept, {total:.1f} s of {duration:.1f} s")
for r in removed:
    print(f"  cut {r['start']:.2f}-{r['end']:.2f} ({r['why']}): {r['text']}")
