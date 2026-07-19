---
name: rui-report-quickstart
description: >
  Generate a newcomer quickstart report for a local project scope.
  Produces a browser-viewable HTML guide and, by default, a markdown
  mirror. Built from a 4-file page template (data.js + index.html
  + index.css + index.js) plus a self-contained components/ subtree
  of 17 qs-* Vue components, so every report renders consistently
  with the rest of the rui-reports catalog. The output language is
  English by default; pass --language zh to switch to Chinese. Uses
  static evidence only, renders all seven canonical sections, and
  fills gaps with TODO markers instead of invented content.
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
2. Always build the page from the bundled 4-file page template at
   `templates/{data.js, index.html, index.css, index.js}` plus the
   17 self-contained Vue components under `templates/components/`.
   The template is the single source of truth for the page layout,
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
| `<out>/index.html`    | yes | `templates/index.html`    | Browser-viewable newcomer quickstart |
| `<out>/index.css`     | yes | `templates/index.css`     | Page-level styles (tokens, layout, chrome, TOC, utilities) |
| `<out>/index.js`      | yes | `templates/index.js`      | Vue 3 orchestrator (chrome, palette, modal, `quickstartToMarkdown()`) |
| `<out>/data.js`       | yes | regenerated each run      | `window.QUICKSTART_DATA` (the actual report content) |
| `<out>/components/`   | yes | `templates/components/`   | 17 self-contained `qs-*` Vue components (charts, hero, sections, overlay) |
| `<out>/README.md`     | no  | `quickstartToMarkdown(data)` | Markdown mirror, skipped when `--no-mirror` is used |

Notes:
- The 4 page files `index.html` / `index.css` / `index.js` / `data.js` and the entire `components/` subtree are copied verbatim from `templates/` every run. The only regenerated file is `data.js`, which carries the scope-derived content.
- `components/` ships 17 directories: 4 chart components (`qs-donut`, `qs-coverage-cell`, `qs-mini-bars`, `qs-sparkline`), 4 hero components (`qs-hero-path`, `qs-coverage-gaps`, `qs-skill-landscape`, `qs-stack-diagram`), 7 section renderers (`qs-overview`, `qs-concepts`, `qs-directory-map`, `qs-onboarding-flow`, `qs-commands`, `qs-faq`, `qs-further-reading`), and 2 overlays (`qs-palette`, `qs-modal`). Each follows the rui bootstrap convention with `data.js` + `index.html` + `index.css` + `index.js`.
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
- [templates/data.js](./templates/data.js) — data schema (defaults, scope-derived dataset, `computeScore`); supports optional `overview.hero / .landscape / .stack / .byTheNumbers / .whatYoullShip` blocks
- [templates/index.html](./templates/index.html) — page shell with `<script>` tags for all 17 `qs-*` components
- [templates/index.css](./templates/index.css) — page-level styles (reset → tokens → base → chrome → layout → toc → page-level components → utilities → animations → responsive → print). Component-specific styles live in `templates/components/<category>/<name>/index.css`.
- [templates/index.js](./templates/index.js) — Vue 3 orchestrator: page chrome (header, TOC, score banner, sections, footer), keyboard shortcuts, search filter, command palette + detail modal mounting, `quickstartToMarkdown()` (full) + `quickstartToMarkdownSection(slug, data)` (per section). Loads and registers all 17 `qs-*` components from `templates/components/` via the rui bootstrap convention.
- [templates/components/](./templates/components/) — 17 self-contained `qs-*` Vue components, each in its own `data.js + index.html + index.css + index.js` directory:
  - **charts**: `qs-donut`, `qs-coverage-cell`, `qs-mini-bars`, `qs-sparkline`
  - **hero**: `qs-hero-path`, `qs-coverage-gaps`, `qs-skill-landscape`, `qs-stack-diagram`
  - **sections**: `qs-overview`, `qs-concepts`, `qs-directory-map`, `qs-onboarding-flow`, `qs-commands`, `qs-faq`, `qs-further-reading`
  - **overlay**: `qs-palette`, `qs-modal`
- [evals/evals.json](./evals/evals.json) — prompt coverage for the main interaction patterns

## In-page interactions

The template ships a reactive Vue 3 app so the generated page is useful as both a final artifact and a live demo. The page maximises visual coverage and uses charts-instead-of-text wherever evidence is quantitative.

- **Hero onboarding path** (top of page): big "Ship your first skill in ≈ 18 min" panel with a 5-step node graph (Detect → Explore → Generate → Arch → Verify). Each step shows a coloured dot, time estimate, type badge (`read` / `view` / `run`), and a file or command reference. Below the path is a `Coverage gaps` callout that lists the sections dragging the score below 90%.
- **By the numbers** (overview): three big-number stat cards (manifests · pipeline steps · onboarding score) with coloured top accents.
- **Tech stack diagram** (overview): layered boxes for Source → Manifest → Runtime → Output, each item colour-coded via `color-mix` design tokens.
- **KPI tiles with sparklines** (overview): 4 stat tiles with embedded SVG area charts showing growth over 10 release checkpoints.
- **What you'll ship** (overview): 3 deliverable cards (docs dashboard · arch scenes · verified counts) with coloured left borders.
- **Skill landscape** (overview): treemap of 5 skill groups sized by manifest count, plus a growth sparkline and distribution list aside.
- **Score banner** with composite score bars + verdict-segmented donut ring. The score ring uses pure SVG (no chart library).
- **Coverage grid** (banner): 7 radial cells, one per section, color-coded by verdict (green / amber / red).
- **Sticky section TOC** (left rail on desktop, top bar on mobile): a 7-item navigation list with active-section highlight driven by `IntersectionObserver`. Each item shows a verdict dot.
- **Command palette** (`⌘K` / `Ctrl+K`): search and navigate any section, command, FAQ, or further-reading entry. Keyboard-first, fuzzy search over the indexed entries.
- **Detail modal** (palette result): clicking a palette entry opens a focused modal showing the source markdown for that section.
- **Per-section copy** (section header): each section has its own copy button that calls `window.quickstartToMarkdownSection(slug, data)`. The button label flips to `Section copied` for 1.5s.
- **Onboarding step tracker** (top of page): a horizontal progress bar that the user can mark complete; state persists in `localStorage` under `rui-report-quickstart:steps`.
- **FAQ collapse**: each FAQ item is a click-to-expand card; collapse state persists in `localStorage` under `rui-report-quickstart:faq`.
- **Role filter chips** (concepts section): multi-select chips that filter the concept list by role (manifest / directory / frontmatter / sub-skill).
- **Keyboard shortcuts**: `j` / `k` move between sections, `t` jumps to the top, `c` copies the current section, `?` opens a shortcut help overlay, `⌘K` opens the palette. Shortcuts are ignored when typing in inputs.
- **Animated count-up** (score banner): the composite score counts up from 0 → N over 600ms with ease-out cubic on first render.
- **Print friendly**: the palette, modal, CTA buttons, stepper, role chips, and animated overlays are hidden via `@media print`; landscape cells switch to a print-friendly palette.
