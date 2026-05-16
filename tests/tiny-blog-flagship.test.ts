import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertIrDocumentV0, importWebIrBundleJson, summarizeLosses } from "../src/index.js";

const bundlePath = join(import.meta.dirname, "..", "fixtures", "webir", "tiny-blog.webir.bundle.json");

describe("Chrysalis tiny-blog flagship bundle", () => {
  it("imports all 325 WebIR nodes with zero losses", () => {
    const doc = importWebIrBundleJson(JSON.parse(readFileSync(bundlePath, "utf8")));
    assertIrDocumentV0(doc);
    const s = summarizeLosses(doc);
    expect(s.importedNodes).toBe(325);
    expect(s.lossCount).toBe(0);
    expect(doc.meta.sourceApp).toBe("tiny-blog");
    expect(doc.roots.length).toBe(5);
  });
});
