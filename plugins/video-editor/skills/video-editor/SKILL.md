---
name: video-editor
description: Viral short-form video editor for talking-head videos, on the person's own Mac or Windows computer with HyperFrames. Cuts fillers, false starts and long pauses on word boundaries, opens on a scroll-stopping text hook, adds word-by-word captions in the person's brand style, zooms on every cut, an accent transition at the story's turns, sound effects on emphasis, an optional logo end card and a -14 LUFS sound master, then checks the finished file before handing it over. Use when someone asks to edit a video, cut a take, caption it, "make it a reel", "make this a TikTok or a Short", make hook versions for trial reels, or runs the practice clip from the Handoff kit.
---

# Video Editor

Turn one raw take into a finished 1080×1920 video the person can post, in their own brand, on their own computer.

**Done means:** a 1080×1920, 30 fps MP4 at -14 LUFS in the studio's `finished` folder that passes `scripts/qa.mjs` (every line PASS, or a CHECK you looked at and explain), with a suggested post caption and a two-line note of what you changed.

`SKILL` below is this skill's own folder (where this file lives). The **studio** is the folder this session is open in (the kit calls it "Handoff Videos"): `brand/` (their brand kit), `inbox/` (raw takes), `projects/` (one folder per video), `finished/` (what they post). `P` is `projects/<short-name>`. Run every script with `node`; it's the same command on Mac and Windows. Write each one as its own plain command with the full path spelled out, `node "<SKILL>/scripts/<name>.mjs" ...` (no shell variables such as `S=...`), and quote paths: folder names have spaces. Plain commands mean that once the person chooses to always allow the editor's steps, the rest of the edit doesn't stop to ask.

## How to talk to the person

They are a business owner, not an editor or a programmer.
- Plain words: "your video", "the cut", "captions", "the hook", "finishing the video". Never "terminal", "command", "script", "repository", "render", "EDL", "LUFS" or file paths in what you write to them.
- When Claude asks to run something, tell them once: "Claude will ask before it runs each step. Choose Allow."
- Short updates while you work. One question at a time, only when you need an answer.

## Before the first edit

1. **Setup (once per computer).** If `~/.video-editor/tools/node_modules/hyperframes` doesn't exist, or anything fails, run `node "SKILL/scripts/setup.mjs"` from the studio. It installs HyperFrames (with its animation library and sound effects), FFmpeg, HyperFrames' renderer and the speech-to-text model (about 640 MB, once), and adds HyperFrames' skills to the studio folder. Say so before you start. If it reports Node.js missing or too old, stop and tell them: "Install Node.js first: go to nodejs.org, download the LTS version, open it and click through the installer. Then start a new chat here."
2. **Brand (once).** If `brand/brand.json` doesn't exist, ask: "Want your colours and logo in your videos? You only do this once." Yes → run the brand-setup skill, then come back. No → use the default look and say they can do it any time.

## The edit, step by step

