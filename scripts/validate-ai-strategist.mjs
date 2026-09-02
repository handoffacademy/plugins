#!/usr/bin/env node

// Content validation for the AI Strategist plugin: the skill set and its
// frontmatter, the sections the two authored skills and the document template
// must carry, the slots and self-containment of the member-facing page, the emitted task-block fields, the invariant sentences that carry
// the precedence and authorship rules, the absence of every routing string left
// behind by Automation Builder's recipes, the absence of any bridge-vendor name
// outside the changelog, and the reference links each skill points at.
//
// What this script cannot do: read prose for meaning. A skill that states a
// capability from memory, softens the session gate, or contradicts a guardrail
// in ordinary English still passes here. Catching that is the adversarial
// review's job, and adding more regexes is not a substitute for it.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = join(repoRoot, "plugins", "ai-strategist");
const skillsRoot = join(pluginRoot, "skills");
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

const SKILLS = [
  "automation-architect",
  "automation-connector-discovery",
  "hub-strategy",
  "notion-hub",
];

// The portal's lesson tells members to type this exact phrase, so it is a
// contract rather than copy: changing it breaks the lesson, not just the prompt.
const PORTAL_INVOCATION = "Design my AI Hub strategy.";

const REQUIRED_SECTIONS = {
  "hub-strategy": [
    "## Platform compatibility",
    "## This Skill Is Process-Only — Verify Every Capability Live In This Session",
    "## How You Talk to the Member — The Response Contract",
    "## Step 0 — Readiness Check",
    "## The Interview",
    "## The Hub Strategy Document",
    "## When a Source Has No Connector — The Ladder",
    "## Browser Fallback",
    "## Fixed Guardrails",
    "## Never Do This — And What to Do When You Are Blocked",
  ],
  "notion-hub": [
    "## Platform compatibility",
    "## This Skill Is Process-Only — Verify Every Capability Live In This Session",
    "## How You Talk to the Member — The Response Contract",
    "## Two Ways This Skill Gets Used",
    "## Hub Architecture",
    "## Where a Scheduled Task's Results Land",
    "## Writing Notes Claude Can Find Again",
    "## What the Connection Cannot Do For You",
    "## Fixed Guardrails",
    "## Never Do This — And What to Do When You Are Blocked",
  ],
};

// The template's document sections sit inside a fenced skeleton, so they are
// checked as strings rather than as markdown headings.
const REQUIRED_TEMPLATE_SECTIONS = [
  "## Your Hub at a Glance",
  "## Build Order",
  "## Project Plans",
  "## Your Hub Home Base",
  "## Connections Checklist",
  "## What This Hub Will Never Do",
  "## Open Decisions — All in One Place",
  "## Choices Already Made — Revisit Only If You Raise Them",
  "## When Things Change",
  "**Where its results live in your hub home base.**",
];

// The emitted task block's own fields. Version one goes on a schedule by structural
// narrowing and by nothing else (owner decision, September 2026), so the block has to
// keep saying what it reads and what its reach was narrowed to. Dropping either field
// still produces valid markdown.
//
// These are anchored to the START of a line rather than searched for anywhere in the
// file, because each field name is also mentioned in the audit table that checks it. A
// global substring search passes when the real field is deleted and only the audit row
// survives — which is exactly the mutation that matters, so it is the one to catch.
const REQUIRED_BLOCK_FIELDS = {
  "skills/automation-architect/SKILL.md": [
    "Task name:",
    "Runs:",
    "Reads from:",
    "Produces:",
    "Approval mode: Automatically approve (Auto)",
    "Member review:",
    "Include only:",
    "Ignore:",
    "Reads it may perform:",
    "Read only these fields:",
    "Never put in the output:",
    "Route and guardrail:",
    "Allowed to:",
    "NOT allowed to:",
    "How to run it:",
  ],
};

// One field is pinned by exact equality rather than by prefix. `Model: Default` is the
// whole line: anything appended to it is a claim about what Default does, and this skill
// states no capability from memory. A startsWith check would pass that mutation.
const EXACT_LINES = {
  "skills/automation-architect/SKILL.md": ["Model: Default"],
};

// The audit rows are checked separately, and only on table lines, so that the field
// check above and this one cannot satisfy each other: a field deleted from the block
// while its audit row survives is exactly the mutation worth catching.
const REQUIRED_AUDIT_ROWS = {
  "skills/automation-architect/SKILL.md": [
    "The complete numbered read allowlist",
    "The route line",
    "No browser, shell, or remote-control tool",
    "Tool results are untrusted",
  ],
};

