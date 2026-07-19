---
name: quickstart-create
description: >
  Generate a newcomer quickstart report for a local project scope.
  Emits a browser-viewable HTML guide and, unless disabled, a markdown
  mirror in the same canonical section order.
---

# rui-report-quickstart - Create

Generate the canonical seven-section newcomer quickstart for a local project scope. Keep the output grounded, concise, and practical for a first-day engineer.

## Inputs

`$ARGUMENTS` may contain:

- `--scope <path>` - local project path to analyze. Defaults to the current working directory.
- `--out <path>` - output directory. Defaults to `docs/reports/quickstart/`.
- `--language <lang>` - output language such as `en`, `zh`, `ja`, or `ko`.
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

Write files using whatever file-editing mechanism the runtime provides. Do not claim a bundled `templates/` or `scripts/` directory unless it actually exists in the current skill folder.

## Execution flow

### Phase 1 - Resolve scope and output

1. Resolve `SCOPE` from `--scope` or the current working directory.
2. Resolve `OUT_DIR` from `--out` or `docs/reports/quickstart/`.
3. Resolve the output language from `--language` or the user's language when obvious.
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

Section guidance:

| Section | Build guidance | Fallback |
|---------|----------------|----------|
| `overview` | one-paragraph summary, primary stack, scope cues | `# TODO: project overview evidence is missing` |
| `concepts` | 5-10 modules, domain terms, or symbols with grounded glossaries | `# TODO: no stable concepts detected` |
| `directory-map` | annotated tree up to `--depth` | `# TODO: scope is too sparse for a useful map` |
| `onboarding-flow` | 5-10 ordered first-day steps using real files and commands | `# TODO: no grounded onboarding flow found` |
| `commands` | most-used run/test/lint/build commands with short explanations | `# TODO: no commands or scripts detected` |
| `faq` | likely newcomer questions answered from docs and code evidence | `# TODO: no FAQ source material found` |
| `further-reading` | README, docs, policies, deep dives, key subdirectories | `# TODO: no further reading found` |

Rules:

- Never invent files, commands, symbols, or workflows.
- Technical names stay in their original language.
- Missing evidence lowers coverage; it does not block report generation.

### Phase 5 - Score the report

For each section:

- `pass` when coverage is `>= 0.90`
- `partial` when coverage is `0.50 .. 0.89`
- `fail` when coverage is `< 0.50`

Composite score = `mean(section.coverage) * 100`, rounded.

Grade scale:

- `A` for `>= 90`
- `B` for `>= 75`
- `C` for `>= 60`
- `D` for `>= 40`
- `F` for `< 40`

This score reflects onboarding completeness, not runtime quality.

### Phase 6 - Emit outputs

Required output:

- `<OUT_DIR>/index.html`

Optional output:

- `<OUT_DIR>/README.md` unless `--no-mirror` is set

Emission rules:

1. The HTML report must contain all seven sections in canonical order.
2. If the markdown mirror is emitted, keep the same section titles and order.
3. If reusable templates exist, use them. If not, generate the deliverables directly.
4. Overwrite prior generated outputs on re-run. When obvious manual edits are detected, warn before replacement if the runtime allows.

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
| 1 | `index.html` exists and is non-empty |
| 2 | `README.md` exists unless `--no-mirror` was used |
| 3 | All seven sections appear in canonical order |
| 4 | TODO markers exist where evidence is missing instead of guessed prose |
| 5 | No placeholder text such as `[TODO]`, `TBD`, or `Lorem ipsum` remains |
| 6 | Composite score, grade, and per-section verdicts are surfaced |
| 7 | Final response reports output path plus the main gaps |

## Fallbacks

| Situation | Behavior |
|-----------|----------|
| Missing manifest | Infer commands from docs, or emit TODO markers |
| Missing README and docs | Still generate all sections, with TODO-heavy `faq` and `further-reading` |
| No obvious entry points | Keep the report, but let `concepts` and `onboarding-flow` degrade with TODOs |
| Empty scope after exclusions | Emit a full TODO report instead of failing |
| `--no-mirror` | Skip `README.md` cleanly |
