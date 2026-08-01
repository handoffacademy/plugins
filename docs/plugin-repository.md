# Canonical Plugin Repository

## Decision

`handoffacademy/moai-plugins` is the default and canonical destination for all MOAI plugin development, fixes, marketplace changes, releases, pull requests, and publishing.

The previous repository, `thomas-echezabal/moai-plugins`, is retained only as a legacy reference. It must not receive plugin work unless Thomas explicitly chooses it for a specific task.

## Local checkout and remotes

Use:

```text
/Users/thomasechezabal/REPOS/moai-plugins
```

The remotes are intentionally split:

```text
origin    https://handoffacademy@github.com/handoffacademy/moai-plugins.git
personal  https://github.com/thomas-echezabal/moai-plugins.git
```

`origin` is the publishing destination. `personal` is read/reference-only by default. Tokens must never be embedded in either remote URL.

## GitHub accounts

The normal GitHub CLI account remains `thomas-echezabal`. The `handoffacademy` account exists to own and administer the plugin repository without changing Thomas's default account for other work.

Git pushes use the account-qualified `origin` URL so the GitHub CLI credential helper can select the `handoffacademy` credential while `thomas-echezabal` stays active.

For owner-only `gh` API operations, switch accounts only for the bounded command and restore the previous account even if the command fails:

```bash
previous_user="$(gh api user --jq .login)"
restore_gh_user() { gh auth switch --hostname github.com --user "$previous_user" >/dev/null; }
trap restore_gh_user EXIT
gh auth switch --hostname github.com --user handoffacademy
# run the exact owner operation
```

Never report completion until `gh api user --jq .login` again returns the intended normal account.

## Required workflow

1. Start from current `origin/main`.
2. Create a feature, fix, or documentation branch.
3. Run marketplace validation and every plugin-specific validator.
4. Push the branch to `origin`.
5. Open the pull request against `handoffacademy/moai-plugins`.
6. Require `Validate marketplace` to pass.
7. Resolve every review conversation.
8. Merge through the protected `main` branch with linear history.
9. Read back the exact merged commit and changed files from `handoffacademy/moai-plugins`.
10. Confirm `thomas-echezabal` is restored as the active GitHub CLI account.

## Protection baseline

The canonical repository requires the `Validate marketplace` status check, enforces branch protection for administrators, requires linear history and resolved review conversations, and forbids force pushes and branch deletion on `main`.

## Agent coverage

The same `plugin-publishing-destination` skill is installed for Hermes, Claude Code, and Codex. Global Claude and Codex instructions route plugin work through that skill. Repository-level `CLAUDE.md` and `AGENTS.md` preserve the rule in fresh clones.

## Verification commands

```bash
git remote -v
git push --dry-run origin main
gh auth status
gh repo view handoffacademy/moai-plugins
gh api repos/handoffacademy/moai-plugins/branches/main/protection
```
