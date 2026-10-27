// Two-pass loudness master for social video: -14 LUFS, true peak -1.5 dBTP (headroom under the -1 dBTP limit).
// The picture is copied untouched; the sound is trimmed to the picture's length, measured, normalised and given a
// 30 ms fade in and 100 ms fade out so a looping reel never clicks.
//
// Usage: node master.mjs <in.mp4> <out.mp4> [target LUFS, default -14]
import { args, ffmpeg, ffmpegLog, probe } from "./lib.mjs";

const { positional: [input, output, target = "-14"] } = args("node master.mjs <in.mp4> <out.mp4> [LUFS]", 2);
const TP = -1.5, LRA = 11;
const v = probe(input).streams.find(s => s.codec_type === "video");
const dur = Number(v.duration);

const log = ffmpegLog(["-i", input, "-af", `loudnorm=I=${target}:TP=${TP}:LRA=${LRA}:print_format=json`, "-f", "null", "-"]);
const m = JSON.parse(log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1));
const af = `loudnorm=I=${target}:TP=${TP}:LRA=${LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,`
  + `atrim=0:${dur},afade=t=in:st=0:d=0.03,afade=t=out:st=${Math.max(0, dur - 0.1)}:d=0.1`;
ffmpeg(["-i", input, "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", output]);

const s = ffmpegLog(["-i", output, "-af", "ebur128=peak=true", "-f", "null", "-"]);
const summary = s.slice(s.lastIndexOf("Summary:"));
console.log(`master: ${(summary.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]} LUFS, true peak ${(summary.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/) || [])[1]} dBTP`);
