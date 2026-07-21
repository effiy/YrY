---
description: "The six yry-init test scenes with their detection rules, §0–§4 shape, and verdict criteria."
---

# Scene Catalog

> The six scenes are pinned by `yry-init` step 04-arch (see
> `/Users/ruiyi/YrY/.claude/skills/yry-init/steps/04-arch/references/test-scenes.md`).
> `yry-report-test` MUST emit all six in `index` order with
> the same slugs.

| # | Directory (slug) | Title | Icon | Facet | Verdict drivers |
|---|------------------|-------|------|-------|-----------------|
| 1 | `post-init-full-self-check` | Post-Init Full Self-Check | 🚀 | `init` | CLAUDE.md, README, docs/, tests, manifest |
| 2 | `pre-commit-incremental-self-check` | Pre-Commit Incremental Self-Check | 🧪 | `tests` | framework, test files, scoped test command |
| 3 | `doc-code-consistency` | Doc-Code Consistency | 📚 | `docs` | doc count, root manifests, doc/code ratio |
| 4 | `security-surface-regression` | Security Surface Regression | 🔐 | `security` | env files, dangerous calls, HTML count |
| 5 | `cross-story-integration-regression` | Cross-Story Integration Regression | 🔗 | `refs` | story dirs, link count, broken-link count |
| 6 | `third-party-framework-service` | Third-Party Framework & Service | 🧩 | `deps` | dep count, pinning ratio, staleness |

## Scene payload (per scene)

```ts
{
  index:    1..6,                  // render order
  slug:     string,                // kebab-case
  title:    string,
  icon:     string,                // single emoji
  facet:    'init' | 'tests' | 'docs' | 'security' | 'refs' | 'deps',
  section0: { effect, matters, mermaid? },
  section1: { steps: [{ title, action, expected, file? }] },
  section2: { outputs: [{ path, type, description }] },
  section3: { report: [{ step, result, notes }], overall },
  section4: { edgeCases: string[], improvements: string[], limitations: string[] },
  evidence: Array<{ label: string, value: string }>,  // raw facet probes driving §3
  verdict:  'pass' | 'partial' | 'fail',
  coverage: number,                // 0..1
}
```

## Scene 1 — post-init-full-self-check

**Purpose**: Verify all artifacts from a fresh `/yry-init` run.
**Checks**:
- `hasClaude` — `CLAUDE.md` exists at scope root
- `hasReadme` — `README` (any extension) exists at scope root
- `hasDocs` — `docs/` directory contains at least one file
- `hasTests` — a test framework was detected (vitest, jest, pytest, etc.)
- `hasManifest` — `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` exists

**Pass criteria**: 5/5 checks pass. **Verdict**: `pass ≥ 4/5`,
`partial 2-3/5`, `fail ≤ 1/5`.

## Scene 2 — pre-commit-incremental-self-check

**Purpose**: Verify that the project has a test framework and a way
to scope tests to a subset (for pre-commit hooks).
**Checks**:
- `framework` — config file detected
- `testFileCount > 0` — at least one test file
- `coverage-script` — framework supports a "changed" flag (vitest, jest, pytest, etc.)

**Pass criteria**: 3/3 checks pass. **Verdict**: pass / partial /
fail as for Scene 1. When `framework` is missing, `coverage = 0.1`
and `verdict = 'fail'` regardless of other checks.

## Scene 3 — doc-code-consistency

**Purpose**: Ensure documentation matches code.
**Checks**:
- `docCount > 0`
- `hasReadme`
- `hasClaude`
- `hasDocsDir`
- `docRatio ≥ 0.05`

**Pass criteria**: 5/5. **Verdict**: pass / partial / fail.

## Scene 4 — security-surface-regression

**Purpose**: Detect security surface changes since last init.
**Checks**:
- `envFileCount` — informational, no penalty if 0 (could be
  env-vars-only deployment)
- `dangerousCallCount === 0` — no eval / innerHTML / child_process.exec
- `dangerousCallCount < 5` — small number is reviewable; ≥ 5 is a regression

**Pass criteria**: 3/3. **Verdict**: pass / partial / fail.

## Scene 5 — cross-story-integration-regression

**Purpose**: Verify cross-story links are intact.
**Checks**:
- `storyDirCount ≥ 2` — at least docs/arch and docs/test exist
- `totalLinks > 0` — some cross-references present
- `brokenLinks === 0` — no broken links
- `mdFileCount ≥ 5` — non-trivial docs surface

**Pass criteria**: 4/4. **Verdict**: pass / partial / fail.

## Scene 6 — third-party-framework-service

**Purpose**: Document and verify third-party integrations.
**Checks**:
- `runtimeCount > 0`
- `devCount > 0`
- `pinningRatio ≥ 0.5` — at least half of deps are pinned
- `staleCount === 0` — no 3+ year-stale deps

**Pass criteria**: 4/4. **Verdict**: pass / partial / fail. When
`totalCount === 0` (no manifest), `coverage = 0.1` and
`verdict = 'fail'`.

## §0–§4 Lifecycle (per scene)

Every scene's `index.md` (or `data.js` scene payload) follows:

| Section | Title | Required content |
|---------|-------|------------------|
| §0 | Effect Sketch | 2 paragraphs (effect + why-it-matters) + optional Mermaid diagram. The effect paragraph must state the input, the transformation, the output, and the failure threshold. The why-it-matters paragraph must quantify the cost of regression (time lost, incident risk). |
| §1 | Test Design | 3–5 steps with `action` / `expected` / `file`. Each step's `action` must name a concrete tool, regex, or command; each `expected` must include a measurable threshold. |
| §2 | Output Inventory | table of files / directories with semantic descriptions (not just "Documentation file"). |
| §3 | Test Report | 1:1 mapping of §1 steps + overall summary. Notes must carry state semantics ("verified — within baseline" vs "review — new patterns detected"). |
| §4 | Self-Improvement | ≥ 3 edge cases, ≥ 3 improvements (each naming a specific tool or command), ≥ 2 limitations. |

`yry-init` step 04-arch checks §0–§4 presence but not body content.
The report enforces §0–§4 presence too — see
`rules/test-contracts.md`.

## Verdict thresholds (composite)

| Verdict | Per-scene coverage | Composite score | Grade |
|---------|-------------------|-----------------|-------|
| pass    | ≥ 0.90            | ≥ 90            | A     |
| pass    | ≥ 0.90            | 75–89           | B     |
| partial | 0.50 – 0.89       | 60–74           | C     |
| partial | 0.50 – 0.89       | 40–59           | D     |
| fail    | < 0.50            | < 40            | F     |

Composite score = `mean(scene.coverage) × 100`, rounded. Grade
follows the yry-report-files scale. The page renders the composite
score as a gauge and the per-scene verdict as a badge; re-running
the analyzer is the only way to refresh either.
