#!/usr/bin/env node

// Content validation for the AI Strategist plugin: the skill set and its
// frontmatter, the sections the two authored skills and the document template
// must carry, the absence of every routing string left behind by Automation
// Builder's recipes, and the reference links each skill points at.
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
  "automation-composio-cost",
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

// The route-2 scheduling doctrine (owner decision, August 2026) lives in prose rather
// than in headings: a job reading through the whole-app bridge may be scheduled only
// where the emitted task block carries its complete written guardrail and every app it
// reads was knowingly approved. Dropping any of these still produces valid markdown.
//
// These are anchored to the START of a line rather than searched for anywhere in the
// file, because each field name is also mentioned in the audit table that checks it. A
// global substring search passes when the real field is deleted and only the audit row
// survives — which is exactly the mutation that matters, so it is the one to catch.
const REQUIRED_BLOCK_FIELDS = {
  "skills/automation-architect/SKILL.md": [
    "Reads it may perform:",
    "Route and guardrail:",
    "Per app it reads, where the route is the connection",
  ],
  "references/hub-strategy-template.md": [
    "**How this route is held.**",
    "Per app it reads, all three states on one line each:",
  ],
};

// The audit rows are checked separately, and only on table lines, so that the field
// check above and this one cannot satisfy each other.
const REQUIRED_AUDIT_ROWS = {
  "skills/automation-architect/SKILL.md": [
    "The route line, and on route 2 both of its conditions",
    "The complete numbered read allowlist",
  ],
};

// "Attached", "technically authorized", and "knowingly approved after disclosure" are
// three separate states, and collapsing them is the regression that lets an unapproved
// app carry a scheduled job. Every file that emits the model must name all three; a
// single marker is not evidence the distinction survived.
const STATE_CATEGORIES = [
  { name: "connection attached", any: ["connection attached", "connection is attached"] },
  { name: "technically authorized", any: ["authorized on it"] },
  { name: "knowing approval", any: ["knowingly approved"] },
  { name: "approval still pending", any: ["approval pending", "knowingly approved: [date] / pending"] },
];
const FULL_STATE_FILES = [
  "references/hub-strategy-template.md",
  "skills/automation-architect/SKILL.md",
  "skills/automation-connector-discovery/SKILL.md",
  "skills/hub-strategy/SKILL.md",
];

// The cost helper is deliberately not on that list: it prices a route and never emits a
// card, so it carries the approval concept alone. Asserting exactly that keeps the
// exception visible instead of letting the file quietly drop the concept altogether.
const COST_HELPER = "skills/automation-composio-cost/SKILL.md";
const COST_HELPER_REQUIRED = ["knowingly approved"];

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
    // The complete gate cannot be satisfied by a summary of it.
    "never substitutes for the audited block",
    // Task-package authorship is exclusive to the architect.
    "Authorship of that package belongs to `automation-architect` and to no other skill",
  ],
  "skills/automation-architect/SKILL.md": ["never substitutes for the audited block"],
  // Each helper refuses the authorship its precedence clause would otherwise hand it.
  "skills/automation-connector-discovery/SKILL.md": [
    "nothing in that file authorizes this skill to write a task package",
  ],
  "skills/automation-composio-cost/SKILL.md": [
    "nothing in that file authorizes this skill to write a task package",
    "requirement returned to `automation-architect`, never written here",
  ],
};

const REFERENCE_LINK = /\.\.\/\.\.\/references\/([A-Za-z0-9._-]+\.md)/g;
const RECIPE_RESIDUE = /recipe-/;

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

// 3. The route-2 doctrine's emitted fields, its audit rows, and the three-state model.
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
        `${relativePath}: no line begins with the route-2 field ${JSON.stringify(field)}. A mention inside the audit table does not satisfy this.`,
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

for (const relativePath of FULL_STATE_FILES) {
  const source = sourceFor(relativePath);
  if (source === null) continue;
  for (const category of STATE_CATEGORIES) {
    if (!category.any.some((marker) => source.includes(marker))) {
      failures.push(
        `${relativePath}: names no "${category.name}" state. All three states plus the pending case must stay separately nameable — one marker is not the model.`,
      );
    }
  }
}

const costSource = sourceFor(COST_HELPER);
if (costSource !== null) {
  for (const marker of COST_HELPER_REQUIRED) {
    if (!costSource.includes(marker)) {
      failures.push(
        `${COST_HELPER}: missing ${JSON.stringify(marker)}. This helper carries the approval concept alone by design, so losing it loses the concept entirely.`,
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

// 4. No routing string left behind by Automation Builder's recipes, anywhere.
for (const path of everyFile(pluginRoot)) {
  if (statSync(path).size === 0) continue;
  const lines = readSource(path).split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    if (RECIPE_RESIDUE.test(lines[index])) {
      failures.push(
        `${label(path)}:${index + 1}: carries a retired recipe identifier: ${lines[index].trim()}`,
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
  `Validated AI Strategist across ${SKILLS.length} skills: frontmatter, required sections in the two authored skills and the document template, the route-2 scheduling sentinels, the knowing-approval distinction, the precedence-scoping and authorship invariants, reference links, the portal invocation phrase, and the absence of retired recipe identifiers.\n`,
);
