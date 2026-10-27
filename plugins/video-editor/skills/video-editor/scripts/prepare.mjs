// Stage a raw take for editing: a 1080x1920, 30 fps, timestamp-clean copy plus a 16 kHz voice track.
//
// Usage: node prepare.mjs <input video> <project folder>
//
// Makes <project>/{edit,final}, writes edit/source.mp4 (H.264, a keyframe every second, AAC 48 kHz, both streams
// starting at 0), edit/voice16k.wav (mono) and edit/source.json (what came in). Landscape or square footage is
// centre-cropped to 9:16, and HDR footage (iPhones film it by default) is tone-mapped to normal colour; the report
// says so.
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { args, fail, ffmpeg, probe, run, tool, writeJSON } from "./lib.mjs";

const { positional: [src, project] } = args("node prepare.mjs <input video> <project folder>", 2);
if (!existsSync(src)) fail(`can't find the video: ${src}`);
const edit = join(project, "edit");
for (const sub of ["edit", "final"]) mkdirSync(join(project, sub), { recursive: true });

const info = probe(src);
const video = info.streams.find(s => s.codec_type === "video");
const audio = info.streams.find(s => s.codec_type === "audio");
if (!video) fail("this file has no picture in it");
if (!audio) fail("this file has no sound in it, so there are no words to cut on");

let [w, h] = [Number(video.width), Number(video.height)];
const rotation = Number((video.side_data_list || []).find(d => d.rotation !== undefined)?.rotation || video.tags?.rotate || 0);
if (Math.abs(rotation) % 180 === 90) [w, h] = [h, w];
const duration = Number(info.format.duration);
const [num, den] = (video.avg_frame_rate || "30/1").split("/").map(Number);
const fpsIn = den ? num / den : 30;

// HDR (HLG from iPhones, PQ from some Android phones) looks grey and washed out unless it's tone-mapped. zscale does it
// properly; without it (some FFmpeg builds), a colour-space conversion gets close.
const transfer = video.color_transfer || "";
const hdr = ["arib-std-b67", "smpte2084"].includes(transfer);
const zscale = hdr && / zscale /.test(run(tool("ffmpeg"), ["-hide_banner", "-filters"], { allowFail: true }).stdout || "");
const toSdr = !hdr ? "" : zscale
  ? `zscale=tin=${transfer}:pin=bt2020:min=bt2020nc:t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,`
  : "colorspace=all=bt709:iprimaries=bt2020:itrc=bt2020-10:ispace=bt2020ncl:format=yuv420p,";
const vf = toSdr + "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p,setpts=PTS-STARTPTS";
ffmpeg(["-i", src, "-map", "0:v:0", "-map", "0:a:0", "-vf", vf, "-af", "aresample=48000,asetpts=PTS-STARTPTS",
  "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-g", "30", "-keyint_min", "30", "-sc_threshold", "0",
  "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
  "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", join(edit, "source.mp4")]);
ffmpeg(["-i", join(edit, "source.mp4"), "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", join(edit, "voice16k.wav")]);

const cropped = w / h > 9 / 16 + 0.01;
writeJSON(join(edit, "source.json"), { input: src, width: w, height: h, fps: Math.round(fpsIn * 1000) / 1000, duration: Math.round(duration * 1000) / 1000, cropped_to_vertical: cropped, hdr: hdr ? transfer : false });
console.log(`staged ${duration.toFixed(1)} s of video (${cropped ? `${w}x${h}, so it was centre-cropped to vertical` : "vertical"}, ${fpsIn.toFixed(2)} fps in, 30 fps out${hdr ? `, converted from HDR${zscale ? "" : " (approximate: this FFmpeg has no zscale)"}` : ""}) in ${edit}`);
