// First pass at the cut: drop fillers, false starts and restarts, and shrink long pauses, on word boundaries.
//
// Usage: node suggest_cut.mjs <project folder> [--pause 0.35] [--hold 1.0]
//
// Reads edit/words_source.json ({"words": [{"text", "start", "end"}]}, source seconds) and writes edit/edl.json:
// {"source": "source.mp4", "ranges": [{"start", "end", "quote", "reason"}], "removed": [...]}. This is a suggestion:
// read the transcript, then change edl.json by hand when a different take reads better. render_cut.mjs only follows
// the ranges.
//
// It removes fillers spoken alone (um, uh, er, erm, ah, hmm, mm); a restart (everything from the start of the attempt
// up to "let me start over", "start again", "let me try that again", "one more time", "take two", or a "sorry"/"wait"
// that breaks off an attempt); a repeated opening (the same 3+ words starting an attempt again within 15 s); and
// pauses longer than --pause inside a line. The last kept word gets up to --hold s of settled picture after it.
import { join } from "node:path";
import { args, clean, fail, readJSON, writeJSON } from "./lib.mjs";

const { positional: [project], opts } = args("node suggest_cut.mjs <project folder> [--pause 0.35] [--hold 1.0]", 1);
const PAUSE = Number(opts.pause ?? 0.35);
const HOLD = Number(opts.hold ?? 1.0);
const PAD_IN = 0.08, PAD_OUT = 0.12;

const words = readJSON(join(project, "edit", "words_source.json"), { words: [] }).words;
const { duration } = readJSON(join(project, "edit", "source.json"), {});
if (!words.length) fail("no words in edit/words_source.json: transcribe first");
const tokens = words.map(w => clean(w.text));
const keep = words.map(() => true);
const why = words.map(() => "");

const FILLERS = new Set(["um", "uh", "er", "erm", "ah", "hmm", "mm", "uhm", "umm", "uhh"]);
tokens.forEach((t, i) => { if (FILLERS.has(t)) { keep[i] = false; why[i] = "filler"; } });

// An attempt starts at the first word, after a gap of 0.6 s or more, or after sentence-ending punctuation.
function attemptStart(i) {
  let j = i;
  while (j > 0) {
    if (words[j].start - words[j - 1].end >= 0.6 || /[.!?]$/.test(words[j - 1].text.trim())) break;
    j--;
  }
  return j;
}

const RESTARTS = [["let", "me", "start", "over"], ["start", "over"], ["start", "again"], ["let", "me", "try", "that", "again"],
  ["let", "me", "try", "again"], ["one", "more", "time"], ["take", "two"], ["sorry"], ["wait"]];
for (let i = 0; i < tokens.length; i++) {
  for (const phrase of RESTARTS) {
    const n = phrase.length;
    if (tokens.slice(i, i + n).join(" ") !== phrase.join(" ")) continue;
    const head = attemptStart(i);
    const onlyFillersBefore = !keep.slice(head, i).some(Boolean);
    if (n === 1) {
      // "sorry" or "wait" counts only when it breaks off an earlier attempt. "Wait until you see this" stays.
      const gapAfter = i + 1 < words.length ? words[i + 1].start - words[i].end : 1;
      const brokeOff = /[,.!?]$/.test(words[i].text.trim()) || gapAfter >= 0.25;
      if (!(brokeOff && onlyFillersBefore && head > 0)) continue;
    }
    // The marker at the head of an attempt throws away the attempt before it; mid-line, the line so far.
    const cutFrom = onlyFillersBefore && head > 0 ? attemptStart(head - 1) : head;
    for (let k = cutFrom; k < i + n; k++) { keep[k] = false; why[k] = `restart ('${phrase.join(" ")}')`; }
    i += n - 1;
    break;
  }
}

// Repeated openings: both copies must start an attempt, so "it's not the light, it's not the water" stays whole.
const startsAttempt = k => k === 0 || attemptStart(k) === k || !keep[k - 1];
for (let i = 0; i < tokens.length; i++) {
  if (!keep[i] || !startsAttempt(i)) continue;
  for (let j = i + 3; j < Math.min(tokens.length, i + 16); j++) {
    if (words[j].start - words[i].start > 15) break;
    if (!startsAttempt(j)) continue;
    let n = 0;
    while (j + n < tokens.length && i + n < j && tokens[i + n] && tokens[i + n] === tokens[j + n]) n++;
    if (n >= 3) {
      for (let k = i; k < j; k++) if (keep[k]) { keep[k] = false; why[k] = "said again right after"; }
      break;
    }
  }
}

const kept = keep.flatMap((k, i) => (k ? [i] : []));
if (!kept.length) fail("nothing left to keep: check edit/words_source.json");

const groups = [];
let start = kept[0];
kept.forEach((a, idx) => {
  const b = kept[idx + 1];
  if (b !== undefined && b === a + 1 && words[b].start - words[a].end <= PAUSE) return;
  groups.push([start, a]);
  start = b;
});

const r3 = x => Math.round(x * 1000) / 1000;
const ranges = groups.map(([a, b], n) => {
  const prevEnd = a > 0 ? words[a - 1].end : 0;
  const nextStart = b + 1 < words.length ? words[b + 1].start : duration;
  const s = Math.max(a > 0 ? prevEnd + 0.02 : 0, words[a].start - PAD_IN, 0);
  let e = Math.min(nextStart - 0.02, words[b].end + PAD_OUT, duration);
  if (n === groups.length - 1) e = Math.min(nextStart - 0.05, words[b].end + HOLD, duration);
  return { start: r3(s), end: r3(e), quote: words.slice(a, b + 1).map(w => w.text.trim()).join(" "), reason: "kept" };
});

const removed = [];
let run = null;
words.forEach((w, k) => {
  if (keep[k]) return;
  if (run && run.why === why[k] && k === run.last + 1) { run.text += ` ${w.text.trim()}`; run.end = w.end; run.last = k; }
  else { run = { start: w.start, end: w.end, text: w.text.trim(), why: why[k], last: k }; removed.push(run); }
});
removed.forEach(r => delete r.last);

writeJSON(join(project, "edit", "edl.json"), { source: "source.mp4", ranges, removed });
const total = ranges.reduce((t, r) => t + r.end - r.start, 0);
console.log(`${ranges.length} pieces kept, ${total.toFixed(1)} s of ${Number(duration).toFixed(1)} s`);
for (const r of removed) console.log(`  cut ${r.start.toFixed(2)}-${r.end.toFixed(2)} (${r.why}): ${r.text}`);
