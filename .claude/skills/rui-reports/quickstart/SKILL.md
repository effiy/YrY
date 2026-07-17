---
name: rui-report-quickstart
description: >
  Generate a "newcomer quickstart" onboarding report for a specified
  local project scope — produces a self-contained HTML page (Vue 3
  with 4-file template split, same convention as rui-report-files /
  rui-report-diagram / rui-report-self-test) AND a hand-editable
  markdown mirror that doubles as a knowledge base. The page reads
  as a guided tour: project overview, key concepts, directory map,
  5–10 step onboarding flow, command cheatsheet, FAQ, and further
  reading. Walks the scope to detect language, framework, entry
  points, test framework, and docs; emits the canonical 7-section
  quickstart payload with a per-scenario verdict and a composite
  onboarding score. Use when a new team member joins, when handing
  off a project, when an open-source repo needs an onboarding
  guide, or when auditing what a project teaches to a first-day
  developer. Triggers: "onboarding report", "newcomer guide",
  "quickstart report", "project walkthrough", "first-day guide",
  "team handoff", "open source onboarding", "新人快速入门",
  "新人上手", "项目导览", "给新人看的页面".
lifecycle: default-pipeline
user_invocable: true
---

# rui-report-quickstart

> A "newcomer quickstart" report generator for any local project
> scope — produces a self-contained HTML page + a markdown mirror
> that doubles as a hand-editable knowledge base. Fuses the
> 6-stage static-analysis pipeline of `rui-reports/files`, the
> docs/quickstart/ scaffold contract of `rui-docs-quickstart`, and
> the README-craft orientation of `rui-docs-readme`.

## Quick Start

```bash
# Generate the newcomer quickstart report for a project
/rui-report-quickstart create --scope <project-path> [--out docs/reports/quickstart]

# Default output paths
#   HTML:  <out>/index.html  (self-contained, Vue 3 + 4-file template)
#   MD  :  <out>/README.md   (hand-editable knowledge base)
```

## What this skill does

- Walks a project scope and detects: language, framework, entry
  points, test framework, docs presence, dependency surface, and
  contributor metadata.
- Synthesizes the **canonical 7-section quickstart payload**:
  project overview → key concepts → directory map → onboarding
  flow → command cheatsheet → FAQ → further reading.
- Renders the payload as a **self-contained Vue 3 page** at
  `<out>/index.html` using the 4-file template split (mirrors
  `rui-report-files`' modular pattern).
- Writes a **markdown mirror** at `<out>/README.md` so the report
  doubles as a hand-editable knowledge base (compatible with any
  static site, git repo, or wiki).
- Computes a per-scenario verdict (`pass / partial / fail`) and a
  composite onboarding score, surfaced in the page header.

## What this skill does NOT do

- Does NOT run unit tests, integration tests, or any executable
  test suite — the verdict is derived from static analysis, not
  from executing project tests.
- Does NOT modify the project source — reads from `<scope>/`,
  writes only to `<out>/`.
- Does NOT pull dependencies, build, or deploy — the report is
  entirely static + offline.
- Does NOT replace `rui-docs-quickstart` (the operator's manual for
  a `docs/quickstart/` scaffold) — this skill generates a
  **newcomer-facing page**, not a maintainer manual.
- Does NOT replace `rui-docs-readme` (the curated README exemplar
  navigator) — this skill emits original content derived from the
  scope, not curated exemplars.
- Does NOT invent content. Every claim is grounded in a real
  file/line/symbol from the scope or rendered as `# TODO`.

## Workflow

```
walk scope → detect facets → assemble payload → score → emit
  │             │                  │              │       │
  │             │                  │              │       └─ data.js + index.{html,css,js} + README.md
  │             │                  │              └─ composite score + per-scenario verdict
  │             │                  └─ 7 sections in canonical order
  │             └─ language, framework, entry, tests, docs, deps, contributors
  └─ file inventory (borrowed from rui-reports/files Stage 1)
```

Key principles:
1. **One analyzer, one page + one mirror.** The analyzer walks
   `<scope>/`, writes `data.js` for the HTML page AND writes
   `README.md` for the markdown mirror in the same run.
2. **The page is a guided tour, not a reference.** Sections are
   ordered: project overview → key concepts → directory map →
   5–10 step onboarding flow → command cheatsheet → FAQ → further
   reading. Newcomers read top-to-bottom.
3. **The mirror is byte-stable for section headers.** The 7
   section names are fixed; the body is regenerated on each run.
   The mirror survives in any static site, git repo, or knowledge
   base without rewrites.
4. **No fabrication.** Every claim is grounded in a real
   file/line/symbol from the scope. Missing data renders as a
   `# TODO` block, never as invented prose.
5. **The report never runs project tests or builds.** The verdict
   is computed from static facet probes (manifest presence, entry
   point resolution, docs existence), not from execution.

## Output contract

The rendered artifact is a single browser-viewable page at
`<out>/index.html` + a markdown mirror at `<out>/README.md`. The
HTML page's **sources** follow the 4-file template split (mirrors
`rui-report-files` / `rui-report-diagram` / `rui-report-self-test`):

| File | Header to read | Customization focus |
|------|----------------|---------------------|
| `templates/index.html` | `@sections`, `@command`, `@style` | DOM section order, script load order, vendor script tags, inline favicon |
| `templates/index.css` | `@layer order: reset, tokens, base, layout, components, utilities, responsive, print` | Color tokens (`:root` `--color-*` / `--text-*` / `--bg-*`), spacing tokens, new component classes |
| `templates/data.js` | `@shape` JSDoc block listing every `window.REPORT_DATA` field | All textual content + the 7-section payload |
| `templates/index.js` | `useTourProgress` / `useExport` JSDoc | Only edit these if you need new Vue composables or new export targets |

