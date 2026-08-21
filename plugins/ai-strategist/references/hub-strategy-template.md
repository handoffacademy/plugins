# The Hub Strategy document

This is the shape of the deliverable, and it is the only one. Fill every section, in this order, with the member's own words. Nothing here is optional: a section with nothing to say says so in one line rather than being dropped, because a missing section reads as an oversight and an empty one reads as an answer.

Every capability line carries exactly one label. `Verified <date>` when it was checked against current documentation in the session that wrote the line. `Unverified — confirm at office hours` when it was not. There is no unlabeled capability line anywhere in the document.

---

## The skeleton

```text
# [Member's name]'s AI Hub Strategy

Written [date].
Capabilities in this document were checked against current documentation on [date].
Re-check anything dated before today before you build from it.

## Your Hub at a Glance

| Project | What it is for | What it reads | Build order |
|---|---|---|---|
| [Project name in their words] | [One line, their words] | [Sources] | [1, 2, 3, or "later"] |

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

Knowledge to add: [the documents, records, or notes that belong in this project and nowhere else.]

**Skills.** [Which existing skill to use, or which one to create and what it should do.]

**Plugins.** [Which to enable in this project's surface, and what each one adds.]

**What runs on a schedule.** [What it should check, how often, and what you want back.]
> The design engine builds this task properly when you get to it. Ask for it by describing the job in this line, and it runs its own interview, verifies the read, and tests on your real data before anything goes on a schedule.

**Where its results live in Notion.** [The exact page or database in your Notion hub that this project writes into, named the way it appears there.]

**Sensitivity.** [Why this project is separate, if it is. What it will never do. Their words.]

**Open decisions.**
- [The real question] — Option A: [what it means, what it costs]. Option B: [same]. Option C: [same].

## Your Notion Hub

**Starting point.** [Either: start from the Command Center template from the Academy's Mastering Claude Cowork module. Or: extend the workspace you already have, keeping what you use.]

**The top-level layout.** [The home page, and one area page per project, named as the projects are named above.]

**Databases to create.**
- [Name] — [what a row is, in plain words] — columns: [each one, in plain words, with what goes in it]

**Dashboards.** [Which page shows what, and where each view pulls from.]

**Where each scheduled task lands.** One destination per task, and no task shares one.
- [Project] → [the page or database it writes into]

**How notes get written so Claude can find them again.** [The naming pattern, the properties that are always filled in, and what a good page looks like here.]

**Two things to do by hand.** [Anything the Notion connection cannot set up for you and you will click yourself. Confirm what those are in the session, rather than assuming — check the current Notion documentation for what the connection can and cannot do today.]

## Connections Checklist

Each connection appears once here, however many projects use it.

- [ ] [App] — [what it is for, which projects use it] — Verified [date] / Unverified — confirm at office hours
- [ ] [App] — [same]

## What This Hub Will Never Do

[The member's own answer to "what should this never do", verbatim.]

And the floor that applies to every project here, whatever else changes:

- Nothing sends, publishes, pays, or deletes on its own. Anything that leaves is something you pressed.
- No passwords or keys go into a chat, ever.
- Legal and medical work gets organized and flagged. The judgment stays with your professional.
- Anything to do with money prefers a statement you exported yourself over a live connection to an account.

## Open Decisions — All in One Place

Everything above that is yours to decide, collected so you can take the list to office hours.

1. [Question] — [options, one line each]
2. [Question] — [options, one line each]

## When Things Change

This plan has two halves and they age differently.

**What you decided does not expire.** Your projects, your build order, your never list, and your Notion layout are yours, and they keep until you change them.

**Every capability in this document expires.** Claude changes constantly. A `Verified` label is a record of one check on one day, not a standing fact. **Before you build any project in this document, re-verify every capability that project depends on. Full stop, however recent the date on it looks.** Ask for the check by name at the start of the session: what the connector reads today, what a project holds today, what a scheduled task can reach today. That takes a minute and it is the difference between building on a fact and building on a memory.

Come back through this document once a week while you are building it. Cross off what is done, move anything that turned out to be in the wrong order, and bring what did not work to office hours.
```

---

## Rules for filling it in

- **Every project card is complete or it is not on the page.** A card missing its Notion destination, its sensitivity line, or its labels is a half-designed project, and a half-designed project is what gets built wrong.
- **The handoff line to the design engine is fixed.** Describe the job the task should do; never write the task text here. The engine runs its own interview, verifies the exact read, and tests on real data. A task specified in this document skips all three.
- **Open decisions carry real options.** Two or three, each with what it means and what it costs. "It depends on your preference" is not an option, and neither is a recommendation with the alternatives left out.
- **The never list is quoted, not summarized.** The member has to be able to find their own sentence in it.
- **The Notion Hub section gives every scheduled task somewhere to land.** Check this last, by walking the project cards and confirming each destination appears in the Notion section. A task with no home is the most common gap in a first draft.