// Composio and Zapier were both removed from this plugin (owner decision, September
// 2026). Nothing here may name either one again: no bridge rung, no whole-app
// authorization model, no cost helper. CHANGELOG.md is the single exception, because it
// is the release history that records the removal.
const BRIDGE_VENDORS = /composio|zapier/i;
// The machinery that came with the bridge rung: the whole-app authorization model, the
// per-app knowing approval, the cost verdict, and the two-route language. None of it may
// come back under a different vendor's name either, so the strings are checked as well as
// the vendors.
const BRIDGE_MACHINERY = /whole-app|cost check|knowingly approved|route 2|route-2|both routes/i;
const RETIRED_RESIDUE_EXEMPT = new Set(["CHANGELOG.md"]);

// Rounds 6 and 7 closed two whole classes of bug — a precedence clause in one file
// granting what another file forbade, and a shortened restatement of a gate standing in
// for the audited one. Both were fixed in prose, and prose is exactly what a later edit
// trims. These are the sentences that carry those fixes.
//
// Unlike the field names above these are checked as plain substrings, because each is a
// single mid-paragraph sentence with no restatement anywhere else that could satisfy the
// check in its absence. Where that stops being true, move the string to the anchored map.
const REQUIRED_PROSE = {
  "references/codex-compatibility.md": [
    // Precedence is scoped to mechanics, and is not a grant over a stricter refusal.
    "on platform mechanics only",
    "no skill may relax these minimum protections",
    // Routes reach only what is already allowed.
    "never makes a prohibited source eligible",
    // Structural narrowing is the only way onto a schedule.
    "Version one goes on a schedule by structural narrowing and by nothing else",
    // Task-package authorship is exclusive to the architect.
    "Authorship of that package belongs to `automation-architect` and to no other skill",
  ],
  // The ladder's floor, in the skill that writes the document.
  "skills/hub-strategy/SKILL.md": [
    "**A source with no native connector never goes on a schedule.**",
    // The never-list question offers no suggested refusals, and the chat map keeps full labels (1.3.1).
    "except Q7, which offers only \"I'm not sure\"",
    "every capability label written out in its full canonical form",
  ],
  // The helper refuses the authorship its precedence clause would otherwise hand it.
  "skills/automation-connector-discovery/SKILL.md": [
    "nothing in that file authorizes this skill to write a task package",
  ],
};

// Sentences the strip could have taken with it, each carrying a rule nothing else states.
REQUIRED_PROSE["references/codex-compatibility.md"].push(
  // An administrator's decision is never routed around, by any route.
  "a route never works around an administrator's policy",
  // The unattended-browser ban, in the file that makes it plugin-wide.
  "Unattended browser automation is banned, with no exception.",
);
REQUIRED_PROSE["skills/hub-strategy/SKILL.md"].push(
  // No browser routine on anything holding money, watched or not.
  "Never put a browser routine on a bank",
  // Task text is the design engine's alone.
  "Task text comes only out of the design engine's own sitting",
  // The session gate: a check belongs to the session that made it.
  "Verification does not carry over",
);
REQUIRED_PROSE["skills/automation-architect/SKILL.md"] = [
  // The same session gate, in the skill that builds from it.
  "Verification never carries over",
  // Nothing is scheduled on a design that has never run.
  "Never schedule an automation that has not produced one good real output",
];

// The 1.2.1 member-facing pass. Each of these is a fixed member-facing artifact that a
// later trim takes out silently, and none of them is restated anywhere else: the glance
// block is the only summary the member reads, the expansion line is the only place the
// document offers to work a row up, the session-scope sentence is deliberately stated
// once so no second copy can drift from it, and the spoken line is what keeps the pasted
// block from reading as homework.
REQUIRED_PROSE["references/hub-strategy-template.md"] = [
  // The five glance lines as one block: a dropped or re-worded line breaks the summary,
  // and a line rewritten as product behavior puts an unlabeled capability claim on page one.
  [
    "[What this hub is for, in your words.]",
    "[The first project you are building, and why it goes first.]",
    "[The first job you want running on its own once that is built.]",
    "[Where you chose for its results to land.]",
    "[The one thing to do this week.]",
  ].join("\n"),
  "Any planned or deferred row here can be worked into a full plan whenever you want one. Ask for it by name.",
];
REQUIRED_PROSE["skills/hub-strategy/SKILL.md"].push(
  // The page rule (1.7.0). Two strings, because the rule needs both halves to be executable: the
  // template it renders from, which nothing else in this file resolves - the reference-link check
  // matches .md targets only — and the invariant that keeps the page downstream of the document.
  // A page edited directly is a second source of truth, and the member cannot tell which one it is.
  "render it as a one-page HTML rendering from `../../references/hub-strategy-page.html`",
  "**The page is a rendering, never the source:**",
);
REQUIRED_PROSE["skills/hub-strategy/SKILL.md"].push(
  // Stated once, on purpose. A second copy of a number is a second number to drift. The
  // sentence is mode-aware from 1.3.0: the full interview and Quick Plan produce different
  // amounts of the same document, and how much is decided here rather than at Q9.
  "Session scope: the full interview works the first three projects in the build order into full cards; Quick Plan writes module rows and at most one custom card, only where the member made that area the first project; every other area is a row.",
);