### 7-section payload contract

The page MUST contain 7 sections in this canonical order:

| # | Section | Slug | Required content |
|---|---------|------|------------------|
| 1 | Project Overview | `overview` | one-paragraph elevator pitch + language/framework badges + LOC/file count |
| 2 | Key Concepts | `concepts` | 5–10 domain terms with one-line glossaries; each term grounded in a real file/symbol |
| 3 | Directory Map | `directory-map` | annotated tree of the top 3 directory levels with per-dir purpose comments |
| 4 | Onboarding Flow | `onboarding-flow` | 5–10 numbered steps a newcomer follows day-1, each with a one-line action + expected outcome |
| 5 | Command Cheatsheet | `commands` | 5–10 most-used CLI commands (build, test, lint, dev) with one-line explanations |
| 6 | FAQ | `faq` | 5–10 Q&A pairs derived from README / CONTRIBUTING / docs; missing data renders as `# TODO` |
| 7 | Further Reading | `further-reading` | 5–10 links to CONTRIBUTING, LICENSE, deep-dive docs, related projects |

### Markdown mirror

`<out>/README.md` MUST contain the same 7 sections with identical
`# / ##` headers (so any markdown-aware static site, wiki, or git
rendering tool produces a navigable page). Body content mirrors
the HTML page but uses GFM tables / fenced code blocks instead of
Vue components.

### Shared resources (no public CDN)

The templates load infrastructure from `/.claude/shared/`, NOT
from public CDNs. Same convention as `rui-report-files`,
`rui-report-diagram`, `rui-report-self-test`.

| Resource | Path |
|----------|------|
| Vue 3.4.27 | `/.claude/shared/loader.js` |
| html2canvas 1.4.1 | `/.claude/shared/vendor/html2canvas@1.4.1/html2canvas.min.js` |
| jsPDF 2.5.2 | `/.claude/shared/vendor/jspdf@2.5.2/jspdf.umd.min.js` |
| `<rui-back-top>` | `/.claude/shared/components/rui-back-top/index.js` |
| `<rui-tag-chip>` | `/.claude/shared/components/rui-tag-chip/index.js` |

If a future contributor adds a public CDN `<script src>`, the
page will fail offline and the rui-tools probe will fail the
`requestFailures: []` assertion.

## Severity thresholds (per-scenario verdict)

| Coverage | Verdict | UI badge |
|----------|---------|----------|
| ≥ 0.90 | `pass` | ✅ green |
| 0.50 – 0.89 | `partial` | ⚠️ amber |
| < 0.50 | `fail` | 🚫 red |

Composite score = `mean(scenario.coverage) × 100`, rounded.
Grade: A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, F < 40.

## Borders

| Boundary | Permission |
|----------|-----------|
| `<scope>/**` (project under analysis) | read-only |
| `<out>/**` (report output) | write |
| `templates/**`, `references/**`, `commands/**` (this skill) | read |
| Outside `<scope>` and this skill | no access |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Always render all 7 sections — fill missing data with `# TODO` markers | The page is canonical; partial coverage is still reportable |
| 2 | Never invent file paths not present in the scope inventory | The directory map and onboarding flow must reference real artifacts |
| 3 | Verdicts are computed by the analyzer, never the page | The page renders state, it does not evaluate it |
| 4 | `data.js` MUST contain all 7 sections in canonical order | The page does no reordering |
| 5 | Markdown mirror is byte-stable for section headers; the body is regenerated | The mirror must survive in any static site or git repo |
| 6 | Re-run on file change; do NOT hot-reload verdicts | Verdicts depend on the static inventory snapshot |
| 7 | No external CDN — Vue 3 + shared components load from `/.claude/shared/` | Works under `file://` and offline |
| 8 | Do not call external test runners or package managers | This skill is static-analysis only |
| 9 | Every claim in the 7 sections must cite a real file/line/symbol or render as `# TODO` | Fabricated content is worse than missing content |
| 10 | Keep both outputs in sync — `data.js` and `README.md` are written in the same run | The mirror is a view of the same payload, not a separate artifact |

## Supporting resources

- [commands/create.md](./commands/create.md) — user-facing CLI reference (the `/rui-report-quickstart create` entry point).
- [evals/evals.json](./evals/evals.json) — test prompts covering the 7 sections, the markdown mirror, the verdict, and the no-fabrication rule.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `scope` not found | Abort with `scope-not-found`; print usage |
| No source files after exclusions | Render all 7 sections with `# TODO: empty scope`; do NOT fail |
| No package manifest (`package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod`) | Render `commands` section with `# TODO: no manifest detected`; infer commands from README if present |
| No docs directory | Render `faq` and `further-reading` with `# TODO: no docs` placeholders |
| No CONTRIBUTING / no LICENSE | Render `further-reading` with `# TODO` placeholders; do NOT fabricate links |
| `out` directory read-only | Stage in `/tmp/rui-report-quickstart-<scope>`, copy to target; surface the temp path in the report footer |
| `rui-docs-quickstart` not installed | Page still renders; section content is original (not borrowed) |
| `rui-docs-readme` not installed | Page still renders; `further-reading` does not depend on the README navigator |
| User invokes `/rui-report-quickstart` outside a git repo | Proceed — git is not required for any facet |
| Same scope, re-run | Overwrite both `index.html` and `README.md`; `data.js` is regenerated; preserve any hand-edits to the mirror's body (warn if dirty) |
