import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertIrDocumentV0 } from "../src/index.js";

const irDir = join(import.meta.dirname, "..", "fixtures", "ir-v0");

describe("IR v0 golden fixtures", () => {
  const files = readdirSync(irDir).filter((f) => f.endsWith(".json"));

  it("has at least ten committed goldens", () => {
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  for (const name of files) {
    it(`validates ${name}`, () => {
      const doc = JSON.parse(readFileSync(join(irDir, name), "utf8"));
      assertIrDocumentV0(doc);
    });
  }
});
