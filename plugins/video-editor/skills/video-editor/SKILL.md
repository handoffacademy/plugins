---
name: video-editor
description: Edit a raw talking-head video into a finished vertical short for Instagram Reels, TikTok or YouTube Shorts. Cuts fillers, false starts and long pauses on word boundaries, opens on a text hook, adds word-by-word captions with highlighted key words, zooms on cuts, light sound effects and a -14 LUFS sound master, then checks the finished file before handing it over. Use when someone attaches or points to a video and asks to edit it, cut it, caption it, "make it a reel", "make this a TikTok", or "edit my video". Also runs the practice clip from the Handoff kit.
---

# Video Editor

Turn one raw take into a finished 1080×1920 video the person can post. You do the editing on your own computer in the cloud; the person never installs anything.

**Done means:** a 1080×1920, 30 fps MP4 at -14 LUFS that passes `scripts/qa.py` (every line PASS, or a CHECK you looked at and explain), handed to the person as a file they can download, with a suggested caption and a two-line note of what you changed.

In the commands below, `SKILL` is this skill's own folder (where this file lives) and `P` is a project folder you make for this video, such as `~/videos/<short-name>`.

## How to talk to the person

They are a business owner, not an editor or a programmer.
- Plain words. Say "your video", "the cut", "captions", "the hook", "finishing the video". Never "terminal", "command", "script", "repository", "render", "EDL", "LUFS" or file paths in what you write to them (numbers go in the QA note only if they ask).
- Short updates while you work ("Cutting the pauses now", "Adding captions", "Finishing the video: about 7 minutes for this length").
- One question at a time, only when you need an answer. Never ask them to type a command or open a settings page you can't name exactly.

## Before the first edit in a conversation

Run `bash SKILL/scripts/setup.sh`. It prints a checklist and is quick once done.
- If a line says **BLOCKED** or **MISSING** for a download, Claude's internet access for code is off or limited. Tell the person, in these words: "I can't download my editing tools yet. Open **Settings**, then **Capabilities**. Under **Code execution and file creation**, turn on **Allow network egress** and set **Domain allowlist** to **All domains**. Then start a new conversation and send your video again." Then stop.
- The first edit in a new conversation also builds the transcription tool and downloads its model (about 3 minutes). Say so once, so the wait doesn't look like a hang.

## The edit, step by step

1. **Find the video.** Use the file the person attached, or the one they pointed to in a folder they connected. Copy it into your working area. If there are several takes, ask which ones belong to this video (or use all of them as takes of one script and pick the best reading of each line).
2. **Stage it:** `python3 -I SKILL/scripts/prepare.py <video> P`. It makes a vertical 1080×1920, 30 fps copy with clean timestamps. If it says the video was landscape, tell the person it was cropped to vertical and that filming upright next time keeps more of the frame.
3. **Transcribe:** `bash SKILL/scripts/transcribe.sh P` (add a language code such as `es` when they speak Spanish or another language). Read the printed words.
4. **Suggest the cut:** `python3 -I SKILL/scripts/suggest_cut.py P`. It drops fillers, restarts ("wait, let me start over"), repeated openings and long pauses, and holds about a second of settled picture after the last word. Then **read the transcript yourself** and fix `P/edit/edl.json` by hand where the person's intent is clearer than the rule: a better second take of a line, an aside that wanders, a sentence that stops halfway. Keep their words and their order; never write new words for them.
5. **Plan the opener and the emphasis** (rules in `references/craft.md`):
   - Three text-hook options, each 7 words or fewer, naming the viewer's problem or the outcome they want. Never a copy of the first spoken line.
   - Two to five key words to highlight: the words that carry the point (a number, the problem, the fix), never filler.
