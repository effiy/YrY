---
title: rui-init
name: rui-init
description: >
  Project initialization pipeline. Bootstraps a project in 4 steps:
  detect → explore → generate → verify. Each step communicates only
  through a shared `pipelineState` object. Triggered by `/rui-init`.
  Always performs a full rebuild: CLAUDE.md is rewritten, README.md is
  rebuilt with the domain-language section preserved.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-27
category: aier/skills/init
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - ai
  - init
  - pipeline
chip: ai-methodology
---
# rui-init

> End-to-end project initialization. Detects project identity, explores
> source code, generates CLAUDE.md + README.md, and verifies everything.
> Formerly separate skills — now unified into a single pipeline with
> shared state.

## Context

Use this skill when:
- A project has no `CLAUDE.md` and needs one generated from its source.
- An existing `CLAUDE.md` is stale and needs a full rebuild.
- The project structure has changed significantly and documentation needs
  to reflect the new reality.
- A new project is being set up and needs its initialization artifacts.

Do NOT use this skill when:
- Only a small section of CLAUDE.md needs updating — edit it directly.
- The project is not a software project (no source code, no manifests).
- You're in a subdirectory of a larger project — run from the project root.

## Role

You're a senior software architect running a structured initialization
pipeline.

**Think before coding.** State assumptions explicitly. If multiple
interpretations exist, present them. If a simpler approach exists, say so.
If something is unclear, stop and ask rather than guessing.

**Verify reality.** Every output is traceable to an input. Every step has a
verifiable success criterion. When a step fails, you surface the failure with
a concrete fix suggestion, not a stack trace.

**Keep it simple.** Don't add features beyond what the pipeline spec defines.
Don't build abstractions for single-use logic. If a step can be done in 50
lines, don't write 200.

## What this skill does

- Probe the project filesystem to detect identity, type, manifests, and
  security surface (step 01-detect).
- Scan source code to build a module map, extract conventions, and correct
  the security surface (step 02-explore).
- Generate `CLAUDE.md` (AI assistant profile) and `README.md` (human-facing
  entry point) from the detected facts (step 03-generate).
- Run a 4-point readiness check — every generated file, every cross-reference
  (step 04-verify).
- Preserve user-curated `## Domain Language` section in README.md across runs.

## What this skill does NOT do

- Does NOT modify source code — it only writes documentation files.
- Does NOT run incrementally — every invocation is a full rebuild.
- Does NOT recover from partial runs — if a step fails, re-run from step 1.
- Does NOT write outside `<cwd>` or its own skill directory.
- Does NOT invoke steps out of order — the pipeline is immutable.

## Execution

When `/rui-init` is invoked, run the pipeline step by step:

```
01-detect  →  02-explore  →  03-generate  →  04-verify
```

### Before starting

1. Confirm `<cwd>` exists and looks like a project root (has source files,
   config files, or a recognizable structure).
2. Initialize `pipelineState = { steps: [] }`.
3. Read [pipeline-contracts.md](./rules/pipeline-contracts.md) for the full
   type definitions and output ownership matrix.

### For each step

1. Read the step's `STEP.md` for detailed instructions.
2. Execute the step against the current `pipelineState`.
3. Verify the step's output against its success criteria (see below).
4. On success: append the step name to `pipelineState.steps`, continue.
5. On failure: run [pipeline-diagnoser](./agents/pipeline-diagnoser.md) to
   classify the error, surface the classification + fix suggestion to the
   user, halt the pipeline.

### Success criteria per step

| Step | Verify |
|------|--------|
| 01-detect | `profile.identity.projectName` is set, `profile.projectType` is not null, `profile.inventory.manifests` is non-empty |
| 02-explore | `exploration.moduleMap` has at least 3 entries, `exploration.architecture.pattern` is set, `exploration.conventions` has at least 5 keys |
| 03-generate | `CLAUDE.md` exists and is > 500 bytes, `README.md` exists and is > 200 bytes |
| 04-verify | `verify.result === 'pass'` with zero failures |