1. **Find the video.** The newest file in `inbox/`, or the one they attached or named. If there are several takes of the same script, use all of them and keep the best reading of each line.
2. **Stage it:** `node "SKILL/scripts/prepare.mjs" <video> P`. If it says the video was cropped, tell them filming upright keeps more of the frame. If it says it converted from HDR, tell them colours stay truest with HDR off when they film (iPhone: Settings, Camera, Record Video, then turn off HDR Video or HDR).
3. **Transcribe:** `node "SKILL/scripts/transcribe.mjs" P` (add `--language es` and so on for other languages). Read the words.
4. **Suggest the cut:** `node "SKILL/scripts/suggest_cut.mjs" P`. Then **read the transcript yourself** and fix `P/edit/edl.json` where their intent is clearer than the rule: a better second take of a line, an aside that wanders, a sentence that stops halfway. Keep their words and their order; never write new words for them.
5. **Plan the opener** with `references/craft.md` (the Hook Stack): three text-hook options, each 7 words or fewer, naming the viewer's problem or the outcome they want, never a copy of the first spoken line. Pick two to five key words to highlight (a number, the problem, the fix).
6. **One check-in, then finish.** In one message: what you're cutting, the three hooks with your pick, the key words. Ask "Shall I finish it like this?" Skip the question if they already said to go ahead.
7. **Cut it:** `node "SKILL/scripts/render_cut.mjs" P`. Every kept line should read as a complete thought. If it held the last frame, tip them: hold still for two seconds after the last line.
8. **Write `P/reel/plan.json`:**
   ```json
   {"hook": ["Still doing your", "taxes in April?"], "key_words": ["quarterly", "penalty"], "face": [50, 34], "caption_y": 1120}
   ```
   - `face`: where their face is, percent across and down. Look first: `node "SKILL/scripts/frame.mjs" P 2` saves `P/edit/frame.jpg`; read it. Zooms centre on the face.
   - `caption_y`: 900-1450 px. Captions sit on the chest or below, never over the mouth, and above 1500 (the platforms' buttons).
   - Optional: `punch_words` (extra zooms in a long stretch), `transition_at` (cut numbers for the accent transition), `"end_card": false`, `"sound": false`.
   - The brand file (`brand/brand.json`) sets caption style, colours, font, transition, sound and the logo end card. Don't repeat those in the plan.
9. **Finish:** `node "SKILL/scripts/render.mjs" P <name>` (`--draft` for a quick look). It builds the captions and motion, checks them, renders with HyperFrames and masters the sound, then copies the video to `finished/`.
10. **Check the finished file:** `node "SKILL/scripts/qa.mjs" P "P/final/<name>.mp4"`. Read `P/final/qa/sheet.jpg` and every still: hook readable on frame 0, captions on the right words and inside the frame, nothing important covered, eyes open on the first and last frames, logo and end card clean. Then start a reviewer subagent (the Agent tool; skip this only if you have no such tool), give it only `P/final/qa/` and the plan, and ask it to hunt for flaws with timecodes; fix what it finds. A second pair of eyes catches what the checks can't, such as a caption over the mouth or a hook that reads badly. Fix any FAIL (change the cut, the plan or the brand file and run 7-10 again), at most three rounds.
11. **Hand it over.** Tell them it's in `finished` (name the file). Offer the live preview if they want to look closer or tweak by hand: `node "SKILL/scripts/hf.mjs" preview` run from `P/reel` in the background, then give them the address it prints. Then write:
    - one line on what you changed;
    - a suggested post caption: 1-2 short lines in their voice plus 3-5 specific hashtags;
    - "Want changes? Say things like 'bigger captions', 'use the second hook' or 'make three hook versions'."

## Changes they ask for

| They say | You change | Re-run from |
|---|---|---|
| "Cut the part where I…" / "Keep the bit about…" | `P/edit/edl.json` | step 7 |
| "Use the other hook" / new hook words | `plan.json` hook | step 9 |
| "Make three hook versions" (trial reels) | render three times with different `hook`, named `<name>-hook1`… | step 9 |
| "Highlight different words" | `plan.json` key_words | step 9 |
| "Bigger / smaller captions", "lower / higher" | `brand.json` captions.size, or `plan.json` caption_y | step 9 |
| "Different caption style" | `brand.json` captions.style: `bold-chip`, `clean-plate` or `punchy` (see `references/styles.md`) | step 9 |
| "More energy" / "calmer" | `brand.json` transition (`wipe`, `flash` or `punch`) and captions.style | step 9 |
| "No sound effects" / "quieter" | `plan.json` sound false, or `brand.json` sound.volume | step 9 |
| "No logo at the end" | `plan.json` end_card false | step 9 |
| "Add my music" | `brand.json` sound.music: a file they own in `brand/` | step 9 |
| "It's too long" | drop the weakest line in `edl.json`; say which | step 7 |

## What this editor never does

- Invent words, numbers, results or testimonials, or caption words that weren't said.
- Add stock footage, generated footage or music it doesn't have the rights to. Its sound effects come with HyperFrames or this plugin; music is only a track the person supplies and owns.
- Add a "link in bio" card or a watermark unless asked. The logo end card is the brand's choice.
- Post anything anywhere. The person posts it.

## If something goes wrong

Use the video-help skill. The usual causes: setup not finished (run `setup.mjs` again), Node.js missing, a file with no sound, or a very long video (suggest a 30-90 second piece first).
