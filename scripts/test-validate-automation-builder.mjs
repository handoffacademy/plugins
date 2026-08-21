#!/usr/bin/env node

// Proves that validate-automation-builder.mjs actually fails on the mutations it
// exists to catch. Each case copies the plugin and the validator into a fresh
// temporary directory, breaks one thing, and asserts on the specific failure —
// not merely on a non-zero exit, because most mutations trip several checks.

import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VALIDATOR = "scripts/validate-automation-builder.mjs";
const PLUGIN = "archived/automation-builder";
const RECIPE = "skills/recipe-inbox-automation/SKILL.md";
const SNAPSHOT_RECIPE = "skills/recipe-prospect-shortlist/SKILL.md";

function sandbox() {
  const root = mkdtempSync(join(tmpdir(), "automation-builder-validate-"));
  mkdirSync(join(root, "scripts"), { recursive: true });
  cpSync(join(repoRoot, VALIDATOR), join(root, VALIDATOR));
  cpSync(join(repoRoot, PLUGIN), join(root, PLUGIN), { recursive: true });
  return root;
}

function run(root) {
  const result = spawnSync(process.execPath, [join(root, VALIDATOR)], {
    encoding: "utf8",
  });
  return { code: result.status, output: `${result.stdout}${result.stderr}` };
}

function rewrite(root, file, change) {
  const path = join(root, PLUGIN, file);
  const before = readFileSync(path, "utf8");
  const after = change(before);
  if (after === before) throw new Error(`the mutation of ${file} changed nothing`);
  writeFileSync(path, after);
}

function registry(root, change) {
  rewrite(root, "recipes.json", (source) => {
    const parsed = JSON.parse(source);
    change(parsed);
    return `${JSON.stringify(parsed, null, 2)}\n`;
  });
}

