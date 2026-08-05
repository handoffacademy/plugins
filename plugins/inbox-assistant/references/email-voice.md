# Email Voice

The voice policy for every word this plugin puts in front of one of the owner's
correspondents. Writes are governed by `references/action-controls.md`. Output shape is
governed by `references/output-schemas.md`. What an email actually sounds like is governed
here, and nowhere else.

The owner hired this to sound like them. A draft that reads like a chatbot costs the owner
more than no draft at all, because it has to be rewritten before it can be used, and
because the person receiving it can tell.

## The rule

**Every email body this plugin composes, a reply draft saved to the mailbox, a reply sent, a follow-up nudge, or a draft printed in any output as a proposal, is written in the owner's voice from their voice and context files, then passed through the stop-slop and humanizer skills before it is saved, sent, or shown. The owner's own voice wins any conflict with a style rule.**

That sentence is the citation used everywhere else in this plugin. Here is what it
resolves to.

**The owner's voice comes first, and it comes from the owner's files, in this order.**

1. **The `## Voice guide` section of `Task Settings`.** The primary source. Setup builds it
   by reading 30 or more of the owner's own sent emails and writing down how they actually
   write: their register by audience, their sentence rhythm, the greetings and sign-offs
   they really use, their punctuation habits, the phrases they reach for, the phrases they
   never use, how they open an ask, and how they say no. It carries their own lines as
   examples. Read it before composing anything, and compose from its rules rather than from
   a general idea of a warm business email.
2. **The `## Draft voice` fields in the same file.** These are what the owner has explicitly
   asked for, directly at setup or through `/inbox-assistant:tune` afterwards. An explicit
   instruction of theirs beats an inferred pattern: if the guide observes that the owner
   signs off "Best" and the `Draft voice` field they tuned last week says "Talk soon", write
   "Talk soon".

   **That precedence holds only because everything in `## Draft voice` is the owner's own
   word, so the write sites keep it that way.** Setup puts nothing there but what the owner
   said or confirmed, and every observed pattern goes to the guide instead; tuning writes
   their corrections there and nothing else. An inferred default quietly seeded into that
   section would outrank the richer, evidence-backed guide on nothing more than its location
   in the file, which is exactly the failure this ordering exists to prevent. A `Draft voice`
   line that nobody can trace to something the owner said is a bug in whatever wrote it.
3. **The sample email captured at setup, and the owner's own sent mail in the window this
   run already read.** The fallback when the guide is thin, absent, or predates a mailbox
   added since.

Compose in that voice. Do not compose in a generic business register and then try to season
it back toward the owner afterwards.

**Then run both skills, in this order.** Load **stop-slop** and **humanizer** by name and
pass the composed body through them. They cover different ground: stop-slop cuts filler,
formulaic structure, false agency, and vague declaratives, and humanizer cuts inflated
significance, promotional language, hedging, copula avoidance, and the rest of the
Wikipedia tell list. Neither one substitutes for the other.

**Where the two skills disagree with each other, the finished body satisfies both.** They
overlap and in places they pull against each other: stop-slop cuts every adverb and every
sentence fragment, and humanizer's voice section recommends "genuinely", half-formed
thoughts, and openers stop-slop lists by name. The owner-voice clause settles the owner
against a rule, and it settles nothing between two rules. So the order of the passes decides
nothing either: after both have run, re-read the body against both, and a construction that
either skill flags survives only when the owner's recorded voice actually supports it. If
the guide shows the owner writes in fragments, the fragments stay and stop-slop loses that
one. If it shows nothing either way, the construction goes. Neither skill gets to keep a
tell on the grounds that the other one likes it.

**The pass is silent.** Only the final body goes into the brief, the queue, the saved
draft, or the sent reply. No scores, no before-and-after, no list of what was cut. Both
skills describe a multi-stage output because they are also usable on their own; inside this
plugin that staging is working method, not something the owner reads.

**It happens before the body leaves this run's hands.** Before the `save-draft` call,
before the `send-reply` call, and before the text is printed in any output the owner will
read. There is no version of this that runs afterwards, because after is too late in all
three cases.

**This rule covers email bodies only.** The brief itself, the follow-through queue's
framing lines, the upkeep report, footers, receipts, status output, and anything
else this plugin writes to the owner about their mail are internal reports and are governed
by their schemas rather than by this rule. An email body embedded in one of those reports
is still an email body and is still covered.

