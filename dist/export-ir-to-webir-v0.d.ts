import type { IrDocumentV0, WebIrBundleV1 } from "./types.js";
/**
 * Export IR v0 to a Chrysalis WebIR bundle (bronze reverse lift).
 * Nodes without `webir` metadata are mapped from `layer` → dialect; round-trip is lossless
 * only when the document originated from WebIR import or uses the same layer/op conventions.
 */
export declare function exportIrToWebIrBundleV0(doc: IrDocumentV0): WebIrBundleV1;
export declare function exportIrToWebIrBundleJson(doc: IrDocumentV0): string;
//# sourceMappingURL=export-ir-to-webir-v0.d.ts.map