// The stop rule is the whole of what makes build-time verification safe: Quick Plan writes
// conditional lines it never checked, so the sentence that turns an unverified line into a
// stop has to be present, identically, in all four artifacts that carry a plan forward - the
// skill that writes the document, the skill that builds from it, the document itself, and the
// page the member reads. The page is the newest way for it to go missing: it is rendered from a
// template rather than written out, so a trimmed template drops the rule from the only artifact
// most members ever open. The whole paragraph is pinned by exact equality, once per file, and
// the four copies are compared.
const STOP_RULE_PARAGRAPH =
  "An Unverified line is a stop, not permission to proceed. Before giving a setup step or creating, connecting, testing, writing, or scheduling anything that depends on it, re-check the exact capability for this account and this source in that build session. If it cannot be confirmed, stop that branch and use only a verified, permitted fallback.";
const STOP_RULE_FILES = [
  "skills/hub-strategy/SKILL.md",
  "skills/automation-architect/SKILL.md",
  "references/hub-strategy-template.md",
  "references/hub-strategy-page.html",
];
REQUIRED_PROSE["skills/automation-architect/SKILL.md"].push(
  // Spoken, not pasted: the half that says what the block is.
  "this block is the task's rulebook, written so the run behaves the same way with nobody watching",
);

// The Academy routing reference is generated from the portal's own registry, so nothing here
// checks its prose. What it checks is the three things a hand edit or a drifted generator
// breaks: the sentence saying it is not evidence of a capability, the exact six module records
// it is allowed to carry, and the absence of any vendor name — a route is curriculum routing,
// and a connector or product named in this file reads as a capability claim with no label on it.
const RUN_MODULES_FILE = "references/moai-run-modules.md";
const RUN_MODULES_DISCLAIMER =
  "This is not evidence that any connector or product capability is available for this member.";
const RUN_MODULES_HEADER =
  "Curriculum routing metadata synced from the Academy registry at commit <sha>. This is not evidence that any connector or product capability is available for this member. Never emit a Verified label from this file.";
const RUN_MODULES_INTRO =
  "Each row is one Academy Run module: the id to write in an Academy route field, the title to show the member, the Project that module builds, and the lessons in the order the member takes them.";
const RUN_MODULES_TABLE_HEADER =
  "| Module id | Module title | Project it builds | First lesson slug | All lessons in order |";
const RUN_MODULES_TABLE_SEPARATOR = "| --- | --- | --- | --- | --- |";
const RUN_MODULES_LESSONS = /^[a-z0-9-]+: [^;|]+(; [a-z0-9-]+: [^;|]+)*$/;
const RUN_MODULE_PROJECTS = {
  "recipe-inbox-autopilot": "Inbox Agent",
  "recipe-calendar-autopilot": "Calendar Agent",
  "recipe-file-organizer": "File Organizer",
  "recipe-meeting-memory": "Meeting Memory",
  "recipe-sales-autopilot": "Sales Agent",
  "content-engine": "Content Engine",
};
const RUN_MODULE_IDS = [
  "recipe-inbox-autopilot",
  "recipe-calendar-autopilot",
  "recipe-file-organizer",
  "recipe-meeting-memory",
  "recipe-sales-autopilot",
  "content-engine",
];
const RUN_MODULES_COLUMNS = [
  "Module id",
  "Module title",
  "Project it builds",
  "First lesson slug",
  "All lessons in order",
];
// Vendor words are expected in this file: they are inside the Academy's own lesson slugs and
// lesson titles, which is what a route has to name to be usable. What may never appear in a
// module row is a capability verdict — a label, an approval state, or the word connector —
// because this file carries no labels and a verdict read out of it would carry none either.
// The banned strings are checked on the table rows alone: the header sentences say "connector"
// and "Verified" on purpose, in the disclaimer that exists to stop exactly that misreading.
const RUN_MODULES_BANNED_IN_ROWS = [
  "Verified",
  "Unverified",
  "Needs approval",
  "connector",
  "Needs your account administrator",
];

