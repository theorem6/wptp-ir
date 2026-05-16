# WebIR → WPTP IR v0 import mapping

Canonical implementation: `src/import-webir-v0.ts`.

## Input: Chrysalis WebIR bundle

```json
{
  "format": "chrysalis.webir.bundle",
  "bundleVersion": "1.0.0",
  "module": {
    "meta": { "sourceApp": "...", "createdAt": "...", "chrysalisVersion": "..." },
    "roots": ["n1"],
    "nodes": [ { "id", "dialect", "op", "type", "effects", "operands", "attrs", "origin", "provenance" } ]
  }
}
```

Produce bundles from Chrysalis with:

```bash
node scripts/export-webir-bundle.mjs --in path/to/module.webir.json --out path/to/out.webir.bundle.json
```

(Chrysalis repo; see `packages/ingest/tests/golden/tiny-blog.webir.json` for a full module snapshot.)

## Dialect mapping

| WebIR `dialect` | IR `layer` | Notes |
| --- | --- | --- |
| `web.request` | `request` | `route`, `handler`, etc. keep the same `op` string |
| `effect` | `effect` | Effects array copied verbatim |
| `data` | `value` | Includes `hole`, arithmetic, literals |
| *other* | — | Recorded in `losses[]` (`unsupported-dialect`) |

## Node fields

| WebIR | IR v0 |
| --- | --- |
| `id` | `id` |
| `dialect` + `op` | `layer` + `op` + `webir.{dialect,op,nodeId}` |
| `type` | `valueType` |
| `effects` | `effects` |
| `operands` | `operandIds` |
| `attrs` + `origin` | `attrs` (origin nested under attrs) |
| `provenance` | `provenance` |

## Roots and losses

- **`roots`:** WebIR roots that were successfully imported.
- If a root node is missing from the imported set, an **`other`** loss is recorded.
- Operand ids pointing outside the bundle → **`missing-operand`** loss for that node.

## Loss report

Use `formatLossReportMarkdown(importWebIrBundleJson(bundle))` for human review, or `summarizeLosses(doc)` in CI gates (future `wptp-ir` CLI).

## Subset vs full tiny-blog

The v0 importer accepts all three supported dialects but does **not** guarantee zero losses on every real module (e.g. future dialects). Flagship importers should assert `lossCount === 0` only after an explicit allowlist review.
