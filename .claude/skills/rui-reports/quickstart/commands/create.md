---
name: quickstart-create
description: >
  Generate a newcomer quickstart report for a local project scope.
  Builds the page from the 4-file template at templates/, regenerates
  data.js with scope-derived evidence, and emits an optional markdown
  mirror via quickstartToMarkdown(). Output language is English by
  default; pass --language zh to switch.
---
# rui-report-quickstart - Create

Generate the canonical seven-section newcomer quickstart for a local project scope. Keep the output grounded, concise, and practical for a first-day engineer.

## Inputs

`$ARGUMENTS` may contain:

- `--scope <path>` - local project path to analyze. Defaults to the current working directory.
- `--out <path>` - output directory. Defaults to `docs/reports/quickstart/`.
- `--language <lang>` - output language: `en` (default) or `zh`. No auto-detect.
- `--depth <n>` - positive integer for directory-map depth. Default `3`.
- `--no-mirror` - skip `README.md` and emit HTML only.
- `--title <text>` - override the report title.

## Preferred tools

| Tool | Use |
|------|-----|
| `Read` | Inspect README, CONTRIBUTING, manifests, entry points, and docs |
| `Grep` / `Glob` | Inventory files, manifests, scripts, and common commands |
| `SearchCodebase` | Find entry points, framework markers, and concept-heavy modules |
| `RunCommand` | Optional lightweight inspection such as `git rev-parse` when helpful |
| `Task` | Optional for large scopes that benefit from parallel facet discovery |
| `Read` on `templates/data.js` | Read `@data_shape` JSDoc to understand the schema contract before writing `data.js` |

## Template-based output

The skill ships a 4-file page template at `templates/` plus a self-contained `components/` subtree with 17 reusable `qs-*` Vue components:

| File / Dir | Role at run time |
|------------|------------------|
| `templates/index.html` | Page shell, copied verbatim. `<title>` placeholder is replaced at write time. |
| `templates/index.css`  | Page-level styles (tokens, layout, chrome, TOC, utilities). Component-specific styles live in each `components/<category>/<name>/index.css`. |
| `templates/index.js`   | Vue 3 orchestrator (page chrome, palette, modal, `quickstartToMarkdown(data)` exporter). Copied verbatim. |
| `templates/data.js`    | Schema reference; `QUICKSTART_DATA_SCHEMA.merge(input)` deep-merges defaults with the run's data; `QUICKSTART_DATA_SCHEMA.computeScore(sections)` derives the composite + grade. |
| `templates/components/`| 17 self-contained `qs-*` components (charts, hero panel, section renderers, overlays). Copied verbatim. Each component is a directory holding `data.js` + `index.html` + `index.css` + `index.js` and follows the rui bootstrap convention. |

The create command must:

1. Copy `templates/index.html`, `templates/index.css`, `templates/index.js` to `<out>/` verbatim (substitute `{{QUICKSTART_TITLE}}` in `index.html` with `meta.title`).
2. Copy the entire `templates/components/` subtree to `<out>/components/` (17 `qs-*` component directories). The page shell already wires the load order via `<script src="components/.../index.js">` tags.
3. Read `templates/data.js` to learn the `@data_shape` JSDoc and the `merge` / `computeScore` helpers.
4. Build the section data (one entry per canonical slug) from scope evidence.
5. Compute the score via `QUICKSTART_DATA_SCHEMA.computeScore(sections)` (or by hand, matching the formula in SKILL.md).
6. Write the merged `data.js` to `<out>/data.js` with `window.QUICKSTART_DATA = { meta, labels, score, sections }`. When `--language zh` is passed, swap the `labels` block for the Chinese set.
7. If `--no-mirror` is not set, call `window.quickstartToMarkdown(window.QUICKSTART_DATA)` and write the result to `<out>/README.md`. The `##` headers must match the section titles in `data.js`.

## Execution flow

### Phase 1 - Resolve scope and output

1. Resolve `SCOPE` from `--scope` or the current working directory.
2. Resolve `OUT_DIR` from `--out` or `docs/reports/quickstart/`.
3. Resolve the output language from `--language`. **Default is `en`** — do not auto-detect from the user's prompt.
4. Resolve directory depth from `--depth`; default to `3` if absent.
5. If the scope does not exist or is unreadable, stop with a clear usage error.

### Phase 2 - Walk the scope

Walk the scope with standard exclusions:

`node_modules` `.git` `dist` `build` `.next` `.turbo` `coverage` `target` `.claude` `.DS_Store`

Collect enough evidence to answer:

- What language dominates the scope?
- What framework or runtime is present?
- Where are likely entry points?
- What commands or scripts are documented or declared?
- What docs exist for onboarding?
- Which directories matter to a newcomer?

Prefer light static probes over exhaustive scanning. This skill is an onboarding report, not a full repo census.

### Phase 3 - Detect facets

Build a small facet record from grounded evidence:

| Facet | Evidence examples | Used by |
|------|-------------------|---------|
| `language` | dominant extension, manifest metadata, lock files | overview, commands |
| `framework` | dependencies, config files, known conventions | overview, concepts |
| `entryPoints` | `main`, `bin`, `src/main.*`, server bootstrap files | overview, onboarding-flow |
| `commands` | `package.json#scripts`, Makefile, README code fences, task runners | commands, onboarding-flow |
| `tests` | test directories, test frameworks, CI snippets | commands, onboarding-flow |
| `docs` | README, CONTRIBUTING, docs/, ADRs, architecture notes | faq, further-reading |

Each section should be explainable from this evidence. If not, fall back to TODO markers.