6. **One check-in, then finish.** Send the person, in one message: what you're cutting (in plain words), the three hook options with your pick, and the key words. Ask "Shall I finish it like this?" If they already said to go ahead without asking, skip this and use your pick.
7. **Cut it:** `python3 -I SKILL/scripts/render_cut.py P`. Read the printed lines: every kept line should read as a complete thought. If it says it held the last frame, the take stopped right after the last word: the video still ends cleanly, but tell the person that holding still for two seconds after their last line looks better.
8. **Write the plan** to `P/reel/plan.json` (make the `reel` folder if it isn't there):
   ```json
   {"hook": ["Still doing your", "taxes in April?"], "key_words": ["quarterly", "penalty"], "face": [50, 34], "caption_y": 1120}
   ```
   - `hook`: one or two lines (a small setup line over a big punch line).
   - `face`: where their face is, as percent across and down. Look at a frame first: `ffmpeg -v error -ss 2 -i P/edit/cut.mp4 -frames:v 1 -vf scale=540:960 P/edit/frame.jpg`, then read the image. Zooms centre there.
   - `caption_y`: move captions down (up to 1450) when the face sits low, or up (to 900) when the lower frame is busy or bright. Captions never cover the mouth.
   - `punch_words` (optional): extra zooms on words that deserve one in a long unbroken stretch.
   - Their brand: if they gave you a `brand.json` (from the brand-setup skill), put it at `P/brand.json`. Otherwise the default look is used (white captions, yellow highlight chips).
9. **Finish:** first tell the person how long it will take (about 10 seconds per second of video, so a 45-second video takes about 7 minutes), even when you skipped the check-in. Then run `bash SKILL/scripts/render.sh P <name>`. It builds the captions and motion, checks them, renders and masters the sound. Use `--draft` only when they want a quick look first.
10. **Check the finished file:** `python3 -I SKILL/scripts/qa.py P P/final/<name>.mp4`. Then open `P/final/qa/sheet.jpg` and read every still: the hook readable on frame 0, captions on the right words and inside the frame, nothing important covered, eyes open on the first and last frames. A FAIL gets fixed (change the cut or the plan, run steps 7-10 again), at most three rounds; if one survives, tell the person plainly what it is.
11. **Hand it over.** Share `P/final/<name>.mp4` as a downloadable file (and save a copy to their connected folder if they gave you one). Then write:
    - one line on what you changed ("I cut the false start and two long pauses, opened on your hook, and added captions with your key words highlighted");
    - a suggested post caption: 1-2 short lines in their voice plus 3-5 relevant hashtags;
    - "Want any changes? You can say things like 'make the captions bigger' or 'use the second hook'."

## Changes they ask for

Map plain requests to the smallest change, then re-run only from that step:

| They say | You change | Re-run from |
|---|---|---|
| "Cut the part where I…" / "Keep the bit about…" | `edit/edl.json` ranges | step 7 |
| "Use the other hook" / new hook words | `reel/plan.json` hook | step 9 |
| "Highlight different words" | `reel/plan.json` key_words | step 9 |
| "Captions bigger / smaller / higher / lower" | `P/brand.json` caption size (copy `SKILL/assets/brand-default.json` first) or plan `caption_y` | step 9 |
| "Less zooming" | remove `punch_words`; zooms on cuts stay, because they hide the jump | step 9 |
| "No sound effects" | plan `"sound": false` | step 9 |
| "My colours / my font" | run the brand-setup skill, then copy its `brand.json` to `P/` | step 9 |
| "It's too long" | drop the weakest line or aside in `edl.json`; say which | step 7 |

## What this editor never does

- Invent words, numbers, results or testimonials, or put words in captions that weren't said.
- Add generated footage, stock clips or music it doesn't have the rights to (it ships its own sound effects).
- Add a "link in bio" card, a logo sting or a watermark unless asked.
- Post anything anywhere. The person posts it themselves.

## If something goes wrong

Use the video-help skill: it runs the checks, reads the error and explains the fix in plain words. The usual causes are internet access for code being off (setup says BLOCKED), a file with no sound, or a very long video. For videos over 3 minutes, suggest cutting a 30-90 second piece first.
