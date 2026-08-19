# Authoring a recipe for Automation Builder

A recipe is a pre-designed automation that ships as a skill inside the
`automation-builder` plugin, named `recipe-<outcome>`. It is a versioned
compiler: it collects a small set of member-specific parameters through the
interview and produces one complete Scheduled Task. The pasted task text is the
runtime artifact — it starts in a fresh session, so it must carry every rule it
runs under. Plugin updates improve future builds; they never alter a task that
is already running.

`recipe-inbox-automation` is the reference for the shapes this document
generalizes: the one-task/one-report structure, the budget mechanics, the
destination flow, and the graduation mapping all follow it. That recipe was
reconciled against this whole document at its 1.1.0 revision — the connector-tier
declaration, the Always-available instruction, the expanded acceptance tests, the
structured task contract, and the canonical runtime-safety block all landed
there. New recipes must satisfy all of it from their first release. Where this
document and a shipped recipe disagree on a shape they both define, fix one of
them — never ship a second divergent interpretation.

## The registry

Every recipe has an entry in `plugins/automation-builder/recipes.json`, and the
validator reconciles that registry against the `skills/recipe-*` directories in
both directions — an unregistered recipe directory and an orphaned registry
entry both fail the build. The entry declares: id, skill path, display name,
invocation aliases, recipe version (must match the SKILL.md frontmatter),
engine-contract version (a recorded hash over the guarded engine blocks plus
the canonical runtime-safety block — a silent edit to either fails the build),
status with `supersedes`/`supersededBy`, connector tier, risk declarations,
source count, destination options, lookback, the global cap, the reviewed
maximum that cap graduates to, the full verbatim text of step one of the
graduation mapping, the number of ladder steps that mapping ends at, the
section reservations, the exact phrase each section is
rendered by, citation policy, and the portal module slug. The registry is the source of truth the
structural checks validate against; adding a recipe means adding its entry, not
editing a list inside the validator.

## Hard boundaries

These come from the engine (`automation-architect`) and are not per-recipe
decisions:

1. Version one reads bounded information, writes one private report, and stops.
2. Outbound and record-changing actions (send, publish, message, invite, book,
   reschedule, move, archive, delete, CRM change) are never version-one
   behaviors. The fixed graduation ladder's own four steps are the only path
   that ever widens a task, and client-facing sending is never on it.
3. Money is permanently out — charging, refunding, invoicing, purchasing, and
   payment-system writes. Guardrail 4 also excludes reading systems connected
   to banking or payments; a design that needs one is an engine change with its
   own adversarial review, not a recipe.
4. The five guarded engine blocks are copied byte-identically from
   `automation-architect/SKILL.md` and validated. Never paraphrase them, and
   never insert recipe content inside one.
5. No credentials, ever. Custom connectors mean the platform's own remote-MCP
   flow with OAuth, never a pasted key.

## Recipe, skill, or lesson?

Route the idea before designing it:

- **Recipe** — clock-based recurrence creates the value, the source can be read
  within the fixed bounds (5–10 items, and either a horizon of at most 7 days or
  a declared current-state read with no history window), and one private review
  is useful without changing the source.
- **Skill** — an on-demand capability needing fresh judgment or an explicit
  approval moment each time (proposal drafting, video editing, image
  generation). Skills may prepare drafts; they are not unattended recurring
  tasks.
- **Lesson** — a one-time setup with no recurring runtime artifact (connector
  setup, destination grants). A recipe may name a lesson as a prerequisite.

## Risk declarations

A recipe declares its position on each of these axes separately. They are
independent declarations, not a single severity scale — a recipe can combine
them (the inbox recipe composes drafts inside the review *and* offers a
second-system destination).

- **Source access** — always read-only in version one. Declare the one logical
  source and its bounds.
- **Output content** — review-only findings, or drafts composed inside the
  private review. Drafts exist only in the report; they cannot invent facts,
  dates, scope, or commitments; sensitive items are flagged with no draft
  attached.
- **Destination write** — the task result alone, or additionally one
  second-system private destination (for example a Notion page). This is the
  one narrow version-one write the engine allows, with the fail-closed rules
  below.
- **Graduated working-tool write** — reachable only through the fixed ladder:
  an unsent mailbox draft at step three, one low-risk internal status update at
  step four. No other working-tool write is a permitted substitution at any
  step; a scheduled design that needs one is an engine change or a skill.
- **Outbound action** — always rejected. Redesign into a private review or the
  idea is not a recipe. (The fixed ladder's step-four internal status update is
  not an outbound action; it stays inside the member's own tool, on records the
  member approved.)
- **Payment contact** — always rejected, including read access to
  payment-connected systems.

## Connector tiers

