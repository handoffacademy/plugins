# The Hub Strategy document

This is the shape of the deliverable, and it is the only one. Fill every section, in this order, with the member's own words. Nothing here is optional: a section with nothing to say says so in one line rather than being dropped, because a missing section reads as an oversight and an empty one reads as an answer.

Every capability line carries exactly one label. `Verified <date>` when it was checked against current documentation in the session that wrote the line. `Unverified — confirm at office hours` when it was not. There is no unlabeled capability line anywhere in the document.

**The label is not only for sources and connections.** Skills, plugins, scheduled tasks, Notion writes, dashboards, and by-hand steps are all capability claims, and each one carries its own label. The test is about meaning, not vocabulary: **any statement about what a product, connector, or tool does, can do, or will do carries a label.** Do not check for a list of verbs — a sentence can make a capability claim without using any particular word, and a claim written in the passive or as a noun phrase ("a daily digest into your hub") is still a claim. Ask of each sentence: is this asserting something about how a product behaves? If yes, it is labeled.

**Plan at the category level, and keep two separate lists straight.** This document describes kinds of things, never their contents.

**Never, with no consent path** — no version of this document carries them, whatever the member offers:
- Account numbers and card numbers
- Passwords, API keys, and any other credential
- Government identifiers

**Only on their explicit, recorded choice** — the default is out, and it is never proposed to them:
- Documents and records themselves, rather than references to them
- Details about a child beyond a first name: school, address, schedule, medical or custody information

First names are fine. Where the member chose something from the second list, the document says they chose it and what for.

---

## The skeleton

```text
# [Member's name]'s AI Hub Strategy

Written [date].
Capabilities in this document were checked against current documentation in the
session that wrote it, on [date]. Those labels belong to that session. Re-check
every capability a project depends on at the start of the session you build it in,
however recent the date above looks.

## Your Hub at a Glance

| Project | What it is for | What it reads | Build order |
|---|---|---|---|
| [Project name in their words] | [One line, their words] | [Sources] — Verified [date] / Unverified | [1, 2, 3, or "later"] |

## Build Order

**Step 1: [exactly one project].**
Why this one first: [daily, boring, low-risk, in one line].
Done means: [what they will be able to point at].

**Step 2: [project].** Start it once step 1 has run on its own for a week and you trust what it gives you.

**Step 3 onward: [projects, in order].**

Nothing sensitive is in step 1, on purpose. Sensitive projects come after you know how the pieces behave.

## Project Plans

### [Project name]

**What it is for.** [One or two sentences, their words.]

**What it reads.**
- [Source] — [connector name] — Verified [date] / Unverified — confirm at office hours
- [Source with no connector] — watched routine, you at the keyboard, reading and summarizing only, never on a schedule — Verified [date] / Unverified — confirm at office hours

**The Claude Project itself.**

Instructions to paste in when you create it:

> [Starter instructions, written out in full, ready to paste. Role, scope, what it never does, how it should answer.]

Knowledge to add: [Kinds of material by default — "invoices", "client agreements",
"school newsletters" — rather than the material itself.
NEVER, whatever is decided later: account and card numbers, passwords, API keys or
other credentials, government identifiers.
ONLY where the member explicitly chose it, never proposed to them: the documents and
records themselves, and a child's details beyond a first name. Where they chose one,
name it here and record on one line that they chose it and what for.]
— Verified [date] / Unverified — confirm at office hours

**Skills.** [Which existing skill to use, or which one to create and what it should
do.] — Verified [date] / Unverified — confirm at office hours

**Plugins.** [Which to enable on this project's surface, and what each one adds.]
— Verified [date] / Unverified — confirm at office hours

**What runs on a schedule.** [What it should check, how often, and what you want
back.] — Verified [date] / Unverified — confirm at office hours
> The design engine builds this task properly when you get to it. Ask for it by describing the job in this line, and it runs its own interview, verifies the read, and tests on your real data before anything goes on a schedule.

**Where its results live in Notion.**
Now: [the task's own result inside Claude, where Notion is not connected yet — or
the Notion page, where it is].
After Notion is connected: [the exact page or database in your Notion hub that this
project will write into, named the way it appears there]. Getting there is a rebuild,
not a switch: connect Notion, have the design engine build the replacement task
pointed at that page, verify the write and that the page is private, run one manual
test into it, then retire the task-result version. The running task never changes
destination on its own and is never edited to point somewhere new.
— Verified [date] / Unverified — confirm at office hours

[Where both lines are the same because Notion is already connected, say so in one
line rather than repeating it.]

**Sensitivity.** [Why this project is separate, if it is. What it will never do. Their words.]

**Open decisions.**
- [The real question] — Option A: [what it means, what it costs]. Option B: [same]. Option C: [same].

## Your Notion Hub

**Starting point.** [Either: start from the Command Center template from the Academy's Mastering Claude Cowork module. Or: extend the workspace you already have, keeping what you use.]

**The top-level layout.** [The home page, and one area page per project, named as the projects are named above.]

**Databases to create.**
- [Name] — [what a row is, in plain words] — columns: [each one, in plain words, with what goes in it]

**Dashboards.**
- [Page name] — [what it shows, and which database each view pulls from] — Verified [date] / Unverified — confirm at office hours

**Where each scheduled task lands.** One destination per task, and no task shares one.
- [Project] → now: [the task result, until Notion is connected] → after the replacement task is built and tested: [the page or database it writes into] — Verified [date] / Unverified — confirm at office hours

**How notes get written so Claude can find them again.** [The naming pattern, the properties that are always filled in, and what a good page looks like here.]

**Two things to do by hand.** [Anything the Notion connection cannot set up for you and you will click yourself. Confirm what those are in the session, rather than assuming — check the current Notion documentation for what the connection can and cannot do today.] — Verified [date] / Unverified — confirm at office hours

**What does not go in here.** The same two lists as above, applied to page bodies, properties, rows, and titles alike. **Never, whatever you decide:** account and card numbers, credentials, government identifiers. **Only if you deliberately choose it:** documents and records themselves, and details about a child beyond a first name.

**And a rule about where, not what.** Anything to do with custody, a legal matter, medical information, children, or money lives under a private parent only — never under a page anyone else can open. That is judged by what goes in rather than by the name on it: a database called "Records" holding custody rows needs a private parent exactly as much as one called "Custody" does.

## Connections Checklist

Each connection appears once here, however many projects use it.

- [ ] [App] — [what it is for, which projects use it] — Verified [date] / Unverified — confirm at office hours
- [ ] Notion — the hub's home base, where every digest, record, and dashboard lands. [Include this line whenever Notion is not connected yet, and name which projects start writing to it once it is.] — Verified [date] / Unverified — confirm at office hours

## What This Hub Will Never Do

[The member's own answer to "what should this never do", verbatim.]

And the floor that applies to every project here, whatever else changes:

- Nothing sends, publishes, pays, or deletes on its own. Anything that leaves is something you pressed.
- No passwords or keys go into a chat, ever.
- Legal and medical work gets organized and flagged. The judgment stays with your professional.
- Financial records come in as statements and exports you download yourself. Never a live connection to an account, and never a browser tool on a bank, card issuer, payment processor, or brokerage — not even watched. Keep full account numbers out of it; the last four identify an account fine.
- Your plan describes kinds of things, not their contents. Account numbers, card numbers, passwords and keys, and government identifiers never go in, whatever anyone decides later. Documents and records themselves, and anything identifying your children beyond a first name, go in only if you deliberately choose it — and this document says so where you did.
- No scheduled task ever changes where it writes on its own. Moving one to your hub means building the new version, testing it once, and retiring the old one.

## Open Decisions — All in One Place

Everything above that is yours to decide, collected so you can take the list to office hours.

1. [Question] — [options, one line each]
2. [Question] — [options, one line each]

## When Things Change

This plan has two halves and they age differently.

**What you decided does not expire.** Your projects, your build order, your never list, and your Notion layout are yours, and they keep until you change them.

**Every capability in this document expires the moment its session ends.** Claude changes constantly. A `Verified` label is a record of one check inside one conversation, not a standing fact, and it does not carry into the next conversation even if that one starts an hour later. **Before you build any project in this document, re-verify every capability that project depends on. Full stop, however recent the date on it looks.** Ask for the check by name at the start of the session: what the connector reads today, what a project holds today, what a scheduled task can reach today. That takes a minute and it is the difference between building on a fact and building on a memory.

Ask for the same re-check whenever any of these happens, because each one can move what is true underneath you:

- You picked this conversation back up after a break.
- You switched to a different Claude surface, workspace, or account.
- You connected, disconnected, or reconnected something.
- Claude or a plugin updated.
- You moved from reading this plan to building from it.

And every time something is about to be written into a page in your hub, its privacy gets checked again first. Sharing can change between one write and the next.

Come back through this document once a week while you are building it. Cross off what is done, move anything that turned out to be in the wrong order, and bring what did not work to office hours.
```

