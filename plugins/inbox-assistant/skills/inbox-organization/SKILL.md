---
name: inbox-organization
description: Audits a real inbox, proposes three provider-aware organization systems, previews exact changes, and applies a selected system only through enabled and tested Zapier actions. Use when the owner asks to clean up, organize, label, archive, move, mark read, or delete inbox mail.
metadata:
  version: 1.0.0
---

# Inbox Organization

## Platform compatibility

When running in ChatGPT or Codex, read `../../references/codex-compatibility.md` before accessing project files or connectors. Apply its fail-closed write-policy preflight before any state change.

The value is not a generic clean-inbox lecture. It is a diagnosis of the owner's real mailbox, three systems fitted to what is actually there, and a controlled path from proposal to verified change.

## Contract

**What it reads.** The mailboxes in `Approved Sources`, their visible labels, categories, or folders, the four context files, and `Inbox Assistant State`. Use the native connector first for mail reads, with Zapier find actions only as the recorded fallback. A read that changes state is not a read route.

**What it produces.** An Inbox organization review using `references/output-schemas.md`, a provider-aware preview of one selected plan, or a verified application report.

**What it never does.** Treat a plan choice as permission, combine archive and delete candidates, use a native connector for a write, substitute a nearby tool, bootstrap actions during a scheduled run, or act on escalated threads.

**What needs approval.** Every write action must complete the Stage 2 ritual once. Every live application batch then gets one immediate yes for its exact targets. Deletion gets its own target list and yes, separate from archive.

## Audit rules

Load safety-escalation and business-context first. Read the four context files, then the state ledger. Inventory at most 500 candidate messages or 90 days. State when provider pagination or connector limits covered less.

Classify observations, not people. A recurring sender is not automatically noise. A newsletter is not automatically deletion. A stale thread is not automatically closed. The audit may recommend, count, and explain. It never acts.

Always produce exactly three plans:

1. Minimal inbox
2. Client operations
3. Aggressive cleanup

Each plan names required action IDs and estimated Zapier task use. The estimate uses two tasks per successful Zapier MCP tool call unless live Zapier documentation says the rate changed. Use the zapier-limits-and-cost skill for allowances and prices.

## Preview rules

Use real representative items. Show current state, proposed state, action ID, exact visible Zapier tool, account route, reversibility, and whether the item hits a boundary. Missing tools remain missing. Never invent a mapping.

A preview does not update Task Settings or Inbox Assistant State. It ends with a safest-first Stage 2 action list.

## Apply rules

Apply only from a preview visible in the current live session. Check action controls and the kill switch before the plan and again before each write. Run the task-auditor once per write. One provider call may touch multiple action classes, so every class must pass and every class receives receipts.

The first batch is at most five items. Unknown outcomes stop the relevant class. Sending, paying, unsubscribing, changing payment details, signing, publishing, and touching CRM or project records remain outside this skill.

## Provider language

- Gmail: labels, archive, inbox, trash.
- Outlook: categories, folders, inbox, Deleted Items.

Describe the member's provider truthfully. Do not tell an Outlook member to apply a Gmail label or a Gmail member to create an Outlook category.

## Delete discipline

Delete candidates are a separate section and separate batch. Prefer archive for reversible cleanup. Never schedule deletion as the recommended course path. If `delete` is not enabled and tested, the entire delete list remains a proposal with no partial substitution.
