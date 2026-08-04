---
description: Audit the inbox, preview a chosen organization system, or apply it through already enabled Zapier actions.
argument-hint: "audit | preview | apply"
---

# /organize

Review and organize a real mailbox without confusing a recommendation with permission. Use the **inbox-organization** skill for the bounded scan, provider-aware plans, cost estimate, and application rules. Load **safety-escalation** and **business-context** before reading mail. Read `references/connector-matrix.md`, `references/action-controls.md`, and `references/output-schemas.md` before this workflow.

Usage:

```
/organize $ARGUMENTS
```

`audit`, `preview`, and `apply` are the only accepted arguments. With no argument, list the three modes and ask which one the owner means. Do not guess. Nothing changes during audit or preview. Selecting a plan is not authorization.

## `audit`

Run a bounded read-only review of the mailboxes in `Approved Sources`.

1. Verify a read route that changes no state.
2. Inspect enough recent mail to describe the inbox honestly, stopping at 500 candidate messages or 90 days, whichever comes first. State the actual coverage.
3. Inventory inbox volume and age, recurring senders, newsletters and promotions, VIP and client threads, messages awaiting the owner, messages awaiting someone else, stale threads, and the labels, categories, or folders visible on the provider.
4. Count likely archive candidates and likely delete candidates separately. A candidate is evidence for a proposal, never an action.
5. Return exactly three plans in the Inbox organization review schema:
   - **Minimal inbox.** Inbox means unresolved. Archive completed threads, label recurring reference mail, and keep VIP mail visible. No deletion by default.
   - **Client operations.** Provider-aware client or project labels, Waiting on me, Waiting on them, and completed mail archived. Folder moves are optional.
   - **Aggressive cleanup.** Archive bulk noise, mark selected low-value categories read, move recurring categories where useful, and put deletion candidates in a separate review list.
6. For every plan, state what changes, the approximate item count, the required action IDs, reversibility, and estimated Zapier task use.

Use provider language. Gmail has labels and archive. Outlook has categories and folders. Do not promise an operation the connected provider cannot represent.

Zapier's current documented rate is **two tasks per successful Zapier MCP tool call**. Failed calls do not consume tasks. Use the `zapier-limits-and-cost` skill for current plan allowances or prices. Never quote an allowance from memory.

## `preview`

Preview one plan from the current audit. If no audit is visible in this session, run `audit` first rather than reconstructing a plan from memory.

1. Ask the owner which of the three plans to preview.
2. Show representative real items and the proposed before and after state.
3. Resolve every change to one of the seven action IDs.
4. Name the exact Zapier tool currently visible for each required action. If it is missing, say so. Never guess a tool name.
5. Keep archive and delete separate. Delete candidates stay separate even when the owner picked Aggressive cleanup.
6. Show the estimated successful tool calls and multiply by two tasks per successful call.
7. End with the actions the owner would need to enable through `/inbox-assistant:setup stage-2`, in safest-first order.

No mailbox action runs in preview. Do not write a control block, do not update a setting, and do not interpret plan selection as authorization.

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

Inbox organization does not authorize follow-up automation. Saved drafts require `save-draft`. Automatic nudges require `send-reply`. Those actions go through their own Stage 2 rituals and scopes. A read-only Daily Brief or organization audit never passes permission to a follow-through task.
