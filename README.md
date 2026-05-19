# wptp-ir

**Program status (2026-05-19):** WPTP **D2 technical exit met** — see [Chrysalis `docs/WPTP-D2-EXIT-REPORT.md`](https://github.com/theorem6/chrysalis/blob/main/docs/WPTP-D2-EXIT-REPORT.md). Package **`@wptp/ir@v0.1.3`**; Chrysalis CI **`webir-bundle-to-wptp-ir`** imports exported tiny-blog bundles with **zero losses**.

## Purpose

**Neutral intermediate representation (IR) hub** for the [Web Platform Translation Program](https://github.com/theorem6/chrysalis/blob/main/docs/MASTER-PROGRAM.md) (WPTP). This repository owns **IR schema v0**, **validators**, **conformance fixtures**, and the **Chrysalis WebIR import** path. It does not replace [Chrysalis](https://github.com/theorem6/chrysalis) (`@chrysalis/webir`); it **imports** from it.

## Public API

- `importWebIrBundleJson` / `importWebIrBundleV1` — map a **`chrysalis.webir.bundle@1.0.0`** document to **`IrDocumentV0`**
- `parseWebIrBundleV1` — parse and validate bundle envelope
- `assertIrDocumentV0` — structural validation of IR v0 JSON
- `summarizeLosses` / `formatLossReportMarkdown` — explicit import loss reporting

## Invariants

- **Losses are explicit.** Unsupported WebIR dialects or nodes appear in `losses[]`, not silent drops.
- **Schema versioned.** `schemaVersion` on every IR document; breaking changes bump major policy in `docs/VERSIONING.md`.
- **Provenance preserved.** Each imported node keeps WebIR dialect/op/id under `webir` and stacks `provenance[]` from the bundle.
- **No emitters here.** Targets (Hono, Next.js, etc.) live in Chrysalis or future `wptp-emit-*` repos.

## Non-goals

- PHP parsing, Oracle capture, or verify replay (Chrysalis **D1**).
- Claiming **Gold** matrix edges without harness proof (see WPTP grading model).
- A second WebIR implementation.

## Quick start

```bash
npm install
npm test
```

**Flagship:** `fixtures/webir/tiny-blog.webir.bundle.json` is exported from Chrysalis
(`packages/ingest/tests/golden/tiny-blog.webir.json` via `export-webir-bundle.mjs`).
Import yields **325** nodes and **zero** losses (see `fixtures/reports/tiny-blog-loss.md`).

Import a fixture bundle:

```bash
npx tsx -e "import { readFileSync } from 'node:fs'; import { importWebIrBundleJson, formatLossReportMarkdown } from './src/index.ts'; const j=JSON.parse(readFileSync('fixtures/webir/minimal-route.webir.bundle.json','utf8')); console.log(formatLossReportMarkdown(importWebIrBundleJson(j)));"
```

## Related repositories

| Repo | Role |
| --- | --- |
| [theorem6/chrysalis](https://github.com/theorem6/chrysalis) | **D1** — PHP → WebIR → emit → verify |
| **theorem6/wptp-ir** (this repo) | **D2** — IR hub v0 |
| `wptp-adapter-*` / `wptp-emit-*` (planned) | Additional sources and targets |

## Documentation

- [`docs/VERSIONING.md`](./docs/VERSIONING.md) — schema bump policy
- [`docs/WEBIR-IMPORT-V0.md`](./docs/WEBIR-IMPORT-V0.md) — WebIR → IR v0 mapping
- [`schema/ir-v0.schema.json`](./schema/ir-v0.schema.json) — JSON Schema (documentation)
