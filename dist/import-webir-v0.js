import { IR_V0_SCHEMA_VERSION } from "./types.js";
const SUPPORTED_DIALECTS = new Set(["web.request", "effect", "data"]);
function layerForDialect(dialect) {
    if (dialect === "web.request")
        return "request";
    if (dialect === "effect")
        return "effect";
    if (dialect === "data")
        return "value";
    return null;
}
function mapNode(raw, nodeById) {
    const layer = layerForDialect(raw.dialect);
    if (!layer) {
        return {
            node: null,
            loss: {
                webirNodeId: raw.id,
                dialect: raw.dialect,
                op: raw.op,
                category: "unsupported-dialect",
                reason: `Dialect ${raw.dialect} is not mapped in IR v0 import`,
            },
        };
    }
    for (const oid of raw.operands) {
        if (!nodeById.has(oid)) {
            return {
                node: null,
                loss: {
                    webirNodeId: raw.id,
                    dialect: raw.dialect,
                    op: raw.op,
                    category: "missing-operand",
                    reason: `Operand ${oid} not present in bundle`,
                },
            };
        }
    }
    const provenance = raw.provenance.map((p) => ({
        source: p.source,
        reason: p.reason,
        locator: p.locator,
    }));
    return {
        node: {
            id: raw.id,
            layer,
            op: raw.op,
            valueType: raw.type,
            effects: raw.effects,
            operandIds: [...raw.operands],
            attrs: { ...raw.attrs, origin: raw.origin },
            provenance,
            webir: { dialect: raw.dialect, op: raw.op, nodeId: raw.id },
        },
        loss: null,
    };
}
export function parseWebIrBundleV1(json) {
    if (!json || typeof json !== "object")
        throw new Error("WebIR bundle: expected object");
    const o = json;
    if (o.format !== "chrysalis.webir.bundle") {
        throw new Error(`WebIR bundle: unexpected format ${String(o.format)}`);
    }
    if (o.bundleVersion !== "1.0.0") {
        throw new Error(`WebIR bundle: unsupported bundleVersion ${String(o.bundleVersion)}`);
    }
    if (!o.module || typeof o.module !== "object") {
        throw new Error("WebIR bundle: missing module");
    }
    return json;
}
/** Import a Chrysalis WebIR bundle into WPTP IR v0 (subset; losses are explicit). */
export function importWebIrBundleV1(bundle) {
    const mod = bundle.module;
    const nodeById = new Map(mod.nodes.map((n) => [n.id, n]));
    const nodes = [];
    const losses = [];
    for (const raw of mod.nodes) {
        if (!SUPPORTED_DIALECTS.has(raw.dialect)) {
            losses.push({
                webirNodeId: raw.id,
                dialect: raw.dialect,
                op: raw.op,
                category: "unsupported-dialect",
                reason: `Dialect ${raw.dialect} is not in the v0 import subset`,
            });
            continue;
        }
        const { node, loss } = mapNode(raw, nodeById);
        if (loss)
            losses.push(loss);
        if (node)
            nodes.push(node);
    }
    const nodeIds = new Set(nodes.map((n) => n.id));
    const roots = mod.roots.filter((id) => {
        if (nodeIds.has(id))
            return true;
        const raw = nodeById.get(id);
        losses.push({
            webirNodeId: id,
            dialect: raw?.dialect ?? "?",
            op: raw?.op ?? "?",
            category: "other",
            reason: "Route root was not imported (loss or unsupported subgraph)",
        });
        return false;
    });
    return {
        schemaVersion: IR_V0_SCHEMA_VERSION,
        meta: {
            sourceApp: mod.meta.sourceApp,
            importedFrom: "chrysalis.webir.bundle@1.0.0",
            chrysalisVersion: mod.meta.chrysalisVersion,
            createdAt: mod.meta.createdAt,
        },
        roots,
        nodes,
        losses,
    };
}
export function importWebIrBundleJson(json) {
    return importWebIrBundleV1(parseWebIrBundleV1(json));
}
