# wptp-ir — Design notes

## Scope

This repository is **D2** of the Web Platform Translation Program: a **neutral IR** that can absorb Chrysalis **WebIR** and eventually feed multiple emitters. Chrysalis `main` remains the PHP reference stack until the program board records D1 exit.

## IR v0 layers

| Layer | WebIR dialect | Role |
| --- | --- | --- |
| `request` | `web.request` | Routes and handlers |
| `effect` | `effect` | DB, session, mail, HTTP side effects |
| `value` | `data` | SSA-style values and holes |

## Import contract

- **Input:** `chrysalis.webir.bundle@1.0.0` (see Chrysalis `scripts/export-webir-bundle.mjs`).
- **Output:** `IrDocumentV0` with `schemaVersion: "0.1.0"` and optional `losses[]`.
- **Round-trip:** Export back to WebIR is **not** required for v0; loss report is the honesty mechanism.

## Versioning

See `docs/VERSIONING.md`. Patch = fixture-only; minor = additive schema fields; major = breaking node shape or layer model.
