---
name: rui-report-quickstart
description: >
  Generate a newcomer quickstart report for a local project scope.
  Produces a browser-viewable HTML guide and, by default, a markdown
  mirror. Uses the 4-file template at templates/ (data.js + index.html
  + index.css + index.js) so every report renders consistently with
  the rest of the rui-reports catalog. The output language is English
  by default; pass --language zh to switch to Chinese. Uses static
  evidence only, renders all seven canonical sections, and fills gaps
  with TODO markers instead of invented content.
lifecycle: default-pipeline
user_invocable: true
arguments:
  - name: scope
    description: Local project path to analyze. Defaults to the current working directory.
    required: false
  - name: out
    description: Output directory for the report. Defaults to `docs/reports/quickstart/`.
    required: false
  - name: language
    description: Output language. Defaults to `en`. Use `zh` to switch to Chinese.
    required: false
  - name: depth
    description: Directory-map depth. Positive integer, default `3`.
    required: false
  - name: no-mirror
    description: Skip the markdown mirror and emit HTML only.
    required: false
  - name: title
    description: Override the report title.
    required: false
---

# rui-report-quickstart

Generate a newcomer-facing onboarding guide for any local repo or subdirectory. The skill reads the scope, detects the main entry points and documentation surface, and emits a guided tour rather than a maintainer manual.

## When to use

- A new teammate needs a first-day guide for an existing project.
- A repo handoff needs a fast onboarding artifact.
- An open-source project needs a browser-viewable quickstart plus an editable markdown mirror.
- You want to audit how well a project teaches its own structure and common commands.

## Not for

- Architecture diagrams. Use `rui-report-diagram`.
- File-size or coupling analysis. Use `rui-report-files`.
- Six-scene repo health checks. Use `rui-report-test`.
- Long-form `docs/quickstart/` maintainer documentation. This skill is for newcomers, not scaffold operators.

## Usage

```bash
# Default scope = current directory, language = English
/rui-report-quickstart create

# Typical usage
/rui-report-quickstart create --scope <project-path> --out docs/reports/quickstart

# Chinese output (overrides the English default)
/rui-report-quickstart create --scope <project-path> --language zh

# HTML only
/rui-report-quickstart create --scope <project-path> --no-mirror
```

## Core contract

1. Always render the seven canonical sections in this order:
   `overview` -> `concepts` -> `directory-map` -> `onboarding-flow` -> `commands` -> `faq` -> `further-reading`.
2. Always build the page from the bundled 4-file template at
   `templates/{data.js, index.html, index.css, index.js}`. The
   template is the single source of truth for the page layout,
   section order, verdict/composite scoring, and the markdown
   mirror exporter (`window.quickstartToMarkdown(data)`).
3. The output language is **English by default**. Pass `--language zh`
   to switch to Chinese. Auto-detect from the user's prompt is no
   longer used; the choice is always explicit.
4. Every claim must be backed by a real file, line, symbol, command, or manifest entry from the analyzed scope.
5. When evidence is missing, render `# TODO: <reason>` instead of guessing.
6. The report is static-analysis only. Do not run project tests, installs, builds, or deploys unless the user explicitly asks for that.
7. Read from `<scope>` and write only to `<out>`.

## Deliverables

| Path | Required | Source | Purpose |
|------|----------|--------|---------|
| `<out>/index.html` | yes | `templates/index.html` | Browser-viewable newcomer quickstart |
| `<out>/index.css`  | yes | `templates/index.css`  | All page styles, layered |
| `<out>/index.js`   | yes | `templates/index.js`   | Vue 3 app + section renderers |
| `<out>/data.js`    | yes | regenerated each run   | `window.QUICKSTART_DATA` (the actual report content) |
| `<out>/README.md`  | no  | `quickstartToMarkdown(data)` | Markdown mirror, skipped when `--no-mirror` is used |

Notes:
- The 4 files `index.html` / `index.css` / `index.js` / `data.js` are copied verbatim from `templates/` every run. The only regenerated file is `data.js`, which carries the scope-derived content.
- The markdown mirror (`README.md`) is produced by calling `window.quickstartToMarkdown(data)` from `templates/index.js`. Identical `##` headers to the HTML page are the contract.
- All shared infrastructure (Vue 3, `<rui-back-top>`) loads from `/.claude/shared/` — no public CDN.

## Section contract

| # | Section | Slug | Required content |
|---|---------|------|------------------|
| 1 | Project Overview | `overview` | Elevator pitch, primary language/framework, high-level size or scope cues |
| 2 | Key Concepts | `concepts` | 5-10 domain terms, modules, or symbols with grounded one-line explanations |
| 3 | Directory Map | `directory-map` | Annotated tree up to the requested depth |
| 4 | Onboarding Flow | `onboarding-flow` | 5-10 ordered first-day steps with expected outcomes |
| 5 | Command Cheatsheet | `commands` | Common dev/test/lint/build/run commands, or TODO markers when absent |
| 6 | FAQ | `faq` | 5-10 grounded Q&A pairs, usually derived from README, docs, or CONTRIBUTING |
| 7 | Further Reading | `further-reading` | Important docs, policies, deep dives, and related links inside the scope |