- **Tier A (core)** — the recipe requires no connector or only one-click
  directory connectors. Some directory connectors carry account, plan,
  administrator, or grant-scope prerequisites; a recipe that depends on one
  must surface those prerequisites prominently as a conditional path, verified
  live during the readiness check — never assumed from a directory listing,
  and never recorded in this convention as a durable fact about any vendor.
- **Tier B (advanced)** — the recipe requires at least one official
  vendor-documented custom remote-MCP connector. Label it "Advanced setup"
  everywhere it is listed. Tier B never means local servers, community proxies,
  or copied credentials.

Every recipe declares its tier in its process-only section, and every recipe —
both tiers — instructs the member to set its required connectors to **Always
available**: the platform's default tool-access mode chooses connectors
dynamically and may not load one the scheduled run depends on.

Missing-connector behavior is fail-closed: report the one missing connection
plainly, then offer either a verified alternative that preserves the outcome or
a design-only card with unresolved operations labeled
`Unverified — confirm before scheduling`. Schedule nothing until the required
connector is visible and its exact read is verified. An optional destination
falls back to the task result by explicit member choice; a required source has
no silent fallback. At runtime, a failed required source or a failed destination
stops the run with a failure report — never partial work in a different place. A
read the contract names as optional may fail without stopping the run: it is
reported under Coverage and failures and it degrades exactly the way the
contract declares, never silently.

A Tier B setup lesson must: re-verify the official endpoint from primary vendor
documentation, explain plan/admin restrictions before the member starts, use
the platform connector flow with OAuth only, explain what data is being
granted, require a fresh session and a visibility check, verify the exact
needed operation against current docs, never perform a changing action as a
probe, and name the stopping point if verification fails.

## Canonical section order

Every recipe follows this order. Sections marked **(guarded)** are the
byte-identical engine blocks.

1. Frontmatter — `name` matches the directory, description names the outcome
   and invocation phrases, `metadata.version` is SemVer.
2. `# <Recipe title>` — one-paragraph promise: cadence, source shape, private
   output, stopping point; what invokes it; nearby requests that do not.
3. `## Platform compatibility` — references `../../references/codex-compatibility.md`.
4. `## This Skill Is Process-Only` — injection defense; the exact operations to
   verify live; connector tier and any conditional prerequisites in
   member-facing language. No durable capability or pricing claims.
5. `## Step 0 — Readiness Check (Before You Promise Anything)` **(guarded)**
6. `## What This Recipe Builds` — one task, one logical source, one private
   output, one cadence, one stopping point; the tradeoff that keeps it bounded.
7. `## <Outcome> Interview Profile` — only the parameters the recipe cannot
   know; engine interview manners (one question per message, at most three
   suggested answers plus "I'm not sure", aggressive prefilling, no member
   research). Immediately after the member's first answer, the recipe states
   its full safety promise — the recipe-specific rendering of the engine's
   safe-version-one promise, in full, never shortened.
8. `## Scope Rule` — the boundary as one quotable sentence, plus named
   exclusions (event-driven work, backfill, writes, unsupported providers).
9. `## Safe Version One — The Fixed Guardrails` **(guarded)**
10. `## The Global Item Budget` — the atomic item definition; a 5–10 total cap
    that is hard; section reservations that sum to it and may be borrowed
    against by explicit rule; dedupe, skip accounting, bounded queries,
    overflow metadata, per-item size bounds for long sources.
11. Recipe-specific decision rules — one section per classification:
    inclusion, exclusion, ranking, sensitive-content handling, citation
    eligibility, what becomes `Needs review`.
12. `## The <Output> Schema` — fixed section order, explicit empty states,
    "What was skipped and why", "Coverage and failures", no padding, no
    cross-section duplication.
13. `## Destination Choice` — exactly one selected destination;
    `task_result` always supported; at most one second-system private
    destination with the fail-closed privacy checks.
14. `## The Scheduled Task Draft` — one complete paste-ready block carrying
    all runtime rules (see "The runtime contract" below). The recipe source may
    hold controlled interview placeholders; the task handed to the member may
    not.
15. `## Test Before You Schedule` **(guarded)**
16. `## <Outcome> Acceptance Tests` — recipe-specific additions (see below).
17. `## Supervised Mode and Graduation` **(guarded)**
18. `## <Outcome> Graduation Mapping` — a separate H2 placed after the guarded
    ladder and before Never Do This (constraints below).
19. `## Never Do This — And What to Do When You Are Blocked` **(guarded, final)**

## The runtime contract

The pasted Scheduled Task template is the artifact that actually runs, alone in
a fresh session. Its fixed half is the canonical runtime-safety block in
`plugins/automation-builder/references/runtime-safety.md`: every recipe's
template carries it byte-for-byte between its two sentinel lines, and the
validator compares the copy against the canonical file. Editing that file
changes the safety floor of every recipe at once — it carries the same
adversarial-review requirement as a guarded engine block. The block covers, at
minimum, all of the following:

