# MOAI Plugins

The official Mother of AI plugin marketplace for Claude Cowork.

## Add the marketplace in Cowork

1. Open **Cowork**, then open **Customize** → **Plugins**.
2. In **Personal plugins**, select **+** → **Add marketplace**.
3. Choose **Add from a repository** and enter:

   `https://github.com/thomas-echezabal/moai-plugins`

4. Open the MOAI Plugins marketplace and install the plugin you want.

## Inbox Assistant

Inbox Assistant reads your email, prepares a morning brief, finds stalled follow-ups, and writes replies as drafts. Every mailbox action starts switched off and must be enabled and tested individually.

After installation, run `/inbox-assistant:setup` in a Cowork session to set it up, or `/inbox-assistant:status` if you are moving an existing installation.

### Moving from the downloaded plugin

If you previously installed Inbox Assistant by uploading a file:

1. Open **Customize** → **Plugins** and uninstall the uploaded Inbox Assistant.
2. Add this marketplace using the steps above.
3. Install **Inbox Assistant** from MOAI Plugins.
4. Start a new Cowork session and run `/inbox-assistant:status`.

The marketplace version uses the same plugin name, command namespace, and workspace files. Do not leave both copies installed.

## Updates

Cowork checks marketplace-installed plugins for updates. New versions load in a new session after Cowork applies the update. If you customized a plugin locally, Cowork warns you before replacing those edits.

If an update does not appear, open **Customize** → **Plugins**, open the MOAI Plugins marketplace, and select **Update**.

## Troubleshooting

- **Marketplace does not appear:** confirm the repository URL is exactly `https://github.com/thomas-echezabal/moai-plugins`, then try adding it again.
- **Two Inbox Assistant entries appear:** uninstall the uploaded copy and keep the marketplace copy.
- **Commands are missing after an update:** start a new Cowork session so the updated plugin is loaded.
- **Inbox Assistant cannot read mail:** reconnect Gmail or Microsoft 365 under Claude **Settings** → **Connectors**, then run `/inbox-assistant:setup` again.

For Academy support, use the Help Center or weekly office hours in the Mother of AI portal.

## Copyright

Source available. All rights reserved. No permission is granted to copy, modify, redistribute, or sublicense this repository or its plugins without written authorization from Mother of AI.
