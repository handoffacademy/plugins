---
name: task-tuner
description: Turns the owner's plain-language corrections about an output into concrete, durable settings in their Task Settings file, and narrows where an action applies or switches it off, always showing the exact before and after. Use whenever the owner says a brief is too long, the wrong things are being flagged, drafts sound wrong, an action is reaching mail it should leave alone, or anything in the daily brief, the follow-through queue, or the upkeep report should be different from now on.
metadata:
  version: 3.0.0
---

# Task Tuner

## Platform compatibility

When running in ChatGPT or Codex, read `../../references/codex-compatibility.md` before accessing project files, connectors, recurring tasks, or delegation. Apply its fail-closed write-policy preflight before any connector state change.

A correction that only fixes today's output is a correction the owner has to repeat. This turns "the briefs are too long" into a line in a file that changes every future run.

## Contract block

**What it reads.** The correction in the owner's own words, the run being corrected, the current `Task Settings` including its `## Action controls` section, and `references/action-controls.md` for what tuning may touch.

**What it produces.** A concrete rule, the exact before and after of the setting, and an updated `Task Settings` written as the owner gives the corrections, with a row appended to the tuning history.

**What it never does.** Change a setting without showing the before and after. Write to `Boundaries` without saying explicitly that a boundary is being changed. Turn an action on. Widen a scope. Turn a correction into a question when the wording already answers it: feedback is durable by default, and only wording that scopes itself to one run is worth asking about. "Skip Marcus today" is this run. "Stop chasing Marcus" is a rule.

**What needs your approval.** Nothing, by default. The correction is the approval: it is applied as given and announced with the exact before and after. If the owner asks to be checked with before saving, honor that for the rest of the session, and if they want it every time, record `Confirm context edits: ask first` under `## Output preferences` like any other correction.

## The four steps

### 1. Translate the feeling into a rule

The owner's words are the input, not the output. Restate them as a rule specific enough to apply mechanically.

| The owner says | The rule |
|---|---|
| "The briefs are too long" | Daily brief capped at 350 words. Needs you today capped at 3 items. FYI capped at 3 lines. |
| "Never flag newsletters" | Any message from a sender in the known-noise list, or with a list-unsubscribe header, goes to Safe to ignore and is never counted in Needs you today. |
| "Warmer drafts" | Drafts open with the person's first name and no salutation line, use contractions, and close with "Talk soon" instead of "Best regards". |
| "Stop chasing Marcus" | Marcus Idowu is excluded from the follow-through queue in both directions. |
| "Only draft for the client mailbox" | `save-draft` scope narrowed from both mailboxes to `clients@` only. |
| "Stop archiving for now" | `archive` set to `Status: disabled`, in one step. |
| "I want the brief earlier" | Cadence change, not a settings change. Route to the schedule command. |
| "Start sending the easy ones" | Not a tuning change. Ask for the exact follow-up outcome, then use its contextual capability flow. |

If the correction is ambiguous, ask one question before writing anything. "Too long" could mean fewer items or shorter items, and those are different settings.

### 2. Know exactly what you may do to an action

Two powers over the `## Action controls` section, and no others:

- **Narrow where an action applies** by taking a mailbox, a folder, or a sender out of `Scope`, or by adding a carve-out to `Restrictions`. Narrowing only ever reduces reach, so it needs no ritual.
- **Switch an action off** by writing `Status: disabled`, in one step, with no phrase to type and no waiting. Turning something off is always immediate.

Never write `Status: enabled` or `Status: pending-test`. Never touch `Zapier tool`, `Account route`, `Enabled on`, `Enable phrase recorded`, or `Last tested`. Never widen a `Scope` or remove a line from `Restrictions`. Those belong to the enable ritual, because the ritual is what tested them.

One more section is out of reach, for a different reason. **A voice correction is written into `## Draft voice`, never into `## Voice guide`.** The guide is a record of how the owner actually writes, built by setup from their own sent mail, and an instruction of theirs outranks it wherever the two disagree, so `Draft voice` is where the instruction belongs and it is already the field that wins. Editing the guide to match a correction destroys the record and leaves nothing to have outranked. If the owner wants the guide itself rebuilt, that is a fresh voice read and it belongs to `/inbox-assistant:setup`.

The `## Upkeep rules` section follows the action-control asymmetry, not the settings default. Narrowing a rule or removing one is a tuning write like any other: applied directly, announced with the exact before and after, logged. Creating a rule or widening one is not tuning, whatever words it arrives in. A standing rule drives unattended writes every morning, so it exists only through a live `/inbox-assistant:organize` apply and the one clear yes that saves it. "Also archive the old invoices every day" is a new rule: route it to `/inbox-assistant:organize` and write nothing.

Three failure categories:

1. **The enable request in tuning clothes.** "Just let you send the easy ones" or "go ahead and start archiving." Say plainly that turning an action on takes the exact-tool ritual, ask for the specific outcome, and use that outcome's contextual capability flow. Do not expose setup-stage language. Offer what tuning can do instead.
2. **The scope widened by a wish.** "Do the same thing for my second mailbox." The scope is what the test verified, so widening it is a setup conversation. Do not append a mailbox to a `Scope` line.
3. **The re-enable after an off.** The owner switched `archive` off last week and now wants it back. Off is one step, back on is the full ritual again, including a fresh test. Say that up front when something gets switched off, so the asymmetry is not a surprise later.

