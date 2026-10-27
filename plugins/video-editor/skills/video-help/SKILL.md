---
name: video-help
description: Troubleshoot the Handoff video editor in plain words on Mac or Windows. Runs the editor's own checks, reads any error and walks the person through the fix one click at a time. Use when an edit fails or stalls, setup says MISSING, the person says "it's not working", "I'm stuck", "it froze", "where's my video", or they're following the Handoff kit and got lost at a step.
---

# Video help

The person is stuck. Find out where, fix what you can yourself, and give them one clear next step.

**Done means:** you named the cause in one plain sentence and either fixed it (and carried on with their edit) or gave them the exact clicks to fix it, one step per line.

`SKILL` is the video-editor skill's folder (`../video-editor` from this file).

## 1. Find where they are

Ask only if you can't tell: "Which step are you on, and what do you see?" A screenshot helps; you can read it.

## 2. Run the checks

From the studio folder: `node "SKILL/scripts/setup.mjs"` (safe to run again) and `node "SKILL/scripts/hf.mjs" doctor`. Read both.

## 3. Match the cause

| What you see | Cause | Fix (tell them in these words) |
|---|---|---|
| "node: command not found" or "not recognized", or Node older than v22 | Node.js isn't installed | "Go to **nodejs.org**, download the **LTS** version, open it and click through the installer. Then quit and reopen the Claude app and come back to this folder." |
| setup says FFmpeg MISSING | The download was blocked | Run setup again. On Windows, if it still fails: "Open **Terminal** (or PowerShell) and run `winget install Gyan.FFmpeg`, then reopen the Claude app." |
| setup says Renderer or HyperFrames MISSING | No internet, or a company firewall | "Check you're online (a company or school network may block downloads), then say 'run setup again'." |
| The editor's skills aren't there | The plugin isn't added to their Claude account, or the session started before it synced | "Quit and reopen the Claude app, then start a new session in this folder." Still missing: "In Claude, open **Customize**, then **Plugins**, and check **Video Editor** is added." It syncs to the app each time the app starts, when they're signed in with their Claude account. |
| HyperFrames' skills aren't there | Setup hasn't added them yet | Run `setup.mjs` again, then start a new session in this folder. The editor works without them. |
| Claude keeps asking before every step | That's normal | "Choose **Allow**. To be asked less, pick 'always allow' for the editor's steps when Claude offers it." |
| "this file has no sound in it" | A screen recording or an export without sound | "Send the original file from your phone's camera." |
| It's been working a long time | Longer videos and slower computers take longer to finish, and the first edit also downloads the tools | "Still working. You can leave this open; I'll tell you when it's done." |
| The computer gets slow or hot | Rendering is heavy | "Close other big apps (browsers with many tabs, video calls) while it finishes." |
| The colours look grey or washed out | Filmed in HDR and this FFmpeg couldn't convert it fully | Run setup again (it installs the editor's own FFmpeg), then re-edit. Next time: "Film with HDR off: on iPhone, **Settings**, **Camera**, **Record Video**, then turn off **HDR Video**." |
| Captions show a wrong word | Speech-to-text misheard a name | Fix the word in `edit/words.json` and `edit/words_source.json`, then rebuild from the video-editor's step 9. Ask them for the right spelling. |
| "You've reached your usage limit" | The Claude plan's limit for now | "Your plan's limit resets in a few hours (Settings, Usage shows when). Come back to this chat then; your edit is saved." |
| A render or check error you don't recognise | Something in the composition | Read the last 20 lines. Rebuild from the plan (never hand-edit `reel/index.html`). Try `--draft`. If it still fails, tell them plainly and offer to email support@handoffacademy.com with the error text. |

## 4. Carry on

Once it's fixed, go back to their edit where it stopped; their project folder keeps every step.
