/** WPTP neutral IR document (schema version 0.1.0). */
export declare const IR_V0_SCHEMA_VERSION: "0.1.0";
export type IrLayer = "request" | "effect" | "value";
export interface IrProvenanceRef {
    readonly source: string;
    readonly reason: string;
    readonly locator: unknown;
}
export interface IrNodeV0 {
    readonly id: string;
    readonly layer: IrLayer;
    readonly op: string;
    readonly valueType: unknown;
    readonly effects: ReadonlyArray<unknown>;
    readonly operandIds: ReadonlyArray<string>;
    readonly attrs: Readonly<Record<string, unknown>>;
    readonly provenance: ReadonlyArray<IrProvenanceRef>;
    readonly webir?: {
        readonly dialect: string;
        readonly op: string;
        readonly nodeId: string;
    };
    /** OpenAPI adapter lift metadata (bronze). */
    readonly openapi?: {
        readonly path: string;
        readonly method: string;
    };
    /** Browser HAR adapter lift metadata (bronze). */
    readonly browser?: {
        readonly url: string;
        readonly method: string;
    };
}
export interface IrLossV0 {
    readonly webirNodeId: string;
    readonly dialect: string;
    readonly op: string;
    readonly category: "unsupported-dialect" | "unsupported-op" | "missing-operand" | "other";
    readonly reason: string;
}
export interface IrDocumentV0 {
    readonly schemaVersion: typeof IR_V0_SCHEMA_VERSION;
    readonly meta: {
        readonly sourceApp: string;
        readonly importedFrom: string;
        readonly chrysalisVersion?: string;
        readonly createdAt?: string;
        readonly openapiVersion?: string;
    };
    readonly roots: ReadonlyArray<string>;
    readonly nodes: ReadonlyArray<IrNodeV0>;
    readonly losses: ReadonlyArray<IrLossV0>;
}
export interface WebIrBundleV1 {
    readonly format: "chrysalis.webir.bundle";
    readonly bundleVersion: "1.0.0";
    readonly module: {
        readonly meta: {
            readonly sourceApp: string;
            readonly createdAt: string;
            readonly chrysalisVersion: string;
        };
        readonly roots: ReadonlyArray<string>;
        readonly nodes: ReadonlyArray<{
            readonly id: string;
            readonly dialect: string;
            readonly op: string;
            readonly type: unknown;
            readonly effects: ReadonlyArray<unknown>;
            readonly operands: ReadonlyArray<string>;
            readonly attrs: Readonly<Record<string, unknown>>;
            readonly origin: unknown;
            readonly provenance: ReadonlyArray<{
                readonly source: string;
                readonly reason: string;
                readonly locator: unknown;
            }>;
        }>;
    };
}
//# sourceMappingURL=types.d.ts.map