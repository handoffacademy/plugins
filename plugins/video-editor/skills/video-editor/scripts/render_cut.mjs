// Render the cut that edl.json describes, in one encode, and map the kept words onto the cut's timeline.
//
// Usage: node render_cut.mjs <project folder>
//
// Every range is snapped to the 30 fps frame grid and trimmed from edit/source.mp4 in a single filter graph, so
// picture and voice stay in sync across every cut. Each audio piece gets a 12 ms fade at both ends so no cut clicks.
// When the take stops less than 0.9 s after the last word, the last frame is held (with silence) so the video never
// ends on a syllable. Writes edit/cut.mp4 and edit/words.json ({"duration", "boundaries", "words": [{text, start, end,
// range}]}).
import { join } from "node:path";
import { args, fail, ffmpeg, probe, readJSON, snap, writeJSON } from "./lib.mjs";

const { positional: [project] } = args("node render_cut.mjs <project folder>", 1);
const edit = join(project, "edit");
const edl = readJSON(join(edit, "edl.json"));
const words = readJSON(join(edit, "words_source.json")).words;
if (!edl) fail("no edit/edl.json yet: run suggest_cut.mjs first");

const ranges = edl.ranges.map(r => [snap(r.start), snap(r.end)]).filter(([s, e]) => e - s >= 2 / 30);
if (!ranges.length) fail("edl.json has no ranges long enough to keep");

const mid = w => (w.start + w.end) / 2;
const [lastS, lastE] = ranges[ranges.length - 1];
const keptLast = Math.max(...words.filter(w => lastS <= mid(w) && mid(w) <= lastE).map(w => w.end), lastS);
const hold = snap(Math.max(0, 0.9 - (lastE - keptLast)));

const parts = [];
const labels = ranges.map(([s, e], i) => {
  const d = e - s, fade = Math.min(0.012, d / 4);
  parts.push(`[0:v]trim=start=${s}:end=${e},setpts=PTS-STARTPTS[v${i}]`);
  parts.push(`[0:a]atrim=start=${s}:end=${e},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${fade.toFixed(3)},afade=t=out:st=${(d - fade).toFixed(4)}:d=${fade.toFixed(3)}[a${i}]`);
  return `[v${i}][a${i}]`;
}).join("");
if (hold > 0) {
  parts.push(`${labels}concat=n=${ranges.length}:v=1:a=1[vc][ac]`, `[vc]tpad=stop_mode=clone:stop_duration=${hold}[v]`, `[ac]apad=pad_dur=${hold}[a]`);
} else {
  parts.push(`${labels}concat=n=${ranges.length}:v=1:a=1[v][a]`);
}
ffmpeg(["-i", join(edit, "source.mp4"), "-filter_complex", parts.join(";"), "-map", "[v]", "-map", "[a]",
  "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-g", "30", "-keyint_min", "30", "-sc_threshold", "0",
  "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", join(edit, "cut.mp4")]);

const r3 = x => Math.round(x * 1000) / 1000;
const out = [], bounds = [0];
let offset = 0;
ranges.forEach(([s, e], i) => {
  for (const w of words) {
    if (s <= mid(w) && mid(w) <= e) out.push({ text: w.text.trim(), range: i, start: r3(offset + Math.max(0, w.start - s)), end: r3(offset + Math.min(w.end - s, e - s)) });
  }
  offset += e - s;
  bounds.push(Math.round(offset * 10000) / 10000);
});
// The timeline ends where the encoded picture really ends (frame rounding and the hold can move it a frame).
const cutInfo = probe(join(edit, "cut.mp4")).streams;
offset = Number(cutInfo.find(s => s.codec_type === "video").duration);
bounds[bounds.length - 1] = Math.round(offset * 10000) / 10000;
writeJSON(join(edit, "words.json"), { duration: Math.round(offset * 10000) / 10000, boundaries: bounds, words: out });

const starts = cutInfo.map(s => `${s.codec_type} ${Number(s.start_time || 0).toFixed(3)}`);
console.log(`cut: ${ranges.length} pieces, ${offset.toFixed(2)} s, ${out.length} words; stream starts ${starts.join(", ")}${hold > 0 ? `; held the last frame ${hold.toFixed(2)} s` : ""}`);
ranges.forEach((_, i) => console.log(`  ${i}: ${out.filter(w => w.range === i).map(w => w.text).join(" ")}`));