### 3. Check it against the boundaries

If the rule would relax a hard boundary or grant permission the safety contract does not allow, stop. Tuning changes ranking, filtering, length, voice, and reach. It never changes what Claude is allowed to do in kind.

Three failure categories:

1. **The rule that quietly implies permission.** "Handle the newsletters" reads like a filter but means archiving. Split it: the filter becomes a setting, and the archiving is either already on or it is a setup conversation.
2. **The correction that would silence an escalation.** "Stop flagging the Nadia thread, it is stressful." Do not write a rule that hides a flagged category. Offer the version you can do: move the flag out of the top position, keep it in the brief. Say why.
3. **The exception carved into a boundary.** "Archive the personal@ stuff too, just that one folder." `personal@` is on the never-read list, and a tuning change cannot reach across a boundary. Say which file holds that line and that changing it is a deliberate edit to `Boundaries`, not a preference.

### 4. Write the change, then show the exact before and after, then log it

Always. Never a description of the change, always the text.

```
File: Task Settings
Section: Output preferences

Before:
  Daily brief length: default
  Needs you today: up to 5 items

After:
  Daily brief length: 350 words maximum
  Needs you today: up to 3 items

Saved. This takes effect on tomorrow's brief.
```

For an action change, show the block field itself:

```
File: Task Settings
Section: Action controls, save-draft

Before:
  Scope: clients@ and hello@

After:
  Scope: clients@

Saved. This takes effect on the next run.
```

If the change touches `Boundaries`, say so in a separate sentence before the diff: "This one changes a hard limit, not a preference."

The change is already written by this point. Append it to the tuning history table.

```
| 2026-08-04 | Daily brief length | default, up to 5 | 350 words, up to 3 |
| 2026-08-04 | save-draft scope | clients@ and hello@ | clients@ |
```

Then confirm in one line which skill changes and when the owner will see it. If the owner objects after seeing the change, revert it, within the revert rule below.

## The correction is the approval

After setup, a correction or an answer the owner gives is the approval. Apply it, then announce the exact before and after in the same breath, as a statement, never as a question. Ask before saving only when the owner has asked you to, in words like "check with me before saving" or "show me first", and honor that for the rest of the session. If the owner objects after seeing a change, revert it, within the revert rule below.

**A revert is a write like any other, with the same limits.** Putting a preference back is direct: the brief length, the urgency definition, a voice line. Putting reach back is not. Un-narrowing a scope, re-enabling an action, or removing a line from `Restrictions` or `Boundaries` is a widening, and widening belongs to the ritual even one minute after the change it undoes, the same asymmetry as step 2's off switch. The owner narrows `save-draft` to `clients@`, then says "actually, put it back": say plainly that putting `hello@` back is a widening, ask for the outcome they want and use its contextual capability flow, and leave the scope narrowed until it runs.

**The standing preference has a name.** When the owner wants every change confirmed from now on, write `Confirm context edits: ask first` under `## Output preferences` in `Task Settings`, directly, like any other correction. Before the first context write of a run, read `## Output preferences`: if that row reads `ask first`, the saved row outranks this default, so show the diff and wait for the yes. "Stop checking with me" removes the row in one direct write.

Three ways that goes wrong:

1. **The diff with a question mark on the end.** The before and after block is exactly right and the last line reads "Save it?" The block stays as it is. The tail becomes "Saved. Takes effect on tomorrow's brief."
2. **The re-ask after an instruction.** The owner says "cap it at 350 words" and the reply is "shall I apply that?" They already said it. Apply it and announce it.
3. **The batch vote.** Four corrections come back as four diffs waiting for an approve or a reject on each. Apply all four and list the four rows written. A veto afterwards reverts that one, within the revert rule.

Three places where asking is still right:

- **The ambiguous correction.** "Too long" could mean fewer items or shorter items. That is a question about meaning, not about permission. Ask it, then apply the answer.
- **The owner who asked to be checked with.** They said "show me first", so show them first for the rest of the session, and save it as a preference if they said always.
- **Anything reaching the mailbox.** Mailbox actions, the enable ritual, the live test, and the scheduled-task confirmation keep every approval they already have. This default covers writes to the owner's own context files and nothing else, and tuning's limits over `## Action controls` are unchanged: narrow or switch off, never enable, never widen.

## One correction at a time

If the owner gives four corrections at once, translate all four, apply all four, and show every diff in one block as the record of what was written. Four changes are four visible rows, never one blurred summary. If the owner vetoes one after reading, revert that one, within the revert rule above.

## What tuning cannot fix

Some complaints are not settings problems, and saying so saves the owner from tuning in circles.

- **Missing data.** "The brief never mentions my Outlook mail" is a connection problem, not a setting. Point to setup, which checks whether that mailbox has a read route at all.
- **A capability that is off.** "Why are the drafts in the brief instead of in Gmail" means `save-draft` is not turned on, or its named tool is not visible. Point to `/inbox-assistant:status` to see which, then to setup stage 2.
- **Wrong cadence.** "It arrives too late" is a scheduled task problem. Point to the schedule command.
- **A capability that does not exist here.** "It should pay the invoices for me" is not a controllable action in this plugin and never will be. Say what it will do instead: surface them, with the numbers, every week.
