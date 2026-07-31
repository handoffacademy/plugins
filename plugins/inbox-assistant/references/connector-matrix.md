# Connector Matrix

What each Inbox Assistant capability needs in order to work, which route it takes, and what happens when the route is missing.

Two connector layers are in play and they do different jobs.

- **Native connectors.** The Gmail and Outlook (Microsoft 365) connectors Anthropic ships inside claude.ai, turned on by the member in Settings, Connectors, or through Cowork's connect-tools flow. They read: mail search, thread bodies. They are the primary read route for every skill in this plugin.
- **Zapier MCP.** The member's own Zapier server, added as a connector. It is the only write route here: saving a draft, archiving a thread, applying a label. It is also the read fallback whenever a native connector is not on.

The split, in one line: **reads go native first, writes go through Zapier only.**

This plugin ships no connector configuration of any kind, **including no `.mcp.json`**. No MCP block, no native connector list, no server entry. A Zapier MCP URL carries access to the member's accounts, so it is never written into a plugin file, never pasted into a chat, and never requested by any command here. Every run checks at runtime which tools are actually connected and adapts.

This file routes reads. It does not govern writes: which write may happen and through which exact tool both live in `references/action-controls.md`, and a route being available never implies an action is permitted.

Tool names differ between Zapier accounts and between connector versions. Match on capability, not on an exact string.

## Capability to route

| Capability | Primary route | Fallback route | Used by |
|---|---|---|---|
| Read new mail | Native Gmail or native Outlook connector | Zapier mail find action. Gmail: Find Email. Microsoft Outlook: Find Email | daily-inbox, follow-through, owner-brief |
| Read sent mail | The same native connector, scoped to sent | Zapier. Gmail: Find Email with label SENT. Microsoft Outlook: Find Email in Sent Items | follow-through, owner-brief |
| Read a full thread | Native connector, message body and not only headers | Zapier find action that returns a body | all mail skills |
| Save a reply draft | Zapier only. Gmail: Create Draft, Create Draft Reply. Microsoft Outlook: Create Draft Email | None. Without it the draft goes into the output as text to copy | daily-inbox, follow-through |
| Tidy a thread: archive, move, label, mark read | Zapier only. Gmail: Archive Email, Add Label. Microsoft Outlook: Move Email | None. Without it the tidy-up is a proposal the owner applies | daily-inbox, follow-through |
| Save the four context files and the state ledger | Files in the member's Claude account | None | setup-concierge, task-tuner, every run |
| Run on a schedule | Claude scheduled tasks, cloud side | None | all three skills |

The two write rows have no fallback on purpose. The native connectors read. They do not save drafts and they do not archive, move, or label, so a member with native connectors and no Zapier gets the whole reading half of every skill and nothing that changes a mailbox. That is a real tier of the product, not a broken setup.

**A missing write route degrades to text in the output. It never degrades to a different write.** Never use a send action in place of a missing draft action, and never use a delete action in place of a missing archive action.

**A route counts as a read route only if it changes no state.** A "read" that marks mail as read, moves a message, applies a label, or logs a side effect anywhere is a write in disguise, so it is never invoked, not even with the owner's approval, and not on either layer. When the only read action available for a mailbox carries a side effect, that source is uncovered for the run: leave it alone, produce the output from the sources you could read cleanly, and name the uncovered one in the footer. This rule is global to the plugin, so every skill, command, and scheduled task follows it without restating it.

## The mail asymmetry, in both layers

**A read route and a write route are two separate connections, even for the same mailbox.** The native Gmail or Outlook connector reads that mailbox and cannot write to it. Gmail or Microsoft Outlook in the owner's Zapier server writes to it, and only for the exact actions they added there.

Native-first reads moved this trap rather than removing it, so check both halves:

- **Mail reads** come from the native connector, with Zapier mail find actions as the fallback. A member with the native Gmail connector on has reads covered and nothing else.
- **Mail writes** come from the exact Zapier tool named in the action's control block and from nowhere else. A native connector never covers this half.

That produces a combination worth naming, because it looks like a bug and is not one: native mail read on, no Zapier mail app. Every brief and every queue runs in full and sees everything. Nothing saves into the mailbox, because there is no route to save it, so every draft prints as text and every tidy-up is a proposal. Say that inside the output rather than letting the owner expect a draft that cannot land.

## What to say when something is missing

Name the capability, name the effect, name the fix, and point at the right place for that fix. Native connectors are turned on inside claude.ai. Zapier tools are connected through the portal lesson. Never attempt to connect either one on the owner's behalf, and never ask for a credential.

Three failure categories, because the fix is in a different place each time.

**No mail read route at all.** Nothing runs. Offer the one-click route first.

> I cannot read any mail yet, so your Inbox Assistant has nothing to work from. The fastest fix is inside Claude: open Settings, then Connectors, and turn on Gmail or Outlook. It is a one-click sign-in and you are done. If your mail lives somewhere those do not reach, the Turn On Automation lesson at portal.themotherofai.com covers the other route.

**Mail reads work, no Zapier write tools.** Everything reads, nothing saves.

> I can read your mail through your Gmail connector, so your briefs and your follow-through queue both work. What I cannot do yet is save a draft into your mailbox, because saving drafts goes through Zapier and I do not see it connected. Your drafts will come to you as text in the brief, ready to copy. The Turn On Automation lesson at portal.themotherofai.com is what turns that into a saved draft.

**Mail reads work, the named write tool is missing.** The output is whole, the write half is not.

> I can read your mail, so your brief is complete. What I cannot do is archive the pile at the bottom, because the archive tool named in your settings is not visible this run. That list is yours to clear until it is back, and the Turn On Automation lesson at portal.themotherofai.com walks through adding it.

## Degradation table

| Missing | Still works | Does not work |
|---|---|---|
| Native mail connector, Zapier mail read present | Every mail skill, reading through Zapier instead | Nothing. Zapier reads spend Zapier tasks, which native reads do not |
| Zapier entirely, native mail read present | Every skill, read-only. Drafts printed in the output to copy, every tidy-up a proposal | Drafts saved into the mailbox. Any write at all |
| Zapier draft action, mail reads work | Every skill, with drafts printed in the output to copy | Drafts saved into the mailbox |
| Zapier archive, move, or label action | Every skill in full, with the tidy-up listed as a proposal | Anything leaving the inbox on its own |
| Sent mail access, both routes | daily-inbox, owner-brief | The "they owe you" half of follow-through |
| Every mail read route | Nothing. Setup does not complete without a mail read route, so nothing runs | Every skill |
| Everything | Nothing | Setup stops and points at both fixes: native connectors in Claude's settings, Zapier through the lesson |

A run that cannot cover everything says what it covered and what it did not. It never returns a partial result shaped like a complete one.

## Running both routes at once

Both layers on is the intended end state: native connectors reading, Zapier writing. Two things to keep straight when that is the setup.

- **One read route per mailbox, per run.** Do not read the same mailbox through the native connector and through Zapier in the same run. Pick the primary, use it, and say which one you used in the footer. Reading both puts the same message in the brief twice.
- **The safety rules do not change with the route.** A native send action, if one ever appears, is off limits: native connectors read, and every write goes through the exact Zapier tool named in its control block. The route decides how something happens. Whether it is allowed at all is decided in `references/action-controls.md` and nowhere else.

Record in `Approved Sources` which route covers which mailbox, and which route saves drafts. That keeps the choice stable between runs instead of being re-decided every morning, and it is what tells a scheduled run six weeks from now that a gap is known rather than new.