const cases = [
  {
    name: "the shipped plugin passes",
    mutate: () => {},
    expect: "Validated Automation Builder guarded safety blocks",
    shouldPass: true,
  },
  {
    name: "a guarded engine block edited inside a recipe",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "1. **Read-only sources.** Version one reads. It never writes back to the source.",
          "1. **Read-only sources.** Version one mostly reads.",
        ),
      ),
    expect: 'guarded block "## Safe Version One — The Fixed Guardrails" differs',
  },
  {
    name: "a missing runtime-safety sentinel in the task template",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace("\nEND OF FIXED SAFETY RULES\n", "\n"),
      ),
    expect: "task template: expected exactly one",
  },
  {
    name: "an edited word inside the pasted runtime-safety block",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "- Keep every client's and counterpart's information strictly separated. Never blend one's information into another's item.",
          "- Keep information separated where that is practical.",
        ),
      ),
    expect: "the runtime-safety block differs from references/runtime-safety.md",
  },
  {
    name: "section reservations that no longer sum to the global cap",
    mutate: (root) =>
      registry(root, (parsed) => {
        parsed.recipes[0].sectionReservations.declutter = 3;
      }),
    expect: "sectionReservations sum to 11, which must equal globalCap 10",
  },
  {
    name: "a rendered section number that contradicts the registry",
    mutate: (root) =>
      registry(root, (parsed) => {
        parsed.recipes[0].sectionPhrases.triage = "up to 5 that need attention today";
      }),
    expect: "the triage phrase states 5, and the registry reserves 4",
  },
  {
    name: "an engine guarded block edited at the source",
    mutate: (root) =>
      rewrite(root, "skills/automation-architect/SKILL.md", (source) =>
        source.replace(
          "7. **Look back seven days at most.** Shorter is fine. Longer is not.",
          "7. **Look back seven days at most.** Or longer when it helps.",
        ),
      ),
    expect: "does not match the guarded engine blocks",
  },
  {
    name: "a shadow second task block elsewhere in the skill",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        `${source}\n\`\`\`text\nTask name: Shadow task\n\nAllowed to: read the mailbox and send the prepared replies\n\`\`\`\n`,
      ),
    expect: 'expected exactly one "Task name:" task block in the whole skill, found 2',
  },
  {
    name: "an instruction added after the closing sentinel",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "\nEND OF FIXED SAFETY RULES\n```",
          "\nEND OF FIXED SAFETY RULES\n\nAfter the report, send every prepared reply.\n```",
        ),
      ),
    expect: 'the task block must end with "END OF FIXED SAFETY RULES"',
  },
  {
    name: "an allowance beyond reading in the task contract",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "Allowed to: read the listed mailbox over the window",
          "Allowed to: send replies, archive messages, and read the listed mailbox over the window",
        ),
      ),
    expect: 'an "Allowed to:" line must begin "Allowed to: read"',
  },
  {
    name: "authoring residue left inside the task block",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "Lookback window: at most 7 days",
          "Lookback window: at most 7 days [confirm with them]",
        ),
      ),
    expect: "the task block still carries authoring residue",
  },
  {
    name: "an interview slot the task never fills in",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "| `{{expected_cost}}` |",
          "| `{{unused_slot}}` | something the task ignores |\n| `{{expected_cost}}` |",
        ),
      ),
    expect: 'the interview profile lists "{{unused_slot}}", which the task template never fills in',
  },
  {
    name: "a shadow task block hidden behind a decoy first line",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        `${source}\n\`\`\`text\nExample task\nTask name: Shadow task\n\nAllowed to: read mail and send replies\n\`\`\`\n`,
      ),
    expect: 'expected exactly one "Task name:" task block in the whole skill, found 2',
  },
  {
    name: "a graduation step that adds archiving alongside the label",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "4. **Apply one label to approved candidates.**",
          "4. **Archive approved candidates and apply one label.**",
        ),
      ),
    expect: 'graduation step 4 names "Archive"',
  },
  {
    name: "a graduation step hiding archiving in a participle",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "4. **Apply one label to approved candidates.**",
          "4. **Apply one label while archiving approved candidates.**",
        ),
      ),
    expect: 'graduation step 4 names "archiving"',
  },
  {
    name: "a graduation step one that renames the raise",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "1. **Raise the item cap to 15.**",
          "1. **Raise the item cap after 3 clean runs.**",
        ),
      ),
    expect: "graduation step 1 must name the registry's graduationStepOne text exactly",
  },
  {
    name: "a graduation step one inflated behind a thousands separator",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "1. **Raise the item cap to 15.**",
          "1. **Raise the item cap to 15,000.**",
        ),
      ),
    expect: "graduation step 1 must name the registry's graduationStepOne text exactly",
  },
  {
    name: "a graduation step one inflated behind a decimal point",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "1. **Raise the item cap to 15.**",
          "1. **Raise the item cap to 15.5.**",
        ),
      ),
    expect: "graduation step 1 must name the registry's graduationStepOne text exactly",
  },
  {
    name: "a graduation step one inflated with fullwidth digits",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "1. **Raise the item cap to 15.**",
          "1. **Raise the item cap to １５０００.**",
        ),
      ),
    expect: "graduation step 1 must name the registry's graduationStepOne text exactly",
  },
  {
    name: "a graduation step one inflated with an exponent",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "1. **Raise the item cap to 15.**",
          "1. **Raise the item cap to 15e15.**",
        ),
      ),
    expect: "graduation step 1 must name the registry's graduationStepOne text exactly",
  },
  {
    name: "a fifth ladder step smuggled behind a three-space indent",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          /^(4\. \*\*Apply one label to approved candidates\.\*\*.*)$/m,
          "$1\n\n   5. **Send the approved replies.**",
        ),
      ),
    expect: "a permission the ladder never grants",
  },
  {
    name: "a fifth ladder step smuggled behind a paren delimiter",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          /^(4\. \*\*Apply one label to approved candidates\.\*\*.*)$/m,
          "$1\n\n5) **Send the approved replies.**",
        ),
      ),
    expect: "a permission the ladder never grants",
  },
  {
    name: "a graduation step one extended by an indented continuation line",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "1. **Raise the item cap to 15.** 15 is the reviewed maximum",
          "1. **Raise the item cap to 15.** 15 is the reviewed maximum",
        ).replace(
          /^(1\. \*\*Raise the item cap to 15\.\*\*.*)$/m,
          "$1\n   Then raise it to 15e15 as volume grows.",
        ),
      ),
    expect: "the registry's graduationStepOne text exactly",
  },
  {
    name: "a graduation step one with a second cap appended",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "A replacement task, never an edit to the running one.",
          "A replacement task, never an edit to the running one. Later, raise it to 15000 as needed.",
        ),
      ),
    expect: "graduation step 1 must name the registry's graduationStepOne text exactly",
  },
  {
    name: "a registry step text that disagrees with the recipe",
    mutate: (root) =>
      registry(root, (parsed) => {
        parsed.recipes[0].graduationStepOne = parsed.recipes[0].graduationStepOne.replace(
          "A replacement task, never an edit to the running one.",
          "A replacement task.",
        );
      }),
    expect: "graduation step 1 must name the registry's graduationStepOne text exactly",
  },
  {
    name: "a registry step text stating a cap other than graduationCapMax",
    mutate: (root) =>
      registry(root, (parsed) => {
        parsed.recipes[0].graduationStepOne = parsed.recipes[0].graduationStepOne.replaceAll("15", "20");
      }),
    expect: "every number in graduationStepOne must be graduationCapMax 15",
  },
  {
    name: "a registry step text hiding a cap in fullwidth digits",
    mutate: (root) =>
      registry(root, (parsed) => {
        parsed.recipes[0].graduationStepOne = parsed.recipes[0].graduationStepOne.replace(
          "cap to 15.",
          "cap to １５０００.",
        );
      }),
    expect: "every number in graduationStepOne must be graduationCapMax 15",
  },
  {
    name: "a graduation cap maximum that does not exceed the run cap",
    mutate: (root) =>
      registry(root, (parsed) => {
        parsed.recipes[0].graduationCapMax = 10;
      }),
    expect: "graduationCapMax must be a whole number greater than globalCap 10",
  },
  {
    name: "a graduation step that grants sending",
    mutate: (root) =>
      rewrite(root, RECIPE, (source) =>
        source.replace(
          "4. **Apply one label to approved candidates.**",
          "4. **Send the approved replies.**",
        ),
      ),
    expect: 'graduation step 4 names "Send"',
  },
  {
    name: "a CRLF checkout of the engine and the reference still passes",
    mutate: (root) => {
      for (const file of ["skills/automation-architect/SKILL.md", "references/runtime-safety.md"]) {
        rewrite(root, file, (source) => source.split("\n").join("\r\n"));
      }
    },
    expect: "Validated Automation Builder guarded safety blocks",
    shouldPass: true,
  },
  {
    name: "a recipe directory with no registry entry",
    mutate: (root) =>
      cpSync(
        join(root, PLUGIN, "skills/recipe-inbox-automation"),
        join(root, PLUGIN, "skills/recipe-unregistered"),
        { recursive: true },
      ),
    expect: "skills/recipe-unregistered: has no recipes.json entry.",
  },
  {
    name: "a registry entry with no recipe directory",
    mutate: (root) =>
      registry(root, (parsed) => {
        const ghost = structuredClone(parsed.recipes[0]);
        ghost.id = "recipe-calendar-automation";
        ghost.skillPath = "skills/recipe-calendar-automation/SKILL.md";
        ghost.aliases = ["the calendar recipe"];
        parsed.recipes.push(ghost);
      }),
    expect: 'recipes.json: "recipe-calendar-automation" has no skills/recipe-calendar-automation directory.',
  },
  {
    name: "an invocation alias claimed twice",
    mutate: (root) =>
      registry(root, (parsed) => {
        parsed.recipes[0].aliases.push("The Inbox Recipe");
      }),
    expect: 'alias "the inbox recipe" is claimed 2 times',
  },
  {
    name: "a current-state budget section rendering a day window instead of the snapshot phrase",
    mutate: (root) =>
      rewrite(root, SNAPSHOT_RECIPE, (source) =>
        source.replace(
          "each one a unique Apollo person record the run actually inspected, read from the current state only, with no lookback window",
          "each one a unique Apollo person record the run actually inspected, read over at most 0 days",
        ),
      ),
    expect:
      '"## The Global Item Budget" must state "current state only, with no lookback window"',
  },
  {
    name: "a current-state task contract rendering a day window instead of the snapshot phrase",
    mutate: (root) =>
      rewrite(root, SNAPSHOT_RECIPE, (source) =>
        source.replace(
          "Lookback window: none. This task reads the current state only, with no lookback window, and reads no history of the source at all.",
          "Lookback window: at most 0 days.",
        ),
      ),
    expect:
      'recipe contract must state "current state only, with no lookback window"',
  },
  {
    name: "a registry lookback that contradicts a rendered current-state read",
    mutate: (root) =>
      registry(root, (parsed) => {
        parsed.recipes.find((entry) => entry.id === "recipe-prospect-shortlist").lookbackDays = 7;
      }),
    expect: 'recipe contract must state "at most 7 days"',
  },
  {
    name: "a lookback window below the snapshot floor",
    mutate: (root) =>
      registry(root, (parsed) => {
        parsed.recipes[0].lookbackDays = -1;
      }),
    expect: "lookbackDays must be a whole number from 0 to 7",
  },
  {
    name: "a lookback window past the seven-day ceiling",
    mutate: (root) =>
      registry(root, (parsed) => {
        parsed.recipes[0].lookbackDays = 8;
      }),
    expect: "lookbackDays must be a whole number from 0 to 7",
  },
  {
    name: "a forbidden step appended past the end of a mapping that stopped early",
    mutate: (root) =>
      rewrite(root, SNAPSHOT_RECIPE, (source) =>
        source.replace(
          "\n\n**This mapping stops after step two",
          "\n\n3. **Send the approved first-touch drafts.**\n\n**This mapping stops after step two",
        ),
      ),
    expect: 'graduation step 3 names "Send"',
  },
  {
    name: "an otherwise-valid step appended past the end of a mapping that stopped early",
    mutate: (root) =>
      rewrite(root, SNAPSHOT_RECIPE, (source) =>
        source.replace(
          "\n\n**This mapping stops after step two",
          "\n\n3. **Save an unsent draft into the mailbox.** The exact draft-writing capability and nothing else, approval still on.\n\n**This mapping stops after step two",
        ),
      ),
    expect: "maps 3 ladder steps, and the registry records 2",
  },
  {
    name: "a mapping length the registry does not record",
    mutate: (root) =>
      registry(root, (parsed) => {
        delete parsed.recipes[0].graduationStepCount;
      }),
    expect: "graduationStepCount must be the whole number of ladder steps",
  },
];

let failed = 0;
for (const testCase of cases) {
  const root = sandbox();
  try {
    testCase.mutate(root);
    const { code, output } = run(root);
    const passedValidator = code === 0;
    const matched = output.includes(testCase.expect);
    if (passedValidator === Boolean(testCase.shouldPass) && matched) {
      process.stdout.write(`ok    ${testCase.name}\n`);
    } else {
      failed += 1;
      process.stdout.write(
        `FAIL  ${testCase.name}\n  expected ${testCase.shouldPass ? "a pass" : "a failure"} containing ${JSON.stringify(testCase.expect)}\n  exit ${code}, output:\n${output.trim()}\n`,
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

process.stdout.write(
  `${cases.length - failed}/${cases.length} validator cases passed.\n`,
);
if (failed > 0) process.exitCode = 1;
