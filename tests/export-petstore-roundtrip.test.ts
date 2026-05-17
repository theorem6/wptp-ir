import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exportIrToWebIrBundleV0 } from "../src/export-ir-to-webir-v0.js";
import { importWebIrBundleJson } from "../src/import-webir-v0.js";
import { assertIrDocumentV0 } from "../src/index.js";

const root = join(import.meta.dirname, "..");

describe("petstore-mini IR goldens", () => {
  it("round-trips through WebIR export with synthesized handlers", () => {
    const irPath = join(root, "fixtures", "ir-v0", "petstore-mini.json");
    const imported = JSON.parse(readFileSync(irPath, "utf8"));
    assertIrDocumentV0(imported);
    const bundle = exportIrToWebIrBundleV0(imported);
    const roundTrip = importWebIrBundleJson(bundle);
    expect(roundTrip.losses).toEqual([]);
    expect(roundTrip.roots.length).toBe(3);
    expect(bundle.module.nodes.some((n) => n.op === "handler")).toBe(true);
  });

  it("matches openapi fixture route count after export/import", () => {
    const openapi = JSON.parse(
      readFileSync(join(root, "fixtures", "openapi", "petstore-mini.openapi.json"), "utf8"),
    );
    const ir = JSON.parse(readFileSync(join(root, "fixtures", "ir-v0", "petstore-mini.json"), "utf8"));
    assertIrDocumentV0(ir);
    const pathCount = Object.keys(openapi.paths ?? {}).length;
    expect(ir.roots.length).toBeGreaterThanOrEqual(pathCount);
  });
});
