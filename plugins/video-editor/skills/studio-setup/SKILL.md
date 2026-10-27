---
name: studio-setup
description: Set up the Handoff video studio on this computer, once, step by step, for a non-technical owner on Mac or Windows. Checks Node.js, installs the editing tools (HyperFrames and its skills, FFmpeg, the speech-to-text model), makes the studio folders, offers the brand setup and runs the practice clip so the person sees a finished video before they film. Use when someone says "set up my video studio", "set me up", "get the video editor ready", or is starting the Handoff take-home kit.
---

# Studio setup

Get this computer ready to edit, in one sitting, and end with a finished practice video in the person's own look.

**Done means:** `setup.mjs` prints "All set.", the studio has `brand/`, `inbox/`, `projects/` and `finished/`, the person chose their look (or the default), and the practice clip is edited into `finished/practice.mp4`.

The **studio** is the folder this session is open in (the kit names it "Handoff Videos"). Run scripts as plain `node "<full path>"` commands, as the video-editor skill says. `SKILL` is the video-editor skill's folder: `../video-editor` from this file.

## Talk like this

Plain words, one step at a time, and tell them before anything slow. Before the first step say: "Claude will ask before each step it runs on your computer. Choose **Allow** each time; you can also choose to always allow these steps."

## Steps

1. **Check the folder.** If this session isn't in a folder made for videos (it's their home folder, Desktop or Documents itself), ask them to make a folder called "Handoff Videos" in Documents and start a new session in it. Stop until they do.
2. **Check Node.js:** run `node --version`.
   - Missing, or lower than v22: stop and say: "One thing to install first, about 2 minutes: go to **nodejs.org**, click the big **LTS** download button, open the file and click through the installer (Continue, Agree, Install; your computer may ask for your password). Then quit and reopen the Claude app, come back to this folder and say 'set up my video studio' again."
3. **Install the editing tools:** `node "SKILL/scripts/setup.mjs"` from the studio. Tell them first: "Downloading the editing tools: about 2 to 5 minutes the first time, only once." Read its checklist back in plain words. It also adds HyperFrames' own skills to this folder, so later sessions here can make extras such as a title card or a motion graphic.
   - Any MISSING line: use the video-help skill, fix it, and run setup again.
4. **The practice clip.** If `inbox/practice-take.mp4` isn't there, download it: `node "SKILL/scripts/fetch.mjs" https://handoffacademy.com/masterclass/take-home/practice-take.mp4 inbox/practice-take.mp4`. Say: "This is a made-up shop owner with a false start and an 'um' in it, so you can see what the editor cuts."
5. **Their look.** Ask: "Want your brand colours, font and logo in your videos? About 3 minutes." Yes → run the brand-setup skill now. No → the default look; they can do it any time.
6. **Edit the practice clip** with the video-editor skill, name it `practice`, and skip the check-in (pick the hook yourself). When it's done, tell them where it is (`finished/practice.mp4`) and offer the live preview.
7. **Wrap up** in four short lines: what's installed, where their brand kit lives, that new raw takes go in `inbox/` (filmed upright, 1080p at 30 fps, HDR off), and the one sentence to start any edit, in a new session in this folder: "Edit my newest video in the inbox."
