# Output Schemas

The exact shape of every Inbox Assistant output. Consistency is the point: when the shape is fixed, the owner learns to skim it in seconds, and a correction in one run can be turned into a durable setting rather than a one-off fix.

Read `owner-communication.md` first. Its owner-facing response contract overrides every schema note below. Internal route, action, receipt, and state details never appear in the owner's output.

Section names and order are fixed. Length caps are ceilings, not targets. `Task Settings` may shorten a cap or drop a whole section. Nothing may add a section that is not defined here.

## Shared rules

- Second person. Warm, plain, specific.
- No emoji. No em-dashes. No demographic assumptions about the reader.
- Never use: elevate, seamless, unleash, streamline, leverage, robust, delve, navigate the landscape, in today's fast-paced world.
- Every item names the person and the thread so the owner can find it. "Rowan, Thursday, re: the March invoice" beats "a client emailed about billing."
- Empty sections are stated, not padded. Write "Nothing today." and move on.
- No technical footer. Show a plain outcome sentence only when the mailbox changed, the run is incomplete, or the owner must act.
- Never invent a date, amount, name, or commitment. If a detail is missing from the source, say it is missing.

### Outcome sentence

If the mailbox changed, say what the owner can observe in plain language: `Saved 3 drafts. Nothing was sent.` If nothing changed, add no sentence unless the owner needs reassurance before approving a proposed change. If a result is unknown, name the affected message and tell the owner where to check. Never show action IDs, route names, receipts, internal status, or control decisions.

## 1. Daily brief (daily-inbox)

Skimmable in under three minutes. That is roughly 400 to 600 words total.

```
# Your brief for [weekday, date]
[One sentence on the shape of the day. What it hinges on.]

## Needs you today
[Max 5. Ranked by consequence, not by time received.]
- **[Person, subject]** [One line on what they want and what happens if it waits.]
  What I would do: [one line]

## Drafted for your review
[Max 5. Each one is a real, finished draft, not a sketch.]
- **[Person, subject]** [One line on what the draft says.]
  Where: [saved as a Gmail draft / below in this brief]

## FYI
[Max 6 lines. One line each. Things the owner should know, no action.]

## Safe to ignore
[One line with a count and the categories. Never a list of individual items.]

[Only when needed: one plain outcome sentence.]
```

Ranking for "Needs you today": a VIP asking a direct question outranks a deadline the owner already knows about, which outranks a scheduling request, which outranks a general update. Escalated threads (legal, financial, personnel, emotionally charged) always sit at the top of the section, flagged, with no draft.

## 2. Follow-through queue (follow-through)

Maximum 10 items, ranked. Nothing below the tenth item is shown, but the run states how many were cut.

```
# Follow-through, [date]
[One sentence: how many things are open and where the pressure is.]

## You owe them
- **[Person] | [what you owe] | quiet [N] days**
  Recommendation: [Reply / Close / Delegate] because [half a line].
  Draft: [the actual text, or where the draft is saved]

## They owe you
- **[Person] | [what you are waiting on] | quiet [N] days**
  Recommendation: [Nudge / Let it go / Delegate] because [half a line].
  Draft: [the actual text, or where the draft is saved]

[N] items shown of [M] found. Covered [window].
[Only when needed: one plain outcome sentence.]
```

Ranking across both directions, most consequential first: money at stake, then a VIP waiting, then a commitment you made with a date attached, then age. Age alone never lifts an item into the top three.

Every item carries exactly one recommendation verb, and every verb but one carries a ready draft: "Let it go" is the exception and carries its half-line reason in place of a draft. A flagged legal, financial, personnel, or emotionally charged item also appears with a summary and no draft.

The verb vocabulary is closed and direction-aware. "You owe them" takes Reply, Close, or Delegate. "They owe you" takes Nudge, Let it go, or Delegate. Never use "escalate" here: in this plugin that word is reserved for a legal, financial, personnel, or emotionally charged matter flagged for the owner, and reusing it for "chase harder" makes those two look alike in the same queue.

## 3. Inbox organization review (inbox-organization)

The audit is read-only. Evaluate Minimal inbox, Client operations, and Aggressive cleanup internally. Show exactly one recommendation. Show alternatives only if the owner asks.

```
# Inbox organization review, [date]

## What is in the way
- Coverage: [mailboxes, dates, message count, and any provider limit]
- Inbox shape: [volume, age, and concentration]
- Recurring senders: [count and useful categories]
- Open loops: [awaiting the owner / awaiting someone else]
- Existing structure: [Gmail labels or Outlook categories and folders]

## Recommended: [Minimal inbox | Client operations | Aggressive cleanup]
Why this fits: [evidence from the real inbox]
Would change: [provider-aware description]
Approximate items: [count]
Reversibility: [one line]
Estimated Zapier use: [successful calls] calls, [tasks] tasks at the current documented rate

## Kept separate
Delete candidates: [count and categories only; no targets are deleted or mixed into archive]

Nothing changed in your mailbox.
Next: Preview this plan | Not now
```

The recommendation proposes operations. It does not authorize them. Gmail output says labels and archive. Outlook output says categories and folders. Keep action IDs and tool names internal until preview or until the owner asks for technical detail. A plan that needs no visible provider capability says so rather than promising it.

## 4. Inbox upkeep run (inbox-upkeep)

Short by design. The owner reads it to confirm that nothing surprising happened, so anything past half a screen means a rule is doing too much.

```
# Inbox upkeep, [date]

## Rules applied
- **[the rule, quoted as it reads in Task Settings]** [N] items

## Skipped
- **[the rule]** [why: cap reached / not turned on / auditor denied / malformed rule]

## Proposals
- [What a rule could not justify, with the count and the exact targets you need.]
- [Candidate rules, phrased as rules, for you to add through /inbox-assistant:organize.]

## Coverage
[Mailbox] through [route], [window]

Nothing outside your standing rules was touched.
```

Every rule in `## Upkeep rules` appears exactly once, under Rules applied or under Skipped, including a rule that matched nothing today: a rule quietly missing from the report reads as a rule that ran. Skipped names the reason in the owner's terms, not the condition ID. Proposals carry counts and targets, because a proposal the owner cannot act on is a line of noise. Coverage is one line per mailbox and stays honest about a window that ended early.

The closing line is fixed and it is the point of the whole report. Write it whether or not anything applied.

## Corrections capture

When the owner corrects an output during a test or a live run, capture it in this shape before doing anything else with it, then hand it to the task-tuner skill.

```
Skill: [which one]
Section: [which section]
What the owner said: [their words, verbatim]
What it means concretely: [the rule, stated as a rule]
Setting it changes: [file and field]
```
