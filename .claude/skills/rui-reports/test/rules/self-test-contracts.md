---
description: "Analyzer ↔ page data contract for rui-report-test. Invariants the analyzer MUST respect."
---

# test Contracts

> Invariants the implementing agent MUST respect while running
> `rui-report-test`. Violations are bugs in the execution, not
> the spec.

## Scene count

`window.REPORT_DATA.scenes` MUST be an array of **exactly 6
elements**, in `index` order 1..6, with these slugs (pinned by
`rui-init` step 04-arch):

| `index` | `slug` |
|---------|--------|
| 1 | `post-init-full-self-check` |
| 2 | `pre-commit-incremental-self-check` |
| 3 | `doc-code-consistency` |
| 4 | `security-surface-regression` |
| 5 | `cross-story-integration-regression` |
| 6 | `third-party-framework-service` |

Adding a 7th scene is forbidden. Reordering the slugs is
forbidden. The page enforces this at boot:

```js
if (!Array.isArray(window.REPORT_DATA.scenes) || window.REPORT_DATA.scenes.length !== 6) {
    throw new Error('window.REPORT_DATA.scenes must be an array of 6 scenes.');
}
```

## Scene payload schema

Each scene payload MUST contain all of:

```ts
{
  index:    1..6,                  // number, ascending 1..6
  slug:     string,                // kebab-case, matches the table above
  title:    string,                // non-empty
  icon:     string,                // non-empty
  facet:    'init' | 'tests' | 'docs' | 'security' | 'refs' | 'deps',
  section0: { effect: string, matters: string, mermaid?: string },
  section1: { steps: Array<{ title: string, action: string, expected: string, file?: string }> },
  section2: { outputs: Array<{ path: string, type: string, description: string }> },
  section3: { report: Array<{ step: string, result: string, notes: string }>, overall: string },
  section4: { edgeCases: string[], improvements: string[], limitations: string[] },
  verdict:  'pass' | 'partial' | 'fail',
  coverage: number,                // 0..1, two decimal places
}
```

The page renders `# TODO` banners for missing sections but does
NOT throw. The `analyze.mjs` MUST emit a complete payload
(including all five sections) on every run; partial payloads
indicate a bug in the analyzer, not the spec.

## Verdict computation

```ts
coverage = passedChecks / max(totalChecks, 1)
verdict  = coverage >= 0.9 ? 'pass'
         : coverage >= 0.5 ? 'partial'
         : 'fail'
```

`compositeScore = mean(scene.coverage) * 100`, rounded to an
integer. `grade` follows the shared scale:

| Range | Grade |
|-------|-------|
| 90–100 | A |
| 75–89 | B |
| 60–74 | C |
| 40–59 | D |
| 0–39 | F |

The page NEVER recomputes the verdict. Re-run the analyzer to
refresh.

## Walk exclusions

Inherited from `rui-reports/files` (single source of truth):

```
node_modules  .git  dist  build  .next  .turbo
coverage  .memory  .claude  target  intermediate
.DS_Store
```

The set is **append-only** within a single run. Hidden
directories (those starting with `.`) are excluded by default
unless explicitly included.

## Per-scene read cap

When a scene's facet probe reads a source file, the cap is:

- File size: skip if `bytes > 256 000`
- Per-file content read: cap at `64 * 1024` bytes (the first
  64 KB)

These caps match `rui-reports/files` Stage 1 and Stage 3.
Files beyond the cap are still listed in the file inventory but
not scanned for content.

## Output determinism

Two runs with identical `(scope, options, file contents)` MUST
produce byte-identical `data.js`. The only non-deterministic
field is `REPORT_CONFIG.options.generatedAt` (ISO 8601 UTC of
the run). All other fields are derived from the file inventory
and are stable.

Sort keys for collections:

- `records[]` — by `path asc` (POSIX)
- `facet.outputs[]` — input order (analyzer-controlled)
- `alerts` / `findings` — by `(severity asc, file asc)` if
  present

## Page determinism

`templates/index.html`, `templates/index.css`, `templates/index.js`
are byte-stable. The analyzer MUST copy them verbatim — no
inline substitution except:

- `{{SCOPE_TITLE}}` → the scope's basename
- `{{SHARED_ROOT}}` → a *relative* path from `outDir` to
  `<repo>/.claude/shared/`

`{{SHARED_ROOT}}` MUST be a relative path, not the absolute
`/.claude/shared/`. The browser resolves absolute paths to the
filesystem root under `file://`, which breaks the report in
offline mode.

## Markdown mirror

When `MERGE_SCENES=true` (default), the analyzer writes each
scene to `<outDir>/../test/scene-N-<slug>/index.md` so the
report and the rui-init scene tree stay aligned. The
`scene-N-<slug>/index.md` filename and the `# §0..§4` headers
are byte-stable; the body is regenerated.

`rui-init` step 04-arch checks for §0–§4 headers (not body
content), so re-running `rui-init` after this skill is safe —
the verifier will see the same headers.

## XSS safety

User-controlled strings — file paths, scene titles, mermaid
fragments — MUST pass through Vue's `{{ }}` interpolation when
inserted into the page. The analyzer MUST NOT string-build HTML
or emit `v-html` directives. Mermaid fragments are rendered as
`<pre><code>` blocks for the reader to copy into a Mermaid
renderer; they are not auto-rendered (no Mermaid runtime).

## Bounded behavior on huge repos

When `records.length > 50 000`:
- The `dangerousCalls` and `brokenLinks` arrays are truncated to
  their respective caps (20 entries).
- The page does NOT need to know — `data.js` is the source of
  truth.

When `records.length > 100 000`:
- The analyzer emits a `truncated: true` flag on
  `window.REPORT_DATA`. The page surfaces this in the footer.

## Failure modes

| Situation | Behavior |
|-----------|----------|
| `scope` does not exist | Abort with `scope-not-found`, exit code 3 |
| `outDir` not writable | Abort with `outDir-not-writable`, exit code 4 |
| `find` fails (sandboxed env) | Abort with `find-failed`, exit code 5 |
| `data.js` exists but is unreadable | Overwrite — the analyzer owns this file |
| `MERGE_SCENES=true` and `docs/test/` is read-only | Skip markdown emit, log warning, continue with report |
| `rui-init` not installed | Page still renders; markdown mirror step is skipped |