---

## Rules for filling it in

- **Every project card is complete or it is not on the page.** A card missing its Notion destination, its sensitivity line, or its labels is a half-designed project, and a half-designed project is what gets built wrong.
- **The handoff line to the design engine is fixed.** Describe the job the task should do; never write the task text here. The engine runs its own interview, verifies the exact read, and tests on real data. A task specified in this document skips all three.
- **Open decisions carry real options.** Two or three, each with what it means and what it costs. "It depends on your preference" is not an option, and neither is a recommendation with the alternatives left out.
- **The never list is quoted, not summarized.** The member has to be able to find their own sentence in it.
- **The Notion Hub section gives every scheduled task somewhere to land**, now and once Notion is connected. Check this by walking the project cards and confirming each destination appears in the Notion section. A task with no home is the most common gap in a first draft.
- **Notion not being connected yet is never a reason to drop it from the plan.** It stays the home base, connecting it goes on the Connections Checklist as its own step, and each task names both destinations in time. What is never done is scheduling a task against a page that does not exist.
- **Never write that a task will move to Notion by itself.** Every second destination in this document is reached by building a replacement task, verifying it, testing it once, and retiring the old one. A member who reads "it will move over" waits for something that is never going to happen.

**The last pass before you hand it over.** Read the finished document once more, asking one question of every sentence: **is this asserting something about what a product, connector, or tool does, can do, or will do?** If yes, it carries a label. Sources, connections, skills, plugins, scheduled tasks, Notion writes, dashboards, by-hand steps, all of them. Do not scan for particular words — a claim can be made in the passive, as a noun phrase, or in a table cell, and it is still a claim. An unlabeled one reads as verified to the person building from it, and that is how a guess becomes a build.
