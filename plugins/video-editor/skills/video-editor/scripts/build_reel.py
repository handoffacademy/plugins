"""Write the HyperFrames composition for a cut: hook bars, word-by-word captions, zooms on cuts, sound, end fade.

Usage: python3 -I build_reel.py <project dir> [--brand brand.json]

Reads edit/cut.mp4, edit/words.json (from render_cut.py) and reel/plan.json, which you write first:
{
  "hook": ["Why your fig", "keeps dying"],  one or two short lines, 7 words or fewer in all; [] for none
  "key_words": ["kills", "light", "water"],  spoken words that get a colour chip; "water#2" = its 2nd time
  "punch_words": ["money"],                  extra zoom-ins on these words, for long stretches with no cut
  "face": [50, 34],                          zoom centre, percent across and down the frame (default 50, 34)
  "caption_y": 1120,                         caption line position in px from the top (default 1120)
  "sound": true,                             pop on the hook, whoosh on zooms, chime at the end
  "end_fade": true                           fade to black over the last 0.6 s
}
The brand file sets fonts and colours (assets/brand-default.json when none is given). Writes reel/index.html
and copies the media it needs into reel/assets/. Run `npx hyperframes init reel` first (render.sh does).
"""
import html
import json
import os
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent / "assets"
FPS = 30
SFX = {"pop": 0.2, "whoosh": 0.6, "chime": 2.0}  # file lengths in seconds
WHOOSH_PEAK = 0.338

args = sys.argv[1:]
if not args:
    sys.exit("usage: build_reel.py <project dir> [--brand brand.json]")
project = Path(args[0])
opt = {args[i]: args[i + 1] for i in range(1, len(args) - 1, 2)}
brand_path = Path(opt["--brand"]) if "--brand" in opt else (
    project / "brand.json" if (project / "brand.json").exists() else ASSETS / "brand-default.json")
brand = json.loads(brand_path.read_text())
plan_path = project / "reel" / "plan.json"
plan = json.loads(plan_path.read_text()) if plan_path.exists() else {}
data = json.loads((project / "edit" / "words.json").read_text())
words, bounds, END = data["words"], data["boundaries"], data["duration"]
if not words:
    sys.exit("no words in edit/words.json: nothing to caption")


