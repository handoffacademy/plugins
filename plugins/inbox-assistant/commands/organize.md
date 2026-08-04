---
description: Review the inbox and recommend one cleanup plan. Nothing changes until the owner approves it.
---

# /organize

Read `references/owner-communication.md` before any other plugin instruction. Its owner-facing response contract overrides every example output and reporting instruction below.

Review and organize a real mailbox without confusing a recommendation with permission. Use the **inbox-organization** skill for the bounded scan, provider-aware plans, cost estimate, and application rules. Load **safety-escalation** and **business-context** before reading mail. Read `references/connector-matrix.md`, `references/action-controls.md`, and `references/output-schemas.md` before this workflow.

The owner sees one recommendation, not a menu. The internal lifecycle remains `audit | preview | apply`, and Nothing changes during audit or preview.

Usage:

```
/organize
```

With no argument, run the audit, recommend exactly one plan, and stop for review. Do not ask the owner to choose a mode. Keep `audit`, `preview`, and `apply` as compatibility inputs and internal lifecycle controls. Selecting a plan is not authorization.

## `audit`

Run a bounded read-only review of the mailboxes in `Approved Sources`.

1. Verify a read route that changes no state.
2. Inspect enough recent mail to describe the inbox honestly, stopping at 500 candidate messages or 90 days, whichever comes first. State the actual coverage.
3. Inventory inbox volume and age, recurring senders, newsletters and promotions, VIP and client threads, messages awaiting the owner, messages awaiting someone else, stale threads, and the labels, categories, or folders visible on the provider.
4. Count likely archive candidates and likely delete candidates separately. A candidate is evidence for a proposal, never an action.
5. Build these three plans internally so the recommendation is evidence-based:
   - **Minimal inbox.** Inbox means unresolved. Archive completed threads, label recurring reference mail, and keep VIP mail visible. No deletion by default.
   - **Client operations.** Provider-aware client or project labels, Waiting on me, Waiting on them, and completed mail archived. Folder moves are optional.
   - **Aggressive cleanup.** Archive bulk noise, mark selected low-value categories read, move recurring categories where useful, and put deletion candidates in a separate review list.
6. Recommend exactly one plan. Show only that plan, why it fits, what would change, approximate item counts, reversibility, and estimated Zapier task use. End with **Preview this plan** and **Not now**. Show alternatives only if the owner asks.

Use provider language. Gmail has labels and archive. Outlook has categories and folders. Do not promise an operation the connected provider cannot represent.

Zapier's current documented rate is **two tasks per successful Zapier MCP tool call**. Failed calls do not consume tasks. Use the `zapier-limits-and-cost` skill for current plan allowances or prices. Never quote an allowance from memory.

## `preview`

Preview the recommended plan from the current audit. If no audit is visible in this session, run `audit` first rather than reconstructing a plan from memory.

1. Continue with the recommended plan the owner accepted. Do not ask them to choose among three plans unless they requested alternatives.
2. Show representative real items and the proposed before and after state.
3. Resolve every change to one of the seven action IDs internally.
4. Resolve the exact Zapier tool internally. If it is missing, give the owner only the action that fixes the gap. Never guess a tool name.
5. Keep archive and delete separate. Delete candidates stay separate even when the owner picked Aggressive cleanup.
6. Show the estimated successful tool calls and multiply by two tasks per successful call.
7. Start the required capability sequence in plain language. Request, authorize, and test each required action separately, one at a time. Never bundle permissions. Keep action IDs and setup-stage language internal unless the owner asks for technical detail.

No mailbox action runs in preview. Do not write a control block, do not update a setting, and do not interpret plan selection as authorization. Selecting a plan is not authorization.

## `apply`

Apply the plan only in a live session with the owner present. A scheduled run never bootstraps an organization plan.

1. Require the exact preview from this session. If it is absent or stale, preview again.
2. Read `## Action controls` in full. Every required action must be `enabled`, tested, in scope, outside restrictions, bound to the exact visible Zapier tool, and the kill switch must be off.
3. If an action is unavailable, leave those items as proposals and continue only with independently safe actions. Never substitute another tool.
4. Start with a small representative batch of at most five items. Show the exact targets and ask once whether to apply that batch.
5. For every item, re-read the kill switch and receipts, run the six-condition consult, run the auditor immediately before the call, write the intent receipt, call the exact tool with the audited payload, verify where possible, then write the result receipt.
6. Stop on an unknown outcome. Do not retry it automatically.
7. Report applied, skipped, blocked, and unknown counts by action class.

### Application order

Organization work proceeds in this order when the selected plan needs the action:

1. `label`
2. `archive`
3. `mark-read`
4. `move`
5. `delete`

Deletion is optional and comes last. The first deletion application is interactive, separated from every archive batch, and requires a fresh list of exact targets plus a yes immediately before the batch. The course path never recommends unattended scheduled deletion.

## Follow-up automation boundary

Inbox organization does not authorize follow-up automation. Saved drafts require `save-draft`. Automatic nudges require `send-reply`. Those actions go through their own independent capability rituals and scopes. A read-only Daily Brief or organization audit never passes permission to a follow-through task.
