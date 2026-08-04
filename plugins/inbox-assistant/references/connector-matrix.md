# Connector Matrix

What each Inbox Assistant capability needs, which route it takes, and what happens when that route is missing.

## Product doctrine

Two connector layers are available. Native write tools exist, and their capabilities vary by provider, plan, administrator policy, and host product. Gmail can create drafts and manage labels. Microsoft 365 can expose broader write tools when an administrator enables them. The plugin does not pretend otherwise.

The Inbox Assistant makes a deliberate portability choice:

- **Native connectors are the primary read route.** They are efficient for mailbox search and thread bodies and do not consume Zapier tasks.
- **Zapier MCP is the portable action layer.** It gives Claude and Codex one consistent route for controlled mailbox actions, exact tool exposure, and Zapier action history across providers.
- **Zapier remains this plugin's only write route.** A native write capability being visible does not authorize this plugin to use it.

The split, in one line: **reads go native first; plugin writes go through Zapier only.** This is an Inbox Assistant policy, not a claim that native products have no write tools.

This plugin ships no connector configuration, including no `.mcp.json`. A Zapier MCP URL carries account access, so it is never written into a plugin file, pasted into chat, or requested by a command. Every run inventories the tools actually visible in that session.

Tool names differ between Zapier accounts and connector versions. Read routing may match by capability. A write never does: it uses only the exact tool recorded in the action control.

## Capability to route

| Capability | Primary route | Fallback or degradation | Used by |
|---|---|---|---|
| Read new mail | Native Gmail or native Microsoft 365 | Zapier mail find action | daily-inbox, follow-through, owner-brief, inbox-organization |
| Read sent mail | Native connector scoped to sent | Zapier mail find action scoped to sent | follow-through, owner-brief, setup voice read when native sent access exists |
| Read a full thread | Native connector returning message bodies | Zapier find action returning bodies | all mail skills |
| Save or update a reply draft | Exact Zapier tool in `save-draft` control | Draft text appears in the output | daily-inbox, follow-through |
| Send or reply | Exact Zapier tool in `send-reply` control | Draft or nudge remains a proposal | follow-through |
| Archive | Exact Zapier tool in `archive` control | Archive list remains a proposal | daily-inbox, inbox-organization |
| Delete or move to trash | Exact Zapier tool in `delete` control | Delete candidates remain a separate proposal | inbox-organization |
| Move between folders | Exact Zapier tool in `move` control | Move list remains a proposal | inbox-organization |
| Apply labels, tags, categories, flags, or stars | Exact Zapier tool in `label` control | Organization labels remain a proposal | daily-inbox, inbox-organization |
| Mark read or unread | Exact Zapier tool in `mark-read` control | Read-state changes remain proposals | daily-inbox, inbox-organization |
| Save the four context files and state ledger | Files in the member's project or workspace | Return proposed contents and name the persistence gap | setup, tune, every run |
| Run on a schedule | Host product recurring task retaining the full safety preamble | Prepare the exact proposal without claiming it was scheduled | daily-inbox, follow-through, owner-brief |

Write rows have no fallback write route. A missing Zapier tool degrades to a proposal, never to a native write or another Zapier action.

## Read routes must not change state

A route counts as a read route only when it changes no mailbox state. A read that marks a message read, moves it, labels it, archives it, or logs another mailbox side effect is a write in disguise. Do not invoke it as part of reading, even when the corresponding action is enabled. Treat that source as uncovered for the read and name the gap.

## The mail asymmetry

A read route and a write route are separate connections even when they reach the same mailbox.

- The native Gmail or Microsoft 365 connector normally reads the mailbox.
- The exact Zapier tool recorded in an action control performs an approved write.
- Approved Sources records the read route. Task Settings records write controls.
- A connected route never implies an enabled action.

Both layers being connected is the intended course setup. Read one mailbox through one route per run. Do not read through native and Zapier simultaneously or the same message can appear twice.

## Current native capabilities

Course and plugin copy must remain honest about current product behavior.

- Claude's native Gmail connector can search and read email, create drafts, and manage labels and threads. It cannot send email at the time of this release.
- Claude's native Microsoft 365 connector can expose drafting, sending, organization, categories, inbox rules, and other write tools when the organization's administrator enables them.
- Those capabilities are not guaranteed in ChatGPT, Codex, every Claude plan, every organization, or every future connector version.

The Inbox Assistant therefore uses native connectors for cost-efficient reads and Zapier for consistent cross-platform writes. Do not say native connectors are universally read-only. Do not use a native write tool as a shortcut around the action controls.

## Zapier task use

Zapier's current documentation charges two tasks per successful Zapier MCP tool call. Failed calls do not consume tasks. Use `skills/zapier-limits-and-cost/SKILL.md` to retrieve current allowances, prices, or a changed task rate. Never quote plan allowances from memory.

A native read normally costs zero Zapier tasks. A Zapier fallback read and every Zapier write consume tasks according to the current documented rate.

## Missing-route language

Name the capability, effect, route, and fix.

**No mail read route:**

> I cannot read this mailbox yet, so I left it alone. Connect Gmail or Microsoft 365 in the current product, or add the needed Zapier find tool through the Setting up Zapier MCP lesson.

**Mail reads work, no Zapier write tools:**

> I can review your inbox. I cannot change it through the Inbox Assistant because no Zapier write tool is available. Every proposed label, archive, move, draft, or deletion stays in the report.

**The recorded write tool is missing:**

> I completed the review. I did not apply the archive changes because the exact Zapier tool recorded in your archive control is not visible in this session. I did not substitute another tool.

## Degradation table

| Missing | Still works | Does not work |
|---|---|---|
| Native mail connector, Zapier read present | Mail skills through the Zapier fallback | Free native reads; fallback reads consume Zapier tasks |
| Zapier entirely, native mail read present | Full audit, briefs, queues, drafts as text, all changes as proposals | Any Inbox Assistant mailbox write |
| Zapier draft tool | Draft text in outputs | Drafts saved into the mailbox |
| Zapier organization tools | Audit and preview in full | Applying the missing organization actions |
| Sent-mail access on both routes | Daily inbox and partial owner brief | The "They owe you" half of follow-through |
| Every mail read route | Nothing | Every mail skill |

A partial run says what it covered and what it did not. It never presents limited coverage as complete.

## Security boundary

The route decides how a permitted action happens. `references/action-controls.md` decides whether it is permitted. Before every write, the exact tool, action class, scope, restrictions, test date, kill switch, receipts, and auditor verdict must all pass again.