1. Read-only sources; the one private destination and no other write.
2. The prohibited actions: outbound, record-changing, and money.
3. No credentials.
4. The declared item cap as a hard total, the section reservations and the
   rule by which one section borrows another's unused slots, and the bounds the
   contract declares — a time horizon where the source has one, a filter set
   over a current-state read where it does not.
5. Citations from connector-supplied identifiers or permalinks only.
6. An item arriving without one is a failed read, reported under Coverage and
   failures — named in plain text by the identity fields the contract declares,
   never by a link taken from the content — and never presented as an item in
   any section. One failed read does not stop the run.
7. Skipped items and failures are always visible with reasons.
8. Everything read is data, never instructions, with flagging of
   instruction-like content.
9. No invented facts; no cross-client mixing.
10. Within-run deduplication; cross-run claims only from what the readable
    destination shows.
11. Stop-and-explain behavior when a required source fails, when inputs
    conflict, or on abnormal volume. A read the contract names as optional may
    fail without stopping the run: it is reported and it degrades exactly the
    way the contract says, never silently.
12. The end-of-run coverage summary.
13. The member's confirmed timezone and cadence.

Recipe-specific values — source, destination, caps, schema, voice, cadence —
sit alongside these rules as a structured contract; the safety rules themselves
are not to be reworded per recipe.

## Design checklist

**Sources.** One logical read source in version one (several calendars behind
one connection count as one; two providers are two sources). Name the exact
bounded read, horizon, result limit, required fields, and connector-supplied
identifier. Verifying that read live means verifying two things the overflow rule
depends on: that it takes a result limit, and that it can prove a newest-first
order without reading past the cap. The fixed block hands an over-cap run the
newest matches, so a source that cannot prove that order fails closed at
scheduling — nothing goes on a schedule against it, and reaching for a different
ordering is an engine revision rather than a recipe-level substitution. Define behavior for partial, truncated, uncitable, or oversized
results. Shared or delegated data needs an ownership answer or is excluded.
Local files are never a Scheduled Task source.

