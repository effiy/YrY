---
name: rui-report-test
description: >
  test report generator that combines the rui-tools skill-creation
  structure with the rui-reports/files analysis pipeline to render
  rui-init's six test scenes (post-init-full-self-check,
  pre-commit-incremental-self-check, doc-code-consistency,
  security-surface-regression, cross-story-integration-regression,
  third-party-framework-service) as a single Vue 3 page at
  docs/reports/test/. Each scene follows the §0–§4 lifecycle
  defined by rui-init-arch. Use /rui-report-test or call
  scripts/analyze.mjs directly.
lifecycle: default-pipeline
user_invocable: true
---

# rui-report-test

> A test report generator that fuses the skill-creation shape of
> `rui-tools/skill`, the 6-stage analyzer pipeline of `rui-reports/files`,
> and the 6 test scenes defined by `rui-init` (step 04-arch) into a
> single Vue 3 page report.

## What this skill does

- Walks a project scope and detects its language, test framework,
  documentation set, security surface, cross-reference graph, and
  third-party dependencies.
- Emits the six canonical rui-init test scenes as structured
  data (`post-init-full-self-check`, `pre-commit-incremental-self-check`,
  `doc-code-consistency`, `security-surface-regression`,
  `cross-story-integration-regression`, `third-party-framework-service`).
- Renders each scene under the §0–§4 lifecycle (Effect Sketch → Test
  Design → Output Inventory → Test Report → Self-Improvement) inside
  one self-contained Vue 3 page at `docs/reports/test/`.
- Persists each scene as a markdown file under
  `docs/test/scene-N-<slug>/index.md` so the report doubles as a
  hand-editable knowledge base.
- Computes a per-scene verdict (`pass` / `partial` / `fail`) and a
  composite test score with grade (A–F), driving the page's
  score gauge and risk banner.

## What this skill does NOT do

- Does NOT run unit tests, integration tests, or any executable test
  suite — the verdict is derived from static analysis, not from
  executing project tests.
- Does NOT modify the project source — it only reads and writes
  under `docs/reports/test/` and `docs/test/`.
- Does NOT replace `rui-init` — `rui-init` builds the canonical
  arch/test directories; this skill renders them as a report.
  When both run, the markdown scenes in `docs/test/` and the
  report at `docs/reports/test/` are kept in sync by the
  `MERGE_SCENES` option (default `true`).

## Quickstart

```bash
# 1) Run the test analyzer
node scripts/analyze.mjs "$(pwd)" docs/reports/test

# 2) Open the report
open docs/reports/test/index.html        # macOS
xdg-open docs/reports/test/index.html    # Linux
```

The output is self-contained — no build step, no external CDN. Vue 3
and the shared `rui-*` components load from `/.claude/shared/` via
the unified loader (see `references/methodology.md` § Loader).

## Workflow

```
walk scope → detect facets → assemble 6 scenes → score → emit
  │             │                  │              │       │
  │             │                  │              │       └─ data.js + index.{html,css,js}
  │             │                  │              └─ composite score + per-scene verdict
  │             │                  └─ §0–§4 lifecycle payload per scene
  │             └─ test, docs, security, refs, deps facets
  └─ file inventory (borrowed from rui-reports/files Stage 1)
```

Key principles:
1. **One analyzer, one page.** `scripts/analyze.mjs` is the single
   entry point. It writes `data.js` AND assembles the full page from
   the byte-stable `templates/` directory.
2. **Six scenes are mandatory.** Even when no test framework is
   detected, every scene renders with a `# TODO: no test framework`
   marker — the report must always have exactly six scenes.
3. **§0–§4 lifecycle is the contract.** Each scene's data payload
   contains `section0..section4` plus a `verdict` field. The Vue
   template refuses to render a scene missing any section.
4. **Verdicts are static, not dynamic.** Pass / partial / fail is
   derived from the analyzer's findings; it is NOT recomputed on
   page load. Re-run the analyzer to refresh.

## Pipeline (6 stages — see `scripts/analyze.mjs`)

1. **File Inventory** — Walk scope, collect bytes / lines / type /
   mtime (mirrors `rui-reports/files` Stage 1).
2. **Facet Detection** — For each of the five facets (tests, docs,
   security, references, dependencies), probe the project for
   relevant files and produce a facet record.
3. **Scene Assembly** — Map facet records to the six scenes; for
   each scene, build the §0–§4 payload by combining static findings
   with template-driven prose.
4. **Verdict Computation** — Per-scene: `pass` (≥ 90% of
   verification steps satisfied), `partial` (50–89%), `fail`
   (< 50%). Composite score = mean of per-scene coverage × 100.
5. **Page Emit** — Copy `templates/index.{html,css,js}` byte-stable;
   substitute `{{SCOPE_TITLE}}` / `{{GENERATED_AT}}`; write
   `data.js` containing the full scene payload.
6. **Markdown Sync (optional)** — When `MERGE_SCENES=true` (default),
   write each scene to `docs/test/scene-N-<slug>/index.md` so
   the report and the rui-init scene tree stay aligned.

## Scene contract (per scene)

Each scene's data payload MUST contain:

```ts
{
  index:    1..6,                  // render order
  slug:     string,                // kebab-case, e.g. 'doc-code-consistency'
  title:    string,                // user-visible
  icon:     string,                // single emoji
  facet:    'tests' | 'docs' | 'security' | 'refs' | 'deps' | 'init',
  section0: { effect: string, matters: string, mermaid?: string },
  section1: { steps: Array<{ title, action, expected, file? }> },
  section2: { outputs: Array<{ path, type, description }> },
  section3: { report: Array<{ step, result, notes }>, overall: string },
  section4: { edgeCases: string[], improvements: string[], limitations: string[] },
  verdict:  'pass' | 'partial' | 'fail',
  coverage: number,                // 0..1, drives composite score
}
```

