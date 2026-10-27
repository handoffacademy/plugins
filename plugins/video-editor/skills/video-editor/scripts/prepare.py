"""Stage a raw take for editing: a 1080x1920, 30 fps, timestamp-clean copy plus a 16 kHz voice track.

Usage: python3 -I prepare.py <input video> <project dir>

Makes <project>/{edit,final}, writes edit/source.mp4 (H.264, a keyframe every second, AAC 48 kHz,
both streams starting at 0), edit/voice16k.wav (mono) and edit/source.json (what came in).
Landscape or square footage is centre-cropped to 9:16; the person is told in the report.
"""
import json
import subprocess
import sys
from pathlib import Path

if len(sys.argv) != 3:
    sys.exit("usage: prepare.py <input video> <project dir>")
src, project = Path(sys.argv[1]), Path(sys.argv[2])
if not src.is_file():
    sys.exit(f"can't find the video: {src}")
for sub in ("edit", "final"):
    (project / sub).mkdir(parents=True, exist_ok=True)

probe = json.loads(subprocess.run(
    ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(src)],
    capture_output=True, text=True, check=True).stdout)
video = next((s for s in probe["streams"] if s["codec_type"] == "video"), None)
audio = next((s for s in probe["streams"] if s["codec_type"] == "audio"), None)
if video is None:
    sys.exit("this file has no picture in it")
if audio is None:
    sys.exit("this file has no sound in it, so there are no words to cut on")

w, h = int(video["width"]), int(video["height"])
rotation = 0
for side in video.get("side_data_list", []):
    rotation = int(side.get("rotation", rotation) or rotation)
if abs(rotation) in (90, 270):
    w, h = h, w
duration = float(probe["format"]["duration"])
num, den = (video.get("avg_frame_rate") or "30/1").split("/")
fps_in = float(num) / float(den or 1) if float(den or 1) else 30.0

edit = project / "edit"
vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p,setpts=PTS-STARTPTS"
subprocess.run(
    ["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", str(src),
     "-map", "0:v:0", "-map", "0:a:0", "-vf", vf, "-af", "aresample=48000,asetpts=PTS-STARTPTS",
     "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-g", "30", "-keyint_min", "30", "-sc_threshold", "0",
     "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(edit / "source.mp4")],
    check=True)
subprocess.run(
    ["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", str(edit / "source.mp4"),
     "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(edit / "voice16k.wav")],
    check=True)

info = {"input": str(src), "width": w, "height": h, "fps": round(fps_in, 3), "duration": round(duration, 3),
        "cropped_to_vertical": w / h > 9 / 16 + 0.01}
(edit / "source.json").write_text(json.dumps(info, indent=1))
shape = "vertical" if not info["cropped_to_vertical"] else f"{w}x{h}, so it was centre-cropped to vertical"
print(f"staged {duration:.1f} s of video ({shape}, {fps_in:.2f} fps in, 30 fps out) in {edit}")
