---
description: Tell me what is wrong with a brief or a queue in your own words and I will turn it into a setting that sticks. Also where you narrow where an action applies or switch it off.
argument-hint: "what you want changed, in plain language"
---

# /tune

Read `references/owner-communication.md` before any other plugin instruction. Its owner-facing response contract overrides every example output and reporting instruction below.

The owner says "the briefs are too long." You turn that into a number in a file. Use the **task-tuner** skill for the translation table and the write rules, and `references/action-controls.md` when the change touches an action.

Usage:

```
/tune $ARGUMENTS
```

If the command ran with nothing after it, ask what the owner wants changed and which skill it is about. Do not present a menu of settings. Nobody should have to know what the settings are called.

## 1. Translate the feeling into a rule

Restate the owner's words as something specific enough to apply mechanically. Vague in, concrete out.

| The owner says | The rule |
|---|---|
| "The briefs are too long" | Daily brief capped at 350 words. Needs you today capped at 3. FYI capped at 3 lines. |
| "Never flag newsletters" | Anything from a known-noise sender or with a list-unsubscribe header goes to Safe to ignore and never counts as urgent. |
| "Warmer drafts" | Open with the first name, use contractions, close with "Talk soon" instead of "Best regards". |
| "Stop chasing Marcus" | Marcus is excluded from the follow-through queue in both directions. |
| "Flag anything from Bright Harbor" | Bright Harbor addresses are treated as VIP, so they always rank into Needs you today. |
| "Only draft for the client mailbox" | `save-draft` scope narrowed from both mailboxes to `clients@` only. |
| "Stop archiving for now" | `archive` set to `Status: disabled` in one step. |
| "I want it earlier" | Not a setting. Cadence lives in `/inbox-assistant:schedule`. |
| "Also start sending the easy ones" | Not a tuning change. Ask for the exact follow-up outcome, then use its contextual capability flow. |

Ask one clarifying question when a correction could land on two different settings. "Too long" might mean fewer items or shorter items. Ask, then translate.

## 2. What tuning may do to an action, and what it may not

Tuning has exactly two powers over the `## Action controls` section:

- **Narrow where an action applies.** Take a mailbox, a folder, or a sender out of `Scope`, or add a carve-out to `Restrictions`. Narrowing is always allowed and always immediate.
- **Switch an action off, in one step.** No phrase to type, no confirmation ritual, no waiting. Turning something off is always easy and always immediate.

Tuning may never set `Status: enabled` or `pending-test`, may never edit `Zapier tool`, `Account route`, `Enable phrase recorded`, or `Last tested`, and may never widen a scope or remove a restriction. Those belong to the ritual.

Three failure categories:

1. **The enable request in tuning clothes.** "Just let you send the easy ones" or "go ahead and start archiving." Say plainly that turning an action on takes the full exact-tool ritual, ask for the specific outcome, and enter that outcome's contextual capability flow. Do not expose setup-stage language. Offer what tuning can do instead: draft more of them, or tighten where the actions already on are allowed to reach.
2. **The scope widened by a wish.** "Do the same thing for my second mailbox." That is a widening, which the ritual owns, because the scope is what the test verified. Route it to setup. Do not append a mailbox to a `Scope` line.
3. **The off switch expected to come back.** "Turn archiving off while I am away, then back on Monday." The off half is one step and happens now. The back-on half is not tuning: re-enabling runs the full ritual again, including the test. Say both halves plainly in the same breath, so Monday is not a surprise, and do not schedule a future re-enable.

## 3. Check it against the safety contract

Tuning changes ranking, filtering, length, voice, and reach. It never changes what Claude is allowed to do in kind.

- "Handle the newsletters" hides an action inside a filter. Split it. The filtering becomes a setting, and archiving is either already on or it is a setup conversation.
- "Stop flagging that thread, it is stressful" would silence an escalation. Do not write it. Offer the version you can do, which is moving the flag out of the top position while keeping it in the brief, and say why the flag stays.
- Anything that would let a run act on a legal, financial, personnel, emotionally charged, or payment-detail thread is refused outright. That is not a setting, it is the contract.

## 4. Write it, then show the exact before and after

The correction is the approval. Write the change, then show what changed in the same breath, as a statement. Always the actual text, never a description of it.

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

For an action change, show the block field, not a summary:

```
File: Task Settings
Section: Action controls, save-draft

Before:
  Scope: clients@ and hello@

After:
  Scope: clients@

Saved. This takes effect on the next run.
```

If the change touches `Boundaries`, say so in its own sentence before the diff: "This one changes a hard limit, not a preference."

Several corrections at once: apply each one, then show every diff in one block as the record of what was written. Four changes are four visible rows, never one blurred summary. If the owner vetoes any of them after reading, revert that one, within the widening limit in step 5.

Ask before saving only when the owner has asked you to, in words like "check with me before saving" or "show me first", and honor that for the rest of the session. If they want every change confirmed from now on, write `Confirm context edits: ask first` under `## Output preferences`, directly like any other correction; later sessions read that row before their first context write and honor it.

## 5. Log and confirm

The write already happened in step 4. Append a row to the tuning history in `Task Settings` for each change.

```
| 2026-08-04 | Daily brief length | default, up to 5 | 350 words, up to 3 |
| 2026-08-04 | save-draft scope | clients@ and hello@ | clients@ |
```

Then one line on what changes and when the owner will see it. If the owner objects after seeing the change, revert it and say so. A revert follows tuning's own limits: putting a preference back is direct, but un-narrowing a scope, re-enabling an action, or removing a restriction is a widening that belongs to the ritual, even right after the change it undoes. Say that plainly instead of writing it.

> Saved. Tomorrow's brief will be shorter and drafts will only be saved in clients@. Want me to run today's again with the new settings so you can see it now?
