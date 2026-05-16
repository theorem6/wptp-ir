import type { IrDocumentV0, WebIrBundleV1 } from "./types.js";
export declare function parseWebIrBundleV1(json: unknown): WebIrBundleV1;
/** Import a Chrysalis WebIR bundle into WPTP IR v0 (subset; losses are explicit). */
export declare function importWebIrBundleV1(bundle: WebIrBundleV1): IrDocumentV0;
export declare function importWebIrBundleJson(json: unknown): IrDocumentV0;
//# sourceMappingURL=import-webir-v0.d.ts.map