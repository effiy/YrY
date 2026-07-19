# methodology.md

> Per-facet measurement methodology for rui-report-test. The
> historical analyzer pipeline and the per-scene agents read
> this document before executing, then follow the rules step by
> step.

## Stage 1 — File Inventory

Mirrors `rui-reports/files` Stage 1 exactly. The walk is shared
so a test report and a files report on the same scope
produce consistent `totalFiles`, `totalBytes`, and `records[]`.

| Field | Source | Cap |
|-------|--------|-----|
| `path` | `find` output, POSIX separators | none |
| `absPath` | `path.resolve(scope, rel)` | none |
| `bytes` | `fs.statSync().size` | none |
| `type` | `path.extname()` | none |
| `lastModified` | `fs.statSync().mtimeMs / 1000` | none |

Default exclusion globs (single source of truth, shared with
`rui-reports/files`):

```
node_modules  .git  dist  build  .next  .turbo
coverage  .memory  .claude  target  intermediate
.DS_Store
```

## Stage 2 — Facet Detection

The analyzer runs six probes in series, one per scene. Each probe
returns a `facet` object that the scene builder reads.

### 2.1 — `init` (post-init-full-self-check)

Booleans + counts only. The scene builder maps them to
pass/fail checks.

```ts
{
  hasClaude:         bool,   // CLAUDE.md present at root
  hasReadme:         bool,   // README present at root
  hasDocs:           bool,   // docs/ directory exists
  hasTests:          bool,   // any test framework detected
  hasPackageJson:    bool,
  hasPyproject:      bool,
  hasGoMod:          bool,
  hasCargoToml:      bool,
  totalFiles:        number,
  totalBytes:        number,
}
```

### 2.2 — `tests` (pre-commit-incremental-self-check)

Detect by config-file presence. Order matters — first match wins.

| Config file | Framework |
|-------------|-----------|
| `vitest.config.{js,ts,mjs,cjs}` | vitest |
| `jest.config.{js,ts,mjs,cjs}` | jest |
| `pytest.ini` / `conftest.py` / `pyproject.toml` (with `[tool.pytest]`) | pytest |
| `go.mod` | go test |
| `Cargo.toml` | cargo test |
| `phpunit.xml` | phpunit |
| `package.json` with `"scripts"."test"` | npm test |

Test file detection (independent of framework):

```regex
\.(test|spec)\.[a-z]+$    // foo.test.js, bar.spec.ts
(^|/)__tests__/           // __tests__/foo.js
\.(test|spec)\.           // foo.test.jsx
```

### 2.3 — `docs` (doc-code-consistency)

Doc files are matched by name; code files by extension.

```ts
DOC_GLOBS = [
  /^CLAUDE\.md$/i,
  /^README(?:\..*)?$/i,
  /^CONTRIBUTING(?:\..*)?$/i,
  /^CHANGELOG(?:\..*)?$/i,
  /^LICENSE(?:\..*)?$/i,
  /^docs\//i,
  /^\.github\//i,
]
CODE_EXTS = /\.(js|ts|mjs|cjs|jsx|tsx|vue|py|go|java|rs|css|scss)$/
```

`docRatio = docCount / max(codeCount, 1)`. Threshold for "good"
ratio: `≥ 0.05` (one doc per ~20 source files).

### 2.4 — `security` (security-surface-regression)

Three sub-probes: env files, dangerous calls, HTML entry points.

```regex
DANGEROUS = [
  /eval\s*\(/g,
  /new\s+Function\s*\(/g,
  /innerHTML\s*=/g,
  /document\.write\s*\(/g,
  /dangerouslySetInnerHTML/g,
  /child_process\.(exec|spawn)\s*\(/g,
  /v-html=/g,                  // Vue
  /\[innerHTML\]/g,            // Angular
]
```

The scan reads at most the first 64 KB of each file (per
the historical Stage 1 cap), and skips files > 256 KB
entirely. A file with `innerHTML =` is a finding even if the
value is constant — surface it for human review.

### 2.5 — `refs` (cross-story-integration-regression)

Walk all `.md` files; extract `[text](path)`; resolve each `path`
relative to the markdown file's directory; check existence.

```ts
LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g
```

Skip:
- Empty targets
- `http://`, `https://`, `mailto:`, `tel:`
- Absolute paths starting with `/` (host-relative)
- Query strings / fragments (after stripping)

