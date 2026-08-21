---
title: subagent-dev
name: subagent-dev
description: >
  Subagent-driven development: dispatch independent tasks to parallel subagents
  for faster execution. Use this skill when a plan has multiple independent tasks
  that can run concurrently, or when the user wants to parallelize work across
  the monorepo's sub-projects. Each subagent receives a self-contained task
  brief with the target files, the project's CLAUDE.md context, and a
  verification command. Results are collected and reviewed before merging.
  Trigger words: subagent, parallel, 并行, dispatch, 分派, 同时处理,
  run in parallel, fan out, split work, 分头行动, 并行执行.
  Do NOT trigger for: sequential tasks with dependencies, single-file changes,
  or when the user hasn't approved a plan.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/subagent-dev
review_cycle: quarterly
roles:
  - aier
  - engineer
tags:
  - skill
  - ai
  - subagent
  - parallel
  - execution
chip: ai-workflow
---

# subagent-dev

> Parallel execution via subagents. Inspired by superpowers'
> subagent-driven-development and dispatching-parallel-agents — adapted
> for the YrY monorepo's multi-project architecture.

## What this skill does

- Identify independent tasks in a plan that can run in parallel.
- Dispatch each task to a subagent with a self-contained brief.
- Each subagent receives: the exact file(s) to modify, the task description,
  the target project's CLAUDE.md context, and the verification command.
- Collect results from all subagents, review each against its spec, then
  merge into the working tree.
- Two-stage review: spec compliance (did it do what was asked?) then code
  quality (does it follow conventions?).

## What this skill does NOT do

- Does NOT dispatch tasks with dependencies — those must run sequentially.
- Does NOT dispatch tasks that touch the same files — shared state = serial.
- Does NOT replace the plan — subagent-dev is an execution strategy, not a
  planning tool.
- Does NOT skip the review stage — every subagent result is reviewed before
  merging.

## Workflow

```
Plan with independent tasks
  → Identify parallel groups (tasks at the same dependency level)
  → For each group:
      1. Prepare task briefs (self-contained, with CLAUDE.md context)
      2. Dispatch all briefs to subagents IN PARALLEL
      3. Wait for all subagents to complete
      4. Review each result: spec compliance → code quality
      5. If a result fails review, fix serially or re-dispatch
  → All groups complete → final integration verification
```

### Task brief template

Each subagent receives a brief with these sections:

```markdown
## Task: [one-line description]

### Context
- Project: [YiVad | YiAi | YiPet]
- Base directory: [absolute path]
- CLAUDE.md reference: [path to CLAUDE.md]

### What to do
[Specific, actionable instructions]

### Files to modify
- [file path]: [what to change]

### Files to read (for context only)
- [file path]: [why]

### Verification
- Command: [exact command to run]
- Expected: [what success looks like]

### Constraints
- [Any specific constraints from the plan]
- [Iron Laws from the project's CLAUDE.md]
```

### Parallel group identification

```
Plan tasks:
  Task 1: Add data_service method (YiAi)        ← Group A (no deps)
  Task 2: Update API module (YiVad)             ← Group B (depends on #1)
  Task 3: Wire up component (YiVad)             ← Group B (depends on #1)
  Task 4: Add error handling (YiVad)            ← Group C (depends on #2, #3)
  Task 5: Update tests (YiPet)                  ← Group C (depends on #1)

Execution order:
  Group A: [Task 1] — run first
  Group B: [Task 2, Task 3] — run in parallel after Group A
  Group C: [Task 4, Task 5] — run in parallel after Group B
```

### Two-stage review

After subagents complete, review each result:

**Stage 1: Spec compliance**
- Does the change implement exactly what the task brief asked for?
- Are there any extra changes outside the task scope?
- Does the verification command pass?

**Stage 2: Code quality**
- Does the code follow the project's conventions (CLAUDE.md)?
- Are there any obvious bugs, edge cases missed, or style violations?
- Would the code pass a `/code-review`?

If a result fails Stage 1, re-dispatch with corrected instructions.
If a result passes Stage 1 but fails Stage 2, fix the quality issues serially.

## YrY-specific dispatching rules

1. **Cross-project tasks are always separate subagents**: A YiAi change and a
   YiVad change go to different subagents with different CLAUDE.md contexts.
2. **Backend subagents run first**: If Group A has YiAi tasks and Group B has
   YiVad tasks, Group A must complete before Group B starts (frontend depends
   on the contract).
3. **Subagents share no state**: Each subagent gets a fresh context. If a
   subagent needs to know about another task's output, it's not independent.
4. **Verification per project**: Each subagent runs the verification command
   for its target project (see `execute-plan` for the command table).
5. **RPC envelope changes**: If a task changes the RPC envelope, pause after
   the backend subagent completes; let the user review before consumers update.

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Parallel tasks must be truly independent | Shared files = conflicts |
| 2 | Each subagent gets a self-contained brief | Subagents can't see the conversation |
| 3 | Review every subagent result | Subagents make mistakes too |
| 4 | Two-stage review: spec then quality | Spec compliance is binary; quality is nuanced |
| 5 | Backend subagents before frontend | Contract must be stable before consumers update |
| 6 | Max 3 subagents per parallel group | More than 3 = diminishing returns + coordination cost |
| 7 | If a subagent fails, don't re-dispatch blindly | Diagnose the failure first |

## Borders

| Boundary | Permission |
|----------|-----------|
| Project source files (within task scope) | read + write (via subagent) |
| CLAUDE.md files | read |
| Build config files | read |
| Files outside task scope | read-only |

## Supporting resources

- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — full project context for YiVad subagents
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — full project context for YiAi subagents
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — full project context for YiPet subagents
- [execute-plan/SKILL.md](../execute-plan/SKILL.md) — verification commands per project

## Fallback

| Situation | Behavior |
|-----------|----------|
| Subagent times out | Run the task serially in the main session |
| Subagent produces wrong result | Review the brief for ambiguity; re-dispatch with clearer instructions |
| Parallel tasks conflict (same file) | Run them serially in dependency order |
| No independent tasks in the plan | Skip subagent-dev; use `execute-plan` serially |