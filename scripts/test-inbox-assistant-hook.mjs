#!/usr/bin/env node

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = join(repoRoot, "archived", "inbox-assistant");
const hookConfig = join(pluginRoot, "hooks", "hooks.json");
const manifest = JSON.parse(
  readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf8"),
);

assert.equal(
  existsSync(hookConfig),
  false,
  "Inbox Assistant must not register hooks that intercept unrelated Claude Code tools",
);
assert.equal(
  Object.hasOwn(manifest, "hooks"),
  false,
  "Inbox Assistant manifest must not declare hooks",
);

process.stdout.write(
  "Verified Inbox Assistant registers no Claude Code hooks.\n",
);
