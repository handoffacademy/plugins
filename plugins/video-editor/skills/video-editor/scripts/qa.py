"""Check the finished file itself, not the plan: spec, sound level, black or frozen picture, gaps, and the words.

Usage: python3 -I qa.py <project dir> <final.mp4> [--no-words]

Writes <project>/final/qa/: QA.md (PASS, FAIL or CHECK per line, with the measured numbers), stills at
frame 0, either side of every cut and before the end fade, and sheet.jpg with all of them.
Read every still before you call the video finished. --no-words skips the re-transcription.
"""
import difflib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
args = sys.argv[1:]
if len(args) < 2:
    sys.exit("usage: qa.py <project dir> <final.mp4> [--no-words]")
project, final = Path(args[0]), Path(args[1])
check_words = "--no-words" not in args
qa = project / "final" / "qa"
if qa.exists():
    shutil.rmtree(qa)
(qa / "stills").mkdir(parents=True)
cut = json.loads((project / "edit" / "words.json").read_text())
rows: list[tuple[str, str, str]] = []


def run(cmd: list[str]) -> str:
    return subprocess.run(cmd, capture_output=True, text=True).stderr


probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(final)],
                                  capture_output=True, text=True, check=True).stdout)
v = next(s for s in probe["streams"] if s["codec_type"] == "video")
a = next((s for s in probe["streams"] if s["codec_type"] == "audio"), None)
dur = float(probe["format"]["duration"])
num, den = v["r_frame_rate"].split("/")
fps = float(num) / float(den)
spec_ok = (v["width"], v["height"]) == (1080, 1920) and abs(fps - 30) < 0.01 and v["codec_name"] == "h264" \
    and a is not None and a["codec_name"] == "aac"
rows.append(("File spec", "PASS" if spec_ok else "FAIL",
             f"{v['width']}x{v['height']}, {fps:g} fps, {v['codec_name']}/{a['codec_name'] if a else 'no sound'}"))
starts = [float(s.get("start_time", 0)) for s in probe["streams"]]
rows.append(("Picture and sound start together", "PASS" if all(abs(s) < 0.001 for s in starts) else "FAIL",
             "stream starts " + ", ".join(f"{s:.3f}" for s in starts)))
rows.append(("Length", "PASS" if abs(dur - cut["duration"]) < 0.15 else "CHECK",
             f"{dur:.2f} s (cut {cut['duration']:.2f} s)"))
v_len, a_len = float(v.get("duration", dur)), float(a.get("duration", dur)) if a else 0.0
rows.append(("Picture and sound end together", "PASS" if abs(v_len - a_len) <= 0.05 else "FAIL",
             f"picture {v_len:.2f} s, sound {a_len:.2f} s"))

loud = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(final), "-af", "ebur128=peak=true", "-f", "null", "-"])
summary = loud[loud.rfind("Summary:"):]
lufs = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summary).group(1))
peak = float(re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", summary).group(1))
rows.append(("Loudness (-14 LUFS for social)", "PASS" if abs(lufs + 14) <= 1 else "FAIL", f"{lufs:.1f} LUFS"))
rows.append(("True peak (at most -1 dBTP)", "PASS" if peak <= -1.0 else "FAIL", f"{peak:.1f} dBTP"))

end_fade_from = dur - 0.7
blacks = [(float(s), float(e)) for s, e in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)",
          run(["ffmpeg", "-hide_banner", "-i", str(final), "-vf", "blackdetect=d=0.2:pic_th=0.98", "-an", "-f", "null", "-"]))]
blacks = [b for b in blacks if b[0] < end_fade_from]
rows.append(("No black frames before the end fade", "PASS" if not blacks else "FAIL",
             "none" if not blacks else ", ".join(f"{s:.2f}-{e:.2f} s" for s, e in blacks)))
frozen = re.findall(r"freeze_start: ([\d.]+)", run(["ffmpeg", "-hide_banner", "-i", str(final), "-vf",
                                                     "freezedetect=n=0.002:d=1.5", "-an", "-f", "null", "-"]))
frozen = [float(f) for f in frozen if float(f) < dur - 1.6]
rows.append(("No frozen picture", "PASS" if not frozen else "CHECK",
             "none" if not frozen else "picture stops moving at " + ", ".join(f"{f:.2f} s" for f in frozen)))
quiet = [(float(s), float(e)) for s, e in re.findall(r"silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)",
         run(["ffmpeg", "-hide_banner", "-i", str(final), "-af", "silencedetect=n=-45dB:d=0.8", "-vn", "-f", "null", "-"]))]
