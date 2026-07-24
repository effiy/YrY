---
name: yry-init
description: >
  Project initialization pipeline. One end-to-end skill that
  bootstraps a project: detect → explore → generate → arch → verify.
  Each step lives in a dedicated sub-directory under `steps/`
  (01-detect, 02-explore, 03-generate, 04-arch, 05-verify) and runs in
  strict order against a shared `pipelineState` object. Triggered by
  `/yry-init`. Always performs a full rebuild: CLAUDE.md is rewritten
  in full, README.md is rebuilt with the domain-language section
  preserved, the docs home (index.html / index.css / index.js /
  data.js) is regenerated, and the two story trees
  (docs/arch/, docs/test/) are emitted and then verified.
lifecycle: default-pipeline
user_invocable: true
---

# yry-init

> End-to-end project initialization. The five steps that used to live
> as separate skills (`yry-init-detect`, `yry-init-explore`,
> `yry-init-generate`, `yry-init-arch`, `yry-init-verify`) are now
> steps **inside** this skill — they share a `pipelineState` object
> and are orchestrated by this file. Manual entry: `/yry-init`.

## Pipeline

```
detect  →  explore  →  generate  →  arch  →  reports  →  verify
```

Every arrow is a step in this skill, except `reports` which is a
delegation phase. Pipeline state flows forward in a single
`pipelineState` object:

```ts
type PipelineState = {
  steps: string[];           // completed step names
  profile: Profile;          // step 01-detect
  exploration: Exploration;  // step 02-explore
  // step 03-generate writes CLAUDE.md + README.md + docs/{index.html,index.css,index.js,data.js}
  //   docs/data.js exposes three fixed sections in this order:
  //     §1 section-dependencies (third-party deps & frameworks)
  //     §2 section-stories      (arch + test story trees)
  //     §3 section-source       (main source code, grouped by src/<dir>/)
  // step 04-arch writes docs/arch/ + docs/test/
  // reports phase delegates to yry-report orchestrator (skipped if absent)
  verify: { result: 'pass' | 'fail'; failures: Failure[] };
};
```

## Steps

| # | Step | Directory | Responsibility | I/O contract |
|---|------|-----------|----------------|--------------|
| ① | [01-detect](./steps/01-detect/STEP.md) | `steps/01-detect/` | Probe filesystem → emit `profile` fact baseline | input: `cwd` · output: `Profile` |
| ② | [02-explore](./steps/02-explore/STEP.md) | `steps/02-explore/` | Read source → emit `exploration` (module map + conventions + corrected security surface) | input: `profile` · output: `Exploration` |
| ③ | [03-generate](./steps/03-generate/STEP.md) | `steps/03-generate/` | Emit `CLAUDE.md` + `README.md` + `docs/{index.html,index.css,index.js,data.js}` from `profile` + `exploration` | input: `profile`, `exploration` · output: files on disk |
| ④ | [04-arch](./steps/04-arch/STEP.md) | `steps/04-arch/` | Build `docs/arch/` and `docs/test/` story directories | input: `profile`, `exploration` · output: files on disk |
| ⑤ | [05-verify](./steps/05-verify/STEP.md) | `steps/05-verify/` | 7-point readiness check + engineering gate | input: `profile`, `exploration` · output: `{ result, failures }` |

### Step → Pipeline State

| Step | Pipeline state field populated |
|------|-------------------------------|
| 01-detect | `pipelineState.profile` |
| 02-explore | `pipelineState.exploration` |
| 03-generate | (writes files) |
| 04-arch | (writes files) |
| 05-verify | `pipelineState.verify` |

## Orchestration Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Steps run in pipeline order | Each step's output is the next step's input |
| 2 | If 05-verify fails, the pipeline terminates | Verify is the engineering gate |
| 3 | Repeatable; full rebuild of CLAUDE.md + README.md main sections each run | Pure function of `profile` + `exploration` |
| 4 | README.md domain-language section is append-once then preserved | User-curated content is not lost |
| 5 | This skill is the only user-invocable entry point | `/yry-init` triggers this skill; the five steps are pipeline-internal |
| 6 | Steps do not invoke each other | They communicate only through the `pipelineState` object held by this skill |
| 7 | On any step failure, surface the failure to the user and halt | No silent retries, no silent skips |
| 8 | All generated docs-facing artifacts live under `docs/` | The docs home entry, both story directories, and the reports tree stay colocated |
| 9 | Report leaf layouts live at `YiDoc/templates/<leaf>/` (repo root, shared across all projects); per-project deployment is a path-adjusted byte-copy of `index.html` only (depth-4 paths, manually maintained — apply depth-3 → depth-4 path substitution when the template changes); `index.css` / `index.js` / `app/*` are NOT copied — they're served from the shared template via `../../../templates/<leaf>/` relative paths. Only the **data model** (`YiDoc/projects/<project>/<leaf>/data.js`) is regenerated per project. Any byte-level drift between `YiDoc/templates/<leaf>/index.html` and a project's `<leaf>/index.html` shell (after path substitution) is a verify failure. The docs home (`yry-init/templates/`) is a seed for new project inits, not a byte-stable SoT — existing catalogs may carry legitimate per-project customization (e.g. inline `<style>` overrides for project-specific print footers) that diverges from the seed | The report-leaf consolidation is the load-bearing contract; the docs-home seed is a starting point, not an invariant |

