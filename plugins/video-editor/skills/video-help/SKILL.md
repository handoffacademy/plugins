---
name: video-help
description: Troubleshoot the Handoff video editor in plain words. Runs the editor's own checks, reads any error and walks the person through the fix one click at a time. Use when an edit fails or stalls, the editor says something is BLOCKED or MISSING, the person says "it's not working", "I'm stuck", "it froze", "where's my video", or they're following the Handoff kit and got lost at a step.
---

# Video help

The person is stuck. Find out where, fix what you can yourself, and give them one clear next step.

**Done means:** you named the cause in one plain sentence and either fixed it (and carried on with their edit) or gave them the exact clicks to fix it, one step per line.

## 1. Find where they are

Ask only if you can't tell: "Which step are you on, and what do you see?" A screenshot helps; you can read it.

## 2. Run the checks

`bash ../video-editor/scripts/setup.sh`. Read the checklist. For a deeper test, `bash ../video-editor/scripts/selftest.sh` edits a made-up 5-second clip end to end (about 4 minutes in a new conversation).

## 3. Match the cause

| What you see | Cause | Fix (tell them in these words) |
|---|---|---|
| setup says BLOCKED or MISSING for a download | Internet access for code is off or limited | "Open **Settings**, then **Capabilities**. Under **Code execution and file creation**, turn on **Allow network egress** and set **Domain allowlist** to **All domains**. Then start a new conversation." |
| The video-editor skill isn't there (no editing happens, Claude says it has no editor) | The plugin isn't installed or is turned off | "Open **Customize**, then **Plugins**. Find **Video Editor** and make sure it's turned on. If it's not listed, add the Handoff marketplace (handoffacademy/plugins) and install it, then start a new conversation." |
| "this file has no sound in it" | The video was saved without sound, or it's a screen recording | "Film again with the phone's camera app, or send the original file from your phone." |
| The upload fails or never finishes | The file is too big | "Film at 1080p and 30 fps (on iPhone: Settings, Camera, Record Video), keep it under about 2 minutes, then send it again. On the Claude desktop app you can also connect the folder the video is in instead of uploading it." |
| It's been working a long time | Finishing takes about 9 seconds per second of video, plus about 3 minutes of setup in a new conversation | "It's still working: a 45-second video takes about 7 minutes to finish. You can leave this open and come back." |
| "You've reached your usage limit" | The Claude plan's limit for now | "Your Claude plan needs a break: the limit resets in a few hours (Settings, Usage shows when). Your edit picks up where it stopped when you come back to this conversation." |
| Captions show wrong words | Transcription misheard a name or term | Fix the word in `edit/words.json` and in `edit/words_source.json`, then rebuild from the video-editor's step 9. Ask them for the right spelling. |
| A render or check error you don't recognise | Something in the composition | Read the last 20 lines of the error. Rebuild from the plan (never hand-edit `reel/index.html`). Try `--draft` to see if it's the render itself. If it still fails, tell them plainly and offer to email support@handoffacademy.com with the error text. |

## 4. Carry on

Once it's fixed, go back to their edit where it stopped. Don't make them start over unless the conversation itself has to be new (network setting changes need a new conversation).
