---
name: rui-report-self-test
description: >
  Generate a self-test report (six rui-init self-test scenes with
  §0–§4 lifecycle) as a Vue 3 page at docs/reports/self-test/.
  Use /rui-report-self-test or call scripts/analyze.mjs directly.
arguments:
  - name: path
    description: Limit analysis scope to a subdirectory
    required: false
  - name: out
    description: Custom output directory for the report
    required: false
  - name: theme
    description: Report theme (dark | light, default: dark)
    required: false
  - name: no-merge
    description: Skip the markdown mirror to docs/self-test/
    required: false
  - name: generated-at
    description: ISO 8601 timestamp embedded in the report (default: now UTC)
    required: false
---

# Rui Report — Self-Test

Run a project-wide self-test analysis, rendering the six rui-init
self-test scenes as a single Vue 3 page at
`docs/reports/self-test/`. Each scene follows the §0–§4 lifecycle
defined by `rui-init` step 04-arch.

## Usage

| Command | Description |
|---------|-------------|
| `/rui-report-self-test` | Full self-test on cwd |
| `/rui-report-self-test <path>` | Limit scope to `<path>` |
| `/rui-report-self-test --out <dir>` | Custom output directory |
| `/rui-report-self-test --theme light` | Light theme report |
| `/rui-report-self-test --no-merge` | Skip markdown mirror to `docs/self-test/` |
| `/rui-report-self-test --generated-at 2026-07-17T00:00:00Z` | Pin the "generated at" timestamp |

## Pipeline (6 stages)

1. **File Inventory** — Walk scope, collect bytes / type / mtime
2. **Facet Detection** — Run six facet probes (init / tests / docs / security / refs / deps)
3. **Scene Assembly** — Map facet records to the six rui-init scenes; build §0–§4 payloads
4. **Verdict Computation** — Per-scene coverage → `pass` / `partial` / `fail`; composite score
5. **Page Emit** — Copy byte-stable templates; write `data.js`
6. **Markdown Mirror (optional)** — Write `docs/self-test/scene-N-<slug>/index.md` for rui-init compat

## The Six Scenes

| # | Scene | What it checks |
|---|-------|----------------|
| 1 | `post-init-full-self-check` | CLAUDE.md, README, docs/, tests, manifest |
| 2 | `pre-commit-incremental-self-check` | Test framework + scoped test command |
| 3 | `doc-code-consistency` | Doc files, doc/code ratio, root manifests |
| 4 | `security-surface-regression` | .env files, dangerous calls, HTML count |
| 5 | `cross-story-integration-regression` | Story dirs, link count, broken links |
| 6 | `third-party-framework-service` | Dep count, pinning ratio, staleness |

## Output

```
docs/reports/self-test/
├── index.html      — Vue 3 markup, scene cards + score gauge
├── index.css       — page-level styles (--rui-* tokens)
├── index.js        — thin entry: waits for Vue, mounts RuiSelfTestApp
├── data.js         — REPORT_CONFIG + REPORT_DATA (regenerated each run)
└── (when MERGE_SCENES=true) ../self-test/scene-N-<slug>/index.md
```

## Verdicts and Composite Score

| Coverage | Verdict | UI badge |
|----------|---------|----------|
| ≥ 0.90 | `pass` | ✅ green |
| 0.50 – 0.89 | `partial` | ⚠️ amber |
| < 0.50 | `fail` | 🚫 red |

Composite score = `mean(scene.coverage) × 100`, rounded. Grade
follows the shared scale (A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, F < 40).

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `1`–`6` | Jump to scene by number |
| `t` | Back to top |
| `l` | Toggle dark/light theme |
| `p` | Print / save as PDF |
| `?` | Show/hide "How to read" |

## Severity Levels (per scene)

| Level | Marker | Coverage |
|-------|--------|----------|
| Pass (P0) | ✅ | ≥ 0.90 |
| Partial (P1) | ⚠️ | 0.50 – 0.89 |
| Fail (P2) | 🚫 | < 0.50 |

## Exclusions

`node_modules` `.git` `dist` `build` `.memory` `.next` `.turbo`
`coverage` `.claude` `target` `intermediate` `.DS_Store`

## See also

- [SKILL.md](./SKILL.md) — full skill contract
- [references/methodology.md](./references/methodology.md) — per-facet measurement methodology
- [references/scene-catalog.md](./references/scene-catalog.md) — the six scenes with detection rules
- [rules/self-test-contracts.md](./rules/self-test-contracts.md) — analyzer ↔ page data contract
