import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { importWebIrBundleJson } from "../src/index.js";

const root = join(import.meta.dirname, "..");

describe("import golden parity", () => {
  const cases = [
    ["minimal-literal", "minimal-literal"],
    ["minimal-route", "minimal-route"],
    ["minimal-db-effect", "minimal-db-effect"],
    ["unsupported-dialect", "unsupported-dialect"],
  ] as const;

  for (const [bundleStem, irStem] of cases) {
    it(`${bundleStem} matches committed IR golden`, () => {
      const bundle = JSON.parse(
        readFileSync(join(root, "fixtures", "webir", `${bundleStem}.webir.bundle.json`), "utf8"),
      );
      const expected = JSON.parse(
        readFileSync(join(root, "fixtures", "ir-v0", `${irStem}.json`), "utf8"),
      );
      const actual = importWebIrBundleJson(bundle);
      expect(actual).toEqual(expected);
    });
  }
});
