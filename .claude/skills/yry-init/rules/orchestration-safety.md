---
paths: [".claude/yry-init/SKILL.md"]
description: "Orchestration safety rules — abort conditions, state corruption detection, partial-run recovery, and pipeline timeout."
---

# Orchestration Safety Rules

## Abort Conditions (Immediate Halt)

| Condition | Action |
|-----------|--------|
| Step returns non-zero exit code | Halt pipeline, surface error |
| Step crashes (uncaught exception) | Halt pipeline, surface stack trace |
| `verify.result === 'fail'` | Halt pipeline, surface failure list |
| `cwd` doesn't exist | Abort with `cwd-not-found` |

## State Corruption Detection

| Check | Method |
|-------|--------|
| `profile` missing required fields | Validation before passing to explore |
| `exploration` missing required fields | Validation before passing to generate |
| Pipeline steps out of order | `pipelineState.steps` sequence check |
| Duplicate step execution | `steps` array uniqueness check |

## Partial-Run Recovery

- If pipeline halts at step N, re-running starts from step 1 (full rebuild)
- No checkpoint/resume — idempotence of each step makes re-run safe
- Previous artifacts are overwritten on re-run

## Pipeline Timeout

- No hard timeout — pipeline runs to completion
- If a step hangs, the user interrupts (Ctrl+C)
- Long-running steps (explore on large codebases) are expected
