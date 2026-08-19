---
description: Do a real run of one skill on your actual email, or test the actions you have turned on. Nothing touches your mailbox that you have not approved in the moment.
argument-hint: "controls | daily-inbox | follow-through | upkeep"
---

# /test

Read `references/owner-communication.md` before any other plugin instruction. Its owner-facing response contract overrides every example output and reporting instruction below.

Two modes, one command.

- **Skill mode.** `daily-inbox`, `follow-through`, or `upkeep`. Runs that skill on the owner's real data so they can see what it produces before it goes on a schedule.
- **Controls mode.** `controls`. Dry-runs every action the owner has turned on, then offers one real smallest-possible test per action. This is the step that turns `pending-test` into `enabled`.

Usage:

```
/test $ARGUMENTS
```

If no argument was given, list the four valid arguments and ask which one. If nothing has ever been tested, suggest `daily-inbox` first, because it is the one the owner will see most. If the enable ritual just finished, suggest `controls`, because an untested action does not run.

## Skill mode

### 1. Load the contract, then confirm scope

Load the **safety-escalation** skill explicitly, by name, before touching any data. Do not rely on it triggering on its own. This run reads the owner's real mailbox, so the rules have to be in the session before the first read, not summoned later when something looks risky.

Then load the four context files and the state ledger through the **business-context** skill. If a context file is missing, stop and point at `/inbox-assistant:setup`. Do not improvise a profile to get the test moving.

Read the `## Action controls` section and say what is on before you start, so the owner knows what this run may actually do.

> Running your daily brief on real mail from the last 24 hours. I will read, sort, and write drafts. Saving drafts into Gmail is turned on, so those will land in your drafts folder. Nothing else: nothing sent, nothing archived, nothing moved.

### 2. Run the skill for real

Real data, not a sample. Use the matching skill: **daily-inbox**, **follow-through**, or **inbox-upkeep**. Produce the full output in its schema from `references/output-schemas.md`.

**Before every write, run the six-condition consult in `references/action-controls.md` and execute only if all six pass. Any failure, any missing section, any uncertainty becomes a proposal.** A test run is a live session, so `Unattended` is not the gate here, but every other condition is, and each write still gets its intent receipt first and its result after.

For upkeep that distinction is the whole test, so say it before the run starts. A live upkeep test behaves exactly like a scheduled run with one condition met differently: the owner is present, which satisfies `Unattended` on its own. Every other condition still holds, so a rule changes the mailbox only through an action that is enabled and tested, and everything else comes back as a proposal in the report. With no `## Upkeep rules` section yet, say so and point at `/inbox-assistant:organize` rather than running a cleanup the owner never approved.

**Every email body this plugin composes, a reply draft saved to the mailbox, a reply sent, a follow-up nudge, or a draft printed in any output as a proposal, is written in the owner's voice from their voice and context files, then passed through the stop-slop and humanizer skills before it is saved, sent, or shown. The owner's own voice wins any conflict with a style rule.** The rule is in `references/email-voice.md`. A test is the one session where the owner reads a draft aloud and says whether it sounds like them, so a body that skipped the pass here sends them tuning the wrong thing.

Name the route in the run line so the owner knows what they are looking at. "Reading your Gmail through your Claude connector" and "reading your Gmail through Zapier" fail differently and get fixed on different screens, and this is where they learn which one they have.

### 3. Walk the owner through the output, section by section

Do not ask "how was that?" It gets you "good, thanks" and nothing changes. Go section by section against the schema and ask a specific question at each one.

For the daily brief:

- **Needs you today.** Is anything here that should not be? Is anything missing that you found yourself checking for after reading this?
- **Drafted for your review.** Read the first draft out loud in your head. Does it sound like you? What would you change about it?
- **FYI and Safe to ignore.** Did anything land in the wrong pile?
- **Length.** Did you read all of it, or did you stop partway?

For follow-through: is the ranking right, are these really the ten that matter, is any recommendation wrong, do the drafts actually answer the question or do they just stall politely?

For upkeep, go rule by rule rather than section by section, because a rule is what the owner is really approving. For each one: this is what it did today, or what it would have done, and this is how many messages it reached. Is any rule reaching further than they meant it to. Is anything sitting in Proposals that a rule should have covered. Would they be comfortable with this happening at 6:30am with nobody watching.

