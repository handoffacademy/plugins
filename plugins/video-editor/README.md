# Video Editor

A viral short-form video editor on your own Mac or Windows computer, built on [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache 2.0). Send it a raw talking-head take and get back a 1080×1920 video in your brand: the stumbles, fillers and long pauses cut on word boundaries, a scroll-stopping hook on the first frame, word-by-word captions in your style, a zoom on every cut, an accent transition at the big moments, sound effects on emphasis, an optional logo end card and studio-level loudness. It checks the finished file before you post.

## What it includes

- **Studio Setup** (`studio-setup`): sets up the computer once, step by step, and ends with a finished practice video.
- **Video Editor** (`video-editor`): the edit, with three caption styles, three transition styles, sound from HyperFrames' library and a QA check on the rendered file.
- **Brand Setup** (`brand-setup`): your colours, font, logo, caption and transition style and end card, saved once and used on every video.
- **Content Kit** (`content-kit`): a hook bank for your niche, five scripts to read off your phone, your caption style and a shot list.
- **Video Help** (`video-help`): plain-words troubleshooting.

Setup installs HyperFrames (pinned to 0.8.209) from npm, with the animation library, skills and sound effects it ships, and adds HyperFrames' core skills (`hyperframes`, `hyperframes-cli`, `media-use`) to your videos folder, so Claude can also make extras like title cards there. If you use HyperFrames' own Claude plugin (`hyperframes@hyperframes`), the editor uses that instead. The editor's scripts run on Node.js only, so they behave the same on Mac and Windows.

## What you need

- The Claude desktop app (Mac or Windows) with a paid plan (Pro or higher), for the **Code** tab, signed in with your Claude account.
- Node.js 22 or newer (the LTS installer from nodejs.org).
- About 1.5 GB of free space for the tools (HyperFrames, FFmpeg, HyperFrames' renderer and a 640 MB speech-to-text model), installed once into `~/.video-editor` and HyperFrames' cache. No admin password is needed beyond the Node.js installer, and no git.

## Install in the Claude desktop app (Code tab)

1. In Claude (the desktop app or claude.ai), open **Customize**, then **Plugins**.
2. Select **Add**, then **Add marketplace**, then **Add from a repository**, and enter `handoffacademy/plugins`.
3. Turn on **Sync automatically** (Claude leaves automatic updates off by default for third-party marketplaces, so this is a one-time setting).
4. Open **Video Editor** and click **Add**.
5. Quit and reopen the Claude app. Plugins on your Claude account sync to the **Code** tab each time the app starts.
6. Make a folder called **Handoff Videos** in Documents. In the app, click **Code**, choose that folder, and say: `Set up my video studio.`

## Install in the Claude Code terminal

```
/plugin install video-editor --marketplace handoffacademy/plugins
```

Then, in your videos folder: `Set up my video studio.` HyperFrames' own plugin is optional: `/plugin install hyperframes --marketplace heygen-com/hyperframes` (both terminal routes need git).

## Install in Claude Cowork

Follow steps 1 to 4 above, then start a new conversation. Cowork runs on a cloud computer that resets between sessions, so it downloads the editing tools again in every new conversation and needs **Settings → Capabilities → Domain allowlist: All domains**. The desktop Code tab installs them once and is the recommended way.

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

Platform differences: the skills and scripts are the same everywhere. Codex runs them on your own computer with Node.js 22+; `scripts/setup.mjs` installs the rest (HyperFrames' sound library included) and stops with a plain message when something is missing.

## Credits

Caption font Montserrat (SIL Open Font License, `skills/video-editor/assets/fonts/OFL.txt`). The editor's own pop, whoosh and chime were made for this plugin. HyperFrames (Apache 2.0) is installed from npm on your computer; its sound effects are used from that install under the Pixabay Content License and aren't redistributed here. FFmpeg comes from the npm packages `ffmpeg-static` (GPL-3.0) and `@ffprobe-installer/ffprobe` (LGPL-2.1).
