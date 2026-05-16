import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exportIrToWebIrBundleV0 } from "../src/export-ir-to-webir-v0.js";
import { importWebIrBundleJson } from "../src/import-webir-v0.js";

const root = join(import.meta.dirname, "..");

describe("IR v0 → WebIR bundle export", () => {
  it("round-trips minimal-route with zero losses", () => {
    const bundlePath = join(root, "fixtures", "webir", "minimal-route.webir.bundle.json");
    const imported = importWebIrBundleJson(JSON.parse(readFileSync(bundlePath, "utf8")));
    const exported = exportIrToWebIrBundleV0(imported, { synthesizeRouteHandlers: false });
    const roundTrip = importWebIrBundleJson(exported);
    expect(roundTrip.losses).toEqual([]);
    expect(roundTrip.nodes.length).toBe(imported.nodes.length);
    expect(roundTrip.roots).toEqual(imported.roots);
  });
});
