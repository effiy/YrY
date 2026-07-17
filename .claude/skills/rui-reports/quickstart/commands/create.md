---
name: quickstart-create
description: >
  Generate a "newcomer quickstart" onboarding report for a specified
  local project scope — emits a self-contained HTML page (Vue 3) and
  a hand-editable markdown mirror in one run.
---

# rui-report-quickstart — Create

Generate the canonical 7-section newcomer quickstart report for a
local project scope. The rendered artifact is **one** browser-viewable
HTML page; the markdown mirror is its hand-editable twin.

> **Output contract (rendered artifacts)**:
> - HTML page: `<OUT_DIR>/index.html`
> - Markdown mirror: `<OUT_DIR>/README.md`
> - Page sources (byte-stable templates): the 4 files in `templates/` (see SKILL.md **Output contract**)
>
> **Shared resources (no public CDN)**: All infrastructure (Vue, html2canvas, jsPDF, `<rui-back-top>`, `<rui-tag-chip>`) loads from `/.claude/shared/...` — see the SKILL.md **Output contract → Shared resources** table. Do NOT add public CDN `<script src>` tags.
>
> **Clean console contract**: After generating, the page must produce zero `console.error` / `pageerror` / 4xx requests.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Read` | Read the scope, the template, the project's README / CONTRIBUTING / LICENSE |
| `Write` | Produce `index.html` (HTML page) and `README.md` (markdown mirror) |
| `Grep` / `Glob` | Inventory the scope: detect language, manifest, entry points, test framework, docs |
| `Task` (subagent) | Optional parallel dispatch for large scopes (per-folder facet probes) |

## Options

`$ARGUMENTS` may contain:

- `--scope <path>` (required) — local project path to analyze. Defaults to CWD if omitted.
- `--out <path>` — output directory. Defaults to `docs/reports/quickstart/`.
- `--language <lang>` — emit all textual content in the specified language (`en` / `zh` / `ja` / `ko`). Defaults to `en`.
- `--depth <1|2|3>` — directory-map depth. Defaults to 3.
- `--no-mirror` — skip writing the `README.md` mirror (HTML only).
- `--title <text>` — override the page title; defaults to `<scope-dir-name> — Newcomer Quickstart`.

---

## Step 1: Resolve scope & output paths

1. Resolve `SCOPE` from `--scope` or CWD. Handle git worktree redirect.
2. Resolve `OUT_DIR` from `--out` or default `docs/reports/quickstart/`.
3. Create `OUT_DIR/` if missing.
4. Get the current git commit hash (if scope is a git repo) for the page footer.

## Step 2: Walk scope (Stage 1 — file inventory)

Walk `SCOPE/` with the standard exclusions
(`node_modules` `.git` `dist` `build` `.memory` `.next` `.turbo`
`coverage` `.claude` `target` `intermediate` `.DS_Store`). For
each file, record: relative path, bytes, lines, type, mtime.

Compute aggregate stats: total files, total LOC, language breakdown
(by extension), top-level directory tree.

## Step 3: Detect facets (Stage 2)

For each of the canonical facets, probe the scope:

| Facet | Detection rule | Drives which section |
|-------|-----------------|----------------------|
| `language` | Most common extension in the inventory; or explicit `package.json#main` / `pyproject.toml#project.name` / `Cargo.toml#package.name` / `go.mod#module` | overview, commands |
| `framework` | `package.json#dependencies` / `pyproject.toml#dependencies` / `Gemfile` — look for known framework names (React, Vue, Next.js, Django, Flask, Rails, Gin, Spring, etc.) | overview, concepts |
| `entry-points` | `package.json#main` / `bin`, `pyproject.toml#scripts`, `Cargo.toml#[[bin]]`, `go.mod` binaries, top-level `src/main.*` | overview, onboarding-flow |
| `test-framework` | `package.json#devDependencies` (jest, vitest, mocha, pytest) / `pyproject.toml#optional-dependencies.test` / `Gemfile` (rspec, minitest) / `Cargo.toml#dev-dependencies` | commands, onboarding-flow |
| `docs` | presence of `docs/` / `README.md` / `CONTRIBUTING.md` / `LICENSE` / `CHANGELOG.md` | faq, further-reading |
| `dependencies` | count of direct dependencies (excluding devDeps); surface the top 5 | overview, commands |
| `contributors` | `git log --format='%an' \| sort -u` (top 5 by commit count) — only if scope is a git repo | further-reading |

Each facet produces a record: `{ found: boolean, evidence: string, confidence: 0..1 }`.

## Step 4: Assemble the 7-section payload (Stage 3)

For each of the 7 sections in canonical order, build the payload
from the facet records. The contract is in the SKILL.md **Output
contract → 7-section payload contract** table.

**Critical: every claim cites a real artifact.** If a section
cannot be grounded in facet evidence, render its body as
`# TODO: <reason>` (the page shows a TODO badge; the mirror shows
a TODO header).

