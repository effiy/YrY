---
name: rui-init-detect
description: >
  Signal probing for project initialization. Extract the fact
  baseline: project identity, project type (frontend / backend /
  fullstack / meta / unknown), dependency inventory (package.json /
  pyproject.toml / go.mod / Cargo.toml), security surface, test
  framework, and architecture pattern. Six dimensions emitted as a
  `profile` JSON passed downstream to rui-init-explore and beyond.
  Run this detect phase first to produce the profile; classify the
  project type; extract deps from ecosystem manifests; map the
  security surface; identify the test framework; determine the
  architecture pattern. Triggers: "probe project filesystem",
  "extract fact baseline", "detect project type", "dependency
  inventory", "security surface", "test framework detection",
  "architecture pattern", "rui-init detect phase".
---

# rui-init-detect

> Single responsibility: probe the project filesystem and emit a fact
> baseline. Source-code reading and doc generation are separate skills.
> This skill produces a profile that the rest of the pipeline consumes.
>
> Triggered by the parent pipeline (rui-init). The output is the
> `profile` object passed downstream to rui-init-explore and beyond.
>
> **Output contract**: a `profile` JSON document with the six dimensions
> listed below. The pipeline treats this object as the fact baseline for
> all later phases.

[Inputs](#inputs) · [Outputs](#outputs) · [1. Project Identity](#1-project-identity) · [2. Project Type](#2-project-type) · [3. Project Inventory](#3-project-inventory) · [4. Security Surface](#4-security-surface) · [5. Test Framework](#5-test-framework) · [6. Architecture Pattern](#6-architecture-pattern) · [Fallback](#fallback) · [Active Markers](#active-markers)

## Inputs

| Field | Type | Description |
|-------|------|-------------|
| `cwd` | path (optional) | Project root to probe. Defaults to current working directory. |
| `manifest` | object (optional) | Pre-parsed ecosystem manifest (package.json / pyproject.toml / go.mod / Cargo.toml). When absent, the skill reads the file from disk. |

## Outputs

```ts
type Profile = {
  identity: {
    name: string;              // repo directory name → branch prefix
    branchPrefix: string;      // derived from identity.name
  };
  projectType: 'frontend' | 'backend' | 'fullstack' | 'meta' | 'unknown' | 'non-node';
  inventory: {
    dependencies: Record<string, string>;
    buildCommands: string[];
    testCommands: string[];
    frameworkVersions: Record<string, string>;
  };
  securitySurface: {
    userInput: boolean;
    apiEndpoints: boolean;
    dataStorage: boolean;
    authentication: boolean;
    thirdParty: boolean;
  };
  testFramework: 'vitest' | 'jest' | 'pytest' | 'go-test' | 'cargo-test' | 'none';
  architecturePattern: 'single' | 'monorepo' | 'microservice' | 'plugin' | 'unknown';
};
```

The output is written to the pipeline's working state and consumed by
rui-init-explore.

## 1. Project Identity

- Read the directory name at the project root → that is `identity.name`.
- `branchPrefix` is derived from `identity.name` by kebab-casing and
  prefix-stripping (e.g. `rui-frontend` → `rui-frontend`).
- Story directory names are purely semantic kebab-case; document names
  do **not** carry the project prefix.

## 2. Project Type

### Decision Tree

| Has `package.json`? | Match | Type |
|---------------------|-------|------|
| yes | `react` / `vue` / `svelte` / `next` / `nuxt` in deps | `frontend` |
| yes | `express` / `koa` / `fastify` / `nest` in deps | `backend` |
| yes | frontend deps **and** `server/` or `api/` directory | `fullstack` |
| yes | `.claude-plugin/plugin.json` present, **or** only `skills/` directory | `meta` |
| yes | none of the above | `unknown` |
| no | `pyproject.toml` / `go.mod` / `Cargo.toml` / etc. present | `non-node` (decide by ecosystem manifest) |
| no | none of the above | `unknown` |

### Notes

- "Has X in deps" means X appears in `dependencies`, `devDependencies`,
  or `peerDependencies` of `package.json`.
- The `meta` type is reserved for skill-only / plugin-only projects
  whose primary output is documentation or skills.
- The `non-node` label is a *flag*, not a type; follow up by reading
  the ecosystem manifest (pyproject.toml / go.mod / Cargo.toml) to
  decide the actual runtime type.

## 3. Project Inventory

Extract from ecosystem manifests:

- `dependencies` — flat object `{ name: versionRange }` for all
  `dependencies` and `devDependencies` keys.
- `buildCommands` — from `scripts.build`, `scripts.start`, or the
  equivalent in the ecosystem manifest.
- `testCommands` — from `scripts.test` or its equivalent.
- `frameworkVersions` — top-level framework packages only (react,
  vue, svelte, next, express, fastify, nest, …), with their resolved
  version range.

For non-Node ecosystems, the same field set is filled from the
equivalent manifest fields (e.g. `[tool.poetry.dependencies]` in
`pyproject.toml`).

## 4. Security Surface

Scan source files for the following keyword / pattern groups. Each
dimension is a boolean.

| Dimension | Keywords / patterns | Mark `true` when |
|-----------|---------------------|------------------|
| User input | `req.body`, `req.query`, `req.params`, `input`, `form` | Any of these appear in source |
| API endpoints | `app.get`, `app.post`, `router.`, `@Get`, `@Post` | Any of these appear in source |
| Data storage | `mongoose`, `sequelize`, `prisma`, `redis`, `fs.write` | Any of these appear in source |
| Authentication | `jwt`, `passport`, `oauth`, `auth`, `session`, `token` | Any of these appear in source |
| Third-party | `fetch`, `axios`, `http.request`, `got` | Any of these appear in source |

Security surface probing **cannot be skipped**. An empty result is
itself a meaningful signal and must be recorded, not omitted.

## 5. Test Framework

Resolution order:

1. If a config file matches, use it:
   - `vitest.config.*` / `vitest.workspace.*` → `vitest`
   - `jest.config.*` → `jest`
   - `pytest.ini` / `pyproject.toml [tool.pytest]` → `pytest`
   - `*_test.go` files present → `go-test`
   - `Cargo.toml [package]` with `[[test]]` → `cargo-test`
2. Otherwise, infer from the test command in the inventory:
   - `vitest` / `vitest run` → `vitest`
   - `jest` / `jest --` → `jest`
   - `pytest` → `pytest`
   - `go test` → `go-test`
   - `cargo test` → `cargo-test`
3. No test command and no config file → `none`.

## 6. Architecture Pattern

| Pattern | Detection |
|---------|-----------|
| `single` | One top-level `src/` (or equivalent) — no nested packages |
| `monorepo` | Workspace manifest present (`workspaces` field, `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json`) |
| `microservice` | Multiple top-level service directories each with its own manifest |
| `plugin` | A `.claude-plugin/plugin.json` or an `addons/` / `plugins/` root with per-plugin manifests |
| `unknown` | None of the above patterns match |

## Fallback

| Situation | Behavior |
|-----------|----------|
| `cwd` does not exist | Abort with `cwd-not-found`; the parent pipeline should pass a valid path |
| `package.json` exists but is not valid JSON | Mark project type as `unknown`, record parse error in profile |
| Security scan finds zero matches across all five dimensions | Return all `false`; do not invent dimensions |
| Test framework cannot be resolved | Set `testFramework: 'none'`; let the parent pipeline surface this to rui-init-verify |

The `profile` object is the **only** artifact this skill produces. It
is read by the parent pipeline, never by the user directly.

## Active Markers

| Marker | Verification | Expected behavior |
|--------|--------------|-------------------|
| `profile.identity.name` is a non-empty string | `profile.identity.name.length > 0` | Pipeline may proceed |
| `profile.projectType` is one of the six enum values | enum check | Pipeline may proceed; `unknown` triggers fallback in rui-init-generate |
| `profile.securitySurface` has all five boolean keys | key set check | Pipeline may proceed |
| `profile.testFramework` is a known enum value | enum check | Pipeline may proceed; `none` is allowed but flagged |


## Rules

- [detection-contracts.md](./rules/detection-contracts.md) — ---
- [probing-rules.md](./rules/probing-rules.md) — ---

## Specialized Agents

- [manifest-parser.md](./agents/manifest-parser.md) — ---
- [project-classifier.md](./agents/project-classifier.md) — ---

## Rules

- [detection-contracts.md](./rules/detection-contracts.md) — ---
- [probing-rules.md](./rules/probing-rules.md) — ---

## Specialized Agents

- [manifest-parser.md](./agents/manifest-parser.md) — ---
- [project-classifier.md](./agents/project-classifier.md) — ---

## References

- [detection-decision-tree.md](./references/detection-decision-tree.md) — ---
- [ecosystem-manifests.md](./references/ecosystem-manifests.md) — ---
