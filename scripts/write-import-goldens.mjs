import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { importWebIrBundleJson } from "../src/import-webir-v0.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const webirDir = join(root, "fixtures", "webir");
const irDir = join(root, "fixtures", "ir-v0");

for (const f of readdirSync(webirDir)) {
  if (!f.endsWith(".webir.bundle.json")) continue;
  const stem = f.replace(".webir.bundle.json", "");
  const bundle = JSON.parse(readFileSync(join(webirDir, f), "utf8"));
  const doc = importWebIrBundleJson(bundle);
  writeFileSync(join(irDir, `${stem}.json`), `${JSON.stringify(doc, null, 2)}\n`);
}

console.log(`Wrote ${readdirSync(irDir).filter((x) => x.endsWith(".json")).length} files under fixtures/ir-v0/`);