| Section | Build from | Fallback if missing |
|---------|-----------|---------------------|
| `overview` | `language` + `framework` + `dependencies` + `contributors` + README first paragraph | `# TODO: no README.md` |
| `concepts` | top 5–10 most-imported modules / top 5 exported symbols from `entry-points` | `# TODO: no entry points detected` |
| `directory-map` | top 3 levels of the inventory tree, annotated with per-dir purpose (read from nearest README / docs/) | `# TODO: sparse scope` |
| `onboarding-flow` | derived from `entry-points` + `commands` + README "Getting Started" section | `# TODO: no Getting Started` |
| `commands` | extracted from `package.json#scripts` / `pyproject.toml#scripts` / `Makefile` / `Cargo.toml#[[bin]]` | `# TODO: no manifest detected` |
| `faq` | 5–10 Q&A derived from README / CONTRIBUTING / docs (use LLM to extract from real text) | `# TODO: no docs` |
| `further-reading` | links to `CONTRIBUTING.md`, `LICENSE`, `docs/`, related projects (from package.json#homepage / repository) | `# TODO: no docs/CONTRIBUTING` |

## Step 5: Compute verdicts (Stage 4)

For each of the 7 sections, compute `coverage` (0..1) based on
how much of the section's required content was grounded:

- All required content present, all evidence cited → `coverage = 1.0`, verdict `pass`.
- ≥ 50% grounded, ≤ 50% TODO → `coverage = 0.5..0.89`, verdict `partial`.
- < 50% grounded → `coverage < 0.5`, verdict `fail`.

Composite score = `mean(section.coverage) × 100`, rounded.
Grade: A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, F < 40.

## Step 6: Emit (Stage 5)

1. **Emit the HTML page:**
   - Read the 4 `templates/` files.
   - Substitute `{{SCOPE_TITLE}}`, `{{GENERATED_AT}}`, `{{COMPOSITE_SCORE}}`, `{{GRADE}}`, `{{SECTIONS_PAYLOAD}}`.
   - Write to `OUT_DIR/index.html`.
   - The Vue 3 page renders all 7 sections in canonical order, with the verdict badge per section and the composite score in the header.

2. **Emit the markdown mirror** (unless `--no-mirror`):
   - Build the same 7 sections as markdown, using `# / ##` headers identical to the HTML page.
   - Use GFM tables for the directory map; fenced code blocks for commands.
   - Write to `OUT_DIR/README.md`.

3. **Write data.js** (regenerated each run) with the full 7-section payload + per-section verdict + composite score.

4. **Report to the user:** output paths, composite score, grade, per-section verdicts, list of `# TODO` markers (so the user can fill them in manually).

## Pre-Delivery Checklist

Before reporting done, verify:

| # | Check | How to verify |
|---|-------|---------------|
| 1 | Both `index.html` and `README.md` exist and are non-empty | `ls -la OUT_DIR/` |
| 2 | Page has exactly 7 sections in canonical order | grep for section slugs in `data.js` |
| 3 | All 7 sections appear in `README.md` with identical `## ` headers | grep for `## ` in `README.md` |
| 4 | Every section's content is grounded or marked `# TODO` | spot-check 3 random sections; no fabricated file paths |
| 5 | No `[...]` / `[A-Z]` sentinel placeholders remain | grep for bracket sentinels in `data.js` and `README.md` |
| 6 | No public CDN `<script src>` tags in `index.html` | grep for `cdn.jsdelivr` / `unpkg` / `cdnjs` |
| 7 | Vue 3 vendor script tag is present (from `/.claude/shared/...`) | grep for `/.claude/shared/loader.js` |
| 8 | Composite score and grade are computed and surfaced | grep for `composite` / `grade` in `data.js` |
| 9 | Markdown mirror uses canonical `## ` headers (not `###`) | grep for section slugs in `README.md` |
| 10 | `<out>` path is reported to the user | final response line |

## Output

```
docs/reports/quickstart/
├── index.html                 — Vue 3 page, 7 sections, self-contained
├── README.md                  — hand-editable mirror
└── data.js                    — REPORT_CONFIG + REPORT_DATA (regenerated)
```

## Progress Reporting

Report at each phase:

- `[Phase 1/6] Walking scope <SCOPE>...`
- `[Phase 2/6] Detecting facets... <language=… framework=… tests=…>`
- `[Phase 3/6] Assembling 7 sections... <N grounded / M TODO>`
- `[Phase 4/6] Computing verdicts... composite=<X> grade=<G>`
- `[Phase 5/6] Emitting HTML + markdown mirror...`
- `[Phase 6/6] Done. Score: <X>/100 (<G>). <K> TODO markers.`

## Error Handling

- If facet detection finds nothing (`language=unknown`, `framework=unknown`, no manifest), render all sections with `# TODO` and a final composite score of 0 — do NOT fail. A `# TODO` page is more useful than no page.
- If the scope is unreadable (permissions), abort with `scope-unreadable` and a clear error.
- If `OUT_DIR` cannot be created, stage in `/tmp/rui-report-quickstart-<scope>/` and surface the temp path in the report footer.
- Always save what you have — a partial report with `# TODO` markers is better than no report.

## Fallback

| Situation | Behavior |
|-----------|----------|
| User has not provided `--scope` | Default to CWD; respect git worktree redirect |
| `--out` not provided | Default to `docs/reports/quickstart/` (relative to CWD) |
| Facet detection fails (no manifest, no README) | Render all sections with `# TODO`; do NOT fail |
| Scope is empty after exclusions | Render all sections with `# TODO: empty scope` |
| `OUT_DIR` is read-only | Stage in `/tmp/`, copy to target; surface the temp path |
| User invokes `--no-mirror` | Skip `README.md`; HTML page only |
| Subagent dispatch fails (large scope) | Skip parallel dispatch; do facet detection serially |
| Bundled script not yet implemented | Fall back to inline facet detection (no `scripts/` dependency) |
