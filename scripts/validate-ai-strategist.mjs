#!/usr/bin/env node

// Content validation for the AI Strategist plugin: the skill set and its
// frontmatter, the sections the two authored skills and the document template
// must carry, the emitted task-block fields, the invariant sentences that carry
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
  // Stated once, on purpose. A second copy of a number is a second number to drift.
  "Session scope: a standard session works the first three projects in the build order into full cards; a rushed session works one. Every other project is a row.",
);
REQUIRED_PROSE["skills/automation-architect/SKILL.md"].push(
  // Spoken, not pasted: the half that says what the block is.
  "this block is the task's rulebook, written so the run behaves the same way with nobody watching",
);

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
  for (let index = 0; index < lines.length; index += 1) {
    if (RECIPE_RESIDUE.test(lines[index])) {
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

// 6. The portal lesson's invocation phrase, character for character.
const codexManifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
if (!existsSync(codexManifestPath)) {
  failures.push(".codex-plugin/plugin.json is missing.");
} else {
  const prompts =
    JSON.parse(readSource(codexManifestPath)).interface?.defaultPrompt ?? [];
  if (!prompts.includes(PORTAL_INVOCATION)) {
    failures.push(
      `.codex-plugin/plugin.json: interface.defaultPrompt must carry the portal lesson's exact phrase ${JSON.stringify(PORTAL_INVOCATION)}.`,
    );
  }
}

if (failures.length > 0) {
  throw new Error(
    `AI Strategist content validation failed:\n${failures.join("\n")}`,
  );
}

process.stdout.write(
  `Validated AI Strategist across ${SKILLS.length} skills: frontmatter, required sections in the two authored skills and the document template, every emitted task-block field, the exactly-pinned model line, the audit rows, the precedence-scoping, structural-narrowing, administrator-policy, browser-ban and authorship invariants, reference links, the portal invocation phrase, the member-facing glance block, the row-expansion line, the session-scope sentence and the spoken line before the task block, and the absence of retired recipe identifiers, retired bridge vendors, retired bridge machinery, and any second statement of the card count.\n`,
);
