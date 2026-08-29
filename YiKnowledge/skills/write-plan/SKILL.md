---
title: write-plan
name: write-plan
description: >
  Transform a spec or requirement into a concrete, step-by-step implementation
  plan. Use this skill after brainstorming has produced a spec, or when the user
  provides a clear requirement and asks for a plan. The plan breaks work into
  independently verifiable tasks, declares cross-project dependencies, and
  respects each project's CLAUDE.md constraints. Trigger words: write plan,
  写计划, 实施计划, to tickets, 拆分任务, 任务分解, 排期, 实施方案, plan this,
  break this down, 怎么实施.
  Do NOT trigger for: single-file changes, typo fixes, or when the user says
  "just do it" without asking for planning.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/write-plan
review_cycle: quarterly
roles:
  - aier
  - engineer
tags:
  - skill
  - ai
  - workflow
  - planning
  - implementation
chip: ai-workflow
---

# write-plan

> Transform a spec into an executable plan. Inspired by superpowers'
> writing-plans and mattpocock's to-spec + to-tickets — adapted for the
> YrY monorepo's multi-project, cross-protocol reality.

## What this skill does

- Read the spec (from brainstorm or user-provided) and produce a task
  breakdown with clear file-level targets.
- Declare dependencies between tasks — which task must complete before
  another can start.
- Flag cross-project touchpoints: RPC envelope changes, SSE contract
  changes, field-name contracts.
- Assign each task a verification step (type-check, build, test, manual).
- Estimate complexity per task (small/medium/large) to guide execution order.

## What this skill does NOT do

- Does NOT execute any code (hand off to `execute-plan`).
- Does NOT re-interview the user (that's `brainstorm`'s job).
- Does NOT create GitHub issues or Linear tickets (it outputs a markdown
  plan; use the project's existing issue tracker separately).
- Does NOT plan for hypothetical future requirements — only what the spec
  asks for.

## Workflow

```
Spec in hand
  → Identify affected projects and files
  → Break into ordered tasks
  → Declare dependencies and verification steps
  → Output the plan for user approval
  → Suggest /execute-plan
```

### Task breakdown rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Each task targets ≤ 3 files | Larger tasks are hard to verify |
| 2 | Each task has a verifiable outcome | "Refactor auth" is not verifiable; "Extract token refresh into useTokenRefresh.ts" is |
| 3 | Cross-project tasks are explicit | "Update YiAi's data_service.py" is a separate task from "Update YiVad's api/modules/dataService.ts" |
| 4 | Dependencies are directional | Task B depends on Task A → B starts after A passes verification |
| 5 | Backend before frontend | When both change, backend tasks come first (frontend depends on the contract) |

### YrY-specific planning rules

1. **RPC envelope changes first**: If `module_name` / `method_name` / `parameters` change,
   plan YiAi changes before YiVad/YiPet consumers.
2. **Field name contracts**: Any task touching `filter`/`query` or `target_file`/`path`
   must include a grep-verification step.
3. **SSE streaming**: Tasks touching SSE must verify both the stream shape AND the
   frontend's `onDone`/`onError` handling.
4. **Degradation**: Tasks that add new API calls must specify what happens when the
   backend is unreachable.
5. **CLAUDE.md alignment**: Every task must respect the target project's Iron Laws
   and Self-Constraints.

## Plan document template

```markdown
## Plan: [brief title]

### Prerequisites
- [ ] Spec approved (from /brainstorm or user)
- [ ] All affected projects identified

### Tasks

| # | Task | Project | Files | Depends on | Verification | Size |
|---|------|---------|-------|------------|-------------|------|
| 1 | ... | YiAi | file.py | — | `python -m pytest tests/ -v` | M |
| 2 | ... | YiVad | file.vue | #1 | `pnpm type:check && pnpm test` | S |
| 3 | ... | YiPet | file.ts | #1 | `npm run typecheck && npm test` | M |

### Cross-project checklist
- [ ] RPC envelope unchanged / changed → tasks #N, #M
- [ ] SSE contract unchanged / changed → tasks #N, #M
- [ ] Field name contracts respected (filter, target_file)
- [ ] Degradation paths defined for new API calls

### Execution order
1. Task 1 (no dependencies)
2. Task 2, Task 3 (depend on Task 1, can run in parallel)

### Risk register
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| ... | low/med/high | ... |
```

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Every task must be independently verifiable | You can't know if you're done otherwise |
| 2 | Backend tasks before frontend tasks | Frontend depends on the contract |
| 3 | Cross-project tasks are never merged | A YiAi change and a YiVad change are separate tasks |
| 4 | Dependencies must be explicit | Hidden dependencies cause deadlocks |
| 5 | Verification steps must be concrete | "test it" is not concrete; "run pytest tests/test_auth.py" is |
| 6 | Flag risks, don't hide them | A high-risk task is better called out than silent |
| 7 | No speculative tasks | Only what the spec asks for |

## Borders

| Boundary | Permission |
|----------|-----------|
| Project source files | read (for context) |
| CLAUDE.md files | read |
| YiKnowledge/skills/** | read |
| Output plan | write to conversation (not to disk unless user asks) |

## Supporting resources

- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — module boundaries, data flow, cross-project protocol
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — domain layer, services, degradation countermeasures
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — API layer, dual-world boundary
- [YiKnowledge/engineer/](../../../YiKnowledge/engineer/) — engineering practices

## Fallback

| Situation | Behavior |
|-----------|----------|
| No spec available | Suggest running `/brainstorm` first; if user insists, work from the conversation context |
| Single-file change | Output a 1-task plan; don't over-structure |
| User rejects the plan | Revise based on feedback; don't defend the original |
| Cross-project impact unclear | Flag it as a risk; don't guess |