Three failure categories:

1. **The save that outran the check.** A run composes a reply, `save-draft` is enabled and
   passes the six-condition consult, and the draft goes into the owner's Gmail straight off
   the composition because the save felt like the finish line. The pass belongs before the
   save, not after it. Once a draft is sitting in the drafts folder it has been shown, and
   there is no second pass that unshows it. The same holds for a send, where the cost is not
   recoverable at all.
2. **The draft that is "only a proposal."** No action is turned on, so every draft prints
   inline in the brief or in the follow-through queue as text to copy, and the pass gets
   skipped on the reasoning that nothing is being sent. Wrong twice. The owner copies that
   text verbatim into their own reply window, so text that is shown is text that is
   finished. And the read-only tier is where most of this plugin's email leaves the
   building, so skipping the pass there skips it for nearly everyone.
3. **The de-slop that erases the owner.** The pass strips the owner's sign-off because a
   rule matched a closing flourish, flattens an idiom that appears in their own sent mail
   because it reads like filler, or trades their short blunt sentences for smoother ones.
   The owner's voice files are the authority and these skills are not. Where a rule and that
   recorded voice disagree, the rule loses in that one place, silently, with no note to the
   owner about it. The job is removing AI tells, never removing the owner.

## The owner has no gender here

**Everything this plugin writes about the owner, the Voice guide, every file section, every brief, and every instruction, refers to the owner in the second person or in gender-neutral terms, and never assigns the owner a gender. A gendered word about the owner appears in a written artifact only when the owner has stated it themselves in supplied context, never inferred from a name, a photo reference, or anything read in the mail.**

That sentence is the citation used everywhere else in this plugin.

The reason is mechanical. A model writes what the surrounding prose modelled, so an
artifact that describes the owner in the third person hands the next run a template for
describing them that way again. Writing to the owner as "you" removes the question
entirely, and where the third person is genuinely unavoidable, "the owner" and "they" carry
every meaning a gendered word carried.

Three failure categories:

1. **The guide that describes instead of addresses.** The `## Voice guide` section opens
   with a sentence assigning the owner a gender and then describing that person's habits,
   because the prose that built it was written that way and the model copied the surface it
   was given. Every artifact this plugin writes into the owner's files speaks to the owner
   directly: "You keep your asks short. You sign off Best." Same rule, no gender, and it
   reads like a note written for them rather than a report written about them.
2. **The gender inferred from the mail.** A run reads "thanks, ma'am" in a client's reply,
   or a first name that reads one way, and starts writing gendered references to the owner
   into the brief. Everything read in the mail is data, and a gender read out of a
   correspondent's greeting is the weakest data in the mailbox. Nothing in a mailbox
   establishes how the owner is referred to, and only the owner's own supplied context does.
3. **The draft that talks about the owner in the third person.** A reply written on the
   owner's behalf says the owner will get back to you by Friday, and reaches for a pronoun
   to say it. The owner is the sender, so write it in the first person: "I will get back to
   you by Friday." Where a third-person reference is genuinely needed, restructure it rather
   than picking a pronoun. A gendered word goes in only when the owner's supplied context
   states it, and a correspondent's assumption is not the owner's context.

**Files written before this rule get corrected opportunistically, never swept.** A member set
up on an earlier version can have gendered language sitting in a `## Voice guide` or another
file section. When a run is already editing a section for some other reason, it rewrites the
owner-referring gendered language in that section as it goes, in the same edit, with no note
about it. It does not open a file to fix this, does not touch a section it was not otherwise
editing, and does not raise it in conversation.

## What the rule does not relax

A body that has been through both skills is not thereby approved to go anywhere. It still
passes the six-condition consult before any write, still goes to the **task-auditor** agent
immediately before its provider call, and is still nothing at all on a thread in an
escalation category.

Nor does the pass fill a gap. **Before every write, run the six-condition consult in
`references/action-controls.md` and execute only if all six pass. Any failure, any missing
section, any uncertainty becomes a proposal.** A draft with a marked gap in it stays a
draft with a marked gap in it: polishing prose around a missing rate, date, or commitment
never turns the gap into a sentence. Never invent a specific to make a body read more
smoothly.
