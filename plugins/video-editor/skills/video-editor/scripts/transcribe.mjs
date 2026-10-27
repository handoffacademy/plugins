// Word-level timings for the staged take, with HyperFrames' local speech-to-text.
//
// Usage: node transcribe.mjs <project folder> [--language es]
//
// Uses Parakeet (installed once by setup.mjs; fast, needs no compiler on Mac or Windows) and falls back to whisper.
// Writes edit/transcript.json (HyperFrames' own file) and edit/words_source.json ({"words": [{text, start, end}]}).
import { join } from "node:path";
import { args, fail, hf, readJSON, writeJSON } from "./lib.mjs";

const { positional: [project], opts } = args("node transcribe.mjs <project folder> [--language es]", 1);
const edit = join(project, "edit");
const lang = opts.language || "en";
const attempt = engine => hf(["transcribe", "voice16k.wav", "--engine", engine, "--json",
  ...(engine === "whisper" ? ["--model", lang === "en" ? "small.en" : "small", "--language", lang] : [])], { cwd: edit, allowFail: true });

let r = attempt("parakeet");
if (r.status !== 0) {
  console.log("Parakeet isn't ready, so using whisper (the first run downloads it)...");
  r = attempt("whisper");
}
if (r.status !== 0) fail(`transcription failed:\n${(r.stderr || "").trim().split("\n").slice(-10).join("\n")}`);

const raw = readJSON(join(edit, "transcript.json"));
const items = Array.isArray(raw) ? raw : raw.words;
const words = items.filter(w => String(w.text || "").trim())
  .map(w => ({ text: String(w.text).trim(), start: Math.round(Number(w.start) * 1000) / 1000, end: Math.round(Number(w.end) * 1000) / 1000 }))
  .sort((a, b) => a.start - b.start);
writeJSON(join(edit, "words_source.json"), { words });
console.log(`${words.length} words: ${words.map(w => w.text).join(" ")}`);
