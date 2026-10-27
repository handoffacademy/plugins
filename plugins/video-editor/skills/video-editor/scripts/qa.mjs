// Check the finished file itself, not the plan: spec, sound level, black or frozen picture, gaps, and the words.
//
// Usage: node qa.mjs <project folder> <final.mp4> [--no-words]
//
// Writes <project>/final/qa/: QA.md (PASS, FAIL or CHECK per line with the measured numbers), stills at frame 0,
// the hook, either side of every cut, each highlighted word, every 2 s and the end, and sheet.jpg with all of them.
// Read every still before you call the video finished. Exits 1 when any line FAILs.
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { args, clean, ffmpeg, ffmpegLog, hf, probe, readJSON } from "./lib.mjs";

const { positional: [project, final], opts } = args("node qa.mjs <project folder> <final.mp4> [--no-words]", 2);
const qa = join(project, "final", "qa");
if (existsSync(qa)) rmSync(qa, { recursive: true });
mkdirSync(join(qa, "stills"), { recursive: true });
const cut = readJSON(join(project, "edit", "words.json"));
const plan = readJSON(join(project, "reel", "plan.json"), {});
const rows = [];
const row = (name, ok, measured, soft = false) => rows.push([name, ok ? "PASS" : soft ? "CHECK" : "FAIL", measured]);

const info = probe(final);
const v = info.streams.find(s => s.codec_type === "video");
const a = info.streams.find(s => s.codec_type === "audio");
const dur = Number(info.format.duration);
const [num, den] = v.r_frame_rate.split("/").map(Number);
const fps = num / den;
row("File spec", v.width === 1080 && v.height === 1920 && Math.abs(fps - 30) < 0.01 && v.codec_name === "h264" && a?.codec_name === "aac",
  `${v.width}x${v.height}, ${fps} fps, ${v.codec_name}/${a ? a.codec_name : "no sound"}`);
const starts = info.streams.map(s => Number(s.start_time || 0));
row("Picture and sound start together", starts.every(s => Math.abs(s) < 0.001), `stream starts ${starts.map(s => s.toFixed(3)).join(", ")}`);
row("Length", Math.abs(dur - cut.duration) < 0.15, `${dur.toFixed(2)} s (cut ${cut.duration.toFixed(2)} s)`, true);
const vLen = Number(v.duration || dur), aLen = Number(a?.duration || 0);
row("Picture and sound end together", Math.abs(vLen - aLen) <= 0.05, `picture ${vLen.toFixed(2)} s, sound ${aLen.toFixed(2)} s`);

const loud = ffmpegLog(["-i", final, "-af", "ebur128=peak=true", "-f", "null", "-"]);
const summary = loud.slice(loud.lastIndexOf("Summary:"));
const lufs = Number((summary.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]);
const peak = Number((summary.match(/Peak:\s+(-?[\d.]+) dBFS/) || [])[1]);
row("Loudness (-14 LUFS for social)", Math.abs(lufs + 14) <= 1, `${lufs.toFixed(1)} LUFS`);
row("True peak (at most -1 dBTP)", peak <= -1.0, `${peak.toFixed(1)} dBTP`);

