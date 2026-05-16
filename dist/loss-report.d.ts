import type { IrDocumentV0, IrLossV0 } from "./types.js";
export interface LossReportSummary {
    readonly totalNodes: number;
    readonly importedNodes: number;
    readonly lossCount: number;
    readonly byCategory: Readonly<Record<string, number>>;
    readonly byDialect: Readonly<Record<string, number>>;
}
export declare function summarizeLosses(doc: IrDocumentV0): LossReportSummary;
export declare function formatLossReportMarkdown(doc: IrDocumentV0): string;
export declare function mergeLosses(a: ReadonlyArray<IrLossV0>, b: ReadonlyArray<IrLossV0>): IrLossV0[];
//# sourceMappingURL=loss-report.d.ts.map