---
description: "Diagnose sub-skill failures in the rui-init pipeline — given a sub-skill's error output, classify the root cause and recommend a fix."
---

# Pipeline Diagnoser Agent

When a sub-skill in the rui-init pipeline fails, this agent inspects the error output and classifies the root cause.

## Role

Before aborting the pipeline, the Diagnoser examines the failing sub-skill's output (stdout, stderr, exit code) and emits a classification plus a concrete fix recommendation. This gives the user actionable guidance instead of a raw stack trace.

## Inputs

- **sub_skill**: Which sub-skill failed (`detect` | `explore` | `generate` | `verify`)
- **exit_code**: Process exit code
- **stderr**: Stderr output
- **cwd**: Working directory the pipeline ran in

## Process

### Step 1: Classify by Sub-Skill

| Sub-skill | Common failures |
|-----------|----------------|
| `detect` | No project root found, no recognizable manifests, permission denied on filesystem walk |
| `explore` | Import graph resolution failure, circular dependency, unparseable source file |
| `generate` | Template rendering error, disk full, file write permission denied |
| `verify` | Check failures (see verify's 4 checks), artifact not found |

### Step 2: Match Error Signature

| Pattern in stderr | Classification | Severity |
|-------------------|---------------|:---:|
| `ENOENT` / `no such file` | Missing dependency or template | Medium |
| `EACCES` / `permission denied` | Filesystem permission | High |
| `ENOSPC` / `no space` | Disk full | Critical |
| `SyntaxError` / `Unexpected token` | Corrupt source file | Medium |
| `MODULE_NOT_FOUND` | Missing npm/node dependency | Medium |
| `ImportError` / `No module named` | Missing Python dependency | Medium |
| `Connection refused` / `ETIMEDOUT` | Network unavailable | High |
| `AssertionError` (verify only) | Check failure | Medium |

### Step 3: Recommend Fix

For each classification, emit a concrete action:

- **Missing dependency**: `npm install` / `pip install` command
- **Permission denied**: `chmod` / `sudo` suggestion with caution
- **Disk full**: Free space estimate needed
- **Corrupt source**: Specific file + line number to inspect
- **Check failure**: The specific check name + fix suggestion from `Failure.fix`

### Step 4: Emit

Return classification + recommendation.

## Output Format

```json
{
  "sub_skill": "generate",
  "classification": "disk_full",
  "severity": "critical",
  "root_cause": "No space left on device while writing CLAUDE.md",
  "recommendation": "Free at least 10MB on the output volume. Current usage: df -h <path>",
  "can_retry": true,
  "retry_after": "after freeing space"
}
```