# Video Editor

Turns a raw talking-head video into a finished vertical short: cuts the stumbles and long pauses, opens on a hook, adds word-by-word captions, zooms and sound, and checks the finished file before you post. Runs in Claude Cowork with nothing to install on your computer.

## What it includes

- **Video Editor** (`video-editor` skill): send a raw take and get back a 1080×1920 video with the fillers, false starts and long pauses cut on word boundaries, a text hook on frame 0, word-by-word captions with highlighted key words, a zoom on every cut, light sound effects and sound mastered to -14 LUFS. It checks the finished file (spec, loudness, black or frozen frames, dead air, every kept word heard) and reads stills at every cut before handing it over.
- **Content Kit** (`content-kit` skill): a hook bank for your niche, five scripts you can read off your phone, your caption style and a shot list for filming day, from a research summary you paste or five quick questions.
- **Brand Setup** (`brand-setup` skill): set your caption font and colours once in a `brand.json` file.
- **Video Help** (`video-help` skill): plain-words troubleshooting when an edit stalls.

The editing runs on Claude's own cloud computer with [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache 2.0) and FFmpeg. The sound effects are made for this plugin; the caption font is Montserrat (SIL Open Font License, `skills/video-editor/assets/fonts/OFL.txt`).

## What you need

- A paid Claude plan (Pro or higher).
- Claude's internet access for code: **Settings** → **Capabilities** → **Code execution and file creation** → **Allow network egress** on, with **Domain allowlist** set to **All domains**. The editor downloads its tools from npm, GitHub, Hugging Face (the transcription model) and Google's Chrome downloads; "package managers only" blocks the last two.
- A video with sound, filmed upright. 1080p at 30 fps keeps uploads small.

The first edit in each new conversation spends about 3 minutes setting up transcription. Finishing a video takes about 9 seconds per second of video, so a 45-second video takes about 7 minutes.

## Install in Claude Cowork

1. In Claude, open **Customize**, then **Plugins**.
2. Select **Add**, then **Add marketplace**, then **Add from a repository**, and enter `handoffacademy/plugins`.
3. Open **Handoff Academy Plugins** and turn on its **Auto-update** toggle. Claude leaves automatic updates off by default for third-party marketplaces, so this is a one-time setting.
4. Install **Video Editor**, then start a new conversation so it loads.
5. Attach a video and type: `Edit this video into a vertical short.`

Plugins you add in Claude are saved to your account, so the same install works in Claude Code.

## Install in the Claude Code terminal

```
/plugin install video-editor --marketplace handoffacademy/plugins
```

On your own computer the scripts need FFmpeg, Python 3 and Node.js 22 or newer; HyperFrames and its Chrome install themselves through `npx`.

## Updates

Claude's native marketplace updater is the supported update path. When **Auto-update** is enabled, Claude checks for newer releases after startup. The check can take several minutes, and the current session keeps the version it loaded. Start a new session after an update; in Claude Code, `/reload-plugins` can load most changes immediately.

If an update does not appear, confirm **Auto-update** is enabled, open Handoff Academy Plugins, select **Update**, and start a new session. Do not add a self-updater or a SessionStart network version check to this plugin.

## Install in ChatGPT/Codex

```bash
codex plugin marketplace add handoffacademy/plugins
codex plugin add video-editor@plugins
```

Start a new Codex task so the plugin loads. To update it, refresh the marketplace, reinstall the plugin, and start another new task:

```bash
codex plugin marketplace upgrade plugins
codex plugin add video-editor@plugins
```

Claude's Auto-update toggle does not update Codex installations.

Platform differences: the skills and scripts are the same everywhere. Codex runs them on your own computer, so it needs FFmpeg, Python 3 and Node.js 22 or newer installed there; `scripts/setup.sh` reports anything missing and stops rather than editing without it. The Content Kit skill needs nothing installed.
