#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = join(repoRoot, "plugins", "inbox-assistant");
const allowTag = "terminology-allow";
const commandNames = [
  "organize",
  "pause",
  "schedule",
  "setup",
  "status",
  "test",
  "tune",
];
const checks = [
  { label: "retired “routine” wording", pattern: /\broutines?\b/i },
  {
    label: "gendered pronoun",
    pattern: /\b(she|her|hers|herself|he|him|his|himself)\b/i,
  },
];

const vendoredSections = new Map([
  ["skills/stop-slop/SKILL.md", ["## Source", "## In this plugin"]],
  [
    "skills/humanizer/SKILL.md",
    [
      "### Where the sample comes from in this plugin",
      "## In this plugin",
      "## Source",
    ],
  ],
]);

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return files(path);
    if (
      !entry.isFile() ||
      (!entry.name.endsWith(".md") && !entry.name.endsWith(".json"))
    )
      return [];
    return [path];
  });
}

function localSections(source, headings) {
  const lines = source.split("\n");
  const selected = [];
  for (const heading of headings) {
    const start = lines.findIndex((line) => line.trim() === heading);
    if (start === -1)
      throw new Error(`Missing locally-authored section “${heading}”.`);
    const level = heading.match(/^#+/)?.[0].length ?? 1;
    let end = lines.length;
    for (let index = start + 1; index < lines.length; index += 1) {
      const nextLevel = lines[index].match(/^(#+)\s/)?.[1].length;
      if (nextLevel && nextLevel <= level) {
        end = index;
        break;
      }
    }
    selected.push(...lines.slice(start, end));
  }
  return selected.join("\n");
}

const failures = [];
for (const path of files(pluginRoot)) {
  const name = relative(pluginRoot, path);
  const source = readFileSync(path, "utf8");
  const scanned = vendoredSections.has(name)
    ? localSections(source, vendoredSections.get(name))
    : source;
  const lines = scanned.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.includes(allowTag)) continue;
    for (const check of checks) {
      if (check.pattern.test(line))
        failures.push(`${name}:${index + 1}: ${check.label}: ${line.trim()}`);
    }
    if (
      name !== "CHANGELOG.md" &&
      /\/moai-chief-of-staff:[a-z-]+/i.test(line)
    ) {
      failures.push(
        `${name}:${index + 1}: retired command namespace: ${line.trim()}`,
      );
    }
  }
}

for (const command of commandNames) {
  const adapter = join(
    pluginRoot,
    "skills",
    `inbox-assistant-${command}`,
    "SKILL.md",
  );
  let source;
  try {
    source = readFileSync(adapter, "utf8");
  } catch {
    failures.push(`Missing Codex adapter for command "${command}".`);
    continue;
  }
  if (!source.includes(`../../commands/${command}.md`)) {
    failures.push(
      `Codex adapter "${command}" must delegate to commands/${command}.md.`,
    );
  }
  if (!source.includes("../../references/codex-compatibility.md")) {
    failures.push(
      `Codex adapter "${command}" must load codex-compatibility.md.`,
    );
  }
  if (source.includes("[TODO:")) {
    failures.push(
      `Codex adapter "${command}" still contains a TODO placeholder.`,
    );
  }
}

const commandFiles = readdirSync(join(pluginRoot, "commands"))
  .filter((name) => name.endsWith(".md"))
  .map((name) => name.slice(0, -3))
  .sort();
if (JSON.stringify(commandFiles) !== JSON.stringify(commandNames)) {
  failures.push(
    `commands/: expected ${commandNames.join(", ")}; found ${commandFiles.join(", ") || "(none)"}`,
  );
}

const scheduleSource = readFileSync(
  join(pluginRoot, "commands", "schedule.md"),
  "utf8",
);
for (const phrase of [
  "Automatically approve (Auto)",
  "Do not choose Skip all approvals",
  "one final confirmation",
  "Pro and Max",
  "Team and Enterprise",
]) {
  if (!scheduleSource.includes(phrase)) {
    failures.push(
      `commands/schedule.md: missing streamlined approval guidance: ${phrase}`,
    );
  }
}

const setupSource = readFileSync(
  join(pluginRoot, "commands", "setup.md"),
  "utf8",
);
for (const phrase of [
  "The owner sees one setup product: a read-only Inbox Assistant",
  "Do not present Stage 2, action IDs, organization plans, or operating modes during first-run setup",
  "first Daily Brief",
]) {
  if (!setupSource.includes(phrase)) {
    failures.push(`commands/setup.md: missing simplified setup policy: ${phrase}`);
  }
}
if (/^argument-hint:.*stage-1.*stage-2/m.test(setupSource)) {
  failures.push("commands/setup.md: stage arguments must not be advertised during first-run setup");
}

const organizeSource = readFileSync(
  join(pluginRoot, "commands", "organize.md"),
  "utf8",
);
for (const phrase of [
  "audit | preview | apply",
  "Nothing changes during audit or preview",
  "Selecting a plan is not authorization",
  "recommend exactly one plan",
  "Show alternatives only if the owner asks",
  "Delete candidates stay separate",
  "two tasks per successful Zapier MCP tool call",
]) {
  if (!organizeSource.includes(phrase)) {
    failures.push(`commands/organize.md: missing organization policy: ${phrase}`);
  }
}

const connectorSource = readFileSync(
  join(pluginRoot, "references", "connector-matrix.md"),
  "utf8",
);
for (const phrase of [
  "portable action layer",
  "Native write tools exist",
  "Zapier remains this plugin's only write route",
]) {
  if (!connectorSource.includes(phrase)) {
    failures.push(`references/connector-matrix.md: missing current connector doctrine: ${phrase}`);
  }
}

if (failures.length > 0) {
  throw new Error(
    `Inbox Assistant content validation failed:\n${failures.join("\n")}`,
  );
}

process.stdout.write(
  "Validated Inbox Assistant terminology, Claude commands, Codex adapters, and neutral language.\n",
);