## Reports Phase (after 04-arch, before 05-verify)

- Delegate to the `yry-report` orchestrator by running
  `node yry-report/scripts/run-orchestrator.mjs` from `cwd`.
- Emits each yry-report* sub-skill's report page under `docs/reports/`
  (Markdown + JSON).
- **Non-blocking**: if `yry-report/scripts/run-orchestrator.mjs` does
  not exist (the yry-report skill is not installed), skip the phase,
  set `pipelineState.reports = { result: 'skipped', reason: 'yry-report-absent' }`,
  and proceed to 05-verify. The pipeline must not fail because a
  sibling skill is missing.
- **Blocking on script failure**: if the script exists but exits
  non-zero, set `pipelineState.reports = { result: 'fail', stderr }`
  and let 05-verify surface it. Do not retry.

## Borders

| Boundary | Permission |
|----------|-----------|
| `<cwd>/**/*` (project under init) | read + write (init's purpose is to bootstrap files) |
| `steps/**`, `references/**`, `agents/**`, `rules/**`, `templates/**` (this skill) | read |
| `YiDoc/templates/<leaf>/**` (shared report + arch shells, repo root) | read |
| `docs/**` (output) | read + write |
| Outside `<cwd>` and this skill | no automatic writes |

## Supporting resources

- [rules/orchestration-safety.md](./rules/orchestration-safety.md) — abort conditions, state-corruption detection, partial-run recovery, pipeline timeout.
- [rules/pipeline-contracts.md](./rules/pipeline-contracts.md) — pipeline ordering, `pipelineState` shape, output ownership, degradation countermeasures.
- [rules/architecture-direction.md](./rules/architecture-direction.md) — canonical YrY architecture direction: frontend projects → componentization, backend projects → modularization. Baked into CLAUDE.md and arch scenes by this skill.
- [agents/artifact-consistency-checker.md](./agents/artifact-consistency-checker.md) — post-pipeline cross-artifact consistency checker.
- [agents/pipeline-diagnoser.md](./agents/pipeline-diagnoser.md) — classify step failures and recommend fixes.
- [references/pipeline-lifecycle.md](./references/pipeline-lifecycle.md) — execution timeline, state transitions, artifact generation order.
- [references/pipeline-state-reference.md](./references/pipeline-state-reference.md) — `pipelineState` type definitions, verify check catalog, filesystem output layout.
- [steps/01-detect/STEP.md](./steps/01-detect/STEP.md) · [steps/02-explore/STEP.md](./steps/02-explore/STEP.md) · [steps/03-generate/STEP.md](./steps/03-generate/STEP.md) · [steps/04-arch/STEP.md](./steps/04-arch/STEP.md) · [steps/05-verify/STEP.md](./steps/05-verify/STEP.md) — per-step contracts.

## Page HTML Generation

This skill can emit a self-contained Vue 3 docs page following the
4-file split layout used across this catalog.

### Output layout

| File | Stability | Purpose |
|------|-----------|---------|
| `index.html` | byte-stable | mounts `#app`, loads Vue 3 + shared components |
| `index.css` | byte-stable | layout, theme tokens, responsive grid |
| `index.js` | byte-stable | wires Vue 3 app, registers shared components |
| `data.js` | regenerated each run | `yry-init`-specific content model |

### Workflow

1. Resolve output directory (default: `docs/yry-init/`).
2. Copy `index.html`, `index.css`, `index.js` verbatim from this
   skill's `templates/` directory (or from `shared/components/` if
   this skill has no templates).
3. Regenerate `data.js` from the skill's domain knowledge —
   `yry-init` rules, references, and agent outputs.
4. Open `docs/yry-init/index.html` in a browser; no build step.

### Borders

| Boundary | Permission |
|----------|-----------|
| `templates/**` (this skill) | read |
| `shared/components/**` | read |
| `docs/yry-init/**` (output) | write |
| Anywhere else | no write |

## Fallback

| Situation | Behavior |
|-----------|----------|
| A step returns an explicit `cwd-not-found` error | Terminate the pipeline; surface the error. |
| 05-verify returns `result: 'fail'` | Terminate the pipeline; surface the failure list with fix suggestions. |
| A step crashes mid-run | Abort; do not attempt partial recovery; surface the stack trace. |
| `yry-report/scripts/run-orchestrator.mjs` absent | Skip the reports phase, record `pipelineState.reports = { result: 'skipped' }`, continue to 05-verify. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