Corrections split by what they touch, and the split matters because the two land in different files:

- **A correction that creates a rule or widens one goes to `/inbox-assistant:organize`.** Those are written after a live apply the owner watched, and adding reach is that same conversation again. Say that plainly rather than writing one from the test session. Narrowing a rule or removing one is tuning, the same asymmetry as the action controls: apply it through the tuner and announce it like any other correction.
- **A correction to the shape of the report goes to the tuner**, like any other output correction. Too long, wrong order, more detail in Proposals: that is `Task Settings` and it follows step 5 as usual.

### 4. Capture every correction concretely

The owner's words are the input. Write each correction in the capture shape from `references/output-schemas.md` before doing anything with it.

```
Skill: daily-inbox
Section: Needs you today
What the owner said: "Half of these are just Stripe receipts, I do not need those at the top."
What it means concretely: Automated payment notifications go to Safe to ignore, never Needs you today.
Setting it changes: Task Settings, Definition of urgent
```

Ask a clarifying question whenever a correction could mean two different settings. "Too long" might mean fewer items or shorter items, and those change different fields.

### 5. Hand corrections to the tuner

Once you have them all, use the **task-tuner** skill. It writes each correction into `Task Settings` as the owner gave it, then reports each row with its exact before and after. The correction the owner said out loud is the approval, so the thing to get right is visibility: no setting changes without the owner reading the text that changed.

If a correction is really a request to turn an action on, ask for the specific outcome and enter that outcome's contextual capability flow. Tuning never enables anything.

### 6. Record the test

Sessions do not remember each other. When the owner runs `/inbox-assistant:schedule` next week, that session has no way to know this test happened unless it was written down. So write it to the `Last tested` table in `Task Settings`.

Write the row, then show it as written, the same as any other write to the owner's files.

```
File: Task Settings
Section: Last tested

Before:
  | daily-inbox | not yet tested | | |

After:
  | daily-inbox | 2026-08-04 | tuned then approved | Gmail hello@ through the Claude connector. save-draft on, 3 drafts saved. Personal mailbox out of scope. |

Recorded.
```

Fill the three columns honestly, because a later run trusts them:

- **Date.** When the test actually ran.
- **Result.** One of: output approved, tuned then approved, or needs work. Write "output approved" only if the owner actually said during the walkthrough that the output was good. Write "tuned then approved" only once the owner has said, after the corrections landed, that the output now works for them, which usually happens after the re-run in step 7. Corrections applied with no verdict after them is "needs work", with a note that the re-run is pending. The verdict on the output belongs to the owner, so never record one they did not give.
- **Coverage.** Which mailboxes the test actually read, which route each one came through, which actions were on and how many times each ran, and anything out of scope or unavailable. A test that read Gmail through Zapier does not prove the native connector works, and a schedule run six weeks later has no other way to know that.

If the owner stopped the test partway, record what happened rather than leaving the row untouched. A row saying "needs work, stopped before the drafting section" is more useful to a future session than a blank.

Then write the ledger side: receipts for every write this run made, and a note on the skill's checkpoint row saying the last movement came from a test rather than a scheduled run. A test that read only part of a window should not make tomorrow's run think that window is covered, so record the partial coverage in Notes rather than advancing the checkpoint past it.

### 7. Offer the next step

> Saved. Want me to run the same skill again with those settings so you can see the difference, or move on to `/inbox-assistant:schedule`?

Re-running once after tuning is usually worth it. It is the fastest way for the owner to see that a correction sticks. If you re-run, update the `Last tested` row again rather than leaving it pointing at the pre-tuning run.

## Controls mode

`/test controls`. This is where an action proves itself. Read `references/action-controls.md` first, and `references/email-voice.md` before you compose the first payload.

