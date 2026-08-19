---
name: stop-slop
description: Strips the predictable tells of AI writing out of prose, covering filler phrases, formulaic structures, passive voice, false agency, vague declaratives, and em dashes. Use on every email body this plugin composes, before that body is saved to the mailbox, sent, or printed in any output, and pair it with the humanizer skill. The rule that requires it is in references/email-voice.md.
metadata:
  version: 3.3.0
---

# Stop Slop

Eliminate predictable AI writing patterns from prose.

## Core Rules

1. **Cut filler phrases.** Remove throat-clearing openers, emphasis crutches, and all adverbs. See [references/phrases.md](references/phrases.md).

2. **Break formulaic structures.** Avoid binary contrasts, negative listings, dramatic fragmentation, rhetorical setups, false agency. See [references/structures.md](references/structures.md).

3. **Use active voice.** Every sentence needs a human subject doing something. No passive constructions. No inanimate objects performing human actions ("the complaint becomes a fix").

4. **Be specific.** No vague declaratives ("The reasons are structural"). Name the specific thing. No lazy extremes ("every," "always," "never") doing vague work.

5. **Put the reader in the room.** No narrator-from-a-distance voice. "You" beats "People." Specifics beat abstractions.

6. **Vary rhythm.** Mix sentence lengths. Two items beat three. End paragraphs differently. No em dashes.

7. **Trust readers.** State facts directly. Skip softening, justification, hand-holding.

8. **Cut quotables.** If it sounds like a pull-quote, rewrite it.

## Quick Checks

Before delivering prose:

- Any adverbs? Kill them.
- Any passive voice? Find the actor, make them the subject.
- Inanimate thing doing a human verb ("the decision emerges")? Name the person.
- Sentence starts with a Wh- word? Restructure it.
- Any "here's what/this/that" throat-clearing? Cut to the point.
- Any "not X, it's Y" contrasts? State Y directly.
- Three consecutive sentences match length? Break one.
- Paragraph ends with punchy one-liner? Vary it.
- Em-dash anywhere? Remove it.
- Vague declarative ("The implications are significant")? Name the specific implication.
- Narrator-from-a-distance ("Nobody designed this")? Put the reader in the scene.
- Meta-joiners ("The rest of this essay...")? Delete. Let the essay move.

## Scoring

Rate 1-10 on each dimension:

| Dimension | Question |
|-----------|----------|
| Directness | Statements or announcements? |
| Rhythm | Varied or metronomic? |
| Trust | Respects reader intelligence? |
| Authenticity | Sounds human? |
| Density | Anything cuttable? |

Below 35/50: revise.

## Examples

See [references/examples.md](references/examples.md) for before/after transformations.

## Source

Vendored from **stop-slop** by Hardik Pandya (https://hvpandya.com), MIT licensed. The
full licence text sits beside this file in `LICENSE`. Everything above this section is
upstream's wording; this section and the `## In this plugin` section below it are not.

Re-vendoring means replacing `SKILL.md` and `references/` from that source and then
restoring all three local pieces: this plugin's frontmatter, this `## Source` section, and
the `## In this plugin` section below. Dropping that last one is the quiet failure, because
the file still looks complete without it while owner-voice precedence and the
silent-pass rule are gone.

## In this plugin

The owner's recorded voice outranks every rule above. It is the `## Voice guide` section of
the owner's `Task Settings` first, which is the primary account of how they write; then the
`## Draft voice` fields, which hold what the owner said themselves and beat the guide
wherever the two disagree; then the setup sample email and the owner's own sent mail, which
apply when the guide is thin, absent, or silent on the case. Where a rule here would strip a
greeting, a sign-off, an idiom, or a rhythm one of those actually shows, the rule loses in
that one place. This skill removes AI tells, never the owner's voice. See
`references/email-voice.md`.

The pass itself is silent. Only the finished email body reaches the output: no scores, no
before-and-after, no list of what was cut, unless the owner asked for the critique.
