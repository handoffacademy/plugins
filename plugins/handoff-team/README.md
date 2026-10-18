# Handoff AI Team

Your AI team's office: a Chief of Staff and helpers that work from your second brain, shown in a friendly Team View.

## What it includes

- **Team View** (Claude Code desktop app, Code tab, version 2.1.286 or later): a side panel that shows each employee, what they are doing in plain words, the messages they pass to each other, and anything that needs you. It opens by itself in a folder that holds a Handoff brain (`.handoff/brain.json`), and in an empty folder it offers to make one. Everywhere else it stays out of the way.
- **The brain template**: an empty brain, or a practice brain with a made-up business (Sunny Days Cleaning) for trying things out. Both carry the team's job pages, trainings and the brain guard.
- **Guided setup in Team View**: backup to a private GitHub copy, email and calendar, the About My Business interview, the first brief, and the cloud morning shift, one screen at a time.
- **Drafts only**: an employee never sends, replies, forwards, invites or posts. Messages become Gmail drafts that you read and send yourself.
- **Friendly Mode**: Claude's own screen in the same plain words while you are in your brain folder.
- **Setup guide** (`handoff-team` skill): answers questions during setup.

## Install in the Claude desktop app (Code tab)

1. Open the Code tab and start a session in any folder.
2. Paste this into the prompt box and press Enter:

   ```
   /plugin install handoff-team --marketplace handoffacademy/plugins
   ```

3. In Finder, make an empty folder named `My Brain` in your home folder.
4. Start a new Code tab session in that folder. Team View opens and offers **Make my brain**.

Team View draws only in the Claude Code desktop app, terminal and VS Code. In Cowork, ChatGPT or Codex the same rules apply and the setup guide gives a written team report instead.

**Trust:** Team View runs inside Claude Code with your permissions, like any mod. Install it only from the Handoff Academy marketplace.

## Install in Claude Cowork

1. Open **Cowork** → **Customize** → **Plugins**.
2. Under **Personal plugins**, select **+** → **Add marketplace**.
3. Add `https://github.com/handoffacademy/plugins` from a repository.
4. Open **Handoff Academy Plugins** and turn on its **Auto-update** toggle. Claude leaves automatic updates off by default for third-party marketplaces.
5. Install **Handoff AI Team**, then start a new Cowork session so it loads.

## Updates

Claude's native marketplace updater is the supported update path. When **Auto-update** is enabled, Claude checks for newer releases after startup. The check can take several minutes, and the current session keeps the version it loaded. Start a new session after an update; in Claude Code, `/reload-plugins` can load most changes immediately.

If an update does not appear, confirm **Auto-update** is enabled, open Handoff Academy Plugins, select **Update**, and start a new session. Do not add a self-updater or a SessionStart network version check to this plugin.

## Install in ChatGPT/Codex

```bash
codex plugin marketplace add handoffacademy/plugins
codex plugin add handoff-team@plugins
```

Start a new Codex task so the plugin loads. To update it, refresh the marketplace, reinstall the plugin, and start another new task:

```bash
codex plugin marketplace upgrade plugins
codex plugin add handoff-team@plugins
```

Claude's Auto-update toggle does not update Codex installations. Document any platform-specific capability differences and safe fallbacks below.
