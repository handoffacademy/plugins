# Changelog

## 1.2.0

- **Tasks already running are untouched.** Nothing in this release reaches a Scheduled Task you have already created. It changes what gets built next. If you want the newer task text, build a new task from the recipe and retire the old one, which is how any change to a running task is made here.
- Every recipe now hands you the same fixed block of safety rules inside the task it writes, word for word. One rule is genuinely new in the pasted task: it now states in the task itself that nothing it does may touch charging, refunding, invoicing, purchasing, or anything connected to banking or payments. That was always the rule; now it travels with the task. Everything else restates limits the recipe already worked under — read-only sources, one private report, nothing sent, nothing archived, every item cited from your own app, everything skipped listed with a reason.
- Inbox Automation was rebuilt to that shape. The task it produces now states your mailbox, your destination, your item budget, your sections, your schedule, your timezone, and the rules you gave it about what counts and what to ignore, together in one place, with the fixed rules underneath. Same digest, same ten-item limit, same seven-day window.
- One wording clarification to fixed guardrail 15, the failure rule every automation designed here runs under: it now says that a failed **required** source stops the run, and that a read the design named as optional may fail without stopping it, with the failure reported and the declared fallback applied rather than a silent one. That is what the inbox recipe already did when sent mail could not be read, reviewed and approved when it shipped; the guardrail now says so in as many words. No behavior changes, in a running task or a new one. The convention treats an engine change as a major release; that is deliberately not applied here, because the semantics are unchanged and this is a clarification reviewed in the same cycle as the rest of this release.
- The ten-item limit is the number that never moves. The 4/4/2 split is a reservation rather than a wall: a quiet follow-up morning lends its unused room to triage, and the run tells you when it did.
- Inbox Automation also names the connections it needs, and asks you to set them to Always available before it goes on a schedule, because a run that happens while you are asleep should never have to pick a connector for itself. Its test list grew as well: the budget arithmetic, an empty section, a missing connection, a sensitive thread, and a source that could not be read are all checked on your real mail before anything gets scheduled.
- Recipes are now listed in one registry that records what each one reads, where it writes, its limits, and the phrases that invoke it. If a future recipe claims a phrase this one already answers to, the build stops before it ships.

## 1.1.0

- The first recipe: **Inbox Automation**. Ask for it and Automation Builder builds one weekday-morning digest of who needs you today, who is still waiting on a reply in either direction with a draft for each one that is safe to draft, and what looks safe to clear. It reads and prepares. It never sends, archives, labels, or deletes.
- Anything legal, financial, personnel, or upset arrives flagged with no draft attached. Those are the threads that need you, not a head start written by something that was not in the room.
- The design still belongs to you. The recipe fixes the shape, then asks about your mailbox, which messages count as needing you, how long is too long to wait, how you like to sound in a reply, and where the digest should land.
- The same safety floor as everything else here: ten threads a run, a seven-day window, every item cited from your mail app itself, everything skipped listed with its reason, and one manual test on your real mail before anything goes on a schedule.
- Growing it later follows a fixed ladder that ends where it should. A bigger batch, then a second source, then drafts saved in your mailbox, then one label on the items you approved. Archiving is not on the ladder at all: if you ever want it, it comes later as its own separate change with its own testing. Sending on your behalf is never on it.

## 1.0.1

- The connection check now reports back quietly during a design session instead of interrupting with its own questions.

## 1.0.0

The automation design work from the Academy, as a plugin you install once.

- Automation Builder asks what tools you use and what outcome you want, checks what those tools can really do against their current documentation, and designs one automation around your process.
- Version one reads bounded information, prepares a private review only you see, and stops. Nothing goes on a schedule until one manual test run comes back clean on your real data.
- After three clean supervised runs it can take on one more permission at a time, in a fixed order that widens reading first — a bigger batch, then a second source — before the first write into a working tool, a private unsent draft. Each step sits behind your own approval settings.
- Two helper skills come along: one that reports which connected apps it can actually use, and one that works out Zapier limits and cost from Zapier's current documentation instead of memory.
- Works in Claude and Cowork, and in ChatGPT and Codex. Where a product cannot schedule recurring work or cannot enforce approval before an action, it says so plainly and hands you the finished task instead.
- If you added Automation Architect to Claude as an uploaded file, remove that copy before installing this one.
