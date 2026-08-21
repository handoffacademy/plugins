# The Hub Strategy document

This is the shape of the deliverable, and it is the only one. Fill every section, in this order, with the member's own words. Nothing here is optional: a section with nothing to say says so in one line rather than being dropped, because a missing section reads as an oversight and an empty one reads as an answer.

Every capability line carries exactly one label. `Verified <date>` when it was checked against current documentation in the session that wrote the line. `Unverified — confirm at office hours` when it was not. Those two are the only capability states, and there is no unlabeled capability line anywhere in the document.

**A capability verified earlier in the same session and then lost is rewritten as the state that is true now.** A connection that dropped, a tool that left the list, an account that changed: the check behind the label is gone, so the label goes with it and the line is rewritten to whatever a check made right now would say — `Unverified — confirm at office hours` where nothing can be checked, or the ruling-out below where it can — with one line saying what changed. **The last pass at the foot of this file asks whether a label is present. This is the one rule that asks whether it is still true**, and a stale `Verified` passes the presence test perfectly while telling the person building from this document exactly the wrong thing.

**A capability checked and found unavailable is neither of those, and it gets no capability line at all.** `Unverified` means nobody looked; a verified negative means somebody looked and the answer was no, and writing one as the other turns a settled fact into an open question that gets re-asked at office hours. What the document records instead is what was chosen in its place — the next rung down, a different source, or the open decision it created — and the sentence that states the ruling-out carries `Verified <date>` like any other checked claim. "Your personal mail is not reachable through the direct connection, checked today — Verified 14 March" is a fact in the plan. There is no line underneath it waiting to be confirmed.

**Some unverified items cannot be settled at office hours, and those carry a resolution note as well as the label.** Whether a work account under somebody else's administration permits a connection is not a documentation question and not an Academy question. On any such line, keep the `Unverified` label and add one line beneath it: `Needs your account administrator — one specific question`, then the exact yes-or-no to put to whoever runs that account, then the fallback version of the project if the answer is no. One question with the fallback already written is the only research this document ever hands back to the member.

**The label is not only for sources and connections.** Skills, plugins, scheduled tasks, writes into your home base, dashboards, and by-hand steps are all capability claims, and each one carries its own label. The test is about meaning, not vocabulary: **any statement about what a product, connector, or tool does, can do, or will do carries a label.** Do not check for a list of verbs — a sentence can make a capability claim without using any particular word, and a claim written in the passive or as a noun phrase ("a daily digest into your hub") is still a claim. Ask of each sentence: is this asserting something about how a product behaves? If yes, it is labeled.

**Plan at the category level, and keep two separate lists straight.** This document describes kinds of things, never their contents.

**Never, with no consent path** — no version of this document carries them, whatever the member offers:
- Account numbers and card numbers
- Passwords, API keys, and any other credential
- Government identifiers

**Only on their explicit, recorded choice** — the default is out, and it is never proposed to them:
- Documents and records themselves, rather than references to them
- Details about a child beyond a first name: school, address, schedule, medical or custody information

**That second list covers the member's own records.** Another adult's records — financial, medical, legal — have no consent path in this document at all and stay at the category level, whoever is offering them and however they came to be held. Where the member administers another adult's affairs under standing authority, what the document carries is the operational metadata that carve permits — a name, a reference, a date, a status from a list the member defined in advance — and never the material underneath it.

First names are fine. Where the member chose something from the second list, the document says they chose it and what for.

**One variant of this document exists, and it is a draft rather than a strategy.** Where the interview rules produced a draft — somebody answered on behalf of a person who was not there, or the sitting was part interview and part proxy — the deliverable keeps this shape exactly and changes four things. All four are canonical, and a draft missing any of them is indistinguishable from a finished plan:

- **The title is `Draft hub proposal — not ready to build`**, in place of the strategy title in the skeleton below.
- **A line under the title names who answered, and which intended members of the hub were not present**, by name.
- **The three sections that make a document somebody's own carry their marker in place of an answer** — everything they carry, the walled gardens, and the never list. `Not established — answered on the member's behalf` where nobody the hub is for was in the room; `Not established — [name] was not present`, written per absent person, where some intended members were present and some were not.
- **The closing line says what would make it a strategy:** each absent member's own sitting, where those three questions are asked of them in their own words. Nothing in the draft is built from until that has happened.

A draft carrying the strategy title is the failure this variant exists to prevent. Every other page of it looks finished, and the person who builds from it has no way to see which of the answers were nobody's.

---

## The skeleton

```text
# [Member's name]'s AI Hub Strategy

