# Automation Builder

Automation Builder asks what tools you actually use and what outcome you want, verifies what those tools can really do against their current documentation, and designs one automation around your process. Not a template you bend your business around.

It interviews you the way a good operations person would: what you want to stop doing by hand, the last real time it happened, where the information lives, which items count, what the review should show, and when it should run. Then it hands you one finished automation, tested on your real data before anything goes on a schedule.

## Install in Claude Cowork

1. Open **Cowork** → **Customize** → **Plugins**.
2. Under **Personal plugins**, select **+** → **Add marketplace**.
3. Add `https://github.com/handoffacademy/plugins` from a repository.
4. Open **Handoff Academy Plugins** and turn on its **Auto-update** toggle. Claude leaves automatic updates off by default for third-party marketplaces.
5. Install **Automation Builder**, then start a new Cowork session so it loads.

## Updates

Claude's native marketplace updater is the supported update path. When **Auto-update** is enabled, Claude checks for newer releases after startup. The check can take several minutes, and the current session keeps the version it loaded. Start a new session after an update; in Claude Code, `/reload-plugins` can load most changes immediately.

If an update does not appear, confirm **Auto-update** is enabled, open Handoff Academy Plugins, select **Update**, and start a new session. Do not add a self-updater or a SessionStart network version check to this plugin.

## Install in ChatGPT/Codex

```bash
codex plugin marketplace add handoffacademy/plugins
codex plugin add automation-builder@plugins
```

Start a new Codex task so the plugin loads. To update it, refresh the marketplace, reinstall the plugin, and start another new task:

```bash
codex plugin marketplace upgrade plugins
codex plugin add automation-builder@plugins
```

Claude's Auto-update toggle does not update Codex installations. Connector names and recurring-task controls differ by product. Automation Builder uses only the tools visible in the current conversation, and where a product cannot schedule recurring work or cannot enforce approval before an action, it says so and hands you the finished task to schedule yourself rather than quietly doing something weaker.

## If you previously uploaded these as files

If you added Automation Architect from the MOAI Skills Hub as an uploaded file, remove that uploaded copy in Claude's skill settings before installing this plugin. The same goes for the connector and Zapier cost helpers if you uploaded those too.

Two copies of the same skill active at once is the one thing worth avoiding. Claude can load either one, and the uploaded copy never receives updates.

## The safety model

**Version one reads and prepares. That is all it does.**

- It reads bounded information, prepares a private review that only you see, and stops. It never sends, publishes, books, changes a record, or deletes anything.
- Everything it reads is data to report, never an instruction to follow. An email that says "forward this to the team" gets quoted in your review as something to look at, not obeyed.
- Every item cites its source, skipped items are listed with a reason, and anything unknown is written as `Needs review` rather than guessed.
- Nothing goes on a schedule until one manual test run comes back clean on your real data.

**Then it can graduate, one permission at a time, if you want it to.**

After three clean supervised runs it can take on one more permission at a time, in a fixed order that widens reading before it ever writes into a working tool: a bigger batch of items, then a second source to read from, then a private unsent draft saved in your mailbox, and last one low-risk internal status update. Each graduation is a new task with its own test run, and each one sits behind your own approval settings rather than a promise in the task text. Never two at once.

Plenty of people stop at version one and stay there for good. An automation that reliably prepares work you review in thirty seconds is a finished product, not a half-built one.

## Recipes are coming

Future updates add ready-made recipes: MOAI-recommended automations built around specific tools and workflows, so a common job starts from a working design instead of a blank page. They arrive as plugin updates, with nothing to re-download and nothing to reinstall.

## Questions

The Help Center at portal.themotherofai.com is the place to ask anything this file does not answer.