The output is per-file + aggregate:

```ts
{
  totalLinks:    number,
  brokenLinks:   number,
  brokenRatio:   number,  // 0..1
  byFile:        { [path]: { total, broken } },
  brokenExamples: [{ file, target }],
}
```

### 2.6 — `deps` (third-party-framework-service)

Parse the project manifest(s). For Node, `package.json`
`dependencies` + `devDependencies`. For Python, `[project]
dependencies` and `[project.optional-dependencies]` from
`pyproject.toml`. For Go, `go.mod` `require` (direct deps only).
For Rust, `Cargo.toml` `[dependencies]`.

Heuristic categorization (in priority order):

| Category | Hint patterns (substring, case-insensitive) |
|----------|---------------------------------------------|
| `ui` | `vue`, `react`, `svelte`, `angular`, `ant`, `element`, `vant`, `naive` |
| `state` | `pinia`, `redux`, `vuex`, `mobx`, `zustand`, `jotai` |
| `router` | `router`, `tanstack` |
| `build` | `vite`, `webpack`, `rollup`, `esbuild`, `parcel`, `turbopack`, `tsup`, `unplugin` |
| `test` | `vitest`, `jest`, `mocha`, `chai`, `playwright`, `cypress`, `testing-library`, `@vitest`, `happy-dom` |
| `util` | `axios`, `lodash`, `dayjs`, `moment`, `date-fns`, `uuid`, `nanoid`, `crypto-js` |
| `style` | `sass`, `less`, `stylus`, `tailwind`, `postcss`, `unocss` |
| `other` | (fallback) |

Pinning heuristic:

```ts
Pinned     = /^\d/                  // "1.2.3" or "1.2.3-beta.1"
Range      = /^[\^~]?\d/             // "^1.2.3" or "~1.2.3"
Wildcard   = /^\*|latest|x/
GitRef     = /^git\+|github:/
FileRef    = /^file:|link:/
```

A dep is "pinned" if it matches `Pinned` or `GitRef` or `FileRef`.

## Stage 3 — Scene Assembly

Each scene is built by combining the facet record with a static
template from the historical generation pipeline.
The scene's `section0.mermaid` is hard-coded for each scene —
the analyzer does not generate Mermaid dynamically.

## Stage 4 — Verdict Computation

```ts
coverage = passedChecks / max(totalChecks, 1)
verdict  = coverage >= 0.9 ? 'pass'
         : coverage >= 0.5 ? 'partial'
         : 'fail'
compositeScore = mean(scene.coverage) * 100   // 0..100
grade = compositeScore >= 90 ? 'A'
      : compositeScore >= 75 ? 'B'
      : compositeScore >= 60 ? 'C'
      : compositeScore >= 40 ? 'D'
      : 'F'
```

The page NEVER recomputes verdicts. Refresh the generated data
through the replacement workflow when the source changes.

## Stage 5 — Page Emit

The page is byte-stable: `index.html`, `index.css`, `index.js`
are copied verbatim from `templates/`. Only `data.js` is
regenerated.

`{{SCOPE_TITLE}}` and `{{SHARED_ROOT}}` in `templates/index.html`
are substituted at copy time:
- `{{SCOPE_TITLE}}` → the basename of the scope
- `{{SHARED_ROOT}}` → a *relative* path from the output directory
  to `/.claude/shared/`. The analyzer computes
  `path.relative(outDir, '<repo>/.claude/shared')` so the page
  works under both `file://` and `http://`.

## Stage 6 — Markdown Mirror (optional)

When `MERGE_SCENES=true`, the analyzer writes each scene to
`<outDir>/../test/scene-N-<slug>/index.md` so the report
and the rui-init scene tree stay aligned. The markdown body is
regenerated; the §0–§4 headers are byte-stable.

## Loader contract

The page uses the same shared loader as `rui-reports/files`:
`/.claude/shared/loader.js`. The loader auto-injects Vue 3 and
exposes `window.__vueLoadPromise`. The page waits for the
promise, verifies `window.Vue.createApp` exists, then mounts.

If the page is opened under `file://`, the loader MUST be loaded
from a *relative* path (e.g., `../../.claude/shared/loader.js`).
Absolute `/.claude/shared/loader.js` resolves to the filesystem
root under `file://`, NOT the project's `.claude/` directory.
The analyzer substitutes a relative path at copy time to avoid
this pitfall.