const blacks = [...ffmpegLog(["-i", final, "-vf", "blackdetect=d=0.2:pic_th=0.98", "-an", "-f", "null", "-"])
  .matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map(m => [Number(m[1]), Number(m[2])]).filter(([s]) => s < dur - 0.7);
row("No black frames before the end fade", !blacks.length, blacks.length ? blacks.map(([s, e]) => `${s.toFixed(2)}-${e.toFixed(2)} s`).join(", ") : "none");
const frozen = [...ffmpegLog(["-i", final, "-vf", "freezedetect=n=0.002:d=1.5", "-an", "-f", "null", "-"])
  .matchAll(/freeze_start: ([\d.]+)/g)].map(m => Number(m[1])).filter(t => t < dur - 1.6);
row("No frozen picture", !frozen.length, frozen.length ? `picture stops moving at ${frozen.map(t => t.toFixed(2)).join(", ")} s` : "none", true);
const quiet = [...ffmpegLog(["-i", final, "-af", "silencedetect=n=-45dB:d=0.8", "-vn", "-f", "null", "-"])
  .matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map(m => [Number(m[1]), Number(m[2])]).filter(([s]) => s < dur - 1.3);
row("No dead air over 0.8 s", !quiet.length, quiet.length ? quiet.map(([s, e]) => `${s.toFixed(2)}-${e.toFixed(2)} s`).join(", ") : "none", true);

if (!opts["no-words"]) {
  ffmpeg(["-i", final, "-ac", "1", "-ar", "16000", join(qa, "final16k.wav")]);
  const r = hf(["transcribe", "final16k.wav", "--json"], { cwd: qa, allowFail: true });
  const heardFile = join(qa, "transcript.json");
  if (r.status === 0 && existsSync(heardFile)) {
    const raw = readJSON(heardFile);
    const heard = (Array.isArray(raw) ? raw : raw.words).map(w => clean(w.text)).filter(Boolean);
    const want = cut.words.map(w => clean(w.text)).filter(Boolean);
    // Share of kept words found, in order (longest common subsequence).
    const dp = Array.from({ length: want.length + 1 }, () => new Array(heard.length + 1).fill(0));
    for (let i = 1; i <= want.length; i++) for (let j = 1; j <= heard.length; j++)
      dp[i][j] = want[i - 1] === heard[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    const ratio = want.length ? dp[want.length][heard.length] / want.length : 1;
    writeFileSync(join(qa, "heard.txt"), `${heard.join(" ")}\n`);
    rows.push(["Every kept word is heard", ratio >= 0.9 ? "PASS" : ratio >= 0.75 ? "CHECK" : "FAIL", `${Math.round(ratio * 100)}% of kept words heard`]);
  } else {
    rows.push(["Every kept word is heard", "CHECK", "re-transcription didn't run"]);
  }
}

// Stills: frame 0, the hook, either side of every cut, each highlighted word, every 2 s, before the end fade, the end.
const keys = new Set((plan.key_words || []).map(k => k.toLowerCase().split("#")[0]));
let times = [0, 2.8, ...cut.boundaries.slice(1, -1).flatMap(b => [b - 0.1, b + 0.1]),
  ...cut.words.filter(w => keys.has(clean(w.text))).map(w => w.start + 0.15),
  ...Array.from({ length: Math.floor(dur / 2) }, (_, i) => (i + 1) * 2), Math.max(0, dur - 0.8), Math.max(0, dur - 2 / 30)];
times = [...new Set(times.filter(t => t >= 0 && t < dur).map(t => Math.round(t * 100) / 100))].sort((x, y) => x - y).slice(0, 24);
times.forEach((t, k) => ffmpeg(["-ss", t.toFixed(3), "-i", final, "-frames:v", "1", "-vf", "scale=360:640",
  join(qa, "stills", `${String(k).padStart(2, "0")}_${t.toFixed(2).padStart(6, "0")}s.jpg`)], { allowFail: true }));
const shots = readdirSync(join(qa, "stills")).filter(f => f.endsWith(".jpg")).sort();
const cols = Math.min(shots.length, 6);
// Build the sheet with an explicit list so it works the same on Windows (no shell globbing).
const inputs = shots.flatMap(f => ["-i", join(qa, "stills", f)]);
const grid = shots.map((_, i) => `[${i}:v]`).join("") + `xstack=inputs=${shots.length}:layout=${shots.map((_, i) => `${(i % cols) * 366}_${Math.floor(i / cols) * 646}`).join("|")}:fill=white[s]`;
if (shots.length > 1) ffmpeg([...inputs, "-filter_complex", grid, "-map", "[s]", "-frames:v", "1", join(qa, "sheet.jpg")], { allowFail: true });

const fails = rows.filter(r => r[1] === "FAIL").length, checks = rows.filter(r => r[1] === "CHECK").length;
const lines = [`# QA for ${basename(final)}`, "", "| Check | Result | Measured |", "|---|---|---|", ...rows.map(r => `| ${r.join(" | ")} |`), "",
  `Stills: ${shots.length} in stills/ and on sheet.jpg. Read them for: the hook readable on frame 0, captions on the right words and inside the frame, nothing important covered, eyes open on the first and last frames.`];
writeFileSync(join(qa, "QA.md"), `${lines.join("\n")}\n`);
console.log(lines.slice(2, rows.length + 4).join("\n"));
console.log(`\n${fails} FAIL, ${checks} CHECK. Stills: ${join(qa, "sheet.jpg")}`);
process.exit(fails ? 1 : 0);