The Vue page renders scenes in `index` order. Missing sections
trigger a `# TODO` banner; the report still renders so the user can
see what is incomplete.

## Output (modular — see `templates/`)

```
docs/reports/test/
├── index.html      — Vue 3 markup, scene cards + score gauge
├── index.css       — page-level styles (--rui-* tokens, scene-card chrome)
├── index.js        — thin entry: waits for Vue, mounts RuiSelfTestApp
├── data.js         — REPORT_CONFIG + REPORT_DATA (regenerated each run)
└── (optional) docs/test/scene-N-<slug>/index.md
                   — markdown mirror of each scene (rui-init compatible)
```

## Severity thresholds

| Coverage | Verdict | UI badge |
|----------|---------|----------|
| ≥ 0.90 | `pass` | ✅ green |
| 0.50 – 0.89 | `partial` | ⚠️ amber |
| < 0.50 | `fail` | 🚫 red |

Composite score formula: `mean(scene.coverage) × 100`, rounded.
Grade follows the rui-report-files scale (A ≥ 90, B ≥ 75, C ≥ 60,
D ≥ 40, F < 40).

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `1`–`6` | Jump to scene by number |
| `t` | Back to top |
| `l` | Toggle dark/light theme |
| `p` | Print / save as PDF |
| `?` | Show/hide "How to read" |

## Exclusions (default — inherits from rui-reports/files)

`node_modules` `.git` `dist` `build` `.memory` `.next` `.turbo`
`coverage` `.claude` `target` `intermediate` `.DS_Store`

## Borders

| Boundary | Permission |
|----------|-----------|
| `<scope>/**` (project under analysis) | read-only |
| `docs/reports/test/**` (report output) | write |
| `docs/test/**` (markdown mirror, when `MERGE_SCENES=true`) | write |
| `templates/**` (this skill) | read |
| `references/**`, `rules/**`, `agents/**` (this skill) | read |
| Outside `<scope>` and this skill | no access |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Always render six scenes — fill missing ones with `# TODO` markers | The report is canonical; partial coverage is still reportable |
| 2 | Never invent file paths not present in the scope inventory | The §0–§4 prose must reference real artifacts |
| 3 | Verdicts are computed by the analyzer, never the page | The page renders state, it does not evaluate it |
| 4 | `data.js` MUST contain all six scenes in `index` order | The page does no reordering |
| 5 | Markdown mirror is byte-stable for §0–§4 headers; the body is regenerated | rui-init's verifier checks for section presence, not body identity |
| 6 | Re-run on file change; do NOT hot-reload verdicts | Verdicts depend on the static inventory snapshot |
| 7 | No external CDN — Vue 3 + shared components load from `/.claude/shared/` | Works under `file://` and offline |
| 8 | Do not call external test runners | This skill is static-analysis only |

## Pitfalls

- **Six scenes are mandatory** — even when the project has zero
  tests, the `pre-commit-incremental-self-check` scene renders with
  a `# TODO: no test framework detected` note. Dropping scenes
  breaks the report.
- **`index.html` has no inline `<style>` or `<script>`** — all
  styles live in `index.css`; all logic lives in `index.js`. Inline
  styles defeat cache and break CSP for `/docs/`.
- **Vue loader path must be relative** — `templates/index.html`
  references `/.claude/shared/loader.js`. Under `file://` the
  browser resolves this to the filesystem root, NOT the project's
  `.claude/` directory. The analyze script substitutes a relative
  path (`../../.claude/shared/loader.js`) at copy time.
- **Section 3 (Test Report) is generated with placeholder pass/fail
  checkboxes** — the analyzer marks each step pass/fail based on
  its own facet probes. The page never recomputes; it only renders
  what `data.js` says.
- **The markdown mirror collides with `rui-init` when both run** —
  set `MERGE_SCENES=false` if you want the report to own its
  scenes, or run `rui-init` last so its scenes overwrite the
  mirror.

## Supporting resources

- [references/methodology.md](./references/methodology.md) — per-scene measurement methodology + facet detection rules.
- [references/scene-catalog.md](./references/scene-catalog.md) — the six scenes with their detection rules and §0–§4 shape.
- [rules/test-contracts.md](./rules/test-contracts.md) — analyzer ↔ page data contract, scene payload schema.
- [agents/scene-analyzer.md](./agents/scene-analyzer.md) — per-scene facet probe prompts (run as subagents when scope is large).
- [agents/doc-tracer.md](./agents/doc-tracer.md) — doc-code consistency probe.
- [agents/security-surface-tracer.md](./agents/security-surface-tracer.md) — security surface detection.
- [commands/analyze.md](./commands/analyze.md) — user-facing CLI reference.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `scope` not found | Abort with `scope-not-found`; print usage |
| No source files after exclusions | Render all six scenes with `# TODO: empty scope` |
| Test framework not detected | Render `pre-commit-incremental-self-check` with `partial` verdict and TODO note |
| Docs directory missing | Render `doc-code-consistency` with `fail` verdict — no docs is a regression |
| `MERGE_SCENES=true` but `docs/test/` is read-only | Skip markdown emit, log warning, continue with report |
| `rui-init` not installed | Page still renders; the markdown mirror step is skipped |
| User invokes `/rui-report-test` outside a git repo | Proceed — git is not required for any facet |
