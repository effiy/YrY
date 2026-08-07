---
name: yry-init
description: >
  Project initialization pipeline. One end-to-end skill that
  bootstraps a project: detect → explore → generate → verify.
  Each step lives in a dedicated sub-directory under `steps/`
  (01-detect, 02-explore, 03-generate, 05-verify) and runs in
  strict order against a shared `pipelineState` object. Triggered by
  `/yry-init`. Always performs a full rebuild: CLAUDE.md is rewritten
  in full, README.md is rebuilt with the domain-language section
  preserved.
lifecycle: default-pipeline
user_invocable: true
---

# yry-init

> End-to-end project initialization. The steps that used to live
> as separate skills (`yry-init-detect`, `yry-init-explore`,
> `yry-init-generate`, `yry-init-verify`) are now
> steps **inside** this skill — they share a `pipelineState` object
> and are orchestrated by this file. Manual entry: `/yry-init`.

## Pipeline

```
detect  →  explore  →  generate  →  verify
```

Every arrow is a step in this skill. Pipeline state flows forward in a single
`pipelineState` object:

```ts
type PipelineState = {
  steps: string[];           // completed step names
  profile: Profile;          // step 01-detect
  exploration: Exploration;  // step 02-explore
  // step 03-generate writes CLAUDE.md + README.md
  verify: { result: 'pass' | 'fail'; failures: Failure[] };
};
```

## Steps

| # | Step | Directory | Responsibility | I/O contract |
|---|------|-----------|----------------|--------------|
| ① | [01-detect](./steps/01-detect/STEP.md) | `steps/01-detect/` | Probe filesystem → emit `profile` fact baseline | input: `cwd` · output: `Profile` |
| ② | [02-explore](./steps/02-explore/STEP.md) | `steps/02-explore/` | Read source → emit `exploration` (module map + conventions + corrected security surface) | input: `profile` · output: `Exploration` |
| ③ | [03-generate](./steps/03-generate/STEP.md) | `steps/03-generate/` | Emit `CLAUDE.md` + `README.md` from `profile` + `exploration` | input: `profile`, `exploration` · output: files on disk |
| ④ | [05-verify](./steps/05-verify/STEP.md) | `steps/05-verify/` | 3-point readiness check + engineering gate | input: `profile`, `exploration` · output: `{ result, failures }` |

### Step → Pipeline State

| Step | Pipeline state field populated |
|------|-------------------------------|
| 01-detect | `pipelineState.profile` |
| 02-explore | `pipelineState.exploration` |
| 03-generate | (writes files) |
| 05-verify | `pipelineState.verify` |

## Orchestration Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Steps run in pipeline order | Each step's output is the next step's input |
| 2 | If 05-verify fails, the pipeline terminates | Verify is the engineering gate |
| 3 | Repeatable; full rebuild of CLAUDE.md + README.md main sections each run | Pure function of `profile` + `exploration` |
| 4 | README.md domain-language section is append-once then preserved | User-curated content is not lost |
| 5 | This skill is the only user-invocable entry point | `/yry-init` triggers this skill; the steps are pipeline-internal |
| 6 | Steps do not invoke each other | They communicate only through the `pipelineState` object held by this skill |
| 7 | On any step failure, surface the failure to the user and halt | No silent retries, no silent skips |

## Borders

| Boundary | Permission |
|----------|-----------|
| `<cwd>/**/*` (project under init) | read + write (init's purpose is to bootstrap files) |
| `steps/**`, `references/**`, `agents/**`, `rules/**`, `templates/**` (this skill) | read |
| Outside `<cwd>` and this skill | no automatic writes |

## Supporting resources

- [rules/orchestration-safety.md](./rules/orchestration-safety.md) — abort conditions, state-corruption detection, partial-run recovery, pipeline timeout.
- [rules/pipeline-contracts.md](./rules/pipeline-contracts.md) — pipeline ordering, `pipelineState` shape, output ownership, degradation countermeasures.
- [rules/architecture-direction.md](./rules/architecture-direction.md) — canonical YrY architecture direction: frontend projects → componentization, backend projects → modularization. Baked into CLAUDE.md by this skill.
- [agents/artifact-consistency-checker.md](./agents/artifact-consistency-checker.md) — post-pipeline cross-artifact consistency checker.
- [agents/pipeline-diagnoser.md](./agents/pipeline-diagnoser.md) — classify step failures and recommend fixes.
- [references/pipeline-lifecycle.md](./references/pipeline-lifecycle.md) — execution timeline, state transitions, artifact generation order.
- [references/pipeline-state-reference.md](./references/pipeline-state-reference.md) — `pipelineState` type definitions, verify check catalog, filesystem output layout.
- [steps/01-detect/STEP.md](./steps/01-detect/STEP.md) · [steps/02-explore/STEP.md](./steps/02-explore/STEP.md) · [steps/03-generate/STEP.md](./steps/03-generate/STEP.md) · [steps/05-verify/STEP.md](./steps/05-verify/STEP.md) — per-step contracts.

## Fallback

| Situation | Behavior |
|-----------|----------|
| A step returns an explicit `cwd-not-found` error | Terminate the pipeline; surface the error. |
| 05-verify returns `result: 'fail'` | Terminate the pipeline; surface the failure list with fix suggestions. |
| A step crashes mid-run | Abort; do not attempt partial recovery; surface the stack trace. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