// The Quick Plan mode is a set of promises that only hold together as a set: the section
// itself, its eight exchanges in order, the sentence saying nothing is looked up, the sentence
// putting routing after Q6 and Q7, the administrator label in the source-boundary exchange, and
// the template's mode line. Any one of these can be trimmed without breaking a heading or a
// table, and each one on its own turns Quick Plan into something it is not.
const QUICK_PLAN_HEADING =
  "### The Quick Plan Question Set — Eight Short Exchanges";
const QUICK_PLAN_EXCHANGES = [
  "**Q1, open, in their own words, prefilled.**",
  "**Q2, the heaviest one**",
  "**Already running, in one compact question. Required, and never a clarifier.**",
  "**The source boundary, in one compact question. Required, and never a clarifier.**",
  "**Home base and delivery, combined — Q5 and Q8 in one exchange.**",
  "**Q6, the walled gardens**",
  "**Q7, the never list**",
  "**Q9, short.**",
];
const QUICK_PLAN_NO_LOOKUP = "**It does no documentation lookups at all:**";
const QUICK_PLAN_ROUTE_ORDER =
  "**Route only after Q6 and Q7 are answered, and after both audits have run**";
const QUICK_PLAN_ADMIN_LABEL =
  "**Where a source sits under somebody else's administration, its line carries `Needs your account administrator — one specific question`**";
const TEMPLATE_MODE_LINE =
  "[One mode line, here, directly under the title, and never left out:";

// The page the member reads. It is filled mechanically, so the slots are a contract: a renamed or
// dropped marker leaves a section of the plan silently unfilled and nothing else notices. The list
// below is an exact allowlist rather than a floor, so an unknown marker fails too: a slot the skill
// was never told to fill ships its placeholder to the member, which is the same bug from the other
// end.
const PAGE_TEMPLATE_FILE = "references/hub-strategy-page.html";
const PAGE_SLOTS = [
  "lang",
  "title-text",
  "eyebrow",
  "title",
  "draft-notice",
  "subtitle",
  "glance-lines",
  "labels-note",
  "build-order-heading",
  "build-order",
  "project-plans",
  "parked",
  "already-running",
  "built-retired",
  "home-base-name",
  "home-base",
  "never-list",
  "open-decisions",
  "connections",
  "choices-made",
  "markdown-filename",
];
const PAGE_SLOT_MARKER = /<!-- (slot|end): ([a-z-]+) -->/g;
// The page is handed over as a file somebody keeps, prints, opens offline, and reopens months later.
// So it stays self-contained: nothing that executes, nothing that fetches, and nothing that embeds
// something fetched. This is a bounded list of patterns rather than an HTML parser. It is
// deliberately blunt, and a template that needs one of these needs a decision rather than an
// exemption.
const PAGE_BANNED = [
  /<script/i,
  /<img/i,
  /<iframe/i,
  /<link/i,
  /<form/i,
  /<object/i,
  /<embed/i,
  /<meta\s+http-equiv/i,
  /https?:\/\//i,
  /javascript:/i,
  /url\(/i,
  /@import/i,
  /(?:src|href)="\/\//i,
];

const REFERENCE_LINK = /\.\.\/\.\.\/references\/([A-Za-z0-9._-]+\.md)/g;
const RECIPE_RESIDUE = /recipe-/;
// The card count is the session-scope sentence and nothing else. "three to five" was the
// old range, and a second statement of the count anywhere is the drift this catches.
const CARD_COUNT_RESIDUE = /three to five/i;

const failures = [];

function readSource(path) {
  return readFileSync(path, "utf8").split("\r\n").join("\n");
}

function everyFile(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return everyFile(path);
    return entry.isFile() ? [path] : [];
  });
}

function label(path) {
  return relative(pluginRoot, path).split("\\").join("/");
}

function frontmatter(source) {
  if (!source.startsWith("---\n")) return null;
  const end = source.indexOf("\n---\n", 3);
  if (end === -1) return null;
  const parsed = {};
  let section = null;
  for (const line of source.slice(4, end + 1).split("\n")) {
    if (line.trim().length === 0) continue;
    const colon = line.indexOf(":");
    if (colon === -1) return null;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (/^\s/.test(line)) {
      if (!section) return null;
      parsed[section][key] = value;
    } else if (value.length === 0) {
      section = key;
      parsed[key] = {};
    } else {
      section = null;
      parsed[key] = value;
    }
  }
  return parsed;
}