[Where this came out of a proxy or a mixed sitting, this title is instead
`Draft hub proposal — not ready to build`, followed by the line naming who answered and
which intended members were not present. The four canonical changes are above.]

Written [date].
Capabilities in this document were checked against current documentation in the
session that wrote it, on [date]. Those labels belong to that session. Re-check
every capability a project depends on at the start of the session you build it in,
however recent the date above looks.

## Your Hub at a Glance

| Project | What it is for | What it reads | Order | State |
|---|---|---|---|---|
| [Project name in their words] | [One line, their words] | [Sources] — Verified [date] / Unverified | Step [1, 2, 3…] | Not built yet |
| [Area they named that is deliberately not designed today] | [Deferred — why, in one line: it needs a decision first, it has no route yet, or it can wait] | — | later | Deferred |
| [Area already served by something that runs] | [Already running — [the existing job or space, one line]. Not redesigned today.] | — | — | Already running — not redesigned |
| [Project from this plan that now exists] | [One line, their words] | [Sources] — Verified [date] / Unverified | Step [the number it has always had] | Built — [date] |
| [Project from this plan they have stopped] | [One line, their words] | — | Step [the number it has always had] | Retired [date] — task stopped |

[Every area they named gets a row, including the ones deliberately left undesigned.
A named area with no row reads as forgotten rather than as decided.]

[**The two right-hand columns do different jobs and never merge.** Order is the step number
a project was given the day it was written into this plan, and it does not change for any
reason afterwards. State is the only column that moves: Not built yet, Built with the date,
Retired with the date and "task stopped". A project that has been built keeps its number
and changes its state; a project that has been stopped does the same; neither row is ever
deleted, because a plan with a gap in it reads as an oversight and a member who wants that
work back needs something to point at. A newly named area takes the next unused number
after the highest one in this table. Deferred rows and already-running rows are untouched
by all of this and keep the entries shown above.]

## Build Order

**Step 1: [exactly one buildable project — OR, only where no project can be built with
what you have today, exactly one named unblocking action plus the first project it
unlocks].**
Why this one first: [daily, boring, low-risk, and buildable this week, in one line — or,
for the unblocking version: what is blocking everything, and what it frees up].
Done means: [what they will be able to point at].

**Step 2: [project].** Start it once step 1 has run on its own for a week and you trust what it gives you.
[Where step 2 is waiting on something — a connection, an answer from whoever runs an
account, a decision on this document's own list — name that one thing here and what it
unblocks, so the wait is visible rather than discovered on the day you sit down to build.]

**Step 3 onward: [projects, in order].**

[Where this document is being amended rather than written fresh, **none of these numbers
move.** A step number is assigned once and kept: a project that has been built keeps its
number and carries Built with the date in the State column, one that has been stopped keeps
its number and carries Retired, and a newly named area takes the next unused number after
the highest one here. What moves is a single pointer line, added at the top of this section:

**Next: Step [N] — [the project].** [Why it is next, and what "done" means for it.]

That line is the only thing that changes, and it names a step number that already exists.
**Never renumber the plan so that the next thing becomes Step 1.** Somebody who built Steps
1 and 2 in March needs to still see them called Steps 1 and 2, or this stops being the
document they have been working through. Whatever Next points at gets the same
buildable-this-week test that Step 1 got the first time.]

Step 1 is deliberately something low-risk, so the early mistakes happen where they cost
an hour rather than a relationship. That is the recommendation, and you can overrule it:
if a different project is the one you actually need first, say so and it goes first, and
this document records that you chose it.

What does not change with the order: every project is built with the same limits and the
same checks whenever it is built. Nothing skips its privacy gates, its permission limits,
or its manual test because it moved up the list.

## Project Plans

### [Project name]

**What it is for.** [One or two sentences, their words.]

**What it reads.**
- [Source] — [connector name], directly in Claude — Verified [date] / Unverified — confirm at office hours
- [Source with no direct connection] — through your Zapier connection[, once it is set up — keep this clause wherever the connection is not in place yet; drop it where Step 0 found the connection in place, whether or not this particular read has been checked] — Verified [date] / Unverified — confirm at office hours
- [Source with no connection of either kind] — watched routine, you at the keyboard, reading and summarizing only, never on a schedule — Verified [date] / Unverified — confirm at office hours