If the markdown mirror is emitted, it must keep the same section titles and order as the HTML report.

## Scoring

| Coverage | Verdict | Meaning |
|----------|---------|---------|
| `>= 0.90` | `pass` | Section is well grounded and nearly complete |
| `0.50 .. 0.89` | `partial` | Section is useful but has meaningful gaps |
| `< 0.50` | `fail` | Section is mostly TODOs or thin evidence |

Composite score = `mean(section.coverage) * 100`, rounded.

Grade scale:
- `A`: `>= 90`
- `B`: `>= 75`
- `C`: `>= 60`
- `D`: `>= 40`
- `F`: `< 40`

The score measures onboarding completeness, not code quality. The data schema in `templates/data.js` exposes a `computeScore(sections)` helper that derives the composite, grade, and per-section verdicts from the coverage values. The create command should call it (or compute the same thing) before writing `data.js`.

## Boundaries

| Boundary | Permission |
|----------|-----------|
| `templates/**` (this skill) | read |
| `commands/**`, `evals/**`, `references/**` in this skill | read |
| `<scope>/**` | read-only |
| `<out>/**` | write |
| `/.claude/shared/**` (loader, components) | read |
| Outside the scope and chosen output directory | avoid unless required for the user's explicit request |

## Fallbacks

| Situation | Behavior |
|-----------|----------|
| Scope path does not exist | Abort with a clear usage error |
| Scope is empty after exclusions | Render all seven sections with `# TODO: empty scope` |
| No manifest found | Infer commands from README or docs; otherwise use TODO markers |
| No README or docs | Keep all sections, but let `faq` / `further-reading` become TODO-heavy |
| No detected entry points | Keep `overview`, mark `concepts` / `onboarding-flow` with TODOs where needed |
| `--no-mirror` used | Emit only `index.html` (+ `index.css`, `index.js`, `data.js`); skip `README.md` |
| Re-run into existing outputs | Overwrite generated files; warn before replacing obvious manual edits when feasible |
| User passes `--language zh` | Overwrite `data.js` `labels` block with the Chinese label set; page UI switches accordingly |
| User passes neither `--language` nor an explicit hint | Default to **English** (`en`) |

## Supporting files

- [commands/create.md](./commands/create.md) — execution playbook for `/rui-report-quickstart create`
- [templates/data.js](./templates/data.js) — data schema (defaults, three example datasets `python` / `ts` / `go`, `mergeWithDefaults`, `computeScore`)
- [templates/index.html](./templates/index.html) — page shell
- [templates/index.css](./templates/index.css) — layered styles (reset → tokens → base → layout → toolbar → toc → components → sections → utilities → responsive → print)
- [templates/index.js](./templates/index.js) — reactive Vue 3 app, per-section renderers, `quickstartToMarkdown()` (full) + `quickstartToMarkdownSection(slug, data)` (per section)
- [evals/evals.json](./evals/evals.json) — prompt coverage for the main interaction patterns

## In-page interactions

The template ships a reactive Vue 3 app so the generated page is useful as both a final artifact and a live demo:

- **Dataset switcher** (toolbar): cycle through three reference datasets — `python` (small CLI, score ≈ B), `ts` (TypeScript monorepo, score ≈ C), `go` (Go HTTP service, score ≈ A) — to see how the template renders different project shapes and score levels.
- **Coverage filter** (toolbar): `All sections` / `Pass + partial` / `Pass only`. Driven by a `data-filter` attribute on `<main>`; the CSS hides sections whose `data-verdict` does not match.
- **Theme switcher** (toolbar): `Auto` / `Light` / `Dark`. Sets `data-theme` on `<html>`; choice persists in `localStorage` under `rui-report-quickstart:theme`.
- **Score ring** (banner): an SVG arc gauge whose `stroke-dasharray` / `stroke-dashoffset` are computed from `data.score.composite`. Color follows the grade (A green, B blue, C amber, D orange, F red).
- **Sticky section TOC** (left rail on desktop, top bar on mobile): a 7-item navigation list with active-section highlight driven by `IntersectionObserver` (`rootMargin: '-20% 0px -65% 0px'`). Each item shows a verdict dot.
- **Coverage bar** (section header): a per-section visual progress bar next to the verdict pill, so coverage gaps are visible at a glance.
- **Copy markdown** (toolbar): copies the full report as markdown via `window.quickstartToMarkdown(data)`. The button label flips to `Copied!` for 1.5s, matching the project's copy-feedback convention.
- **Per-section copy** (section header): each section has its own copy button that calls `window.quickstartToMarkdownSection(slug, data)` to copy just that section's markdown. The button label flips to `Section copied` for 1.5s.
- **Print friendly**: the toolbar, TOC, and copy buttons are hidden via `@media print`; sections use `break-inside: avoid`.
