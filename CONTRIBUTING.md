# Releasing MOAI plugins

Every plugin release goes through a pull request. Direct releases from a working tree are not supported.

## Add a plugin

Run:

```bash
node scripts/new-plugin.mjs <slug> "Display name" "One-sentence description"
```

The scaffold starts at `1.0.0`, adds the plugin to the marketplace, and creates the required README and changelog. Replace the generated placeholders, then validate the whole repository.

## Update a plugin

1. Make the plugin changes.
2. Increase the version in the plugin's `.claude-plugin/plugin.json` using semantic versioning.
3. Add a matching `## X.Y.Z` entry at the top of the plugin's `CHANGELOG.md`.
4. Run `node scripts/validate-marketplace.mjs --base origin/main`.
5. Run `claude plugin validate . --strict`.
6. Open a pull request and merge only after the required validation check passes.

The marketplace entry must not contain a `version`. The plugin manifest is the single version authority.

## Roll back a release

Revert the behavior in a new patch release and increase the version. Never lower, reuse, or delete a version that users may already have installed.
