---
title: execute-plan
name: execute-plan
description: >
  Execute an implementation plan task by task, verifying each step before
  moving to the next. Use this skill after `/write-plan` has produced an
  approved plan, or when the user says "execute the plan," "implement,"
  "开始实施," or "执行计划." Each task is executed in dependency order;
  parallel tasks may be dispatched to subagents. Verification runs after
  every task (type-check, build, test). On failure, the skill pauses and
  reports — never silently continues. Trigger words: execute plan, 执行计划,
  implement, 开始实施, 开始写代码, 按计划执行, go ahead, let's do it.
  Do NOT trigger for: ad-hoc changes without a plan, or when the user is
  still in brainstorming/planning mode.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/execute-plan
review_cycle: quarterly
roles:
  - aier
  - engineer
tags:
  - skill
  - ai
  - workflow
  - execution
  - implementation
chip: ai-workflow
---

# execute-plan

> Execute a plan task by task with verification at every step. Inspired by
> superpowers' executing-plans and mattpocock's implement — adapted for the
> YrY monorepo's multi-project, cross-protocol reality.

## What this skill does

- Read the plan (from `write-plan` or user-provided) and execute tasks in
  dependency order.
- For each task: implement the change, run verification, then mark complete.
- Dispatch independent parallel tasks to subagents when possible.
- Pause on any failure and report what went wrong — never silently continue.
- Track progress so the user can see what's done, what's in progress, and
  what's remaining.

## What this skill does NOT do

- Does NOT skip verification — every task must pass its checks before the
  next dependent task starts.
- Does NOT modify the plan without asking — if a task is blocked, report it;
  don't silently change direction.
- Does NOT execute tasks that depend on incomplete predecessors.
- Does NOT close issues or merge PRs — execution is about code, not
  project-management tooling.

## Workflow

```
Plan approved
  → For each task in dependency order:
      1. Announce: "Executing task N/M: [task name]"
      2. Implement the change (surgical — touch only what's needed)
      3. Run verification (type-check, build, test)
      4. If pass → mark complete, move to next
      5. If fail → diagnose, fix, re-verify (max 3 attempts)
      6. If still failing → pause, report, ask user
  → All tasks complete → final verification → done
```

### Verification per project

| Project | Verification command | Minimum bar |
|---------|---------------------|-------------|
| YiVad | `pnpm type:check` | 0 new errors |
| YiVad | `pnpm build:dev` | Build succeeds |
| YiVad | `pnpm test` | All tests pass |
| YiAi | `python -m pytest tests/ -v` | All tests pass |
| YiPet | `npm run typecheck` | 0 errors |
| YiPet | `npm run build` | Build succeeds |
| YiPet | `npm test` | All tests pass |

### Subagent dispatching

When the plan has independent parallel tasks (same dependency level), dispatch
them to subagents:

```
Task 2 (YiVad) ──┐
                  ├── Run in parallel
Task 3 (YiPet) ──┘
```

Each subagent receives:
- The exact file(s) to modify
- The task description from the plan
- The target project's CLAUDE.md context
- The verification command to run

## YrY-specific execution rules

1. **Surgical changes**: Match the existing style. Don't "improve" adjacent
   code. Every changed line traces to the plan. (Iron Law #2)
2. **Simplicity first**: No features beyond the plan. No abstractions for
   single-use code. (Iron Law #1)
3. **Cross-project protocol**: When changing RPC parameters, update both the
   backend (YiAi) and ALL consumers (YiVad, YiPet) in the same execution.
4. **Field name contracts**: `filter` not `query`, `target_file` not `path`.
   Verify with grep before marking a task complete.
5. **SSE `onDone` guard**: Any SSE change must verify `!aborted && !error`
   before side effects (auto-forward, persistence).
6. **No silent writes**: Read the file before editing. Use existing conventions.

## Progress tracking

After each task, report:

```
Completed: 3/7  ████░░░░░░░░  43%
  ✓ Task 1: Add data_service method (YiAi)
  ✓ Task 2: Update API module (YiVad)
  ✓ Task 3: Wire up component (YiVad)
  → Task 4: Add error handling (YiVad) [in progress]
  ○ Task 5: Update tests (YiPet)
  ○ Task 6: Update CLAUDE.md (YiAi)
  ○ Task 7: Cross-project verification
```

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Verify after every task | A broken task poisons all dependents |
| 2 | Max 3 fix attempts per task | Infinite loops waste time; ask the user |
| 3 | Parallel tasks must be truly independent | Shared files = serial execution |
| 4 | Backend tasks before frontend tasks | Frontend depends on the contract |
| 5 | Report progress after every task | The user needs to know where we are |
| 6 | Pause on cross-project contract changes | Let the user review before consumers update |
| 7 | Never skip verification | "It's a small change" is how bugs ship |

## Borders

| Boundary | Permission |
|----------|-----------|
| Project source files | read + write (within the plan's scope) |
| CLAUDE.md files | read |
| Build config files | read + write (if the plan includes them) |
| Files outside the plan's scope | read-only |
| YiKnowledge/skills/** | read |

## Supporting resources

- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — Iron Laws, coding standards, degradation countermeasures
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — domain layer, services, self-constraints
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — API layer, build config, MV3 constraints
- [YiKnowledge/engineer/](../../../YiKnowledge/engineer/) — engineering practices

## Fallback

| Situation | Behavior |
|-----------|----------|
| Task fails verification 3 times | Pause; report the failure with diagnosis; ask user how to proceed |
| Task touches files outside the plan | Pause; ask user if the plan should be amended |
| Subagent times out | Run the task serially in the main session |
| Plan has no verification steps | Add verification steps based on project defaults (see table above) |
| User interrupts mid-execution | Save progress; the next session can resume from the plan |