import type { IrDocumentV0, IrLayer, IrNodeV0, WebIrBundleV1 } from "./types.js";

function dialectForLayer(layer: IrLayer): string {
  if (layer === "request") return "web.request";
  if (layer === "effect") return "effect";
  if (layer === "value") return "data";
  throw new Error(`export: unsupported layer ${layer}`);
}

function irNodeToWebIr(node: IrNodeV0): WebIrBundleV1["module"]["nodes"][number] {
  const dialect = node.webir?.dialect ?? dialectForLayer(node.layer);
  const op = node.webir?.op ?? node.op;
  const id = node.webir?.nodeId ?? node.id;
  const { origin, ...attrs } = node.attrs;
  return {
    id,
    dialect,
    op,
    type: node.valueType,
    effects: [...node.effects],
    operands: [...node.operandIds],
    attrs,
    origin: origin ?? null,
    provenance: node.provenance.map((p) => ({
      source: p.source,
      reason: p.reason,
      locator: p.locator,
    })),
  };
}

/**
 * Export IR v0 to a Chrysalis WebIR bundle (bronze reverse lift).
 * Nodes without `webir` metadata are mapped from `layer` → dialect; round-trip is lossless
 * only when the document originated from WebIR import or uses the same layer/op conventions.
 */
export function exportIrToWebIrBundleV0(doc: IrDocumentV0): WebIrBundleV1 {
  const createdAt = doc.meta.createdAt ?? new Date(0).toISOString();
  return {
    format: "chrysalis.webir.bundle",
    bundleVersion: "1.0.0",
    module: {
      meta: {
        sourceApp: doc.meta.sourceApp,
        createdAt,
        chrysalisVersion: doc.meta.chrysalisVersion ?? "wptp-ir-export",
      },
      roots: [...doc.roots],
      nodes: doc.nodes.map(irNodeToWebIr),
    },
  };
}

export function exportIrToWebIrBundleJson(doc: IrDocumentV0): string {
  return JSON.stringify(exportIrToWebIrBundleV0(doc), null, 2);
}