**The Claude Project itself.**

Instructions to paste in when you create it:

> [Written out in full, ready to paste — not a sketch to improve later.
> Role, scope, and what this project never does.
> Then how it should answer YOU: the shape of a reply, the length, what it leads with.
> Then, WHERE THIS PROJECT DRAFTS ANYTHING IN YOUR NAME, how it should sound when it
> writes AS you: register, length, what it opens with, the specific phrases it must
> never use, and what it does when it does not have the facts to draft honestly.
> Where the project writes as you, this part is not optional. It is the difference
> between a draft you edit and a draft you have to proofread for tone.
> Then the refusals this space needs, in your own words.]

**Knowledge to add.** Two questions, in this order, and the second never stands in for
the first.

*First, what it should hold and why.* [For each item: name it, and say in one clause
what it teaches this project about acting in this space — the judgment, the voice, the
vocabulary, or the standard it cannot infer from the sources it reads. Three to five
items is the working range. "Nothing, and here is why" is a legitimate answer and is
written as one.]

*Then the filter.* [NEVER, whatever is decided later: account and card numbers,
passwords, API keys or other credentials, government identifiers.
ONLY where the member explicitly chose it, never proposed to them: the documents and
records themselves, and a child's details beyond a first name. Where they chose one,
name it here and record on one line that they chose it and what for.
That choice covers the member's own records only. Another adult's financial, medical,
or legal records have no consent path here and stay at the category level, and where
the member administers that adult's affairs under standing authority this knowledge
holds the operational metadata that carve permits and never the material underneath.
Default to kinds of material — "invoices", "client agreements", "school newsletters" —
rather than the material itself.]
— Verified [date] / Unverified — confirm at office hours

**Skills.** [Which existing skill to use, or which to create and what it does — and in
one clause, why it is a skill rather than a line in the project instructions. Common
reason: it is a rule that erodes over a long conversation and needs re-asserting every
turn. "None needed, because [reason]" is a legitimate answer.]
— Verified [date] / Unverified — confirm at office hours

**Plugins.** [Which to enable on this project's surface and what each one adds — and
what is deliberately NOT enabled here, and why. In a space that drafts, prepares, or
handles sensitive material, what a project cannot reach is part of its design rather
than an omission: nothing that can send in a drafting space, nothing that can reach a
bank or a browser in a money space, nothing that can write to a shared location in a
private one.]
— Verified [date] / Unverified — confirm at office hours

**How you use this space day to day.**
- What it does without being asked: [the scheduled work, in one line]
- What you ask it: [three to five real questions in your own phrasing]
- What stays manual, permanently: [what you will always do yourself, and why that is
  the design rather than a gap]
- [One line specific to this space: what it needs from you, what it will get wrong at
  first, or the habit it depends on]

[This block restates capabilities that are labeled elsewhere in the same card and
carries no labels of its own. Anything in it that is a new claim gets labeled inline.]

**What runs on a schedule.** [What it should check, how often, and what you want
back.] [Runs in the cloud / runs on your computer — it must be on, awake, and
logged in at run time, because [the local dependency / this is the only place your
setup can run a scheduled task] / run location not established this session —
confirm which locations your surface offers before this task is built.] —
Verified [date] / Unverified — confirm at office hours
> The design engine builds this task properly when you get to it. Ask for it by pasting this line and this project's never-list, in full, and it runs its own interview, re-verifies the exact read, where this task will run, and the reach, control, and cost checks that depend on where it runs, then tests on your real data before anything goes on a schedule. It inherits this project's never-list, which is not optional and is not re-decided in that interview.

**Where its results live in your hub home base.** [Notion by default, or the tool you
chose instead. One of three states, and only one.]
- *The home base not connected:* now, the task's own result inside Claude. After the
  replacement task is built and tested, [the page in your hub].
- *The home base connected and a scheduled run's ability to re-check that destination's
  privacy verified:* [the page in your hub].
- *The home base connected but that per-run check unverified:* now, the task's own
  result. [The page in your hub] is named and gated until the check is made. **Nothing is
  scheduled into a destination whose per-run privacy check nobody has made.**

Moving from the task result to a page is a rebuild, never a switch:

1. Connect [your hub home base — Notion by default].
2. Have the design engine redesign the task, with [the page in your home base] as its destination.
3. Verify the write operation, the page's privacy, and that a scheduled run can perform the per-run privacy check.
4. Run one manual test into the page, then open the page and read it there.
5. Create the replacement task.
6. Retire the task-result version.

The running task never changes destination on its own and is never edited to point somewhere new.
— Verified [date] / Unverified — confirm at office hours

**Sensitivity.** [Why this project is separate, if it is. What it will never do. Their
words, quoted rather than summarized — this list is what the design engine asks them to
paste when a task for this project gets built, so it has to be readable on its own and
recognizable as their own sentence.]

**Open decisions.**
- [The real question] — Option A: [what it means, what it costs]. Option B: [same]. Option C: [same].

## Your Hub Home Base

[Notion unless the member chose otherwise at Q5 — record the choice here in one line, in
their words. Where it is another tool, keep this section's shape and use that tool's
nearest equivalent for each block below: its own way of holding records, and its own way
of showing several projects at once. Where it genuinely has no equivalent, say so in one
line rather than inventing one — a folder of documents cannot roll four projects into a
dashboard, and the plan is better for saying that than for pretending.]

**Starting point.** [Either: start from the Command Center template from the Academy's Mastering Claude Cowork module. Or: extend the workspace you already have, keeping what you use. In another tool, the same two: a fresh area set up from nothing, or the folders and documents you already keep, kept the way you keep them.]

**The top-level layout.** [The home page, and one area page per project, named as the projects are named above.]

**Databases to create.**
- [Name] — [what a row is, in plain words] — columns: [each one, in plain words, with what goes in it]

**Dashboards.**
- [Page name] — [what it shows, and which database each view pulls from] — Verified [date] / Unverified — confirm at office hours

**Where each scheduled task lands.** One destination per task, and no task shares one.
- [Project] → now: [the task result, until the home base is connected and its per-run privacy check is verified] → after the replacement task is built and tested: [the page or database it writes into] — Verified [date] / Unverified — confirm at office hours

**Your morning read until the hub is live.** [While tasks are still landing in their
own results, the one place is your scheduled-task list, read in this order: [task],
then [task]. Name the order rather than leaving several results to be found.]

Two interim tasks is the preferred limit: get the home base connected and its per-run
check cleared before a third goes live, so you are never opening more than two separate
results.

[Where the home base is genuinely unavailable — not connected, or connected without a
run being able to re-check a page's privacy — and your task results are themselves verified
private, a third task and beyond can go ahead once you have agreed to it knowing the
cost. Then this ordered reading list is the standing arrangement rather than a stopgap:
[task], then [task], then [task]. Revisit it if the home base becomes available.]

**How notes get written so Claude can find them again.** [The naming pattern, the properties that are always filled in, and what a good page looks like here.]

**Two things to do by hand.** [Anything the home base's connection cannot set up for you and you will click yourself. Confirm what those are in the session, rather than assuming — check that tool's current documentation for what its connection can and cannot do today; where the home base is Notion, that is Notion's own documentation.] — Verified [date] / Unverified — confirm at office hours

**What does not go in here.** The same two lists as above, applied to page bodies, properties, rows, and titles alike. **Never, whatever you decide:** account and card numbers, credentials, government identifiers. **Only if you deliberately choose it:** documents and records themselves, and details about a child beyond a first name.

**And a rule about where, not what.** Anything to do with custody, a legal matter, medical information, children, or money lives under a private parent only — never under a page anyone else can open. That is judged by what goes in rather than by the name on it: a database called "Records" holding custody rows needs a private parent exactly as much as one called "Custody" does.

## Connections Checklist

Each connection appears once here, however many projects use it.

- [ ] [App] — [what it is for, which projects use it] — Verified [date] / Unverified — confirm at office hours
- [ ] Your Zapier connection — the route to [apps with no direct connection, named], set up once. [Include this line whenever any project above reads through Zapier and that connection is not set up yet, and name the projects that are waiting on it.] — Verified [date] / Unverified — confirm at office hours
- [ ] [The hub home base — Notion by default, or the tool they chose instead] — where every digest and record lands. [Include this line whenever the home base is not connected yet, and name which projects start writing to it once it is.] — Verified [date] / Unverified — confirm at office hours

## What This Hub Will Never Do

[The member's own answer to "what should this never do", verbatim.]

[Where they were asked and named nothing, this section reads `Asked, none given [date]` above
the floor below rather than being left empty. A section nobody filled in and a section nobody
asked about look the same to whoever builds from this plan. That line records the question, and
it is not a refusal for anything downstream to carry forward.]

[Where a scheduled task in this plan would have been blocked by one of those lines and it
was settled in the conversation, the amended sentence goes here — "never touch the case,
except reading subject lines for dates" — and it is **the sentence the member confirmed
when it was drafted and read back to them**, in the wording they ended on, replacing the
original outright. A synthesis they never saw is not their own words and does not belong on
this list. One sentence, never the original refusal and the amended version both: two
readings of the same refusal is one the design engine cannot carry forward, because it
carries this list into every scheduled task word for word.]

And the floor that applies to every project here, whatever else changes:

- Nothing sends, publishes, pays, or deletes on its own. Anything that leaves is something you pressed.
- No passwords or keys go into a chat, ever.
- Legal and medical work gets organized and flagged. The judgment stays with the licensed
  professional, who may be you. Where this is your own practice, the working record is
  yours to keep here — the matter or client, what kind it is, the next date, the status —
  and what stays out is the material itself: the filings, the notes, the correspondence,
  which live in the systems your practice already keeps them in. Your own personal legal
  or medical matter stays walled off exactly as you asked, whatever you are qualified in.
- Financial records come in as statements and exports you download yourself. Never a live connection to an account, and never a browser tool on a bank, card issuer, payment processor, or brokerage — not even watched. Keep full account numbers out of it; the last four identify an account fine.
- Your plan describes kinds of things, not their contents. Account numbers, card numbers, passwords and keys, and government identifiers never go in, whatever anyone decides later. Documents and records themselves, and anything identifying your children beyond a first name, go in only if you deliberately choose it — and this document says so where you did.
- No scheduled task ever changes where it writes on its own. Moving one to your hub means building the new version, testing it once, and retiring the old one.

## Open Decisions — All in One Place

Everything above that is still yours to decide, collected so you can take the list to office hours. Only genuinely unanswered choices go here — anything you have already settled is in the section below and is not waiting on you.

1. [Question] — [options, one line each]
2. [Question] — [options, one line each]

## Choices Already Made — Revisit Only If You Raise Them

Decisions you have already made, written down so nobody asks you again and so a stranger reading this plan understands why it looks the way it does. Nothing here is a question, and nothing here needs an answer at office hours.

- [The recommended home base you turned down, where you did] — [what was recommended, what you chose instead, and what it costs you, one line each]. Yours to revisit whenever you want to.
- [A route you declined] — [what it would have carried, in one line][, and where you turned it down on cost rather than on the route itself: the price and the cadence you declined it at, plus the smaller shape that was offered]. Yours to revisit whenever you want to.
- [Any other refusal you recorded] — [in your words].

## When Things Change

This plan has two halves and they age differently.

**What you decided does not expire — except where you named an ending.** Your projects, your build order, your never list, and your home-base layout are yours, and they keep until you change them. Where an area of yours has a date on it — a sale, a wind-down, a lease or a role ending — its row says when, because that date was part of the decision rather than a note sitting beside it.

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

- **A card is complete when a stranger could build the space from it and the member could use it on the day it exists.** Missing its knowledge reasons, its day-to-day use block, its home-base destination, its sensitivity line, or any label makes it half-designed. **And a card whose only described behavior is the scheduled task is a task with a project wrapped around it, not a space.** A card with no scheduled task at all can be complete; a card that would collapse into nothing without its task is not.
- **A source reached through the member's Zapier connection is its own route and is written as one.** It is not a direct connection and it is not a watched routine: it is the rung between them, and it is the one that can still carry scheduled work. Two states get recorded separately here, and one part of the line carries each. **The clause carries the connection:** Step 0's inventory says whether it is in place, and the route line keeps ", once it is set up" wherever it is not. **The label carries the read:** `Verified` or `Unverified` is the only thing that says whether this particular source has been checked through it. A connection that is in place with a read nobody has checked yet is the short clause plus an unverified label, and that is a normal state rather than a gap. Where any project depends on the connection **and it is not set up yet**, setting it up is its own one-time line on the Connections Checklist, exactly as connecting the home base is — the same condition the checklist entry states. A connection the member already has gets no setup line.
- **A knowledge item with no reason attached is a guess about what the member has lying around, not a setup instruction.** Every item names what it teaches the project about acting in this space, or it comes out.
- **Skills and plugins are decisions, and "none, because…" is one of them.** A named skill with no argument for why it is a skill rather than a line in the instructions is boilerplate. So is a plugin line that only lists additions: in any space that drafts or handles sensitive material, what is deliberately not enabled belongs on the card, because the absence is the safety property.
- **The handoff line to the design engine is fixed, including the never-list clause.** Describe the job the task should do; never write the task text here, or anywhere else in the conversation that produced this document — asking for the prompt "just in the chat" is the same request with the channel changed. The engine runs its own interview, re-verifies the exact read along with the run location and the reach, control, and cost checks that depend on it, and tests on real data. A task specified in this document skips all three — and a refusal that lives only in the project instructions never reaches a scheduled run, which is why the handoff carries the project's never-list forward.
- **Step 1 is one of exactly two shapes, and never a list.** Normally it is one project that can be built this week with what the member has today — sources reachable now, destination available now, nothing in it waiting on an open decision. **Only where no project passes that test** does it become the second shape: one named unblocking action — the single connection, the single question to whoever runs an account — with the first project it unlocks named beside it, so the step still ends in something rather than in waiting. **A member starting from paper gets that shape by a third route: a digitize-first step** — an account to open, a paper calendar to move into it, a folder to scan — which is the unblocking action for that plan and carries the first project it unlocks beside it like any other. Two projects is never Step 1, and neither is an unblocking action with nothing attached to it.
- **An amended document keeps every step number it already had, because the ordinal and the lifecycle state are two different columns.** Order is assigned once and never changes. State is where `Built — [date]` and `Retired [date] — task stopped` go, and a row in either state keeps its number and stays in the table. A newly named area takes the next unused number. **The next thing to build is named as `Next: Step [N]` in the Build Order section, never renumbered to Step 1** — a plan that renumbers itself stops being recognizable to the person who has been working through it, and a finished project is never moved back into the order to make room. Whatever `Next` points at gets the buildable-this-week test exactly as Step 1 got it the first time. Deferred rows are unaffected by any of this.
- **A route they declined is a settled choice, not an open decision, and it has its own section.** Where the member turned down a rung of the connector ladder, or the recommended home base, it goes under *Choices Already Made* in their own words, with one line on what that route would have carried and one on what it costs them. **Where the decline was about cost rather than about the route, the price and the cadence it was declined at go in the line**, because those are the conditions that would make them look at it again, and a refusal recorded without them reads as permanent when it was not. **It never goes in Open Decisions**, because that list is what they take to office hours to answer, and a decision they already made is not a question. Frame it as theirs to revisit rather than as a disagreement kept on the record, and let the document be the only place it is raised again.
- **Open decisions carry real options.** Two or three, each with what it means and what it costs. "It depends on your preference" is not an option, and neither is a recommendation with the alternatives left out.
- **The never list is quoted, not summarized.** The member has to be able to find their own sentence in it.
- **The Hub Home Base section gives every scheduled task somewhere to land**, now and once the home base is connected. Check this by walking the project cards and confirming each destination appears in that section. A task with no home is the most common gap in a first draft.
- **The home base not being connected yet is never a reason to drop it from the plan.** It stays the home base, connecting it goes on the Connections Checklist as its own step, and each task names both destinations in time. What is never done is scheduling a task against a page that does not exist.
- **Never write that a task will move to the home base by itself.** Every second destination in this document is reached by building a replacement task, verifying it, testing it once, and retiring the old one. A member who reads "it will move over" waits for something that is never going to happen.

**The last pass before you hand it over.** Read the finished document once more, asking one question of every sentence: **is this asserting something about what a product, connector, or tool does, can do, or will do?** If yes, it carries a label. Sources, connections, skills, plugins, scheduled tasks, writes into the home base, dashboards, by-hand steps, all of them. Do not scan for particular words — a claim can be made in the passive, as a noun phrase, or in a table cell, and it is still a claim. An unlabeled one reads as verified to the person building from it, and that is how a guess becomes a build.

**This pass checks that a label is present. Whether a label is still true is the rule at the top of this file**, and it is settled before this pass runs: a capability that was verified earlier in the session and then lost is rewritten to the state true now, wherever this session already wrote it down. A stale `Verified` survives this pass untouched, which is exactly why it is not the pass that catches it.
