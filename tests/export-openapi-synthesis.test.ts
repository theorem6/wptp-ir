import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exportIrToWebIrBundleV0 } from "../src/export-ir-to-webir-v0.js";
import { IR_V0_SCHEMA_VERSION } from "../src/types.js";

const root = join(import.meta.dirname, "..");

function importPetstoreMini(openapi: { paths: Record<string, Record<string, unknown>> }) {
  const nodes: Array<{
    id: string;
    layer: "request";
    op: "route";
    valueType: { kind: "void" };
    effects: [];
    operandIds: [];
    attrs: { path: string; method: string; operationId?: string };
    provenance: [{ source: string; reason: string; locator: unknown }];
  }> = [];
  const roots: string[] = [];
  let n = 0;
  for (const [path, pathItem] of Object.entries(openapi.paths)) {
    for (const m of ["get", "post"] as const) {
      const op = pathItem[m];
      if (!op || typeof op !== "object") continue;
      const id = `route-${n++}`;
      roots.push(id);
      nodes.push({
        id,
        layer: "request",
        op: "route",
        valueType: { kind: "void" },
        effects: [],
        operandIds: [],
        attrs: {
          path,
          method: m.toUpperCase(),
          operationId: typeof (op as { operationId?: string }).operationId === "string"
            ? (op as { operationId: string }).operationId
            : undefined,
        },
        provenance: [
          { source: "openapi-contract", reason: `${m.toUpperCase()} ${path}`, locator: { kind: "openapi", path, method: m } },
        ],
      });
    }
  }
  return { schemaVersion: IR_V0_SCHEMA_VERSION, meta: { sourceApp: "petstore-mini", importedFrom: "openapi@3" }, roots, nodes, losses: [] };
}

describe("export synthesizes handlers for OpenAPI routes", () => {
  it("adds handler and literal nodes for petstore-mini", () => {
    const openapi = JSON.parse(
      readFileSync(join(root, "fixtures", "openapi", "petstore-mini.openapi.json"), "utf8"),
    );
    const bundle = exportIrToWebIrBundleV0(importPetstoreMini(openapi));
    expect(bundle.module.nodes.length).toBe(9);
    const routes = bundle.module.nodes.filter((n) => n.dialect === "web.request" && n.op === "route");
    expect(routes).toHaveLength(3);
    for (const route of routes) {
      expect(route.operands).toHaveLength(1);
    }
    expect(bundle.module.nodes.some((n) => n.op === "handler" && n.attrs.name === "listPets")).toBe(true);
  });
});