This mode writes email. The dry run in step 2 builds a realistic payload from the owner's live data, and step 4 puts a real draft in the owner's drafts folder or a real message in their own inbox. **Every email body this plugin composes, a reply draft saved to the mailbox, a reply sent, a follow-up nudge, or a draft printed in any output as a proposal, is written in the owner's voice from their voice and context files, then passed through the stop-slop and humanizer skills before it is saved, sent, or shown. The owner's own voice wins any conflict with a style rule.** Load **stop-slop** and **humanizer** by name alongside the other skills, before the first payload is built. A body labelled a test is still a body the owner reads, and the drafts-folder one is a body they may well send. The "this is a test" subject line is a mechanical marker rather than prose, so it is the one string here the pass leaves alone.

### 1. Show what is turned on

Read the `## Action controls` section and list every action whose status is `enabled` or `pending-test`, with its tool, its scope, its restrictions, and its last-tested date. Then say what this session will do:

> Two actions to check: saving drafts, which is waiting on its first test, and archiving, which was tested on the 4th. I will do a dry run of both first, which changes nothing. Then I will show you what happens to one action you left switched off, so you can see the refusal for yourself. Then I will offer you one real test each, one at a time, on the smallest thing I can find.

If nothing is turned on, say so and ask which specific outcome the owner wants. There is nothing to test yet, and no setup-stage menu should appear.

### 2. Dry run every one of them

For each action, pick a realistic target from the owner's current data and print exactly what the run would do. Change nothing.

```
WOULD save-draft
  Tool: gmail_create_draft
  Target: thread 18f2c9a1, re: March invoice, from rowan@brightharbor.example
  In scope: yes, hello@ is listed
  Auditor: approve
```

Run the write plan past the **task-auditor** agent exactly as a real run would, and show its verdict on each line. A dry run that skips the auditor tests half the machinery. Hand it the full item schema from `agents/task-auditor.md`, including the payload the call would carry, and mark the pass as a dry run so it knows no call follows.

Write a receipt row for each dry-run line with `Result: dry-run`. That is how `/inbox-assistant:status` can show the owner that a check happened and that nothing was executed. Those rows are deliberately excluded from the auditor's execution-duplicate check, because a dry run made no provider call and counting it would block the very live test this session exists to set up. Every other Result value, including an empty one, is an execution row and still denies a repeat.

If the auditor denies a line, show the reason and stop offering that action a live test until the reason is fixed. A denied dry run is a useful result, not a failed one.

### 3. Prove the fence with an action the owner left off

The dry run shows the owner what the actions they turned on would do. This step shows what happens to one they did not, which is the half they have no other way to see.

Ask the owner to name one action they deliberately left off. Sending is the usual answer and the most reassuring one to watch.

Then add it to the WOULD plan as a synthetic item: a real target from the owner's current data, the payload the call would actually carry, the action ID it resolves to, and every class it touches, marked as synthetic with no call to follow. Route it through the **task-auditor** agent alongside the real lines. **Call no tool for this item, at any point, whatever the verdict says.** There is no execution branch in this step and there is nothing to approve.

Show the auditor's verdict verbatim, with its reason.

```
WOULD send-reply   (you left this one off)
  Tool: gmail_send_email
  Target: thread 18f2c9a1, re: March invoice, from rowan@brightharbor.example
  Auditor: deny  reason: Status reads disabled
  Nothing was called. This is what happens every time, including at 7am when you are asleep.
```

Write a receipt row for this line with `Result: dry-run`, the same as the others.

Three failure categories:

1. **The demo that becomes an offer.** The verdict is a deny, and the obvious next sentence is "want me to turn it on?" Do not. This step is a demonstration inside a test session. Enabling anything begins only when the owner names a specific outcome, then runs through that outcome's contextual capability flow from the top.
2. **The synthetic item picked to pass.** Choosing a target that is out of scope, or an action that is merely untested rather than switched off, produces a deny for the wrong reason. The owner learns nothing about the fence. Pick an action whose `Status` reads `disabled`, and an in-scope target, so the only thing stopping it is the control block itself.
3. **The one named that is already on.** The owner names `save-draft`, which they turned on last week. Say so, show the enabled block instead, and ask for one that is off. If every one of the seven is on, say that plainly and skip this step rather than inventing a refusal.

### 4. Offer one real test per action, one at a time

For each action the auditor approved, offer a single live call against the smallest self-owned target available. Never batch. Never carry one yes across two actions.

