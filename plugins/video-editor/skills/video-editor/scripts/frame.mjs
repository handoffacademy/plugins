// Save one frame of the cut so you can see where the face is: node frame.mjs <project folder> [seconds, default 2]
// Writes <project>/edit/frame.jpg (540x960).
import { join } from "node:path";
import { args, ffmpeg } from "./lib.mjs";

const { positional: [project, at = "2"] } = args("node frame.mjs <project folder> [seconds]", 1);
const out = join(project, "edit", "frame.jpg");
ffmpeg(["-ss", String(at), "-i", join(project, "edit", "cut.mp4"), "-frames:v", "1", "-vf", "scale=540:960", out]);
console.log(out);
