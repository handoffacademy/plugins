---
description: Stop everything at once with "all", or see your Inbox Assistant scheduled tasks and pause, resume, or delete the ones you name.
argument-hint: "all | <task name>"
---

# /pause

Read `references/owner-communication.md` before any other plugin instruction. Its owner-facing response contract overrides every example output and reporting instruction below.

Show exactly what is scheduled, then change only what the owner names. Going quiet for a week should take one sentence and should never cost a scheduled task the owner wanted to keep.

Usage:

```
/pause $ARGUMENTS
```

`all` is the emergency stop and it does two things, in order. A task name pauses, resumes, or removes that one task. No argument lists everything and asks.

## 1. `all` is the kill switch, and order matters

`/pause all` means stop everything, and it does this in exactly this order:

1. **Pause every scheduled task belonging to this plugin.** This is the enforcement that actually holds, because it is applied on Anthropic's side and a paused task does not start.
2. **Then set `Status: on` in the `## Kill switch` section of `Inbox Assistant State`**, with the date and this command's name. This is cover for a run already in flight, which re-reads the switch before each write.

Do them in that order. Setting the switch first leaves a window where a cadence can still fire, and pausing without the switch leaves a run already underway free to keep writing.

**The kill switch blocks business-data writes only. Control-plane writes, setting the switch, pausing tasks, updating action controls, and writing receipts and state, stay available so the plugin can always record what it did and always be stopped.**

Say what it does and what it cannot do, plainly:

> Everything is stopped. Every scheduled task with this plugin's name on it is paused, and the safety switch is on, so nothing will write to your mail even if a run is already going. One thing I cannot do is unsend something already sent or un-archive something already archived. Anything that landed in the last few minutes has landed.

Resuming is never silent. When the owner asks to resume, say that the switch is on, ask whether to turn it off as well as unpausing the tasks, and do only what they confirm:

> Your tasks are paused and the safety switch is on. Do you want both back on, or the tasks back on with writing still switched off? Tasks on with the switch on means you get your briefs and everything comes to you as a proposal.

Three failure categories:

1. **The panic with no argument.** The owner types `/inbox-assistant:pause` and then "stop, stop everything." Treat that as `all` once you have said what you are about to do in one line. Do not make anyone find the exact word while they are worried.
2. **The half resume.** The owner says "you can start again." Unpause what they name and ask about the switch explicitly. Never turn the switch off as a helpful extra, because the switch is the only thing standing between an in-flight run and the mailbox.
3. **The switch left on quietly.** A previous session set the switch and nobody mentioned it. Every run of this command reads the switch and says its state in the first line of output, so a member never spends a week wondering why nothing is being saved.

## 2. List what exists

The scheduled tasks are the only record of when the skills run. Nothing in the saved files stores a cadence, so this list is the truth. Read the live tasks every time rather than describing what you remember being set up.

List the scheduled tasks belonging to this plugin, by their exact names. Show the current state and the next run for each, and show the switch above them.

```
Safety switch: off. Actions can run.

Your Inbox Assistant scheduled tasks:

1. Inbox Assistant: Daily Brief          Active    next tomorrow 7:30am
2. Inbox Assistant: Follow-Through       Active    next Thursday 8:00am
3. Inbox Assistant: Daily Cleanup        Paused    since Jul 12
```

Show only tasks belonging to this plugin. If the owner has other scheduled tasks, do not list them, do not count them, and do not touch them. If the owner asks about one of those, say it is outside this plugin and can be managed from the scheduled-task list directly.

If nothing is scheduled, say so and point at `/inbox-assistant:schedule`.

## 3. Act only on what the owner names

Repeat back the exact task name and the exact action, then do it, then confirm.

> Pausing **Inbox Assistant: Daily Brief**. Nothing else changes. Your follow-through and your daily cleanup stay on.

Three failure categories for the only-what-was-named rule:

1. **The plural that is not a list.** The owner says "pause everything while I am away." That is `all`, so read the live list back, every task whose name starts with Inbox Assistant, including any task an earlier plugin version created under an older name, plus the switch, and get a yes, then do it in the two-step order, then confirm.
2. **The helpful extra.** The owner asks to pause the daily brief. The follow-through cadence leans on the same reading and looks pointless without it. Do not pause it too. Pause what was named, then mention the other one and ask.
3. **The wrong-direction inference.** The owner says "the Thursday one is too much right now." That is a complaint, not an instruction, and it might mean pause, might mean tune. Ask which: pause it, or make it shorter with `/inbox-assistant:tune`.

Update the `## Scheduled tasks` table in `Inbox Assistant State` whenever a state changes, so `/inbox-assistant:status` reads true.

## 4. Deleting is different from pausing

Deleting removes the task and its schedule. Since the task is the only place the cadence is stored, deleting it is the only copy of that cadence gone. Recreating it means going back through `/inbox-assistant:schedule` and deciding the timing again. The context files survive, so a rebuilt task still knows the business, still has its `Last tested` record, and still has whatever actions were turned on.

Confirm deletion separately, and default to pausing when the owner has not clearly said delete.

> **Inbox Assistant: Daily Cleanup** would be removed, not paused. Rebuilding it later means running schedule again, though your settings and business profile stay. Pause it instead?

## 5. Confirm the resulting state

End every run with the full list again, plus the switch, so the owner can see the whole picture rather than trusting one confirmation line.

```
Now:

Safety switch: on. Nothing will write to your mail.

1. Inbox Assistant: Daily Brief          Paused
2. Inbox Assistant: Follow-Through       Paused
3. Inbox Assistant: Daily Cleanup        Paused

Resume any of these whenever you want with `/inbox-assistant:pause`.
```

If an action failed, say which one and what state it is actually in. Never report a change that did not land, and if the tasks paused but the switch write failed, say exactly that, because the two halves protect different things.
