---
name: rui-report-quickstart
description: >
  Generate a newcomer quickstart report for a local project scope.
  Produces a browser-viewable HTML guide and, by default, a markdown
  mirror. Uses static evidence only, renders all seven canonical
  sections, and fills gaps with TODO markers instead of invented
  content.
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
    description: Output language (`en`, `zh`). Defaults to the user's language when obvious, otherwise `en`.
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
# Default scope = current directory
/rui-report-quickstart create

# Typical usage
/rui-report-quickstart create --scope <project-path> --out docs/reports/quickstart

# Chinese output
/rui-report-quickstart create --scope <project-path> --language zh

# HTML only
/rui-report-quickstart create --scope <project-path> --no-mirror
```

## Core contract

1. Always render the seven canonical sections in this order:
   `overview` -> `concepts` -> `directory-map` -> `onboarding-flow` -> `commands` -> `faq` -> `further-reading`.
2. Every claim must be backed by a real file, line, symbol, command, or manifest entry from the analyzed scope.
3. When evidence is missing, render `# TODO: <reason>` instead of guessing.
4. The report is static-analysis only. Do not run project tests, installs, builds, or deploys unless the user explicitly asks for that.
5. Read from `<scope>` and write only to `<out>`.

## Deliverables

| Path | Required | Purpose |
|------|----------|---------|
| `<out>/index.html` | yes | Browser-viewable newcomer quickstart |
| `<out>/README.md` | no | Markdown mirror, skipped when `--no-mirror` is used |

Notes:
- Supporting files such as `index.css`, `index.js`, or `data.js` are allowed when they help implementation, but they are not the primary contract.
- This skill does not assume a bundled `templates/` or `scripts/` directory exists locally. If reusable scaffolds exist, read them first; otherwise generate the deliverables directly while preserving this contract.

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

The score measures onboarding completeness, not code quality.

## Boundaries

| Boundary | Permission |
|----------|------------|
| `<scope>/**` | read-only |
| `<out>/**` | write |
| `commands/**`, `evals/**`, `references/**` in this skill | read-only |
| Outside the scope and chosen output directory | avoid unless required for the user's explicit request |

## Fallbacks

| Situation | Behavior |
|-----------|----------|
| Scope path does not exist | Abort with a clear usage error |
| Scope is empty after exclusions | Render all seven sections with `# TODO: empty scope` |
| No manifest found | Infer commands from README or docs; otherwise use TODO markers |
| No README or docs | Keep all sections, but let `faq` / `further-reading` become TODO-heavy |
| No detected entry points | Keep `overview`, mark `concepts` / `onboarding-flow` with TODOs where needed |
| `--no-mirror` used | Emit only `index.html` |
| Re-run into existing outputs | Overwrite generated files; warn before replacing obvious manual edits when feasible |

## Supporting files

- [create.md](./commands/create.md) — execution playbook for `/rui-report-quickstart create`
- [evals.json](./evals/evals.json) — prompt coverage for the main interaction patterns
