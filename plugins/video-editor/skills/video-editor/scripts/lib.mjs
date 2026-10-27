// Shared helpers for the Video Editor scripts. Plain Node.js 22+, no packages: runs the same on Mac and Windows.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const HF_VERSION = process.env.HF_VERSION || "0.8.209";
export const FPS = 30;
export const IS_WINDOWS = platform() === "win32";
export const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const TOOLS_DIR = process.env.VE_TOOLS || join(homedir(), ".video-editor", "tools");
/** HyperFrames as setup.mjs installs it: its CLI, plus the GSAP, skills and sound library it ships with. */
export const HF_PKG = join(TOOLS_DIR, "node_modules", "hyperframes");
const HF_BIN = join(HF_PKG, "bin", "hyperframes.mjs");

/** Where FFmpeg and ffprobe live: HyperFrames' own variables, then the copies setup.mjs installs, then the PATH. */
export function tool(name) {
  const envName = name === "ffmpeg" ? "HYPERFRAMES_FFMPEG_PATH" : "HYPERFRAMES_FFPROBE_PATH";
  if (process.env[envName] && existsSync(process.env[envName])) return process.env[envName];
  const exe = IS_WINDOWS ? `${name}.exe` : name;
  const arch = process.arch === "arm64" ? "arm64" : "x64";
  const local = name === "ffmpeg"
    ? join(TOOLS_DIR, "node_modules", "ffmpeg-static", exe)
    : join(TOOLS_DIR, "node_modules", "@ffprobe-installer", `${IS_WINDOWS ? "win32" : platform()}-${arch}`, exe);
  return existsSync(local) ? local : name;
}

/** The environment every HyperFrames call gets, so it uses the same FFmpeg as these scripts. */
export function hfEnv() {
  const env = { ...process.env, DO_NOT_TRACK: "1" };
  const ffmpeg = tool("ffmpeg"), ffprobe = tool("ffprobe");
  if (ffmpeg !== "ffmpeg") env.HYPERFRAMES_FFMPEG_PATH = ffmpeg;
  if (ffprobe !== "ffprobe") env.HYPERFRAMES_FFPROBE_PATH = ffprobe;
  return env;
}

/** Run a program; stop with the last lines of its output when it fails. */
export function run(cmd, args, { cwd, env, quiet = true, allowFail = false } = {}) {
  const r = spawnSync(cmd, args, { cwd, env: env || process.env, encoding: "utf8", shell: IS_WINDOWS && /\.cmd$/.test(cmd), maxBuffer: 256 * 1024 * 1024 });
  if (r.error) {
    if (allowFail) return r;
    fail(`couldn't start ${cmd}: ${r.error.message}`);
  }
  if (r.status !== 0 && !allowFail) {
    const tail = `${r.stderr || ""}${r.stdout || ""}`.trim().split("\n").slice(-15).join("\n");
    fail(`${cmd} ${args.slice(0, 3).join(" ")} failed:\n${tail}`);
  }
  if (!quiet && r.stdout) process.stdout.write(r.stdout);
  return r;
}

/** GSAP exactly as HyperFrames ships it, or null before setup. */
export function gsapFile() {
  const vendor = join(HF_PKG, "dist", "vendor", "npm");
  const dir = existsSync(vendor) && readdirSync(vendor).filter(d => d.startsWith("gsap@")).sort().pop();
  return dir ? join(vendor, dir, "dist", "gsap.min.js") : null;
}

/** The command that runs HyperFrames: the installed copy through Node (no npx, so paths with spaces work on Windows), else npx. */
export function hfCommand(args) {
  if (existsSync(HF_BIN)) return [process.execPath, [HF_BIN, ...args]];
  return [IS_WINDOWS ? "npx.cmd" : "npx", ["-y", `hyperframes@${HF_VERSION}`, ...args]];
}

export function hf(args, opts = {}) {
  const [cmd, full] = hfCommand(args);
  return run(cmd, full, { env: hfEnv(), ...opts });
}

export const ffmpeg = (args, opts) => run(tool("ffmpeg"), ["-hide_banner", "-v", "error", "-y", ...args], opts);

export function probe(file) {
  const r = run(tool("ffprobe"), ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]);
  return JSON.parse(r.stdout);
}

/** Read the ffmpeg log of a filter (stderr) without failing on it. */
export function ffmpegLog(args) {
  return run(tool("ffmpeg"), ["-hide_banner", "-nostats", ...args], { allowFail: true }).stderr || "";
}

export const readJSON = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback);
export function writeJSON(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 1)}\n`);
}

export const snap = t => Math.round(Math.round(t * FPS) / FPS * 10000) / 10000;
export const clean = s => s.toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9']/g, "");

export function fail(message) {
  console.error(message);
  process.exit(1);
}

export function args(usage, min) {
  const a = process.argv.slice(2);
  if (a.length < min) fail(`usage: ${usage}`);
  const opts = {};
  const positional = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith("--")) {
      const next = a[i + 1];
      if (next === undefined || next.startsWith("--")) opts[a[i].slice(2)] = true;
      else { opts[a[i].slice(2)] = next; i++; }
    } else positional.push(a[i]);
  }
  return { positional, opts };
}
