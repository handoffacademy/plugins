# Handoff Academy Plugins

Handoff Academy publishes practical plugins for Claude, Codex, ChatGPT, and compatible agent platforms. Each plugin keeps one canonical workflow and adds the manifests or adapters each platform needs.

## Platform support

| Platform | Marketplace catalog | Plugin contract |
|---|---|---|
| Claude Cowork and Claude Code | `.claude-plugin/marketplace.json` | `.claude-plugin/plugin.json`, commands, agents, hooks, and shared skills |
| Codex and ChatGPT | `.agents/plugins/marketplace.json` | `.codex-plugin/plugin.json` and shared Agent Skills |
| Other compatible agents | Shared `skills/` directories | Portable `SKILL.md` workflows, with a platform adapter when required |

Platform-specific files should delegate to the shared workflow instead of copying it. If a platform lacks a connector, scheduler, hook, or file API, the plugin must document a safe fallback and fail closed when the missing capability affects safety.

## Repository layout

```text
plugins/
├── .claude-plugin/marketplace.json
├── .agents/plugins/marketplace.json
├── plugins/
│   └── <plugin-id>/
│       ├── .claude-plugin/plugin.json
│       ├── .codex-plugin/plugin.json
│       ├── skills/
│       ├── commands/        # when Claude commands are needed
│       ├── agents/          # when Claude subagents are needed
│       ├── hooks/           # when Claude hooks are needed
│       ├── README.md
│       └── CHANGELOG.md
├── scripts/
└── docs/creating-and-releasing-plugins.md
```

## Install in Claude Cowork

1. Open **Cowork** → **Customize** → **Plugins**.
2. Under **Personal plugins**, select **+** → **Add marketplace**.
3. Choose **Add from a repository** and enter:

   `https://github.com/handoffacademy/plugins`

4. Open **Handoff Academy Plugins** and turn on **Auto-update**. Claude leaves automatic updates off for third-party marketplaces.
5. Install the plugin, then start a new Cowork session.

Claude Code users can add the same Git marketplace through the plugin interface.

## Install in Codex

```bash
codex plugin marketplace add handoffacademy/plugins
codex plugin add inbox-assistant@plugins
```

Start a new Codex task after installation so its skills load.

To refresh the marketplace and reinstall a plugin:

```bash
codex plugin marketplace upgrade plugins
codex plugin add inbox-assistant@plugins
```

Claude's Auto-update setting does not update Codex installations.

## Moving from the former MOAI marketplace

Handoff Academy replaced the MOAI Plugins name. GitHub redirects the former repository URL, but the marketplace slug changed from `moai-plugins` to `plugins`.

For Claude, add `https://github.com/handoffacademy/plugins`, install the plugin from **Handoff Academy Plugins**, and remove the old marketplace entry after confirming the new installation works.

For Codex:

```bash
codex plugin marketplace add handoffacademy/plugins
codex plugin add inbox-assistant@plugins
codex plugin marketplace remove moai-plugins
```

Remove the old source only after the plugin appears under the new marketplace.

## Available plugins

| Plugin | Purpose |
|---|---|
| [Inbox Assistant](plugins/inbox-assistant) | Email briefs, stalled follow-ups, safe draft replies, and recurring inbox reviews with mailbox actions disabled until you enable and test them |

## Create or release a plugin

Read [Creating and releasing plugins](docs/creating-and-releasing-plugins.md). The repository includes a scaffold command and validation for synchronized Claude and Codex manifests, semantic versions, changelogs, installation docs, and cross-platform fallbacks.

## Updates

Claude uses its native marketplace updater. Turn on **Auto-update** for Handoff Academy Plugins, then start a new session after an update. Claude Code can use `/reload-plugins` for most plugin changes.

Codex maintains a separate marketplace cache. Run the upgrade and reinstall commands above, then start a new task.

## Support

Use the Handoff Academy Help Center or bring your question to weekly office hours.

## License

Source available. All rights reserved. Written permission is required to copy, modify, redistribute, or sublicense this repository or its plugins.
