function dialectForLayer(layer) {
    if (layer === "request")
        return "web.request";
    if (layer === "effect")
        return "effect";
    if (layer === "value")
        return "data";
    throw new Error(`export: unsupported layer ${layer}`);
}
function irNodeToWebIr(node) {
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
export function exportIrToWebIrBundleV0(doc) {
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
export function exportIrToWebIrBundleJson(doc) {
    return JSON.stringify(exportIrToWebIrBundleV0(doc), null, 2);
}
