---
name: verify-step
description: >
  7-point readiness check + engineering gate for the yry-init
  pipeline. Verify that every artifact produced by the upstream
  pipeline steps (detect, explore, generate, arch) is present and
  well-formed. Any failure terminates the pipeline and surfaces the
  fix list to the caller. Run this step after step 04-arch.
lifecycle: pipeline-step
user_invocable: false
---

# yry-init-verify (step ⑤ of yry-init)

> Single responsibility: assert that the upstream pipeline steps
> produced all required artifacts. It does not generate files, run
> tests, or assess engineering maturity. On failure, the pipeline
> terminates — the verify step is the engineering gate.
>
> Triggered by the parent pipeline (yry-init), right after
> yry-init-arch.
>
> **Strict**: any single failed check terminates the pipeline. The
> verify step does not attempt to repair artifacts; it only reports
> the failure list.

[Inputs](#inputs) · [Outputs](#outputs) · [1. The 7 Checks](#1-the-7-checks) · [2. Failure Handling](#2-failure-handling) · [3. Edge Cases](#3-edge-cases) · [Fallback](#fallback) · [Active Markers](#active-markers)

## Inputs

| Field | Type | Description |
|-------|------|-------------|
| `profile` | `Profile` | The fact baseline emitted by yry-init-detect. Required. |
| `exploration` | `Exploration` | The module map + conventions emitted by yry-init-explore. Required. |
| `cwd` | path (optional) | Project root. Defaults to current working directory. |

## Outputs

| Field | Type | Description |
|-------|------|-------------|
| `result` | `'pass' \| 'fail'` | Overall pass / fail |
| `failures` | `Failure[]` | Per-check failure list (empty on pass) |

```ts
type Failure = {
  checkId: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  message: string;
  fix: string;        // human-readable fix suggestion
};
```

## 1. The 7 Checks

Each check is independent. All 7 must pass for the pipeline to
proceed.

| # | Check ID | Check | Method | On failure |
|---|----------|-------|--------|------------|
| 1 | `claude-md-name` | `CLAUDE.md` contains project name | `grep <projectName>` | Re-run yry-init-generate |
| 2 | `readme-md-name` | `README.md` contains project name | `grep <projectName>` | Add project name |
| 3 | `domain-language` | `README.md` contains `## Domain Language` + ≥ 3 terms | `grep` + count of term definitions | Add domain-language section |
| 4 | `docs-home-files` | `docs/index.html`, `docs/index.css`, `docs/index.js`, `docs/data.js` all exist | file check | Re-run yry-init-generate and restore the docs home entry |
| 5 | `arch-scenes` | `docs/arch/` directory exists and each scene has `index.md` | directory + per-scene check | Re-run yry-init-arch or add missing `index.md` |
| 6 | `test-scenes` | `docs/test/` directory exists and each scene has `index.md` | directory + per-scene check | Re-run yry-init-arch or add missing `index.md` |
| 7 | `scene-counts` | `docs/arch/` scene count ≥ 5, `docs/test/` scene count ≥ 6 | Count | Add scenes |

### Check 3 — Domain Language Term Count

The `## Domain Language` heading must be followed by a section
that defines **at least three** project-specific terms. A "term
definition" is a one-sentence statement of the form "**Term** —
definition." Lines that do not match this shape do not count.

### Check 4 — Docs Home Entry

The generated docs home is part of the required init baseline. All four
files must exist under `docs/`:

- `docs/index.html`
- `docs/index.css`
- `docs/index.js`
- `docs/data.js`

Any missing file is a verify failure.

### Check 5 / 6 — Per-Scene `index.md`

Each scene directory must contain an `index.md` following the
§0–§4 lifecycle (effect sketch, test design, output inventory,
test report, self-improvement). A scene missing `index.md` is
a verify failure.

## 2. Failure Handling

When any check fails:

1. The skill returns `result: 'fail'`.
2. The `failures` array contains one entry per failed check, in
   check-id order.
3. The parent pipeline terminates and surfaces the failure list to
   the user.
4. The verify step does **not** attempt to repair artifacts.

```
result: 'fail'
failures: [
  { checkId: 5, message: "docs/arch/scene-2-data-flow-tracing/ missing index.md", fix: "Re-run yry-init-arch; the scene emit aborted mid-flight." }
]
```

## 3. Edge Cases

| Scene | Handling |
|----------|----------|
| `cwd` does not exist | All 7 checks fail with `cwd-not-found`; the parent pipeline should pass a valid path |
| `profile.projectType === 'unknown'` | Check 1 still passes if the project name is present; record a warning |
| `exploration.moduleMap.length === 0` | Check 5 still passes if the stub scene emitted by yry-init-arch is well-formed; record a warning |
| Any docs home file is missing | Check 4 fails with "docs home artifact missing" |
| `docs/arch/` does not exist | Checks 5 and 7 fail with "directory missing" |
| `CLAUDE.md` does not exist | Check 1 fails with "CLAUDE.md absent" |
| `pipelineState.reports.result === 'skipped'` | Non-blocking — the yry-report orchestrator script was absent; record a warning, do not fail the pipeline |
| `pipelineState.reports.result === 'fail'` | Blocking — the reports delegation script exited non-zero; surface `stderr` as a verify failure with `checkId: 7` and fix suggestion "Re-run `node yry-report/scripts/run-orchestrator.mjs` manually to inspect" |
| `README.md` exists but has no `## Domain Language` | Check 3 fails with "domain-language section absent" |
| A scene's `index.md` is empty (0 bytes) | Check 5 / 6 fails with "scene-N/index.md is empty" |

## Fallback

| Situation | Behavior |
|-----------|----------|
| `cwd` does not exist | Abort with `cwd-not-found`; all checks fail |
| A file is unreadable (permission error) | Treat the file as missing for the purpose of the check; record the permission error in the failure message |

The verify step is the **engineering gate** of the yry-init
pipeline. It never silently passes; if it cannot evaluate a check,
the check fails.

## Active Markers

| Marker | Verification | Expected behavior |
|--------|--------------|-------------------|
| All 7 checks pass | `failures.length === 0` | Pipeline may proceed |
| Any check fails | `failures.length > 0` | Pipeline terminates; user sees the failure list |
| `result === 'pass'` | boolean | Pipeline may proceed |
| `result === 'fail'` | boolean | Pipeline halts; no further steps run |


## Rules

- [failure-escalation.md](./rules/failure-escalation.md) — ---
- [verification-contracts.md](./rules/verification-contracts.md) — ---

## Specialized Agents

- [check-runner.md](./agents/check-runner.md) — ---
- [failure-diagnoser.md](./agents/failure-diagnoser.md) — ---

## References

- [check-catalog.md](./references/check-catalog.md) — ---
- [integration-points.md](./references/integration-points.md) — ---