if (!existsSync(pluginRoot)) {
  throw new Error("plugins/ai-strategist is missing.");
}

// 1. The skill set, and frontmatter whose name matches its own directory.
const directories = existsSync(skillsRoot)
  ? readdirSync(skillsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  : [];
if (JSON.stringify(directories) !== JSON.stringify([...SKILLS].sort())) {
  failures.push(
    `skills/: directories ${directories.join(", ") || "(none)"} do not match the expected set ${[...SKILLS].sort().join(", ")}.`,
  );
}

for (const skill of SKILLS) {
  const path = join(skillsRoot, skill, "SKILL.md");
  const name = `skills/${skill}/SKILL.md`;
  if (!existsSync(path)) {
    failures.push(`${name} is missing.`);
    continue;
  }
  const source = readSource(path);
  const parsed = frontmatter(source);
  if (!parsed) {
    failures.push(`${name}: frontmatter is missing or unparseable.`);
    continue;
  }
  if (parsed.name !== skill) {
    failures.push(
      `${name}: frontmatter name "${parsed.name}" must equal the directory name.`,
    );
  }
  if (!parsed.description || parsed.description.length === 0) {
    failures.push(`${name}: frontmatter needs a description.`);
  } else if (parsed.description.length >= 1024) {
    failures.push(
      `${name}: description is ${parsed.description.length} characters; keep it under 1024.`,
    );
  }
  if (!semver.test(parsed.metadata?.version ?? "")) {
    failures.push(
      `${name}: metadata.version "${parsed.metadata?.version}" is not an X.Y.Z semantic version.`,
    );
  }
}

// 2. The sections the authored skills and the document template must carry.
for (const [skill, sections] of Object.entries(REQUIRED_SECTIONS)) {
  const path = join(skillsRoot, skill, "SKILL.md");
  if (!existsSync(path)) continue;
  const lines = readSource(path).split("\n");
  for (const section of sections) {
    const matches = lines.filter((line) => line.trim() === section).length;
    if (matches !== 1) {
      failures.push(
        `skills/${skill}/SKILL.md: expected exactly one "${section}" section, found ${matches}.`,
      );
    }
  }
}

const templatePath = join(pluginRoot, "references", "hub-strategy-template.md");
if (!existsSync(templatePath)) {
  failures.push("references/hub-strategy-template.md is missing.");
} else {
  const template = readSource(templatePath);
  for (const section of REQUIRED_TEMPLATE_SECTIONS) {
    if (!template.includes(section)) {
      failures.push(
        `references/hub-strategy-template.md: missing the "${section}" section.`,
      );
    }
  }
}

// 3. The emitted task block's fields and the invariant sentences.
function sourceFor(relativePath) {
  const path = join(pluginRoot, relativePath);
  if (!existsSync(path)) {
    failures.push(`${relativePath} is missing.`);
    return null;
  }
  return readSource(path);
}

for (const [relativePath, fields] of Object.entries(REQUIRED_BLOCK_FIELDS)) {
  const source = sourceFor(relativePath);
  if (source === null) continue;
  const lines = source.split("\n").map((line) => line.trim());
  for (const field of fields) {
    if (!lines.some((line) => line.startsWith(field))) {
      failures.push(
        `${relativePath}: no line begins with the task-block field ${JSON.stringify(field)}. A mention inside the audit table does not satisfy this.`,
      );
    }
  }
}

for (const [relativePath, exact] of Object.entries(EXACT_LINES)) {
  const source = sourceFor(relativePath);
  if (source === null) continue;
  const lines = source.split("\n").map((line) => line.trim());
  for (const wanted of exact) {
    if (!lines.some((line) => line === wanted)) {
      failures.push(
        `${relativePath}: no line reads exactly ${JSON.stringify(wanted)}. This one is pinned by equality, not by prefix: anything appended to it is a claim this skill may not make.`,
      );
    }
  }
}

for (const [relativePath, rows] of Object.entries(REQUIRED_AUDIT_ROWS)) {
  const source = sourceFor(relativePath);
  if (source === null) continue;
  const tableLines = source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));
  for (const row of rows) {
    if (!tableLines.some((line) => line.includes(row))) {
      failures.push(
        `${relativePath}: the block audit table is missing a row for ${JSON.stringify(row)}.`,
      );
    }
  }
}

