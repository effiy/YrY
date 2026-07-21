---
paths: [".claude/yry-init-verify/SKILL.md"]
description: "Failure escalation rules — when to warn vs fail vs abort, retry policy, and degradation countermeasures."
---

# Failure Escalation Rules

## Escalation Tiers

| Tier | Trigger | Action |
|:---:|---------|--------|
| **Warning** | Non-blocking issue (e.g., projectType unknown, stale scene) | Record, continue pipeline |
| **Fail** | Check failure (e.g., missing file, broken section) | Terminate pipeline, surface failure list |
| **Abort** | Unexpected error (e.g., disk full, permission denied) | Abort immediately, surface stack trace |

## Warning Conditions

| Condition | Warning text |
|-----------|-------------|
| `projectType === 'unknown'` | "Project type unknown — checks 1 and 2 may be unreliable" |
| `moduleMap` is empty | "Module map empty — scene verification may be incomplete" |
| Scene `index.md` < 100 words | "Scene {{name}} is unusually short — may be incomplete" |

## Retry Policy

- **Never auto-retry.** A failed check is surfaced to the user.
- The user decides whether to re-run the pipeline.
- No partial recovery — a crashed sub-skill aborts the entire pipeline.

## Degradation Countermeasures

| Condition | Countermeasure |
|-----------|---------------|
| `cwd` doesn't exist | All checks fail; user must provide valid path |
| File permission error | Treat as missing; include permission error in failure message |
| Corrupt `index.md` | Check fails with parse error detail |
| Missing scene directory | Checks 5-7 fail; user re-runs arch step |
