// Download a file over HTTPS: node fetch.mjs <url> <destination>
// Used for the practice clip and for Google Fonts files during brand setup. Follows redirects; works on Mac and Windows.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { args, fail } from "./lib.mjs";

const { positional: [url, dest] } = args("node fetch.mjs <url> <destination>", 2);
if (!/^https:\/\//.test(url)) fail("only https links");
const res = await fetch(url, { redirect: "follow" });
if (!res.ok) fail(`download failed: ${res.status} ${res.statusText}`);
const buf = Buffer.from(await res.arrayBuffer());
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, buf);
console.log(`saved ${dest} (${(buf.length / 1e6).toFixed(1)} MB)`);