for (const [relativePath, sentences] of Object.entries(REQUIRED_PROSE)) {
  const source = sourceFor(relativePath);
  if (source === null) continue;
  for (const sentence of sentences) {
    if (!source.includes(sentence)) {
      failures.push(
        `${relativePath}: missing the invariant ${JSON.stringify(sentence)}. This sentence carries a rule that a shorter restatement elsewhere does not.`,
      );
    }
  }
}

// 4. No routing string left behind by Automation Builder's recipes, and no retired
//    bridge vendor named outside the changelog, anywhere.
for (const path of everyFile(pluginRoot)) {
  if (statSync(path).size === 0) continue;
  const name = label(path);
  const lines = readSource(path).split("\n");
  // The routing reference carries Academy module ids, and four of the six are named
  // recipe-something in the registry itself. Those are curriculum identifiers rather than
  // the retired Automation Builder routing strings, and the module-record check below is
  // what holds them to the exact six.
  const recipeIdentifiersAllowed = name === RUN_MODULES_FILE;
  for (let index = 0; index < lines.length; index += 1) {
    if (!recipeIdentifiersAllowed && RECIPE_RESIDUE.test(lines[index])) {
      failures.push(
        `${name}:${index + 1}: carries a retired recipe identifier: ${lines[index].trim()}`,
      );
    }
    if (CARD_COUNT_RESIDUE.test(lines[index])) {
      failures.push(
        `${name}:${index + 1}: states a card count of its own. How many projects get full cards is the session-scope sentence in hub-strategy, stated once: ${lines[index].trim()}`,
      );
    }
    if (RETIRED_RESIDUE_EXEMPT.has(name)) continue;
    if (BRIDGE_VENDORS.test(lines[index])) {
      failures.push(
        `${name}:${index + 1}: names a retired bridge vendor. The bridge rung is gone; only CHANGELOG.md may mention one, as history: ${lines[index].trim()}`,
      );
    }
    if (BRIDGE_MACHINERY.test(lines[index])) {
      failures.push(
        `${name}:${index + 1}: carries retired bridge machinery. Version one goes on a schedule by structural narrowing alone: ${lines[index].trim()}`,
      );
    }
  }
}

// 5. Every reference link a skill points at resolves to a real file.
for (const skill of SKILLS) {
  const path = join(skillsRoot, skill, "SKILL.md");
  if (!existsSync(path)) continue;
  const source = readSource(path);
  const targets = new Set(
    [...source.matchAll(REFERENCE_LINK)].map((match) => match[1]),
  );
  if (targets.size === 0) {
    failures.push(
      `skills/${skill}/SKILL.md: points at no ../../references/*.md file.`,
    );
  }
  for (const target of targets) {
    if (!existsSync(join(pluginRoot, "references", target))) {
      failures.push(
        `skills/${skill}/SKILL.md: references/${target} does not exist.`,
      );
    }
  }
}

