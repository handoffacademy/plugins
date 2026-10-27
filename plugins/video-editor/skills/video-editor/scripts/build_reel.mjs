// Write the HyperFrames composition for a cut, in the person's brand: hook bars, word-by-word captions in their
// caption style, zooms on cuts, one accent transition at the story's turns, sound on emphasis, an optional end card.
//
// Usage: node build_reel.mjs <project folder> [--brand <brand.json>]
//
// Reads edit/cut.mp4, edit/words.json (render_cut.mjs) and reel/plan.json, which you write first:
//   {"hook": ["Still doing your", "taxes in April?"],  one or two short lines, 7 words or fewer in all
//    "key_words": ["quarterly", "penalty"],             spoken words that get the highlight; "word#2" = its 2nd time
//    "punch_words": [],                                 extra zoom-ins on these words in a long stretch with no cut
//    "transition_at": [],                               cut numbers (1 = first cut) for the accent transition; omit for auto
//    "face": [50, 34], "caption_y": 1120,               zoom centre (% across, % down) and caption line height in px
//    "sound": true, "end_card": true}                   override the brand's sound and end card for this video
// The brand file (brand/brand.json in the studio folder, else the plugin default) sets colours, font, caption style,
// transition, sound pack, logo and end card. Writes reel/index.html and copies its media into reel/assets/.
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { FPS, HF_PKG, SKILL_DIR, args, clean, fail, gsapFile, readJSON } from "./lib.mjs";

const { positional: [projectArg], opts } = args("node build_reel.mjs <project folder> [--brand brand.json]", 1);
const project = resolve(projectArg);
const ASSETS = join(SKILL_DIR, "assets");
const brandPath = [opts.brand, join(project, "brand.json"), join(project, "..", "..", "brand", "brand.json")]
  .find(p => p && existsSync(p)) || join(ASSETS, "brand-default.json");
const brand = readJSON(brandPath);
const brandDir = dirname(brandPath);
const plan = readJSON(join(project, "reel", "plan.json"), {});
const data = readJSON(join(project, "edit", "words.json"));
if (!data?.words?.length) fail("no words in edit/words.json: run render_cut.mjs first");
const { words, boundaries: bounds, duration: END } = data;

const col = { accent: "#FFE14D", accent_text: "#111111", bar: "#FFFFFF", bar_text: "#111111", caption: "#FFFFFF", ...brand.colors };
const capStyle = brand.captions?.style || "bold-chip";
const capCase = brand.captions?.case || "as-spoken";
const capSize = brand.captions?.size || (capStyle === "punchy" ? 92 : 78);
const transition = brand.transition || "punch";
const soundOn = plan.sound ?? (brand.sound?.pack !== "off");
const volume = brand.sound?.volume ?? 0.2;
const endCard = plan.end_card ?? brand.end_card?.enabled ?? false;

