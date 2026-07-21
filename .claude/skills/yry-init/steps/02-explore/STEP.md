---
name: yry-init-explore
description: >
  Deep exploration of project source code to validate and supplement the
  detect-phase profile. Read core source, identify architecture patterns
  and code conventions, confirm or correct the security surface, and
  emit a module map. Run this skill after yry-init-detect, before any
  content generation work begins.
---

# yry-init-explore

> Single responsibility: read source code and emit a module map. It does
> not generate docs, run tests, or change files. The output is the
> `exploration` object passed to yry-init-generate and yry-init-arch.
>
> Triggered by the parent pipeline (yry-init), right after
> yry-init-detect.
>
> **Input**: the `profile` object emitted by yry-init-detect.
> **Output**: an `exploration` object — module map + corrected
> security surface + confirmed architecture pattern.

[Inputs](#inputs) · [Outputs](#outputs) · [1. Source Reading Order](#1-source-reading-order) · [2. Module Map](#2-module-map) · [3. Architecture Confirmation](#3-architecture-confirmation) · [4. Security Surface Validation](#4-security-surface-validation) · [5. Convention Capture](#5-convention-capture) · [Fallback](#fallback) · [Active Markers](#active-markers)

## Inputs

| Field | Type | Description |
|-------|------|-------------|
| `profile` | `Profile` | The fact baseline emitted by yry-init-detect. Required. |
| `cwd` | path (optional) | Project root. Defaults to current working directory. |

## Outputs

```ts
type Exploration = {
  moduleMap: Module[];
  architecture: {
    pattern: 'single' | 'monorepo' | 'microservice' | 'plugin' | 'unknown';
    notes: string;
  };
  securitySurface: Profile['securitySurface'];  // corrected
  conventions: {
    language: string;
    styleGuide: string | null;       // eslint / prettier / .editorconfig presence
    commitStyle: string | null;      // conventional / gitmoji / freeform
    fileNaming: 'kebab-case' | 'camelCase' | 'snake_case' | 'mixed';
  };
};

type Module = {
  name: string;                       // directory name or logical name
  path: string;                       // physical path
  coreDeps: string[];                 // other modules it depends on
  responsibility: string;             // single-responsibility description
};
```

## 1. Source Reading Order

1. Read the manifest files (`package.json`, `tsconfig.json`, etc.)
   to confirm the framework / build setup from `profile`.
2. Read the top-level `src/` (or equivalent) tree, one level deep.
3. For each top-level module, read its public entry file (index.ts /
   mod.rs / __init__.py / …) to capture its responsibility.
4. Read any documentation files at the root (`README.md`, `docs/`) to
   cross-check the architecture narrative.
5. Stop reading once the module map covers all top-level modules and
   the architecture pattern is confirmed — exploration is **bounded**,
   not exhaustive.

## 2. Module Map

For each top-level module, capture:

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Directory name or logical name | `auth` |
| `path` | Physical path relative to project root | `src/auth/` |
| `coreDeps` | Other modules it depends on (module names, not file paths) | `["db", "session"]` |
| `responsibility` | Single-responsibility description | "JWT issuance and refresh-token rotation" |

The module map is the canonical input for yry-init-arch — it is what
the arch stories are built from.

## 3. Architecture Confirmation

Validate or correct `profile.architecturePattern`:

| Detected pattern | What to look for in source |
|------------------|----------------------------|
| `single` | One `src/` (or equivalent) with no nested package manifests |
| `monorepo` | Workspace manifest in root + multiple package directories each with its own manifest |
| `microservice` | Multiple top-level service directories each owning its own manifest and runtime entry |
| `plugin` | `.claude-plugin/plugin.json` or `addons/` / `plugins/` root with per-plugin manifests |
| `unknown` | None of the above; record the actual structure in `notes` |

If the source contradicts the detected pattern, the source wins.
Update the pattern and record the rationale in `architecture.notes`.

## 4. Security Surface Validation

Walk the source code and re-evaluate each of the five dimensions
inherited from `profile.securitySurface`:

- Confirm `true` only when the dimension's keywords appear in actual
  handler / controller / persistence code (not in `node_modules/` or
  vendored libraries).
- Promote `false → true` when a previously-uncatalogued call site is
  found.
- Demote `true → false` when the keyword appears only in a comment,
  test file, or dependency declaration.
- Test files (`*.test.*`, `*_test.go`, `tests/`) are excluded from the
  scan — they are not part of the runtime security surface.

The corrected `securitySurface` is what yry-init-verify sees.

## 5. Convention Capture

Record the following conventions for downstream use:

| Convention | Detection |
|------------|-----------|
| `language` | Most common file extension under `src/` |
| `styleGuide` | Presence of `eslint.config.*` / `.prettierrc*` / `.editorconfig` |
| `commitStyle` | Presence of `commitlint.config.*` or `.gitmessage` template |
| `fileNaming` | Sample the top-level module names and pick the dominant casing convention |

`null` is the correct value when the convention cannot be inferred —
do not invent one.

## Fallback

| Situation | Behavior |
|-----------|----------|
| A source file is unreadable (permission / parse error) | Skip that file, mark the affected module as `unreadable` in `moduleMap[i].responsibility` |
| Architecture pattern cannot be confirmed | Set `architecture.pattern = 'unknown'`; let the parent pipeline surface this to yry-init-verify |
| Security surface is empty after re-scan | Return all `false`; do not invent dimensions |
| Module map grows past a sensible bound (≥ 50 top-level modules) | Truncate to the 50 most-coupled modules and record the truncation in `conventions` |

The `exploration` object is the **only** artifact this skill produces.
It is read by the parent pipeline, never by the user directly.

## Active Markers

| Marker | Verification | Expected behavior |
|--------|--------------|-------------------|
| `exploration.moduleMap` is a non-empty array | `Array.isArray && length > 0` | Pipeline may proceed; empty array triggers yry-init-verify fallback |
| `exploration.architecture.pattern` is a known enum value | enum check | Pipeline may proceed |
| `exploration.securitySurface` has all five boolean keys | key set check | Pipeline may proceed |
| `exploration.conventions.language` is a non-empty string | non-empty check | Pipeline may proceed; `null` is allowed but flagged |


## Rules

- [exploration-contracts.md](./rules/exploration-contracts.md) — ---
- [import-resolution.md](./rules/import-resolution.md) — ---

## Specialized Agents

- [convention-detector.md](./agents/convention-detector.md) — ---
- [module-graph-builder.md](./agents/module-graph-builder.md) — ---

## Rules

- [exploration-contracts.md](./rules/exploration-contracts.md) — ---
- [import-resolution.md](./rules/import-resolution.md) — ---

## Specialized Agents

- [convention-detector.md](./agents/convention-detector.md) — ---
- [module-graph-builder.md](./agents/module-graph-builder.md) — ---

## References

- [graph-algorithms.md](./references/graph-algorithms.md) — ---
- [module-map-schema.md](./references/module-map-schema.md) — ---
