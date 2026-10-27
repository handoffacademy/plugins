// Run HyperFrames (pinned version) with the editor's FFmpeg, from anywhere: node hf.mjs <hyperframes arguments...>
// Use this instead of calling npx hyperframes directly, e.g. node hf.mjs preview, node hf.mjs doctor.
// Output streams as it comes, so a long-running preview shows its address straight away.
import { spawn } from "node:child_process";
import { IS_WINDOWS, hfCommand, hfEnv } from "./lib.mjs";

const [cmd, full] = hfCommand(process.argv.slice(2));
const child = spawn(cmd, full, { stdio: "inherit", env: hfEnv(), shell: IS_WINDOWS && cmd.endsWith(".cmd") });
child.on("exit", code => process.exit(code ?? 1));
