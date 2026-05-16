# IR schema versioning

## Policy (RFC-style)

- **`schemaVersion`** uses **SemVer** strings on the IR document (`0.1.0` today).
- **Patch** — golden fixture updates, clarifications, no consumer code change.
- **Minor** — additive fields or node attrs; importers must ignore unknown fields.
- **Major** — breaking node shape, layer rename, or loss category semantics.

## Bundle envelope

| Field | Version | Owner |
| --- | --- | --- |
| `chrysalis.webir.bundle` | `bundleVersion: 1.0.0` | Chrysalis export tool |
| WPTP IR document | `schemaVersion: 0.1.0` | this repo |

Bump **bundle** when the WebIR snapshot shape changes; bump **IR** when the neutral graph changes.
