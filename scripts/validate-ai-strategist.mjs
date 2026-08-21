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
  "automation-zapier-cost",
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
  "## Your Notion Hub",
  "## Connections Checklist",
  "## What This Hub Will Never Do",
  "## Open Decisions — All in One Place",
  "## When Things Change",
  "**Where its results live in Notion.**",
];

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

// 3. No routing string left behind by Automation Builder's recipes, anywhere.
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

// 4. Every reference link a skill points at resolves to a real file.
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

// 5. The portal lesson's invocation phrase, character for character.
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
  `Validated AI Strategist across ${SKILLS.length} skills: frontmatter, required sections in the two authored skills and the document template, reference links, the portal invocation phrase, and the absence of retired recipe identifiers.\n`,
);
