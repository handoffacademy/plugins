---
description: See what is connected, what is turned on, what is scheduled, and what did not finish. Reads only, changes nothing.
---

# /status

The one-screen answer to "what is my Inbox Assistant actually doing right now."

**This command writes nothing.** Not a file, not a receipt, not a fix. It reads `Inbox Assistant State`, the `## Action controls` section of `Task Settings`, `Approved Sources`, and the live scheduled-task list, checks the routes, and reports. If it finds something broken, it names the command that fixes it and stops there.

## If the switch is on, say that first

Before anything else, read the `## Kill switch` section. If it reads `on`, open with a banner, because every other line below it is conditional on this one.

```
Everything is stopped. The safety switch went on Aug 12 via /inbox-assistant:pause.
Nothing will write to your mail until you turn it back off.
Your briefs still arrive if any task is active, with everything as proposals.
```

**The kill switch blocks business-data writes only. Control-plane writes, setting the switch, pausing tasks, updating action controls, and writing receipts and state, stay available so the plugin can always record what it did and always be stopped.**

## 1. Connectors

Do one live no-side-effect read per route the owner is supposed to have, the same way setup does: one small mail search. Compare what worked against the routes recorded in `Approved Sources`.

```
Connectors
  Gmail hello@          reading fine through your Claude connector, checked just now
  Outlook personal@     not reachable. Approved Sources says Zapier, and I see no Zapier mail tool
  Zapier                2 apps visible: Gmail, Slack
```

Never print a Zapier server URL. App names and a count, nothing more.

When a recorded route no longer answers, say so plainly rather than reporting the file's claim as fact. A status command that reads a file and calls it a health check is worse than no health check.

## 2. What is turned on

Read every control block. List only the actions whose status is `enabled` or `pending-test`, then close the list with the sentence that matters most.

```
Turned on
  save-draft       Gmail hello@, tested Aug 4
  label            Gmail hello@, tested Aug 6
  archive          waiting on its first test, so it is not running yet

Everything else is off.
```

**`pending-test` is not enabled. A pending-test action may execute exactly once, inside an interactive `/inbox-assistant:test controls` session, as a single call against the smallest self-owned target, after an explicit yes, with no retry. Everywhere else, treat pending-test as disabled.** So say it in plain words: waiting on its first test means it is not running yet, and `/inbox-assistant:test controls` is the two-minute fix.

If nothing is on, say so as a fact and not a gap:

```
Turned on
  Nothing. Every action is off, which is the default. Your briefs and queues all work,
  with drafts as text you copy and every tidy-up as something you apply.
```

## 3. Scheduled tasks

Read the live task list and filter to this plugin's names. Show state, next run, and whether the prompt carries the `Preamble: v2` marker.

```
Scheduled
  Inbox Assistant: Daily Brief         Active   next tomorrow 7:30am
  Inbox Assistant: Follow-Through      Active   next Thursday 8:00am
  Inbox Assistant: Weekly Owner Reset  Active   next Friday 3:00pm   recreate via /schedule
```

A task without the `Preamble: v2` marker gets that "recreate via /schedule" note and one line of explanation: it was written against the old rules, it is safe and it still runs, and it cannot use anything turned on since. Never present it as broken.

Never list, count, or comment on a scheduled task that is not this plugin's.

## 4. Last successful runs

Read the Checkpoints table and say it in plain language, not as a UTC table.

```
Last full runs
  Daily brief        this morning, 7:31am
  Follow-through     Thursday
  Weekly reset       never run
```

A checkpoint that has not moved in a while is worth a sentence. "Your follow-through has not completed since Jul 29, and its task is active, so something is failing on the run itself" tells the owner something they cannot see anywhere else.

## 5. What did not finish

Read the Partial failures table and show every open row. This is the most valuable section in the command, so do not summarize it into a count.

```
Needs your eyes
  Aug 12  daily-inbox      A draft save came back unclear on thread 18f2c9a1. Check your
                           drafts folder before replying to Rowan, in case it saved twice.
  Aug 11  follow-through   A label was applied and the archive behind it failed. The Dana
                           thread is tagged and still sitting in your inbox.
```

If the ledger is at its 50-row cap, say so and say that older resolved rows are being kept out, because a full ledger is itself a problem.

If there are none: "Nothing outstanding."

## 6. Reconnect guidance

Only when something above is actually broken, and name the right screen for the right thing. These are two different places and sending the owner to the wrong one wastes an afternoon.

- **A native connector.** Inside claude.ai: Settings, then Connectors, then Gmail or Outlook. One sign-in. Walk the owner through it here if they want.
- **Zapier.** The Setting up Zapier MCP lesson at portal.themotherofai.com. Never recite the steps from memory, and never ask for a server URL.
- **A missing or damaged state file.** `/inbox-assistant:setup`, which repairs it with the owner confirming each value.
- **An action that is not running.** `/inbox-assistant:test controls` if it is waiting on a test, `/inbox-assistant:setup stage-2` if it was never turned on.

## Three failure categories

1. **The status that fixes something.** A route is down and reconnecting looks like one command away. Do not reconnect, do not rewrite `Approved Sources` to match reality, do not clear a Partial failures row that looks stale. Report and point. The moment this command writes, its report stops being trustworthy as an independent read.
2. **The route reported from the file.** `Approved Sources` says Gmail reads through the native connector, so the report says reading fine. Check it. The whole point of this section is catching the connector that was revoked in April and never noticed.
3. **The reassuring summary.** Four sections are healthy and one has an open partial failure, so the summary line says "everything looks good." It does not. Lead with what needs the owner, and let the healthy parts be the short lines.