quiet = [q for q in quiet if q[0] < dur - 1.3]
rows.append(("No dead air over 0.8 s", "PASS" if not quiet else "CHECK",
             "none" if not quiet else ", ".join(f"{s:.2f}-{e:.2f} s" for s, e in quiet)))

if check_words:
    wav = qa / "final16k.wav"
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", str(final), "-ac", "1", "-ar", "16000", str(wav)], check=True)
    env_hf = subprocess.run(["bash", "-c", f"source '{HERE}/env.sh'; echo $HF_VERSION"], capture_output=True, text=True).stdout.strip()
    r = subprocess.run(["npx", "-y", f"hyperframes@{env_hf}", "transcribe", wav.name, "--json"], cwd=qa, capture_output=True, text=True)
    heard_path = qa / "transcript.json"
    if r.returncode == 0 and heard_path.exists():
        raw = json.loads(heard_path.read_text())
        heard = [w["text"] for w in (raw["words"] if isinstance(raw, dict) else raw)]
        clean = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace("’", "'"))
        want = [clean(w["text"]) for w in cut["words"]]
        got = [clean(t) for t in heard]
        ratio = difflib.SequenceMatcher(None, want, got).ratio()
        lost = [want[i] for op, i1, i2, _, _ in difflib.SequenceMatcher(None, want, got).get_opcodes()
                if op in ("delete", "replace") for i in range(i1, i2)]
        (qa / "heard.txt").write_text(" ".join(heard) + "\n")
        rows.append(("Every kept word is heard", "PASS" if ratio >= 0.9 else "CHECK" if ratio >= 0.75 else "FAIL",
                     f"{ratio:.0%} match" + (f"; listen for: {' '.join(lost[:12])}" if lost else "")))
    else:
        rows.append(("Every kept word is heard", "CHECK", "re-transcription didn't run: " + (r.stderr.strip().splitlines() or ["no output"])[-1]))

# Stills: frame 0, the hook's last moment, either side of every cut, each highlighted word as it lands,
# one every 2 s in between, just before the end fade and the very last frame.
plan_path = project / "reel" / "plan.json"
plan = json.loads(plan_path.read_text()) if plan_path.exists() else {}
keys = {k.lower().split("#")[0] for k in plan.get("key_words", [])}
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace("’", "'"))
times = [0.0, 2.8] + [t for b in cut["boundaries"][1:-1] for t in (b - 0.1, b + 0.1)]
times += [w["start"] + 0.15 for w in cut["words"] if norm(w["text"]) in keys]
times += [t * 2.0 for t in range(1, int(dur // 2) + 1)]
times += [max(0.0, dur - 0.8), max(0.0, dur - 1 / 30)]
times = sorted({round(t, 2) for t in times if 0 <= t < dur})
while len(times) > 24:  # keep the sheet readable on long videos: drop the evenly spaced fillers first
    fillers = [t for t in times if abs(t / 2 - round(t / 2)) < 1e-6 and t not in (0.0,)]
    if not fillers:
        break
    times.remove(fillers[len(fillers) // 2])
for k, t in enumerate(times):
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(final), "-frames:v", "1",
                    "-vf", "scale=360:640", str(qa / "stills" / f"{k:02d}_{t:06.2f}s.jpg")], check=True)
cols = min(len(times), 6)
subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-pattern_type", "glob", "-i", str(qa / "stills" / "*.jpg"),
                "-vf", f"tile={cols}x{-(-len(times) // cols)}:padding=6:color=white", "-frames:v", "1", str(qa / "sheet.jpg")], check=True)

fails = [r for r in rows if r[1] == "FAIL"]
checks = [r for r in rows if r[1] == "CHECK"]
lines = ["# QA for " + final.name, "", "| Check | Result | Measured |", "|---|---|---|"]
lines += [f"| {n} | {res} | {m} |" for n, res, m in rows]
lines += ["", f"Stills: {len(times)} in stills/ and on sheet.jpg (frame 0, the hook, either side of each cut, each highlighted word, every 2 s, the end).",
          "Read them for: captions on the right words, nothing cut off at the edges, eyes open on frame 0 and the last frame, "
          "the hook readable on frame 0."]
(qa / "QA.md").write_text("\n".join(lines) + "\n")
print("\n".join(lines[2:len(rows) + 4]))
print(f"\n{len(fails)} FAIL, {len(checks)} CHECK. Stills: {qa / 'sheet.jpg'}")
sys.exit(1 if fails else 0)