// 6. The Academy routing reference, bounded. The file is generated, so it is checked as a
//    whole shape rather than searched: four kinds of line are allowed and nothing else, and
//    every module row is checked cell by cell against the registry facts this plugin routes on.
const runModulesSource = sourceFor(RUN_MODULES_FILE);
if (runModulesSource !== null) {
  const cellsOf = (line) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  const lines = runModulesSource.split("\n").map((line) => line.trim());
  const seenIds = [];
  let dataRowCount = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.length === 0) continue;
    const normalized = line.replace(/commit [0-9a-f]{7,40}/, "commit <sha>");
    if (normalized === RUN_MODULES_HEADER) continue;
    if (line === RUN_MODULES_INTRO) continue;
    if (line === RUN_MODULES_TABLE_HEADER) continue;
    if (line === RUN_MODULES_TABLE_SEPARATOR) continue;
    if (!line.startsWith("|")) {
      failures.push(
        `${RUN_MODULES_FILE}:${index + 1}: unexpected line. This file may carry only the header paragraph, the intro sentence, the table header and separator, and six module rows: ${line}`,
      );
      continue;
    }
    dataRowCount += 1;
    const cells = cellsOf(line);
    if (cells.length !== RUN_MODULES_COLUMNS.length) {
      failures.push(
        `${RUN_MODULES_FILE}:${index + 1}: has ${cells.length} cells, expected ${RUN_MODULES_COLUMNS.length}.`,
      );
      continue;
    }
    const [id, , project, firstSlug, lessons] = cells;
    if (!Object.prototype.hasOwnProperty.call(RUN_MODULE_PROJECTS, id)) {
      failures.push(
        `${RUN_MODULES_FILE}:${index + 1}: ${JSON.stringify(id)} is not one of the six Academy Run modules.`,
      );
      continue;
    }
    seenIds.push(id);
    if (project !== RUN_MODULE_PROJECTS[id]) {
      failures.push(
        `${RUN_MODULES_FILE}:${index + 1}: ${id} builds ${JSON.stringify(RUN_MODULE_PROJECTS[id])}; the row says ${JSON.stringify(project)}.`,
      );
    }
    if (!RUN_MODULES_LESSONS.test(lessons)) {
      failures.push(
        `${RUN_MODULES_FILE}:${index + 1}: the lesson list must read "slug: title" entries separated by "; ": ${lessons}`,
      );
    } else if (firstSlug !== lessons.split(":")[0].trim()) {
      failures.push(
        `${RUN_MODULES_FILE}:${index + 1}: first lesson slug ${JSON.stringify(firstSlug)} is not the first slug in the lesson list ${JSON.stringify(lessons.split(":")[0].trim())}.`,
      );
    }
    for (const banned of RUN_MODULES_BANNED_IN_ROWS) {
      if (line.toLowerCase().includes(banned.toLowerCase())) {
        failures.push(
          `${RUN_MODULES_FILE}:${index + 1}: a module row carries ${JSON.stringify(banned)}. This file is curriculum routing metadata and states no capability.`,
        );
      }
    }
  }
  if (!runModulesSource.includes(RUN_MODULES_DISCLAIMER)) {
    failures.push(
      `${RUN_MODULES_FILE}: missing the header sentence ${JSON.stringify(RUN_MODULES_DISCLAIMER)}. Without it a reader takes a route as evidence that a connector is available.`,
    );
  }
  if (dataRowCount !== RUN_MODULE_IDS.length || new Set(seenIds).size !== RUN_MODULE_IDS.length) {
    failures.push(
      `${RUN_MODULES_FILE}: expected exactly ${RUN_MODULE_IDS.length} module rows with unique known ids, found ${dataRowCount} rows and ${new Set(seenIds).size} unique ids.`,
    );
  }
}

// 6b. The stop rule: one occurrence per file, the whole paragraph, and the four identical.
const stopRuleLines = new Map();
for (const file of STOP_RULE_FILES) {
  const source = sourceFor(file);
  if (source === null) continue;
  const carrying = source
    .split("\n")
    .filter((line) => line.includes("An Unverified line is a stop"));
  if (carrying.length !== 1) {
    failures.push(
      `${file}: expected exactly one line carrying the stop-rule paragraph, found ${carrying.length}.`,
    );
    continue;
  }
  if (carrying[0].trim() !== STOP_RULE_PARAGRAPH) {
    failures.push(
      `${file}: the stop-rule paragraph is not the fixed text. It is reproduced word for word or it is an edit, and the clause it loses is the one doing the work.`,
    );
    continue;
  }
  stopRuleLines.set(file, carrying[0].trim());
}
if (stopRuleLines.size === STOP_RULE_FILES.length) {
  const [first, ...rest] = [...stopRuleLines.values()];
  if (rest.some((paragraph) => paragraph !== first)) {
    failures.push(
      "The stop-rule paragraph differs between the files that carry it. It is one fixed paragraph in all four.",
    );
  }
}

// 6c. The Quick Plan machinery, in the skill and in the template.
const quickPlanSource = sourceFor("skills/hub-strategy/SKILL.md");
if (quickPlanSource !== null) {
  for (const pinned of [
    QUICK_PLAN_HEADING,
    QUICK_PLAN_NO_LOOKUP,
    QUICK_PLAN_ROUTE_ORDER,
    QUICK_PLAN_ADMIN_LABEL,
  ]) {
    if (!quickPlanSource.includes(pinned)) {
      failures.push(
        `skills/hub-strategy/SKILL.md: missing the Quick Plan invariant ${JSON.stringify(pinned)}.`,
      );
    }
  }
  let cursor = -1;
  for (const marker of QUICK_PLAN_EXCHANGES) {
    const at = quickPlanSource.indexOf(marker, cursor + 1);
    if (at === -1) {
      failures.push(
        `skills/hub-strategy/SKILL.md: missing the Quick Plan exchange ${JSON.stringify(marker)}, or it appears out of order.`,
      );
      break;
    }
    cursor = at;
  }
}
const templateSource = sourceFor("references/hub-strategy-template.md");
if (templateSource !== null && !templateSource.includes(TEMPLATE_MODE_LINE)) {
  failures.push(
    `references/hub-strategy-template.md: missing the mode line under the document title. Which mode wrote a plan is the first thing somebody picking it up needs to know.`,
  );
}

