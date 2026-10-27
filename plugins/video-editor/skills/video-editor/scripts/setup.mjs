// One-time setup of the video studio on this computer (Mac or Windows). Safe to run again: it skips what's there.
//
// Usage: node setup.mjs [studio folder]   (default: the current folder)
//
// Installs into ~/.video-editor/tools with npm (no admin password, no git): HyperFrames (pinned) with the GSAP and
// sound library it ships, and FFmpeg and ffprobe, so every computer edits with the same build (it can convert iPhone
// HDR). Then HyperFrames' headless Chrome and the Parakeet speech-to-text model (about 640 MB, once). Copies
// HyperFrames' core skills into the studio's .claude/skills (unless HyperFrames' plugin is installed) and makes the
// studio's folders. Prints a plain checklist; exits 1 if something is missing. It changes no Claude settings.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { HF_PKG, HF_VERSION, IS_WINDOWS, TOOLS_DIR, gsapFile, hf, readJSON, run, tool, writeJSON } from "./lib.mjs";

const studio = resolve(process.argv[2] || ".");
let ok = true;
const line = (what, status) => console.log(`${what.padEnd(30)} ${status}`);
const npm = IS_WINDOWS ? "npm.cmd" : "npm";
const npmInstall = pkgs => run(npm, ["i", "--silent", "--no-audit", "--no-fund", "--prefix", TOOLS_DIR, ...pkgs], { allowFail: true });
mkdirSync(TOOLS_DIR, { recursive: true });
if (!existsSync(join(TOOLS_DIR, "package.json"))) writeJSON(join(TOOLS_DIR, "package.json"), { name: "video-editor-tools", private: true });

const major = Number(process.versions.node.split(".")[0]);
if (major >= 22) line("Node.js 22 or newer", `ready (${process.version})`);
else { line("Node.js 22 or newer", `TOO OLD (${process.version}): install the LTS version from nodejs.org`); ok = false; }

// HyperFrames, pinned: the renderer, plus GSAP, its skills and its sound effects.
if (readJSON(join(HF_PKG, "package.json"), {}).version !== HF_VERSION) npmInstall([`hyperframes@${HF_VERSION}`]);
const hfOk = readJSON(join(HF_PKG, "package.json"), {}).version === HF_VERSION && hf(["--version"], { allowFail: true }).status === 0;
if (hfOk) hf(["telemetry", "disable"], { allowFail: true });
line(`HyperFrames ${HF_VERSION}`, hfOk ? "ready" : "MISSING: npm couldn't download it");
ok &&= hfOk && Boolean(gsapFile());

// FFmpeg: the editor's own copy, so every computer has the same one. The computer's own is the fallback.
const works = cmd => run(cmd, ["-hide_banner", "-version"], { allowFail: true }).status === 0;
if (tool("ffmpeg") === "ffmpeg" || tool("ffprobe") === "ffprobe") npmInstall(["ffmpeg-static@5", "@ffprobe-installer/ffprobe@2"]);
const ffOk = works(tool("ffmpeg")) && works(tool("ffprobe"));
line("Video tools (FFmpeg)", ffOk ? `ready (${tool("ffmpeg") === "ffmpeg" ? "this computer's own" : "installed for the editor"})` : "MISSING: couldn't install it");
ok &&= ffOk;

const chromeOk = hfOk && hf(["browser", "ensure"], { allowFail: true }).status === 0;
line("Renderer (headless Chrome)", chromeOk ? "ready" : "MISSING: the download failed");
ok &&= chromeOk;

const parakeetOk = hfOk && hf(["models", "install", "parakeet"], { allowFail: true }).status === 0;
line("Speech-to-text (Parakeet)", parakeetOk ? "ready" : "not installed: the editor will use whisper instead (slower first run)");

// HyperFrames' own skills, so Claude can make extras (titles, motion graphics) in this folder. The plugin has them too.
const plugin = existsSync(join(homedir(), ".claude", "plugins", "cache", "hyperframes"));
if (hfOk && !plugin) {
  for (const name of ["hyperframes", "hyperframes-cli", "media-use"]) {
    const from = join(HF_PKG, "dist", "skills", name);
    if (existsSync(from)) cpSync(from, join(studio, ".claude", "skills", name), { recursive: true, force: true });
  }
}
const skillsOk = plugin || existsSync(join(studio, ".claude", "skills", "hyperframes", "SKILL.md"));
line("HyperFrames skills", skillsOk ? (plugin ? "ready (HyperFrames plugin)" : "ready (in this folder)") : "not added: the editor still works");

for (const sub of ["brand", "inbox", "projects", "finished"]) mkdirSync(join(studio, sub), { recursive: true });
line("Your studio folder", `ready (${studio})`);

console.log(ok ? "\nAll set." : "\nSomething is missing: see the lines above.");
process.exit(ok ? 0 : 1);
