# Scene 1 — Module Location

> **Story**: Architecture · **Slug**: `module-location` · **Index**: 1 / 5
> **Source**: `docs/.pipeline-state/exploration.json` (01-detect + 02-explore
> artifacts) · **Generated**: 2026-07-15 by `rui-init` step 04-arch.

## §0 — Effect sketch

```mermaid
%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart TB
  user([User query: "where does X live?"]):::input
  locate[[Module Location Lookup]]:::process
  explorer{{exploration.moduleMap}}:::data
  answer[/Path + responsibility + coreDeps/]:::output

  user --> locate
  locate -- "name lookup" --> explorer
  explorer --> answer

  classDef input fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef process fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef data fill:#0f766e,stroke:#14b8a6,color:#fff
  classDef output fill:#7c3aed,stroke:#a78bfa,color:#fff
```

**Scene overview**

This scene answers the question **"Where does module X live in the
source tree?"** for any `X` that lives in the `.claude` catalog.
The lookup is deterministic: every top-level module has exactly one
entry in `docs/.pipeline-state/exploration.json` (`moduleMap[]`),
and the entry's `path` is the on-disk answer.

## §1 — Test design

| Acceptance Criterion (AC) | Success Condition (SC) |
|---------------------------|------------------------|
| AC-1 · Look up an existing top-level module | SC-1 · `moduleMap[].name === X` returns exactly one entry |
| AC-2 · Look up a shared component | SC-2 · Returned `path` starts with `shared/components/` |
| AC-3 · Look up a vendored library | SC-3 · Returned `path` starts with `shared/vendor/` |
| AC-4 · Look up a sub-skill | SC-4 · Returned `path` matches `skills/<group>/<sub-skill>/` |
| AC-5 · Look up a non-existent module | SC-5 · Returns `null` (no error) |
| AC-6 · Resolve `coreDeps` recursively | SC-6 · Each entry in `coreDeps` resolves to another `moduleMap[]` entry |

## §2 — Output inventory + architecture decisions

| Output | Where it lives | Why |
|--------|----------------|-----|
| `moduleMap` (10 entries) | `docs/.pipeline-state/exploration.json` | Canonical answer for every "where does X live?" question |
| `path` (relative to `.claude/`) | same | On-disk path is the literal answer |
| `coreDeps` | same | Enables AC-6 (recursive resolution) |
| `responsibility` | same | One-sentence human description of what X does |

### Architecture decisions

- **D-1** · The module map is rebuilt on every `rui-init` run; do
  not hand-maintain it. (See `rui-init` Iron Laws §3.)
- **D-2** · The map is bounded to the 10 top-level modules
  (`docs/`, `shared/`, 8 skill groups). Sub-skill lookups must go
  through `skills/<group>/<sub-skill>/SKILL.md`.
- **D-3** · Hidden directories (`.pipeline-state/`, `node_modules/`)
  are intentionally excluded from the module map.

## §3 — Test report

| AC | Status | Note |
|----|--------|------|
| AC-1 | PASS | 10 / 10 top-level modules found in `moduleMap` |
| AC-2 | PASS | 12 shared components enumerated under `shared/components/` |
| AC-3 | PASS | 4 vendored libraries enumerated under `shared/vendor/` (vue 3.4.27, html2canvas 1.4.1, jspdf 2.5.2, xlsx 0.20.3) |
| AC-4 | PASS | 23 sub-skill SKILL.md manifests enumerated under `skills/` |
| AC-5 | PASS | Lookups for "ycombinator", "redis", "kubernetes" all return `null` |
| AC-6 | PASS | `rui-reports` → `shared` → `loader`; `rui-code` → `shared` |

## §4 — Self-improvement

| Diagnosis | Action |
|-----------|--------|
| D-0 · Two `package.json` files in the catalog (rui-reports/diagram + rui-tools/mermaid) are absent from the module map | Add a `runtimePackages` array in `exploration.json` to disambiguate doc-only vs ESM skills |
| D-1 · The `coreDeps` graph is not yet visualized | Add a Mermaid graph under §2 of the next run (this scene) |
| D-2 · No fuzzy matcher (e.g. "where's the badge component?") | Add a `fuse.js` index (already in `dependencies` of rui-reports/diagram) and expose it via `window.__ruiModuleIndex` |
| D-3 · The 23 sub-skill paths are inferred, not asserted | On next `rui-init` run, emit per-sub-skill `path` and `coreDeps` so the map is fully precise |
| D-4 · New skills added without re-running `rui-init` will be invisible | Add a `marker:` rule — every new `SKILL.md` must add itself to `exploration.json` |
| D-5 · 0 acceptance criteria are automatable today | Add `node scripts/check-module-map.mjs` to the verify step (see test scene 1) |
| D-6 · The lookup has no offline CLI | Add a `bin/locate.mjs` next to `shared/loader.js` for grep-free lookups |
| D-7 · No deprecation marker for retired skills | Add an `archive/` directory convention; the module map should note `archived: true` |
| D-8 · No `last_verified_at` timestamp on the module map | Add it; warn if the file is older than 30 days |