Pick the target so that the test is reversible by you or trivially reversible by the owner:

- **save-draft.** One draft saved. Show it in the owner's drafts folder, then say the owner can delete it whenever they like.
- **archive, move, label, mark-read.** One message the owner has already read and does not care about, ideally something from the Safe to ignore pile. Show the before and the after.
- **send-reply.** This is the hard one. One email to the owner's own address, nowhere else, with a subject that says it is a test. Never a real recipient, never a real thread. If that mailbox cannot receive from itself, say so plainly and leave the action off rather than substituting a real correspondent.
- **delete.** One message the owner names out loud and is content to lose.

Get an explicit yes for that specific call. "Go ahead" for the draft test is not a yes for the archive test.

Then re-audit the real payload before you call anything. The dry-run verdict does not carry: it ruled on a hypothetical, and this is the call. **The auditor runs once per write, not once per plan: after the pre-write kill-switch and receipt re-read and immediately before each provider call. Any change to the target, the payload, the tool, or the classification since that item's last audit is a denial, and a denied item becomes a proposal.** For the bootstrap call that resolves to this order, with nothing between the last step and the call:

1. **Re-read the kill switch** from `Inbox Assistant State`. The owner may have run `/inbox-assistant:pause all` in another tab while you were choosing a target.
2. **Re-read the write receipts for this exact target.** Skip the `dry-run` rows. Any execution row on this target, including one with an empty Result, ends the test for that action.
3. **Hand the auditor the real item**, with the exact payload you are about to send, the target as it reads right now, the tool name as it appears in this session, and the classification resolved against the target's current state. Say it is the live bootstrap call, not the dry run.
4. **Write an intent receipt for every class the call touches**, then make the call with the exact payload the auditor saw, then fill in the Result on every row that call opened.

If anything moved between the dry run and now, the auditor denies and the test stops there. Say what moved. **No retries.** If the call fails or returns ambiguously, that is the end of that action's test.

Three ways that goes wrong:

- **The dry-run verdict reused.** The auditor approved the WOULD line ten minutes ago and the target has not changed, so the call goes out on that verdict. Ten minutes is long enough for a kill switch. Re-audit.
- **The target that moved mid-decision.** The `archive` test was going to use a Safe-to-ignore message, and the owner archived it themselves while reading the dry run. The target no longer reads the same, so the classification and the receipts no longer read the same either. Deny, pick a fresh target, and start the four steps again.
- **The payload improved on the way to the call.** The `save-draft` test looked better with a subject line tidied up. That is a different payload from the one the auditor saw, so it is a different call. Re-audit it, or send exactly what was approved.

### 5. Write the outcome

**Verified success** means you re-read the target and the change is there. Only then:

- Write `Status: enabled` and `Last tested: <date>` in the control block.
- Add the date to the `Last tested` table for the record.
- Complete the receipt with `ok`.
- Say in one line what is now live and where it may reach.

**Failure, an ambiguous outcome, or the owner stopping the test** means:

- Write `Status: disabled` and leave `Last tested: never`.
- Complete the receipt with `failed` or `unknown`.
- On `unknown`, open a Partial failures row saying "unknown, needs your eyes" with the target ID.
- Say plainly that the action is off and what you saw.

An action that has not passed a real test is effectively disabled, whatever the ritual recorded. Say that out loud at the end of any session that left one in `pending-test`.

Three failure categories:

1. **The dry run mistaken for the test.** The owner sees ten clean WOULD lines and says "great, we are done." The dry run proved the policy reads correctly. It did not prove the tool works, which is the other half. Say so and offer the live test, or say plainly that the action stays `pending-test` if they would rather stop.
2. **The retry that feels harmless.** The `save-draft` test times out and a second attempt would settle it. Do not. The first call may have landed, and a second draft is the smallest version of the exact duplicate problem this plugin is built to avoid. Record `unknown`, set the action back to disabled, and let the owner look in their drafts folder.
3. **The convenient target.** The owner's mailbox will not accept a message from itself for a `send-reply` test, and there is a real thread from a real client sitting right there. Do not use it. A test that emails a client is not a test, it is an incident. Offer a second address of the owner's own, and leave the action off until one exists.