// Contrast: every text colour must read on its background.
const lum = hex => {
  const c = [0, 2, 4].map(i => parseInt(hex.replace("#", "").slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
for (const [fg, bg] of [["accent_text", "accent"], ["bar_text", "bar"]]) {
  const r = contrast(col[fg], col[bg]);
  if (r < 4.5) console.log(`warning: ${fg} on ${bg} is ${r.toFixed(1)}:1, under 4.5:1; pick a darker or lighter text colour`);
}

// Clean and Punchy colour the key word with the accent over dark; a dark accent (under 3:1 there) gets a chip instead.
const keyChip = contrast(col.accent, "#1b1d19") < 3;
if (keyChip && capStyle !== "bold-chip") console.log(`note: the accent is dark on video, so key words get a chip in it instead of coloured text`);

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const shown = t => { t = t.replace(/'/g, "’"); return capCase === "lower" ? t.toLowerCase() : capCase === "upper" ? t.toUpperCase() : t; };
const t3 = x => x.toFixed(3);

// Which word occurrences are key words or extra punch-ins.
const seen = {};
const keySet = new Set(), punchSet = new Set();
const wanted = (plan.key_words || []).map(k => k.toLowerCase());
const punchWanted = (plan.punch_words || []).map(k => k.toLowerCase());
words.forEach((w, i) => {
  const c = clean(w.text);
  seen[c] = (seen[c] || 0) + 1;
  if (wanted.includes(c) || wanted.includes(`${c}#${seen[c]}`)) keySet.add(i);
  if (punchWanted.includes(c) || punchWanted.includes(`${c}#${seen[c]}`)) punchSet.add(i);
});
const missing = wanted.filter(k => ![...keySet].some(i => clean(words[i].text) === k.split("#")[0]));
if (missing.length) console.log(`warning: key words not spoken in the cut: ${missing.join(", ")}`);

// Caption chunks: at most 3 words and 16 letters (2 words for punchy), breaking at cuts, punctuation and pauses.
const maxWords = capStyle === "punchy" ? 2 : 3;
const chunks = [];
let cur = [];
words.forEach((w, i) => {
  if (cur.length) {
    const prev = words[cur[cur.length - 1]];
    const letters = cur.reduce((n, k) => n + words[k].text.length, 0) + w.text.length;
    if (cur.length >= maxWords || letters > 16 || w.range !== prev.range || /[.?!,;:]$/.test(prev.text) || w.start - prev.end > 0.35) { chunks.push(cur); cur = []; }
  }
  cur.push(i);
});
chunks.push(cur);

// The hook leaves at the first cut between 2 and 4 s, else after the first sentence, else at 3 s.
const hook = (plan.hook || []).filter(l => String(l).trim());
let hookOut = bounds.slice(1, -1).find(b => b >= 2 && b <= 4);
if (hookOut === undefined) hookOut = words.find(w => /[.?!]$/.test(w.text) && w.end >= 2.2 && w.end <= 4.5)?.end ?? 3;
hookOut = Math.min(hookOut, END - 0.5);

// Zooms: settle on frame 0, then alternate levels on every cut, punch word and new clause in a long stretch.
const LEVELS = [1.04, 1.12];
let events = [...bounds.slice(1, -1), ...[...punchSet].map(i => words[i].start)].filter(t => t > 0.6 && t < END - 0.4);
const clauseStarts = words.filter((w, k) => k && /[.?!,;:]$/.test(words[k - 1].text)).map(w => w.start);
const marks = [0, ...[...new Set(events)].sort((a, b) => a - b), END];
for (let m = 0; m < marks.length - 1; m++) {
  let t = marks[m];
  while (marks[m + 1] - t > 2.5) {
    const next = clauseStarts.find(c => c >= t + 1.2 && c <= marks[m + 1] - 0.8);
    if (next === undefined) break;
    events.push(next);
    t = next;
  }
}
events = [...new Set(events)].sort((a, b) => a - b);
const tl = ['tl.fromTo("#frame", { scale: 1.12 }, { scale: 1.04, duration: 0.5, ease: "expo.out" }, 0);'];
let level = 0, tPrev = 0.5;
for (const t of events) {
  if (t - tPrev > 0.4) tl.push(`tl.to("#frame", { scale: ${(LEVELS[level] + 0.02).toFixed(3)}, duration: ${t3(t - tPrev)}, ease: "none" }, ${t3(tPrev)});`);
  level = 1 - level;
  tl.push(`tl.to("#frame", { scale: ${LEVELS[level].toFixed(3)}, duration: 0.2, ease: "power3.out" }, ${t3(t)});`);
  tPrev = t + 0.2;
}
if (END - tPrev > 0.4) tl.push(`tl.to("#frame", { scale: ${(LEVELS[level] + 0.03).toFixed(3)}, duration: ${t3(END - tPrev)}, ease: "none" }, ${t3(tPrev)});`);

if (hook.length) {
  tl.push('tl.fromTo("#hook .punch", { scale: 1.15 }, { scale: 1, duration: 0.24, ease: "back.out(2)" }, 0);');
  tl.push(`tl.to("#hook", { y: -24, opacity: 0, duration: 0.2, ease: "power2.in" }, ${t3(Math.max(0.5, hookOut - 0.2))});`);
}

// The accent transition (wipe or flash) covers at most two cuts: the turn out of the opener and the turn into the
// payoff. Every other cut gets only its zoom (Thomas's rule: at most two transition types per video).
const inner = bounds.slice(1, -1);
let turnCuts = (plan.transition_at || []).map(n => inner[n - 1]).filter(t => t !== undefined);
if (!plan.transition_at && transition !== "punch" && inner.length) {
  turnCuts = [inner.find(t => t >= 1.5), inner.length > 1 ? inner[inner.length - 1] : undefined].filter((t, i, a) => t !== undefined && a.indexOf(t) === i);
  if (turnCuts.length === 2 && turnCuts[1] - turnCuts[0] < 3) turnCuts = [turnCuts[0]];
}
const fxHtml = [];
if (transition === "wipe") {
  turnCuts.forEach((t, i) => {
    fxHtml.push(`<div class="wipe" id="wipe${i}"></div>`);
    // Hidden in CSS until its moment; GSAP owns the transform (position and skew), so nothing covers frame 0.
    tl.push(`tl.fromTo("#wipe${i}", { xPercent: 110, skewX: -12, opacity: 1 }, { xPercent: 0, skewX: -12, opacity: 1, duration: 0.14, ease: "power2.in", immediateRender: false }, ${t3(t - 0.14)});`);
    tl.push(`tl.to("#wipe${i}", { xPercent: -115, duration: 0.18, ease: "power2.out" }, ${t3(t)});`);
  });
} else if (transition === "flash") {
  turnCuts.forEach((t, i) => {
    fxHtml.push(`<div class="flash" id="flash${i}"></div>`);
    tl.push(`tl.to("#flash${i}", { opacity: 1, duration: ${t3(2 / FPS)}, ease: "none" }, ${t3(t - 2 / FPS)});`);
    tl.push(`tl.to("#flash${i}", { opacity: 0, duration: ${t3(5 / FPS)}, ease: "none" }, ${t3(t)});`);
  });
}

// Captions in the brand's style. Each chunk holds its place; each word appears as it's spoken.
const capHtml = [], capJs = [];
const willShowCard = endCard && END - (words[words.length - 1].end + 0.15) >= 0.6;
chunks.forEach((ids, n) => {
  const next = chunks[n + 1] ? words[chunks[n + 1][0]].start : null;
  const lastEnd = words[ids[ids.length - 1]].end;
  const hide = next !== null ? Math.min(next, lastEnd + 0.6) : willShowCard ? lastEnd + 0.15 : null;
  capHtml.push(`<div class="cap" id="c${n}">${ids.map(i => `<b${keySet.has(i) ? ' class="key"' : ""}>${esc(shown(words[i].text))}</b>`).join("")}</div>`);
  capJs.push(`["#c${n}", ${JSON.stringify(ids.map(i => Math.round(words[i].start * 1000) / 1000))}, ${hide === null ? "null" : Math.round(hide * 1000) / 1000}]`);
});
const pop = capStyle === "punchy" ? 'tl.fromTo(el, { scale: 1.18 }, { scale: 1, duration: 0.16, ease: "back.out(2)", immediateRender: false }, starts[i]);' : "";

// End card: the logo and one line over the final hold, from just after the last word.
const lastWordEnd = words[words.length - 1].end;
const cardAt = lastWordEnd + 0.15;
const logoSrc = brand.logo?.file ? resolve(brandDir, brand.logo.file) : null;
const showCard = endCard && END - cardAt >= 0.6 && (logoSrc && existsSync(logoSrc) || brand.end_card?.line);
if (showCard) {
  tl.push(`tl.to("#card", { opacity: 1, duration: 0.25, ease: "power2.out" }, ${t3(cardAt)});`);
  tl.push(`tl.fromTo("#card .card-inner", { scale: 0.92 }, { scale: 1, duration: 0.35, ease: "back.out(1.6)", immediateRender: false }, ${t3(cardAt)});`);
}
const fadeAt = Math.max(END - 0.6, lastWordEnd + 0.1);
if (!showCard && END - fadeAt >= 0.2) tl.push(`tl.to("#fade", { opacity: 1, duration: ${(END - fadeAt - 1 / FPS).toFixed(4)}, ease: "none" }, ${fadeAt.toFixed(4)});`);

// Sound: HyperFrames' library (from the copy setup.mjs installs, else its plugin), or the editor's own basic pack.
// Start = event minus the file's peak.
function hyperframesSfxDir() {
  const sub = ["skills", "media-use", "audio", "assets", "sfx"];
  const dirs = [join(HF_PKG, "dist", ...sub)];
  const base = join(homedir(), ".claude", "plugins", "cache", "hyperframes", "hyperframes");
  if (existsSync(base)) for (const v of readdirSync(base).sort().reverse()) dirs.push(join(base, v, ...sub));
  return dirs.find(d => existsSync(join(d, "pop.mp3"))) || null;
}
const pack = brand.sound?.pack === "basic" ? null : hyperframesSfxDir();
const SFX = pack
  ? { hook: ["impact-bass-1.mp3", 0.073, 1.2], zoom: ["whoosh-short.mp3", 0.161, 0.575], turn: ["whoosh.mp3", 0.161, 0.575], key: ["click-soft.mp3", 0.051, 0.366], end: ["chime.mp3", 0.416, 2.5] }
  : { hook: ["pop.mp3", 0, 0.2], zoom: ["whoosh.mp3", 0.338, 0.6], turn: ["whoosh.mp3", 0.338, 0.6], key: null, end: ["chime.mp3", 0.007, 2.0] };
const sfxDir = pack || join(ASSETS, "sfx");
const audio = [], used = new Set(), times = [];
let track = 10;
function sound(kind, at, vol = volume) {
  const s = SFX[kind];
  if (!s || !soundOn) return;
  const start = Math.max(0, at - s[1]);
  if (times.some(t => Math.abs(t - at) < (kind === "key" ? 1.0 : 0.3))) return;
  const len = Math.min(s[2], END - start);
  if (len < 0.15) return;
  audio.push(`<audio id="sfx-${kind}-${track}" class="clip" src="assets/sfx/${s[0]}" data-start="${t3(start)}" data-duration="${t3(len)}" data-track-index="${track}" data-volume="${vol}"></audio>`);
  used.add(s[0]); times.push(at); track++;
}
if (hook.length) sound("hook", 0, volume * 0.9);
turnCuts.forEach(t => sound("turn", t));
let lastZoom = -10;
for (const t of events) if (!turnCuts.includes(t) && t - lastZoom >= 3.5) { sound("zoom", t); lastZoom = t; }
if (capStyle === "bold-chip") [...keySet].slice(0, 3).forEach(i => sound("key", words[i].start, volume * 0.6));
// The chime peaks as the last word ends and rings out over the hold.
if (END - lastWordEnd >= 0.5) sound("end", lastWordEnd + 0.05, volume * 0.8);

// Music: only a track the person supplies and owns, kept low under the voice.
const musicSrc = brand.sound?.music ? resolve(brandDir, brand.sound.music) : null;
if (musicSrc && existsSync(musicSrc) && soundOn) {
  audio.push(`<audio id="music" class="clip" src="assets/brand/${esc(basename(musicSrc))}" data-start="0" data-duration="${t3(END)}" data-track-index="5" data-volume="${brand.sound.music_volume ?? 0.08}"></audio>`);
}

// Files the composition uses.
const reel = join(project, "reel");
for (const d of ["sfx", "fonts", "vendor", "brand"]) mkdirSync(join(reel, "assets", d), { recursive: true });
copyFileSync(join(project, "edit", "cut.mp4"), join(reel, "assets", "cut.mp4"));
for (const f of used) copyFileSync(join(sfxDir, f), join(reel, "assets", "sfx", f));
const fontSrc = [brand.font?.file && resolve(brandDir, brand.font.file), join(ASSETS, "fonts", "Montserrat-Variable.ttf")].find(p => p && existsSync(p));
copyFileSync(fontSrc, join(reel, "assets", "fonts", basename(fontSrc)));
const family = brand.font?.file && existsSync(resolve(brandDir, brand.font.file)) ? brand.font.family : "Montserrat";
if (showCard && logoSrc && existsSync(logoSrc)) copyFileSync(logoSrc, join(reel, "assets", "brand", basename(logoSrc)));
if (musicSrc && existsSync(musicSrc) && soundOn) copyFileSync(musicSrc, join(reel, "assets", "brand", basename(musicSrc)));
const gsap = gsapFile();
if (!gsap || !existsSync(gsap)) fail("HyperFrames isn't installed yet: run setup.mjs first");
copyFileSync(gsap, join(reel, "assets", "vendor", "gsap.min.js"));

const [fx, fy] = plan.face || [50, 34];
// Keep the caption above the bottom 420 px, where the platforms put the caption text and buttons.
const capY = Math.max(300, Math.min(Number(plan.caption_y || 1120), 1500 - Math.round(capSize * 1.1) - 48));
const hk = brand.hook || {};
const hookHtml = !hook.length ? "" : `<div id="hook">${hook.length > 1 ? `<span class="setup">${esc(hook[0])}</span><span class="punch">${esc(hook[1])}</span>` : `<span class="punch">${esc(hook[0])}</span>`}</div>`;
const cardHtml = !showCard ? "" : `<div id="card"><div class="card-inner">${logoSrc && existsSync(logoSrc) ? `<img src="assets/brand/${esc(basename(logoSrc))}" alt="" />` : ""}${brand.end_card?.line ? `<p>${esc(brand.end_card.line)}</p>` : ""}</div></div>`;

const captionCss = {
  "bold-chip": `.cap b { color: var(--caption); font-weight: 800; text-shadow: 0 3px 0 rgba(0,0,0,.7), 0 0 18px rgba(0,0,0,.75), 0 0 40px rgba(0,0,0,.45); }
      .cap b.key { padding: 2px 16px 10px; background: var(--accent); color: var(--accent-text); text-shadow: none; border-radius: 10px; box-shadow: 0 0 0 5px #fff, 0 12px 26px rgba(0,0,0,.3); }`,
  "clean-plate": `.cap { padding: 14px 26px 18px; border-radius: 18px; background: rgba(16,18,14,.72); left: auto; right: auto; inset-inline: 0; margin-inline: auto; width: fit-content; max-width: 880px; }
      .cap b { color: var(--caption); font-weight: 700; }
      .cap b.key { ${keyChip ? "padding: 0 12px 6px; border-radius: 10px; background: var(--accent); color: var(--accent-text);" : "color: var(--accent);"} }`,
  punchy: `.cap b { color: var(--caption); font-weight: 900; text-transform: uppercase; letter-spacing: -0.01em; -webkit-text-stroke: 3px rgba(0,0,0,.85); paint-order: stroke fill; text-shadow: 0 6px 18px rgba(0,0,0,.55); }
      .cap b.key { ${keyChip ? "padding: 0 14px 8px; border-radius: 12px; background: var(--accent); color: var(--accent-text); -webkit-text-stroke: 0;" : "color: var(--accent);"} }`,
}[capStyle] || "";

const page = `<!doctype html>
<!-- Built by the Handoff Video Editor (build_reel.mjs) from edit/words.json, reel/plan.json and the brand file. Rebuild, don't hand-edit. -->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      @font-face { font-family: "${esc(family)}"; src: url("assets/fonts/${esc(basename(fontSrc))}"); font-weight: 100 900; font-display: block; }
      :root { --accent: ${col.accent}; --accent-text: ${col.accent_text}; --bar: ${col.bar}; --bar-text: ${col.bar_text}; --caption: ${col.caption}; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #000; font-family: "${esc(family)}", sans-serif; }
      #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; }
      #frame { position: absolute; inset: 0; transform-origin: ${fx}% ${fy}%; }
      #frame video { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }
      #hook { position: absolute; left: 60px; right: 140px; top: 230px; display: grid; justify-items: center; gap: 10px; }
      #hook span { display: block; max-width: 100%; text-align: center; font-weight: ${hk.weight || 900}; line-height: 1.02; letter-spacing: -0.02em; box-shadow: 0 16px 36px rgba(0,0,0,.32); }
      #hook .setup { padding: 8px 22px 12px; background: var(--bar); color: var(--bar-text); font-size: ${hk.setup_size || 56}px; }
      #hook .punch { padding: 10px 28px 18px; background: var(--accent); color: var(--accent-text); font-size: ${hk.punch_size || 96}px; }
      .cap { position: absolute; left: 60px; right: 140px; top: ${capY}px; display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; gap: 0 20px; opacity: 0; }
      .cap b { display: block; font-size: ${capSize}px; letter-spacing: -0.02em; line-height: 1.1; white-space: nowrap; opacity: 0; }
      ${captionCss}
      .wipe { position: absolute; top: -10%; left: -20%; width: 140%; height: 120%; background: var(--accent); border-left: 34px solid var(--bar); opacity: 0; }
      .flash { position: absolute; inset: 0; background: #fff; opacity: 0; }
      #card { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.55); opacity: 0; }
      #card .card-inner { display: grid; justify-items: center; gap: 28px; padding: 0 120px; }
      #card img { max-width: 420px; max-height: 300px; object-fit: contain; }
      #card p { padding: 10px 28px 16px; background: var(--accent); color: var(--accent-text); font-size: 64px; font-weight: 900; text-align: center; line-height: 1.05; }
      #fade { position: absolute; inset: 0; background: #000; opacity: 0; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${t3(END)}" data-width="1080" data-height="1920" data-fps="${FPS}"
      data-fx-chain='{"version":1,"nodes":[{"type":"truepeak","id":"m1","params":{"ceiling":-1.5}}]}'>
      <div id="frame">
        <video id="take" class="clip" src="assets/cut.mp4" data-start="0" data-duration="${t3(END)}" data-media-start="0" data-track-index="0" playsinline data-has-audio="true"></video>
      </div>
      ${hookHtml}
      ${capHtml.join("\n      ")}
      ${fxHtml.join("\n      ")}
      ${cardHtml}
      <div id="fade"></div>
      ${audio.join("\n      ")}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${tl.join("\n      ")}
      const chunks = [${capJs.join(", ")}];
      for (const [id, starts, end] of chunks) {
        const els = gsap.utils.toArray(\`\${id} b\`);
        tl.to(id, { opacity: 1, duration: 0.08, ease: "none" }, starts[0]);
        ${capStyle === "clean-plate" ? 'tl.to(els, { opacity: 0.45, duration: 0.08, ease: "none" }, starts[0]);' : ""}
        els.forEach((el, i) => { tl.to(el, { opacity: 1, duration: 0.08, ease: "none" }, starts[i]); ${pop} });
        if (end !== null) tl.to(id, { opacity: 0, duration: 0.01, ease: "none" }, end);
      }
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
writeFileSync(join(reel, "index.html"), page);
console.log(`built ${join(reel, "index.html")}: ${END.toFixed(2)} s, ${chunks.length} caption lines (${capStyle}), ${keySet.size} key words, ${events.length} zooms, `
  + `${turnCuts.length} ${transition} transitions, ${audio.length} sounds (${pack ? "HyperFrames library" : "basic pack"}), hook ${hook.length ? `until ${hookOut.toFixed(2)} s` : "off"}, end card ${showCard ? "on" : "off"}`);
