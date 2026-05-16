import type { IrDocumentV0, WebIrBundleV1 } from "./types.js";
export interface ExportIrToWebIrOptions {
    /** When true (default), route nodes without handlers get bronze stub handler bodies. */
    readonly synthesizeRouteHandlers?: boolean;
}
/**
 * Export IR v0 to a Chrysalis WebIR bundle (bronze reverse lift).
 * Contract-only routes (OpenAPI/HAR) can synthesize stub handler subgraphs for emit backends.
 */
export declare function exportIrToWebIrBundleV0(doc: IrDocumentV0, options?: ExportIrToWebIrOptions): WebIrBundleV1;
export declare function exportIrToWebIrBundleJson(doc: IrDocumentV0, options?: ExportIrToWebIrOptions): string;
//# sourceMappingURL=export-ir-to-webir-v0.d.ts.map