import type { IrDocumentV0, IrLossV0 } from "./types.js";

export interface LossReportSummary {
  readonly totalNodes: number;
  readonly importedNodes: number;
  readonly lossCount: number;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly byDialect: Readonly<Record<string, number>>;
}

export function summarizeLosses(doc: IrDocumentV0): LossReportSummary {
  const byCategory: Record<string, number> = {};
  const byDialect: Record<string, number> = {};
  for (const loss of doc.losses) {
    byCategory[loss.category] = (byCategory[loss.category] ?? 0) + 1;
    byDialect[loss.dialect] = (byDialect[loss.dialect] ?? 0) + 1;
  }
  return {
    totalNodes: doc.nodes.length + doc.losses.length,
    importedNodes: doc.nodes.length,
    lossCount: doc.losses.length,
    byCategory,
    byDialect,
  };
}

export function formatLossReportMarkdown(doc: IrDocumentV0): string {
  const s = summarizeLosses(doc);
  const lines = [
    "# WebIR import loss report",
    "",
    `- **Imported nodes:** ${s.importedNodes}`,
    `- **Losses:** ${s.lossCount}`,
    `- **Source app:** ${doc.meta.sourceApp}`,
    `- **Imported from:** ${doc.meta.importedFrom}`,
    "",
  ];
  if (s.lossCount === 0) {
    lines.push("No losses recorded for this bundle.");
    return `${lines.join("\n")}\n`;
  }
  lines.push("## By category", "");
  for (const [k, v] of Object.entries(s.byCategory).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`- **${k}:** ${v}`);
  }
  lines.push("", "## Losses", "");
  for (const loss of doc.losses) {
    lines.push(`- \`${loss.webirNodeId}\` (${loss.dialect}/${loss.op}): ${loss.reason}`);
  }
  return `${lines.join("\n")}\n`;
}

export function mergeLosses(a: ReadonlyArray<IrLossV0>, b: ReadonlyArray<IrLossV0>): IrLossV0[] {
  const seen = new Set(a.map((x) => x.webirNodeId));
  const out = [...a];
  for (const row of b) {
    if (seen.has(row.webirNodeId)) continue;
    seen.add(row.webirNodeId);
    out.push(row);
  }
  return out;
}
