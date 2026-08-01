# Repository Instructions

## Canonical plugin destination

This repository is the canonical home for all MOAI plugin development and publishing:

- GitHub: `https://github.com/handoffacademy/moai-plugins`
- Local checkout: `/Users/thomasechezabal/REPOS/moai-plugins`
- Canonical remote: `origin`
- Legacy/reference remote: `personal` → `https://github.com/thomas-echezabal/moai-plugins.git`

For any plugin or marketplace task, load and follow the global `plugin-publishing-destination` skill when available.

Do not push plugin work to the legacy `personal` repository unless Thomas explicitly overrides the destination for that task. Keep `thomas-echezabal` as the normal active GitHub CLI account. Use `handoffacademy` only for bounded owner operations on this repository, then restore the prior account.

Main is protected. Use a branch and pull request, require `Validate marketplace` to pass, resolve review conversations, merge with linear history, and verify the merged commit on `handoffacademy/moai-plugins` before reporting completion.

See `docs/plugin-repository.md` for the account-safe operating procedure.
