import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertIrDocumentV0,
  importWebIrBundleJson,
  summarizeLosses,
} from "../src/index.js";

const root = join(import.meta.dirname, "..");
const webirDir = join(root, "fixtures", "webir");

function loadJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("WebIR bundle import", () => {
  for (const name of readdirSync(webirDir).filter((f) => f.endsWith(".webir.bundle.json"))) {
    it(`imports ${name} without throwing`, () => {
      const doc = importWebIrBundleJson(loadJson(join(webirDir, name)));
      assertIrDocumentV0(doc);
      expect(doc.schemaVersion).toBe("0.1.0");
    });
  }

  it("maps route/handler/data/effect layers", () => {
    const doc = importWebIrBundleJson(loadJson(join(webirDir, "minimal-route.webir.bundle.json")));
    const layers = new Set(doc.nodes.map((n) => n.layer));
    expect(layers.has("request")).toBe(true);
    expect(layers.has("value")).toBe(true);
  });

  it("records losses for unsupported dialect", () => {
    const doc = importWebIrBundleJson(loadJson(join(webirDir, "unsupported-dialect.webir.bundle.json")));
    const s = summarizeLosses(doc);
    expect(s.lossCount).toBeGreaterThan(0);
    expect(s.importedNodes).toBe(0);
  });
});