### Phase 4 - Build the seven sections

Always emit the seven sections in canonical order:

1. `overview`
2. `concepts`
3. `directory-map`
4. `onboarding-flow`
5. `commands`
6. `faq`
7. `further-reading`

Section guidance (each maps to a key in `data.sections`):

| Slug | Build guidance | Fallback |
|------|----------------|----------|
| `overview` | one-paragraph summary, primary stack, scope cues | `{ isTodo: true, reason: 'project overview evidence is missing' }` |
| `concepts` | 5-10 modules, domain terms, or symbols with grounded glossaries | `{ isTodo: true, reason: 'no stable concepts detected' }` |
| `directory-map` | annotated tree up to `--depth` | `{ isTodo: true, reason: 'scope is too sparse for a useful map' }` |
| `onboarding-flow` | 5-10 ordered first-day steps using real files and commands | `{ isTodo: true, reason: 'no grounded onboarding flow found' }` |
| `commands` | most-used run/test/lint/build commands with short explanations | `{ isTodo: true, reason: 'no commands or scripts detected' }` |
| `faq` | likely newcomer questions answered from grounded evidence; for skill scopes, prioritize the matching `evals/evals.json`, then use docs and code evidence | `{ isTodo: true, reason: 'no FAQ source material found' }` |
| `further-reading` | README, docs, policies, deep dives, key subdirectories | `{ isTodo: true, reason: 'no further reading found' }` |

Per-section shapes are documented in `templates/data.js` (`@section_kinds`).

Rules:

- Never invent files, commands, symbols, or workflows.
- Technical names stay in their original language.
- Missing evidence lowers coverage; it does not block report generation.

### Phase 5 - Score the report

Use `QUICKSTART_DATA_SCHEMA.computeScore(sections)` to derive:

- `score.composite` — `mean(section.coverage) * 100`, rounded
- `score.grade`     — `A >= 90`, `B >= 75`, `C >= 60`, `D >= 40`, `F < 40`
- `score.verdicts`  — per-slug `pass` (`>= 0.90`) / `partial` (`0.50..0.89`) / `fail` (`< 0.50`)

This score reflects onboarding completeness, not runtime quality.

### Phase 6 - Emit outputs

Required outputs:

- `<OUT_DIR>/index.html` (copied from `templates/index.html` with `{{QUICKSTART_TITLE}}` replaced)
- `<OUT_DIR>/index.css`  (copied verbatim from `templates/index.css`)
- `<OUT_DIR>/index.js`   (copied verbatim from `templates/index.js`)
- `<OUT_DIR>/data.js`    (regenerated; merges `meta`, `labels`, `score`, `sections`)
- `<OUT_DIR>/components/` (copied verbatim from `templates/components/`; 17 `qs-*` component directories, the page shell already wires the load order)

Optional output:

- `<OUT_DIR>/README.md` unless `--no-mirror` is set. Generate via
  `window.quickstartToMarkdown(window.QUICKSTART_DATA)` (loaded by
  including `templates/index.js` once, in memory only — do not rely
  on a browser to produce the markdown mirror). The exporter keeps
  the same `##` headers in the same order as the HTML page.

Emission rules:

1. The HTML report must contain all seven sections in canonical order.
2. If the markdown mirror is emitted, keep the same section titles and order.
3. Overwrite prior generated outputs on re-run. When obvious manual edits are detected, warn before replacement if the runtime allows.
4. When `--language zh` is passed, swap the `data.js` `labels` block for the Chinese set; the page UI will switch accordingly. The English defaults in `templates/data.js` are the canonical baseline.

## Progress reporting

Report concise progress in these stages:

- `[1/6] Resolving scope and output...`
- `[2/6] Walking scope...`
- `[3/6] Detecting facets...`
- `[4/6] Building seven sections...`
- `[5/6] Computing score and verdicts...`
- `[6/6] Writing outputs...`

## Pre-delivery checklist

Before finishing, verify:

| # | Check |
|---|-------|
| 1 | `index.html`, `index.css`, `index.js`, `data.js` exist and are non-empty |
| 2 | `components/` subtree exists with 17 `qs-*` directories, each holding `data.js` + `index.html` + `index.css` + `index.js` |
| 3 | `README.md` exists unless `--no-mirror` was used |
| 4 | All seven sections appear in canonical order in both HTML and (when present) README |
| 5 | TODO markers exist where evidence is missing instead of guessed prose |
| 6 | No placeholder text such as `[TODO]`, `TBD`, or `Lorem ipsum` remains |
| 7 | Composite score, grade, and per-section verdicts are surfaced in the score banner |
| 8 | `data.js` `meta.language` matches the resolved `--language` (defaults to `en`) |
| 9 | Final response reports output path plus the main gaps |

## Fallbacks

| Situation | Behavior |
|-----------|----------|
| Missing manifest | Infer commands from docs, or emit TODO markers |
| Missing README and docs | Still generate all sections, with TODO-heavy `faq` and `further-reading` |
| No obvious entry points | Keep the report, but let `concepts` and `onboarding-flow` degrade with TODOs |
| Empty scope after exclusions | Emit a full TODO report instead of failing |
| `--no-mirror` | Skip `README.md` cleanly; still emit the 4 HTML/JS/CSS/data files |
| User passes `--language zh` | Replace `data.js` `labels` block with the Chinese set; leave section content language as documented in `@section_kinds` (typically English technical terms, Chinese prose when applicable) |
| User passes neither `--language` nor an explicit hint | Default to **English** (`en`) |
| `data.js` already exists in `<out>/` | Overwrite; if obvious manual edits are detected, warn before replacement |
