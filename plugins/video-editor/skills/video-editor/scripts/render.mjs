// Build the composition, check it, render it with HyperFrames and master the sound.
//
// Usage: node render.mjs <project folder> <name> [--draft] [--brand brand.json]
//
// Writes <project>/final/<name>.mp4 (1080x1920, 30 fps, -14 LUFS) and copies it to the studio's finished/ folder
// when the project sits in <studio>/projects/. --draft renders faster at lower quality for a first look.
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { SKILL_DIR, args, fail, hf, run } from "./lib.mjs";

const { positional: [projectArg, name], opts } = args("node render.mjs <project folder> <name> [--draft] [--brand brand.json]", 2);
const project = resolve(projectArg);
const reel = join(project, "reel");
const node = (script, extra) => run(process.execPath, [join(SKILL_DIR, "scripts", script), ...extra], { quiet: false });

if (!existsSync(join(reel, "hyperframes.json"))) {
  const tmp = join(project, "reel.tmp");
  rmSync(tmp, { recursive: true, force: true });
  hf(["init", "reel.tmp", "--non-interactive", "--example=blank", "--resolution", "portrait", "--skip-skills"], { cwd: project });
  mkdirSync(reel, { recursive: true });
  for (const f of ["hyperframes.json", "meta.json", "package.json"]) if (existsSync(join(tmp, f))) copyFileSync(join(tmp, f), join(reel, f));
  rmSync(tmp, { recursive: true, force: true });
}

node("build_reel.mjs", [project, ...(opts.brand ? ["--brand", opts.brand] : [])]);
const lint = hf(["lint"], { cwd: reel, allowFail: true });
if (lint.status !== 0) fail(`HyperFrames found a problem in the composition:\n${(lint.stdout || "") + (lint.stderr || "")}`);
console.log("rendering...");
hf(["render", "--fps", "30", "--workers", "1", "--quality", opts.draft ? "draft" : "looks", "--output", join(project, "edit", "render.mp4")], { cwd: reel });
mkdirSync(join(project, "final"), { recursive: true });
const out = join(project, "final", `${name}.mp4`);
node("master.mjs", [join(project, "edit", "render.mp4"), out]);

const studio = dirname(dirname(project));
if (basename(dirname(project)) === "projects" && existsSync(join(studio, "finished"))) {
  cpSync(out, join(studio, "finished", `${name}.mp4`));
  console.log(`finished: ${join(studio, "finished", `${name}.mp4`)}`);
} else console.log(`finished: ${out}`);