def luminance(hex_color: str) -> float:
    c = [int(hex_color.lstrip("#")[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a: str, b: str) -> float:
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


col = brand["colors"]
for fg, bg in (("accent_text", "accent"), ("bar_text", "bar")):
    ratio = contrast(col[fg], col[bg])
    if ratio < 4.5:
        print(f"warning: {fg} on {bg} is {ratio:.1f}:1, under 4.5:1; pick a darker or lighter text colour")

clean = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace("’", "'"))
case = brand.get("caption", {}).get("case", "as-spoken")
def shown(text: str) -> str:
    text = text.replace("'", "’")
    return text.lower() if case == "lower" else text.upper() if case == "upper" else text

# Which word occurrences are key words.
seen: dict[str, int] = {}
key_set = set()
wanted = [k.lower() for k in plan.get("key_words", [])]
punch_set = set()
punch_wanted = [k.lower() for k in plan.get("punch_words", [])]
for i, w in enumerate(words):
    c = clean(w["text"])
    seen[c] = seen.get(c, 0) + 1
    if c in wanted or f"{c}#{seen[c]}" in wanted:
        key_set.add(i)
    if c in punch_wanted or f"{c}#{seen[c]}" in punch_wanted:
        punch_set.add(i)
missing = [k for k in wanted if not any(clean(words[i]["text"]) == k.split("#")[0] for i in key_set)]
if missing:
    print(f"warning: key words not spoken in the cut: {missing}")

# Caption chunks: at most 3 words and 16 letters, breaking at cuts, punctuation and pauses.
chunks, cur = [], []
for i, w in enumerate(words):
    if cur:
        prev = words[cur[-1]]
        letters = sum(len(words[k]["text"]) for k in cur) + len(w["text"])
        if (len(cur) >= 3 or letters > 16 or w["range"] != prev["range"]
                or re.search(r"[.?!,;:]$", prev["text"]) or w["start"] - prev["end"] > 0.35):
            chunks.append(cur)
            cur = []
    cur.append(i)
chunks.append(cur)

# Hook leaves at the first cut between 2 and 4 s, else after the first sentence, else at 3 s.
hook = [line for line in plan.get("hook", []) if line.strip()]
hook_out = next((b for b in bounds[1:-1] if 2.0 <= b <= 4.0), None)
if hook_out is None:
    hook_out = next((w["end"] for w in words if re.search(r"[.?!]$", w["text"]) and 2.2 <= w["end"] <= 4.5), 3.0)
hook_out = min(hook_out, END - 0.5)

fx, fy = plan.get("face", [50, 34])
cap_y = int(plan.get("caption_y", 1120))
sound = plan.get("sound", True)
end_fade = plan.get("end_fade", True)

# Zooms: settle on frame 0, then alternate levels on every cut and punch word, with a slow drift between.
LEVELS = (1.04, 1.12)
events = sorted(set([b for b in bounds[1:-1]] + [words[i]["start"] for i in punch_set]))
events = [t for t in events if 0.6 < t < END - 0.4]
# A stretch over 2.5 s with no cut gets a punch-in where a new clause starts (a change every 1.5-3 s).
clause_starts = [w["start"] for k, w in enumerate(words) if k and re.search(r"[.?!,;:]$", words[k - 1]["text"])]
marks = [0.0] + events + [END]
for a, b in zip(marks, marks[1:]):
    t = a
    while b - t > 2.5:
        nxt = next((c for c in clause_starts if t + 1.2 <= c <= b - 0.8), None)
        if nxt is None:
            break
        events.append(nxt)
        t = nxt
events = sorted(set(events))
tl = ['tl.fromTo("#frame", { scale: 1.12 }, { scale: 1.04, duration: 0.5, ease: "expo.out" }, 0);']
level, t_prev = 0, 0.5
for t in events:
    if t - t_prev > 0.4:
        tl.append(f'tl.to("#frame", {{ scale: {LEVELS[level] + 0.02:.3f}, duration: {t - t_prev:.3f}, ease: "none" }}, {t_prev:.3f});')
    level = 1 - level
    tl.append(f'tl.to("#frame", {{ scale: {LEVELS[level]:.3f}, duration: 0.2, ease: "power3.out" }}, {t:.3f});')
    t_prev = t + 0.2
if END - t_prev > 0.4:
    tl.append(f'tl.to("#frame", {{ scale: {LEVELS[level] + 0.03:.3f}, duration: {END - t_prev:.3f}, ease: "none" }}, {t_prev:.3f});')

if hook:
    tl.append('tl.fromTo("#hook .punch", { scale: 1.15 }, { scale: 1, duration: 0.24, ease: "back.out(2)" }, 0);')
    tl.append(f'tl.to("#hook", {{ y: -24, opacity: 0, duration: 0.2, ease: "power2.in" }}, {max(0.5, hook_out - 0.2):.3f});')

cap_html, cap_js = [], []
for n, ids in enumerate(chunks):
    first = words[ids[0]]["start"]
    nxt = words[chunks[n + 1][0]]["start"] if n + 1 < len(chunks) else None
    hide = None if nxt is None else min(nxt, words[ids[-1]]["end"] + 0.6)
    spans = "".join(f'<b class="key">{html.escape(shown(words[i]["text"]))}</b>' if i in key_set
                    else f'<b>{html.escape(shown(words[i]["text"]))}</b>' for i in ids)
    cap_html.append(f'<div class="cap" id="c{n}">{spans}</div>')
    starts = [round(words[i]["start"], 3) for i in ids]
    cap_js.append(f'["#c{n}", {json.dumps(starts)}, {"null" if hide is None else round(hide, 3)}]')

audio = []
track = 10
if sound and hook:
    audio.append(f'<audio id="sfx-hook" class="clip" src="assets/sfx/pop.mp3" data-start="0" data-duration="{SFX["pop"]}" data-track-index="{track}" data-volume="0.2"></audio>')
    track += 1
last_whoosh = -10.0
for k, t in enumerate(events):
    s = t - WHOOSH_PEAK
    if sound and s > 0.3 and t - last_whoosh >= 3.5:
        audio.append(f'<audio id="sfx-zoom-{k}" class="clip" src="assets/sfx/whoosh.mp3" data-start="{s:.3f}" data-duration="{SFX["whoosh"]}" data-track-index="{track}" data-volume="0.2"></audio>')
        track += 1
        last_whoosh = t
chime_at = words[-1]["end"] + 0.15
if sound and END - chime_at >= 0.5:
    d = min(SFX["chime"], END - chime_at)
    audio.append(f'<audio id="sfx-end" class="clip" src="assets/sfx/chime.mp3" data-start="{chime_at:.3f}" data-duration="{d:.3f}" data-track-index="{track}" data-volume="0.16"></audio>')

# The fade never starts before the last word has finished.
fade_at = max(END - 0.6, words[-1]["end"] + 0.1)
if end_fade and END - fade_at >= 0.2:
    tl.append(f'tl.to("#fade", {{ opacity: 1, duration: {END - fade_at - 1 / FPS:.4f}, ease: "none" }}, {fade_at:.4f});')

reel = project / "reel"
(reel / "assets" / "sfx").mkdir(parents=True, exist_ok=True)
(reel / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
(reel / "assets" / "vendor").mkdir(parents=True, exist_ok=True)
shutil.copyfile(project / "edit" / "cut.mp4", reel / "assets" / "cut.mp4")
for name in SFX:
    shutil.copyfile(ASSETS / "sfx" / f"{name}.mp3", reel / "assets" / "sfx" / f"{name}.mp3")
font_src = Path(brand["font_file"])
if not font_src.is_absolute():
    font_src = (brand_path.parent / font_src) if (brand_path.parent / font_src).exists() else ASSETS / "fonts" / font_src
shutil.copyfile(font_src, reel / "assets" / "fonts" / font_src.name)
gsap_local = Path(os.environ.get("VE_HOME", Path.home() / ".video-editor")) / "node_modules" / "gsap" / "dist" / "gsap.min.js"
if not gsap_local.exists():
    sys.exit("GSAP isn't installed yet: run setup.sh first")
shutil.copyfile(gsap_local, reel / "assets" / "vendor" / "gsap.min.js")
gsap_tag = '<script src="assets/vendor/gsap.min.js"></script>'

cap = brand.get("caption", {})
hk = brand.get("hook", {})
family = brand["font_family"]
hook_html = ""
if hook:
    lines = [f'<span class="setup">{html.escape(hook[0])}</span>', f'<span class="punch">{html.escape(hook[1])}</span>'] if len(hook) > 1 \
        else [f'<span class="punch">{html.escape(hook[0])}</span>']
    hook_html = f'<div id="hook">{"".join(lines)}</div>'

page = f"""<!doctype html>
<!-- Built by the Handoff Video Editor (build_reel.py) from edit/words.json and reel/plan.json. Rebuild, don't hand-edit. -->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    {gsap_tag}
    <style>
      @font-face {{ font-family: "{family}"; src: url("assets/fonts/{font_src.name}"); font-weight: 100 900; font-display: block; }}
      :root {{ --accent: {col["accent"]}; --accent-text: {col["accent_text"]}; --bar: {col["bar"]}; --bar-text: {col["bar_text"]}; --caption: {cap.get("color", "#FFFFFF")}; }}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #000; font-family: "{family}", sans-serif; }}
      #root {{ position: relative; width: 1080px; height: 1920px; overflow: hidden; }}
      #frame {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: {fx}% {fy}%; }}
      #frame video {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }}
      #hook {{ position: absolute; left: 60px; right: 140px; top: 230px; display: grid; justify-items: center; gap: 10px; }}
      #hook span {{ display: block; max-width: 100%; text-align: center; font-weight: {hk.get("weight", 900)}; line-height: 1.02; letter-spacing: -0.02em; box-shadow: 0 16px 36px rgba(0, 0, 0, 0.32); }}
      #hook .setup {{ padding: 8px 22px 12px; background: var(--bar); color: var(--bar-text); font-size: {hk.get("setup_size", 56)}px; }}
      #hook .punch {{ padding: 10px 28px 18px; background: var(--accent); color: var(--accent-text); font-size: {hk.get("punch_size", 96)}px; }}
      .cap {{ position: absolute; left: 60px; right: 140px; top: {cap_y}px; display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; gap: 0 20px; opacity: 0; }}
      .cap b {{ display: block; color: var(--caption); font-size: {cap.get("size", 78)}px; font-weight: {cap.get("weight", 800)}; letter-spacing: -0.02em; line-height: 1.1; white-space: nowrap; opacity: 0;
        text-shadow: 0 3px 0 rgba(0, 0, 0, 0.7), 0 0 18px rgba(0, 0, 0, 0.75), 0 0 40px rgba(0, 0, 0, 0.45); }}
      .cap b.key {{ padding: 2px 16px 10px; background: var(--accent); color: var(--accent-text); text-shadow: none; border-radius: 10px; box-shadow: 0 0 0 5px #fff, 0 12px 26px rgba(0, 0, 0, 0.3); }}
      #fade {{ position: absolute; inset: 0; background: #000; opacity: 0; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{END:.3f}" data-width="1080" data-height="1920" data-fps="{FPS}"
      data-fx-chain='{{"version":1,"nodes":[{{"type":"truepeak","id":"m1","params":{{"ceiling":-1.5}}}}]}}'>
      <div id="frame">
        <video id="take" class="clip" src="assets/cut.mp4" data-start="0" data-duration="{END:.3f}" data-media-start="0" data-track-index="0" playsinline data-has-audio="true"></video>
      </div>
      {hook_html}
      {chr(10).join("      " + c for c in cap_html).strip()}
      <div id="fade"></div>
      {chr(10).join("      " + a for a in audio).strip()}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      {chr(10).join("      " + line for line in tl).strip()}
      const chunks = [{", ".join(cap_js)}];
      for (const [id, starts, end] of chunks) {{
        const els = gsap.utils.toArray(`${{id}} b`);
        tl.to(id, {{ opacity: 1, duration: 0.08, ease: "none" }}, starts[0]);
        els.forEach((el, i) => tl.to(el, {{ opacity: 1, duration: 0.08, ease: "none" }}, starts[i]));
        if (end !== null) tl.to(id, {{ opacity: 0, duration: 0.01, ease: "none" }}, end);
      }}
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
(reel / "index.html").write_text(page)
print(f"built {reel / 'index.html'}: {END:.2f} s, {len(chunks)} caption lines, {len(key_set)} key words, "
      f"{len(events)} zooms, {len(audio)} sounds, hook {'on until ' + format(hook_out, '.2f') + ' s' if hook else 'off'}")
