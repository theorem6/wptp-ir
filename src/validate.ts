import { IR_V0_SCHEMA_VERSION, type IrDocumentV0 } from "./types.js";

export function assertIrDocumentV0(value: unknown): asserts value is IrDocumentV0 {
  if (!value || typeof value !== "object") {
    throw new Error("IR document: expected object");
  }
  const o = value as Record<string, unknown>;
  if (o.schemaVersion !== IR_V0_SCHEMA_VERSION) {
    throw new Error(`IR document: unsupported schemaVersion ${String(o.schemaVersion)}`);
  }
  if (!o.meta || typeof o.meta !== "object") {
    throw new Error("IR document: missing meta");
  }
  if (!Array.isArray(o.roots)) throw new Error("IR document: roots must be array");
  if (!Array.isArray(o.nodes)) throw new Error("IR document: nodes must be array");
  if (!Array.isArray(o.losses)) throw new Error("IR document: losses must be array");
  const ids = new Set<string>();
  for (const n of o.nodes) {
    if (!n || typeof n !== "object") throw new Error("IR document: invalid node");
    const node = n as Record<string, unknown>;
    if (typeof node.id !== "string") throw new Error("IR document: node missing id");
    if (ids.has(node.id)) throw new Error(`IR document: duplicate node id ${node.id}`);
    ids.add(node.id);
    if (typeof node.layer !== "string") throw new Error(`IR document: node ${node.id} missing layer`);
    if (typeof node.op !== "string") throw new Error(`IR document: node ${node.id} missing op`);
  }
  for (const root of o.roots) {
    if (typeof root !== "string" || !ids.has(root)) {
      throw new Error(`IR document: root ${String(root)} not found in nodes`);
    }
  }
}
