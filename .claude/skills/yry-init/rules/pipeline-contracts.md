---
paths: [".claude/yry-init/SKILL.md"]
description: "Pipeline contracts for yry-init: step ordering, step communication protocol, pipelineState shape (single source of truth in references/), output ownership, and degradation countermeasures."
---

# Pipeline Orchestration Contracts

`yry-init` is the sole user-invocable entry point for the project initialization pipeline. It orchestrates five steps plus one optional phase in strict order, communicating only through a shared `pipelineState` object.

## Pipeline Order (Immutable)

```
detect → explore → generate → arch → reports → verify
```

`reports` is the optional phase between `arch` and `verify`. If the
`yry-report` orchestrator script is absent, the phase is skipped
non-blocking and `pipelineState.reports.result` is `'skipped'`.

## PipelineState Shape

The complete `PipelineState` / `Profile` / `Exploration` / `VerifyResult` /
`Failure` / `ReportsResult` type definitions live in
[`references/pipeline-state-reference.md`](./references/pipeline-state-reference.md)
(single source of truth). The summary below is for orientation only —
the reference file is authoritative.

```ts
type PipelineState = {
  steps: string[];
  profile: Profile;                // step 01-detect
  exploration: Exploration;        // step 02-explore
  reports?: ReportsResult;         // reports phase (optional)
  verify: VerifyResult;            // step 05-verify
};
```

## Step Communication Protocol

| Rule | Description |
|------|-------------|
| No direct calls | Steps never invoke each other |
| Single writer per field | Each step writes its designated pipelineState field |
| Upstream is read-only | step N may read fields from steps < N only |
| No cross-step imports | Steps must not import from sibling step directories |

## Output Ownership Matrix

| Artifact | Owner | Other steps may |
|----------|-------|-----------------|
| `CLAUDE.md` | step 03-generate | Read (all) |
| `README.md` (main sections) | step 03-generate | Read (all) |
| `README.md` (Domain Language) | User (append-once, preserved) | Read (all) |
| `docs/index.html`, `index.css`, `index.js` | `yry-init/templates/` (source of truth) | Copied by step 03-generate |
| `docs/data.js` | step 03-generate (regenerated) | Read by docs dashboard |
| `docs/arch/` | step 04-arch | Read (all) |
| `docs/test/` | step 04-arch | Read (all) |

## Degradation Countermeasures

| Condition | Action |
|-----------|--------|
| `verify.result === 'fail'` | Halt pipeline; surface failure list to user; no retry |
| Step crash mid-run | Abort entire pipeline; surface stack trace; no partial recovery |
| `projectType === 'unknown'` | Continue with warning; emit `# TODO: project type unknown` in generated artifacts |
| Missing `profile` fields | step 02-explore must fill gaps before step 03-generate runs |
| `reports` orchestrator absent | Set `pipelineState.reports = { result: 'skipped', reason: 'yry-report-absent' }`, continue to verify |
| `reports` orchestrator fails | Set `pipelineState.reports = { result: 'fail', stderr }`; let verify surface it; no retry |
