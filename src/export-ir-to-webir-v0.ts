import type { IrDocumentV0, IrLayer, IrNodeV0, WebIrBundleV1 } from "./types.js";

export interface ExportIrToWebIrOptions {
  /** When true (default), route nodes without handlers get bronze stub handler bodies. */
  readonly synthesizeRouteHandlers?: boolean;
}

function dialectForLayer(layer: IrLayer): string {
  if (layer === "request") return "web.request";
  if (layer === "effect") return "effect";
  if (layer === "value") return "data";
  throw new Error(`export: unsupported layer ${layer}`);
}

function parsePathParams(path: string): ReadonlyArray<{ readonly name: string }> {
  const out: { name: string }[] = [];
  for (const m of path.matchAll(/\{([^}]+)\}/g)) {
    out.push({ name: m[1]! });
  }
  return out;
}

function syntheticOrigin(node: IrNodeV0): { kind: "synthetic"; reason: string } {
  const loc = node.provenance[0]?.locator;
  if (loc && typeof loc === "object" && "kind" in loc) {
    const k = (loc as { kind: string }).kind;
    if (k === "openapi" && "path" in loc && "method" in loc) {
      return { kind: "synthetic", reason: `openapi:${String((loc as { method: string }).method)} ${String((loc as { path: string }).path)}` };
    }
    if (k === "har" && "url" in loc) {
      return { kind: "synthetic", reason: `har:${String((loc as { url: string }).url)}` };
    }
  }
  return { kind: "synthetic", reason: `wptp-ir:${node.id}` };
}

function handlerNameForRoute(route: IrNodeV0): string {
  const op = route.attrs.operationId;
  if (typeof op === "string" && op.trim()) return op.trim();
  const method = typeof route.attrs.method === "string" ? route.attrs.method.toLowerCase() : "get";
  const path = typeof route.attrs.path === "string" ? route.attrs.path : "/";
  const slug = path
    .replace(/^\//, "")
    .replace(/\{[^}]+\}/g, "by-id")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return slug ? `${method}_${slug}` : method;
}

function synthesizeRouteHandlers(doc: IrDocumentV0): IrNodeV0[] {
  const extra: IrNodeV0[] = [];
  const patched: IrNodeV0[] = [];

  for (const node of doc.nodes) {
    if (node.layer !== "request" || node.op !== "route" || node.operandIds.length > 0) {
      patched.push(node);
      continue;
    }
    const path = typeof node.attrs.path === "string" ? node.attrs.path : "/";
    const method = typeof node.attrs.method === "string" ? node.attrs.method : "GET";
    const pathParams = parsePathParams(path);
    const handlerId = `${node.id}-handler`;
    const bodyId = `${node.id}-body`;
    const origin = syntheticOrigin(node);
    const name = handlerNameForRoute(node);

    patched.push({
      ...node,
      operandIds: [handlerId],
      attrs: { ...node.attrs, path, method, pathParams },
    });

    extra.push(
      {
        id: handlerId,
        layer: "request",
        op: "handler",
        valueType: { kind: "named", name: "Response" },
        effects: [],
        operandIds: [bodyId],
        attrs: { name },
        provenance: [
          {
            source: "hand-authored",
            reason: "bronze stub handler for contract-only route",
            locator: { kind: "synthetic", reason: `handler:${name}` },
          },
        ],
      },
      {
        id: bodyId,
        layer: "value",
        op: "literal",
        valueType: { kind: "string" },
        effects: [],
        operandIds: [],
        attrs: { value: JSON.stringify({ ok: true, route: path, method }) },
        provenance: [
          {
            source: "hand-authored",
            reason: "bronze stub response body",
            locator: { kind: "synthetic", reason: `body:${name}` },
          },
        ],
      },
    );
  }

  return [...patched, ...extra];
}

function irNodeToWebIr(node: IrNodeV0): WebIrBundleV1["module"]["nodes"][number] {
  const dialect = node.webir?.dialect ?? dialectForLayer(node.layer);
  const op = node.webir?.op ?? node.op;
  const id = node.webir?.nodeId ?? node.id;
  const path = typeof node.attrs.path === "string" ? node.attrs.path : undefined;
  const restAttrs: Record<string, unknown> = { ...node.attrs };
  if (node.layer === "request" && node.op === "route" && path) {
    restAttrs.pathParams =
      Array.isArray(node.attrs.pathParams) && node.attrs.pathParams.length > 0
        ? node.attrs.pathParams
        : parsePathParams(path);
  }
  return {
    id,
    dialect,
    op,
    type: node.valueType,
    effects: [...node.effects],
    operands: [...node.operandIds],
    attrs: restAttrs as Readonly<Record<string, unknown>>,
    origin: syntheticOrigin(node),
    provenance: node.provenance.map((p) => ({
      source: "hand-authored",
      reason: p.reason,
      locator: syntheticOrigin(node),
    })),
  };
}

/**
 * Export IR v0 to a Chrysalis WebIR bundle (bronze reverse lift).
 * Contract-only routes (OpenAPI/HAR) can synthesize stub handler subgraphs for emit backends.
 */
export function exportIrToWebIrBundleV0(
  doc: IrDocumentV0,
  options: ExportIrToWebIrOptions = {},
): WebIrBundleV1 {
  const synthesize = options.synthesizeRouteHandlers !== false;
  const nodes = synthesize ? synthesizeRouteHandlers(doc) : [...doc.nodes];
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
      nodes: nodes.map(irNodeToWebIr),
    },
  };
}

export function exportIrToWebIrBundleJson(
  doc: IrDocumentV0,
  options?: ExportIrToWebIrOptions,
): string {
  return JSON.stringify(exportIrToWebIrBundleV0(doc, options), null, 2);
}
