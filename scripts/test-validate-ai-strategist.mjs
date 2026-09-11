#!/usr/bin/env node

// Exercise the shipped content contracts in temporary copies. These tests check
// omissions and regressions, not the quality of a model's future conversations.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const validator = "scripts/validate-ai-strategist.mjs";
const plugin = "plugins/ai-strategist";
const skill = "skills/hub-strategy/SKILL.md";
const page = "references/hub-strategy-page.html";
const template = "references/hub-strategy-template.md";

function change(file, before, after) {
  return (root) => {
    const path = join(root, plugin, file);
    const source = readFileSync(path, "utf8");
    assert.ok(source.includes(before), `Mutation target missing: ${before}`);
    writeFileSync(path, source.replace(before, after));
  };
}

const cases = [
  ["shipped content passes", () => {}, null],
  ["answered-topic reuse cannot disappear", change(skill,
    "One answer may cover several topics; skip every topic already answered.",
    "Ask every topic again."), "missing adaptive handoff invariant"],
  ["a privacy topic cannot be satisfied elsewhere", change(skill,
    "4. **Separation and shared sources.**", "4. **Other details.**"), "missing the Quick Plan exchange"],
  ["ChatGPT has the same topic coverage", change("chatgpt/SKILL.md",
    "5. **Never list.**", "5. **Preferences.**"), "missing adaptive topic"],
  ["old fixed intake cannot return", change(skill,
    "Use the adaptive topic flow below in both modes.",
    "Use the adaptive topic flow below in both modes. Never batch questions."), "obsolete fixed interview requirement"],
  ["unverified instructions need the missing-context gate", change(skill,
    "and wait before any setup or source access.", "and begin setup."), "missing adaptive handoff invariant"],
  ["draft instructions remain excluded", change("chatgpt/SKILL.md",
    "Drafts, unblocking actions, deferred rows, already-running rows, and built or retired rows get no starter kit.",
    "Every row gets a starter kit."), "missing adaptive handoff invariant"],
  ["Start here must have a real slot", change(page,
    "<!-- slot: next-steps -->", "<!-- next-steps -->"), "next-steps"],
  ["a kit cannot lose its first prompt", change(page,
    '<p class="k">First prompt</p>', '<p class="k">Notes</p>'), "starter-kit fields"],
  ["a kit cannot lose a copyable block", change(page,
    '<pre class="paste" tabindex="0">[the personalized guided first prompt, with known facts and the first result; ask for this project\'s instructions and wait if absent, check capabilities before setup, ask only missing details, stop blocked work, and never author or schedule task text]</pre>',
    ""), "exactly two focusable, nonempty paste blocks"],
  ["starter instructions must carry the fixed floor", change(page,
    "fixed read-allowlist block and canonical never-list floor in full", "the project role"), "starter-kit exemplar missing"],
  ["only the next project starts open", change(page,
    "remove open from every other kit and from all kits when an unblocking action comes first", "leave every kit open"), "starter-kit exemplar missing"],
  ["a kit must remain inside its project card", change(page,
    "    <!-- starter-kit: start -->", "  </li>\n    <!-- starter-kit: start -->"), "starter kit lies outside its project card"],
  ["an action card cannot gain a setup kit", change(page,
    '<p class="step">Step 1 · Unblocking action</p>',
    '<p class="step">Step 1 · Unblocking action</p><details class="starter"><summary>Set up this project</summary></details>'), "Set up this project"],
  ["the content contract cannot omit the expected result", change(template,
    "**What you should get.**", "**Result.**"), "missing starter field"],
  ["unchanged source-access floor remains checked", change(page,
    "Anything not on that list is not yours to do.", "Other useful actions are allowed."), "pasted read allowlist"],
  ["script-free artifact remains checked", change(page,
    "</body>", "<script>void 0</script></body>"), "script"],
];

for (const [name, mutate, failure] of cases) {
  const root = mkdtempSync(join(tmpdir(), "ai-strategist-validation-"));
  try {
    mkdirSync(join(root, "scripts"), { recursive: true });
    cpSync(join(repo, validator), join(root, validator));
    cpSync(join(repo, plugin), join(root, plugin), { recursive: true });
    mutate(root);
    const result = spawnSync(process.execPath, [join(root, validator)], { encoding: "utf8" });
    const output = `${result.stdout}${result.stderr}`;
    if (failure === null) assert.equal(result.status, 0, `${name}: ${output}`);
    else {
      assert.notEqual(result.status, 0, `${name}: unexpectedly passed`);
      assert.ok(output.includes(failure), `${name}: wrong failure: ${output}`);
    }
    process.stdout.write(`PASS ${name}\n`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
process.stdout.write(`Validated ${cases.length} AI Strategist regression cases.\n`);