### After all steps pass

Run [artifact-consistency-checker](./agents/artifact-consistency-checker.md)
to verify cross-artifact integrity. Report the result to the user.

### Pipeline state

Steps communicate through a single `pipelineState` object. Each step reads
only upstream fields and writes only its designated output.

| # | Step | Reads | Writes |
|---|------|-------|--------|
| ① | [01-detect](./steps/01-detect/STEP.md) | `cwd` (filesystem) | `pipelineState.profile` |
| ② | [02-explore](./steps/02-explore/STEP.md) | `profile` | `pipelineState.exploration` |
| ③ | [03-generate](./steps/03-generate/STEP.md) | `profile`, `exploration` | `CLAUDE.md`, `README.md` |
| ④ | [04-verify](./steps/04-verify/STEP.md) | `profile`, `exploration`, filesystem | `pipelineState.verify` |

## Output

After a successful run, the project root contains:

```
<project-root>/
├── CLAUDE.md    # AI assistant profile (full rewrite)
└── README.md    # Human-facing entry point (domain language preserved)
```

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Steps run in strict pipeline order | Each step's input is the previous step's output |
| 2 | Steps communicate only through `pipelineState` | No direct step-to-step calls, no side channels |
| 3 | Each field has a single writer | Prevents race conditions and conflicting data |
| 4 | Full rebuild every run | Idempotent — pure function of profile + exploration |
| 5 | `## Domain Language` is append-once, preserve thereafter | User-curated content survives rebuilds |
| 6 | Verify is the engineering gate | `result: 'fail'` halts the pipeline; surface failures with fix suggestions |
| 7 | On any step crash, halt immediately | No silent retries, no partial recovery, no skip-and-continue |

## Borders

| Boundary | Permission |
|----------|-----------|
| `<cwd>/**/*` (project under init) | read + write |
| Existing `CLAUDE.md` / `README.md` in `<cwd>` | read (for Domain Language preservation) |
| `steps/**`, `references/**`, `agents/**`, `rules/**` | read |
| Outside `<cwd>` and this skill directory | no access |

## Supporting resources

### Rules (pipeline constraints)
- [pipeline-contracts.md](./rules/pipeline-contracts.md) — step ordering, `pipelineState` type definitions, output ownership, degradation countermeasures
- [orchestration-safety.md](./rules/orchestration-safety.md) — abort conditions, state-corruption detection, partial-run recovery, pipeline timeout

### References (detailed specs)
- [pipeline-state-reference.md](./references/pipeline-state-reference.md) — `Profile` and `Exploration` field catalog, verify checks, filesystem output layout
- [pipeline-lifecycle.md](./references/pipeline-lifecycle.md) — execution timeline, state transitions, artifact generation order

### Agents (post-pipeline tooling)
- [artifact-consistency-checker.md](./agents/artifact-consistency-checker.md) — cross-artifact consistency (CLAUDE.md ↔ README.md)
- [pipeline-diagnoser.md](./agents/pipeline-diagnoser.md) — classify step failures and recommend fixes

### Steps (execution contracts)
- [01-detect](./steps/01-detect/STEP.md) · [02-explore](./steps/02-explore/STEP.md) · [03-generate](./steps/03-generate/STEP.md) · [04-verify](./steps/04-verify/STEP.md)

## Fallback

| Situation | Behavior |
|-----------|----------|
| `cwd` doesn't exist or is not a project root | Halt with `cwd-not-found`; surface the error |
| `projectType === 'unknown'` | Continue with warning; emit `# TODO: project type unknown` in generated artifacts |
| `profile` missing required fields | Validate before passing to explore; halt if incomplete |
| `exploration` missing required fields | Validate before passing to generate; halt if incomplete |
| 04-verify returns `result: 'fail'` | Halt; surface each failure with its `fix` suggestion |
| A step crashes mid-run (uncaught exception) | Abort immediately; surface the stack trace; no partial recovery |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language |
| Existing CLAUDE.md/README.md found | Read them for Domain Language before overwriting; do not preserve anything else |