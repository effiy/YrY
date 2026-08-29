---
paths: [".claude/rui-init/SKILL.md"]
description: "Orchestration safety rules — abort conditions, state corruption detection, partial-run recovery, and pipeline timeout."
---

# Orchestration Safety Rules

## Abort Conditions (Immediate Halt)

| Condition | Action |
|-----------|--------|
| Sub-skill returns non-zero exit code | Halt pipeline, surface error |
| Sub-skill crashes (uncaught exception) | Halt pipeline, surface stack trace |
| `verify.result === 'fail'` | Halt pipeline, surface failure list |
| `cwd` doesn't exist | Abort with `cwd-not-found` |

## State Corruption Detection

### After 01-detect (before passing to explore)

| Check | Threshold |
|-------|-----------|
| `profile` is not null/undefined | Required |
| `profile.identity.projectName` is a non-empty string | Required |
| `profile.projectType` is not null | Required |
| `profile.inventory.manifests` is non-empty object | Required |
| `profile.inventory.topLevelDirs` is non-empty array | Warn if empty |

### After 02-explore (before passing to generate)

| Check | Threshold |
|-------|-----------|
| `exploration` is not null/undefined | Required |
| `exploration.moduleMap` has at least 3 entries | Required |
| `exploration.architecture.pattern` is a non-empty string | Required |
| `exploration.architecture.notes` is a non-empty string | Warn if empty |
| `exploration.conventions` has at least 5 keys | Required |
| `exploration.securitySurface` fields are non-null arrays | Required |

### Pipeline integrity

| Check | Method |
|-------|--------|
| Steps out of order | `pipelineState.steps` must match `['01-detect', '02-explore', '03-generate', '04-verify']` prefix |
| Duplicate step execution | `steps` array must have no duplicates |
| Missing upstream state | Step N must not read fields that step N-1 hasn't written yet |

## Partial-Run Recovery

- If pipeline halts at step N, re-running starts from step 1 (full rebuild)
- No checkpoint/resume — idempotence of each step makes re-run safe
- Previous artifacts are overwritten on re-run

## Pipeline Timeout

- No hard timeout — pipeline runs to completion
- If a sub-skill hangs, the user interrupts (Ctrl+C)
- Long-running steps (explore on large codebases) are expected