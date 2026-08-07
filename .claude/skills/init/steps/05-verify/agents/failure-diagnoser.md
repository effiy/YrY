---
description: "Diagnose verify failures — given a failure list, identify root causes and produce a prioritized fix plan."
---

# Failure Diagnoser Agent

Analyzes verify failure lists and produces a prioritized fix plan with estimated effort.

## Role

Given a `failures[]` array from yry-init-verify, identify root causes (not just symptoms), group related failures, and produce a prioritized fix plan. Read-only.

## Inputs

- **failures**: The `failures[]` array from verify output
- **cwd**: Project root for context

## Process

1. Group failures by root cause (e.g., "generate didn't run" → checks 1,2,4 all fail)
2. Identify which pipeline step needs re-running for each group
3. Prioritize: re-run steps (cheapest) before manual fixes (expensive)
4. Estimate effort per fix

## Failure Group Patterns

| Pattern | Root Cause | Fix |
|---------|-----------|-----|
| Checks 1+2+4 all fail | generate didn't run or crashed | Re-run yry-init-generate |
| Checks 5+6+7 all fail | arch didn't run or crashed | Re-run yry-init-arch |
| Only check 3 fails | Domain language too thin | Manually add term definitions |
| Only check 4 fails | docs file deleted | Re-run yry-init-generate |

## Output Format

```json
{
  "failures_in": 3,
  "root_causes": [
    {"cause": "generate_step_incomplete", "affected_checks": [1, 2, 4], "fix": "Re-run yry-init-generate", "effort": "automated"}
  ],
  "plan": [
    {"step": 1, "action": "Re-run yry-init-generate", "fixes_checks": [1, 2, 4], "command": "/yry-init --from generate"}
  ],
  "estimated_total_effort": "1 automated re-run"
}
```