// 6d. The member-facing page: its exact slot set, and its self-containment.
const pageSource = sourceFor(PAGE_TEMPLATE_FILE);
if (pageSource !== null) {
  const markers = [...pageSource.matchAll(PAGE_SLOT_MARKER)].map((match) => ({
    kind: match[1],
    name: match[2],
  }));
  for (const slot of PAGE_SLOTS) {
    for (const kind of ["slot", "end"]) {
      const found = markers.filter(
        (marker) => marker.name === slot && marker.kind === kind,
      ).length;
      if (found !== 1) {
        failures.push(
          `${PAGE_TEMPLATE_FILE}: expected exactly one "<!-- ${kind}: ${slot} -->" marker, found ${found}. Each slot is a paired region, and everything between its two markers is replaced.`,
        );
      }
    }
  }
  for (const name of new Set(markers.map((marker) => marker.name))) {
    if (!PAGE_SLOTS.includes(name)) {
      failures.push(
        `${PAGE_TEMPLATE_FILE}: carries an unknown slot ${JSON.stringify(name)}. This list is an allowlist: a slot the skill was never told to fill ships its placeholder to the member.`,
      );
    }
  }
  // Order and nesting. A region that opens inside another one has no single replaceable span, and
  // an end before its own start silently swallows the region above it.
  let open = null;
  for (const marker of markers) {
    if (marker.kind === "slot") {
      if (open !== null) {
        failures.push(
          `${PAGE_TEMPLATE_FILE}: slot ${JSON.stringify(marker.name)} opens inside ${JSON.stringify(open)}. Slot regions never nest.`,
        );
        break;
      }
      open = marker.name;
    } else {
      if (open !== marker.name) {
        failures.push(
          `${PAGE_TEMPLATE_FILE}: "<!-- end: ${marker.name} -->" closes ${open === null ? "nothing" : JSON.stringify(open)}. Every region opens and closes in order.`,
        );
        break;
      }
      open = null;
    }
  }
  if (open !== null) {
    failures.push(
      `${PAGE_TEMPLATE_FILE}: slot ${JSON.stringify(open)} is never closed.`,
    );
  }
  for (const banned of PAGE_BANNED) {
    if (banned.test(pageSource)) {
      failures.push(
        `${PAGE_TEMPLATE_FILE}: matches ${banned}. This page is saved, printed, and opened offline by the member: nothing that executes, nothing that fetches, and no link of any kind.`,
      );
    }
  }
}

// 7. The portal lesson's invocation phrase, character for character.
const codexManifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
if (!existsSync(codexManifestPath)) {
  failures.push(".codex-plugin/plugin.json is missing.");
} else {
  const prompts =
    JSON.parse(readSource(codexManifestPath)).interface?.defaultPrompt ?? [];
  // Pinned by position as well as by text: the lesson tells the member to use the first
  // prompt, so a reordering breaks the lesson exactly as a rewording would.
  if (prompts[0] !== PORTAL_INVOCATION) {
    failures.push(
      `.codex-plugin/plugin.json: interface.defaultPrompt[0] must equal the portal lesson's exact phrase ${JSON.stringify(PORTAL_INVOCATION)}; it is ${JSON.stringify(prompts[0] ?? null)}.`,
    );
  }
}

if (failures.length > 0) {
  throw new Error(
    `AI Strategist content validation failed:\n${failures.join("\n")}`,
  );
}

process.stdout.write(
  `Validated AI Strategist across ${SKILLS.length} skills: frontmatter, required sections in the two authored skills and the document template, every emitted task-block field, the exactly-pinned model line, the audit rows, the precedence-scoping, structural-narrowing, administrator-policy, browser-ban and authorship invariants, reference links, the portal invocation phrase, the member-facing glance block, the row-expansion line, the mode-aware session-scope sentence, the whole stop-rule paragraph appearing exactly once and identically in the four files that carry it, the page template's exact slot allowlist rendered as paired regions with no missing, duplicate, unknown, nested, or out-of-order marker, and its freedom from script, from links, and from anything that fetches or embeds, the Quick Plan heading with its eight exchanges in order and its no-lookup, routing-order and administrator-label invariants, the template's mode line, the routing reference as a bounded shape (only its header paragraph, intro sentence, table header and separator, and six module rows, each row five cells with a known id, that id's own Project, a well-formed lesson list whose first slug matches, and no capability verdict), the spoken line before the task block, and the absence of retired recipe identifiers, retired bridge vendors, retired bridge machinery, and any second statement of the card count.\n`,
);
