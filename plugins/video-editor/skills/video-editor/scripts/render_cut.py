"""Render the cut that edl.json describes, in one encode, and map the kept words onto the cut's timeline.

Usage: python3 -I render_cut.py <project dir>

Every range is snapped to the 30 fps frame grid and trimmed from edit/source.mp4 in a single filter graph,
so picture and voice stay in sync across every cut (no copy-concat, no AAC priming drift). Each audio
piece gets a 12 ms fade at both ends so no cut clicks. When the take stops less than 0.9 s after the last
word, the last frame is held (with silence) so the video never ends on a syllable. Writes:
- edit/cut.mp4: 1080x1920, 30 fps, H.264 + AAC 48 kHz, both streams starting at 0;
- edit/words.json: {"duration", "boundaries": [0, cut1, ..., end], "words": [{"text", "start", "end", "range"}]}.
"""
import json
import subprocess
import sys
from pathlib import Path

FPS = 30
if len(sys.argv) != 2:
    sys.exit("usage: render_cut.py <project dir>")
project = Path(sys.argv[1])
edit = project / "edit"
edl = json.loads((edit / "edl.json").read_text())
words = json.loads((edit / "words_source.json").read_text())["words"]
snap = lambda t: round(round(t * FPS) / FPS, 4)

ranges = []
for r in edl["ranges"]:
    s, e = snap(r["start"]), snap(r["end"])
    if e - s >= 2 / FPS:
        ranges.append((s, e))
if not ranges:
    sys.exit("edl.json has no ranges long enough to keep")

parts, labels = [], []
for i, (s, e) in enumerate(ranges):
    d = e - s
    fade = min(0.012, d / 4)
    parts.append(f"[0:v]trim=start={s}:end={e},setpts=PTS-STARTPTS[v{i}]")
    parts.append(f"[0:a]atrim=start={s}:end={e},asetpts=PTS-STARTPTS,"
                 f"afade=t=in:st=0:d={fade:.3f},afade=t=out:st={d - fade:.4f}:d={fade:.3f}[a{i}]")
    labels.append(f"[v{i}][a{i}]")
# How much settled picture follows the last kept word; hold the last frame to make up 0.9 s.
kept_last = max((w["end"] for w in words if ranges[-1][0] <= (w["start"] + w["end"]) / 2 <= ranges[-1][1]), default=ranges[-1][1])
hold = snap(max(0.0, 0.9 - (ranges[-1][1] - kept_last)))
if hold > 0:
    parts.append("".join(labels) + f"concat=n={len(ranges)}:v=1:a=1[vc][ac]")
    parts.append(f"[vc]tpad=stop_mode=clone:stop_duration={hold}[v]")
    parts.append(f"[ac]apad=pad_dur={hold}[a]")
else:
    parts.append("".join(labels) + f"concat=n={len(ranges)}:v=1:a=1[v][a]")
subprocess.run(
    ["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", str(edit / "source.mp4"),
     "-filter_complex", ";".join(parts), "-map", "[v]", "-map", "[a]",
     "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-g", "30", "-keyint_min", "30", "-sc_threshold", "0",
     "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart",
     str(edit / "cut.mp4")],
    check=True)

out, offset, bounds = [], 0.0, [0.0]
for i, (s, e) in enumerate(ranges):
    for w in words:
        mid = (w["start"] + w["end"]) / 2
        if s <= mid <= e:
            out.append({"text": w["text"].strip(), "range": i,
                        "start": round(offset + max(0.0, w["start"] - s), 3),
                        "end": round(offset + min(w["end"] - s, e - s), 3)})
    offset += e - s
    bounds.append(round(offset, 4))
if hold > 0:
    offset += hold
    bounds[-1] = round(offset, 4)

(edit / "words.json").write_text(json.dumps({"duration": round(offset, 4), "boundaries": bounds, "words": out}, indent=1))

starts = subprocess.run(
    ["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,start_time", "-of", "csv=p=0", str(edit / "cut.mp4")],
    capture_output=True, text=True, check=True).stdout.split()
print(f"cut: {len(ranges)} pieces, {offset:.2f} s, {len(out)} words; stream starts {starts}"
      + (f"; held the last frame {hold:.2f} s" if hold > 0 else ""))
minutes = max(1, round(offset * 10 / 60))
print(f"finishing will take about {minutes} minute{'s' if minutes > 1 else ''} (about 10 seconds per second of video)")
for i in range(len(ranges)):
    print(f"  {i}: " + " ".join(w["text"] for w in out if w["range"] == i))