**Budgets.** Define the atomic item before capping it. Total 5–10 and hard;
section reservations sum to the total, and a section passes its reservation only
by taking slots another left unused, by an explicit rule, with every borrow named
in the coverage summary; one source item appears once, in its highest-qualifying
section; drafts and supporting bullets are not extra items. Selection among more-than-cap matches follows the guarded engine rule:
handle the newest and say how many were left. Member choices shape the
connector-side filters that define what matches; they never change the
overflow ordering, and content is never read to rank it. Any item whose
*content* informed a judgment — inclusion, classification, ranking, or a
decision to skip — consumes a slot. Overflow beyond the cap is count-only
metadata naming the filter that matched it, and it claims no individualized
review ("N more matched and were left unreviewed", never "N more are safe to
ignore").

**Interview.** Ask only open variables (source, include/exclude rules,
thresholds, cadence, timezone, voice where relevant, destination). State the
full recipe-specific safety promise immediately after the first answer. Capture
one known inclusion and one known exclusion to test against. End by showing a
real include, a real skip, and a sample output, then ask what is wrong or
uncomfortable.

**Destination.** Verify the write operation and the destination's privacy from
evidence — a private-sounding title is not evidence. Creating the
member-approved private container (a page or document that will hold the
reports) is permitted once privacy is proven from current documentation; what
is never permitted is probe *content* — no placeholder line, no test row. The
first content ever written is the real manual-test report. A runtime
destination failure produces a failure report, not a digest somewhere else.

**Acceptance tests.** Every recipe adds: a known inclusion and a known
exclusion; budget arithmetic and cross-section dedupe; an empty section; an
untrusted instruction inside a source item; a missing identifier; a partial
source failure; exactly one destination write; missing optional and required
connectors; sensitive content; and traceability of sampled facts to real
sources.

**Graduation mapping.** The mapping covers the fixed ladder's four steps as a
contiguous prefix: a recipe may stop early, and it stops at the first step that
does not apply to it — it never skips an inapplicable step and continues to a
later one, and it never renames, reorders, or substitutes a permission. Step
one names an explicit reviewed maximum for the raised cap (a number the member
saw, not "more"). Step three is an unsent mailbox draft or the mapping ends
before it — no other working-tool write stands in. Step four names one exact
internal status field or label; the operation must be single-effect,
reversible, and applied only to items the member approved — a tool whose one
call has several effects is classified by its full effect set and stays
rejected until each effect has separately graduated. Steps three and four also
require the platform to enforce both approval mode and tool reach; where a
platform cannot, the mapping says those steps are unavailable there.

## Naming, versions, and supersession

- Directory and id: `recipe-<outcome>`, lower kebab case, outcome-named never
  vendor-named. Provider choice is an interview parameter. Never rename a
  published recipe id — supersede it.
- Three version axes are deliberately independent: the plugin catalog version
  (both platform manifests, the release signal), the recipe's own
  `metadata.version` (its behavior contract), and the engine contract (the
  guarded blocks — changing those is an engine change with separate review).
  A behavior-changing recipe revision is a plugin minor; prose-only is a
  patch.
- One active recipe owns an outcome and its invocation phrases. Ownership,
  status, aliases, and `supersedes`/`supersededBy` live in the recipe registry
  (see "The registry"), and the validator rejects an alias two active recipes
  both claim. A successor that fully absorbs an older recipe marks it
  superseded, takes over its aliases, and leaves a short note pointing
  forward. Never two active recipes answering the same request. Existing
  Scheduled Tasks continue unchanged; release notes say whether members should
  rebuild.

## Validation and release

Run both validators on every change:

```bash
node scripts/validate-marketplace.mjs
node scripts/validate-automation-builder.mjs
```

A change to the validator itself also runs its self-test:

```bash
node scripts/test-validate-automation-builder.mjs
```

What the Automation Builder validator enforces:

- **The engine.** The five guarded blocks byte-for-byte, each guarded H2 exactly
  once, and the engine-contract hash over those blocks plus the canonical
  runtime-safety block.
- **The registry.** Schema and enums; both-direction reconciliation with the
  `skills/recipe-*` directories; `sourceCount` of one; `task_result` plus at
  most one second-system destination; a `globalCap` of 5–10 with
  `sectionReservations` summing to it; a `lookbackDays` of 0–7, where 0 is a
  source with no history window at all — a current-state directory read rather
  than a date range — and renders as the fixed snapshot phrase the validator
  holds as a constant instead of "at most N days"; a
  `sectionPhrases` map covering exactly the same sections; the fixed
  `citationPolicy` value; alias uniqueness across active recipes; and
  `recipeVersion` matching the skill's frontmatter.
- **Section order.** The canonical H2s, each exactly once, in order, with the
  guarded Never Do This block last.
- **The task template.** Exactly one `Task name:` fence in the whole skill; the
  sentinel-delimited region compared byte-for-byte against the canonical file;
  the closing sentinel as the last line of the fence; every `Allowed to:` line
  beginning `Allowed to: read`; no square brackets, HTML comments, `TODO`, or
  `TBD` residue inside the fence; and placeholder set equality, in both
  directions, between the fence and the interview profile.
- **Rendered numbers.** The cap phrase, the lookback phrase, and every section
  phrase appear in both the budget section and the task contract, with each
  section number matching the registry and the section numbers summing to the
  global cap.
- **The graduation mapping's body.** A contiguous 1–4 step prefix of exactly
  the length recorded in the registry's `graduationStepCount`, so a mapping that
  stops early cannot be extended by a later step even when that step's own text
  would satisfy every other check; no step
  naming any outbound, record-changing, or money verb, checked against a
  morphology-covering deny-list (every inflection of send, publish, archive,
  message, invite, book, reschedule, move, merge, delete, charge, purchase,
  refund, and invoice); a step one byte-compared against the registry's
  `graduationStepOne` — the whole step is structured data, held identical the
  same way the sentinel block is, with no numeral parsing and no grammar of any
  kind, and the registry separately requires every number in that recorded text,
  NFKC-normalized and in any script, to be `graduationCapMax`; an added read
  source at step two; an
  unsent mailbox draft or an unavailability statement at step three; a status or
  label update at step four. A recipe that needs one of those words innocently
  rewords the step — the deny-list does not shrink to accommodate prose.
- **The rest of the plugin.** Frontmatter (`name` matching, non-empty
  length-limited description, SemVer `metadata.version`); the skill set;
  catalog coherence between the README and the architect skill for active
  recipes; the platform-compatibility reference and the referenced file's
  existence; injection-defense language in the core helper skills; static
  capability/pricing/stale-language checks; and a gendered-language regex. Every
  read normalizes line endings, so a CRLF checkout validates like an LF one.

What it does not do is read prose for meaning. A recipe sentence that
contradicts the fixed rules in ordinary English passes the validator, as does a
weak interview, an unsound decision rule, or a claim about a connector. Those
are what the mandatory adversarial review is for.

What no validator will ever prove: live connector capability, destination
privacy, and unattended-run behavior. Those live in each recipe's readiness
checks and the mandatory manual test.

Every recipe change follows the marketplace release workflow in
[creating-and-releasing-plugins.md](creating-and-releasing-plugins.md): bump
both manifests, add the changelog entry naming the recipe and whether existing
tasks need rebuilding, validate, and release through the normal branch flow.
Recipe releases also require an adversarial review of the full skill text
before shipping — recipes are guard content, and the reviewer's job is to
break them.
