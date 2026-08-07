---
description: "Execute individual verification checks and report results — reads artifacts, runs the 7 checks, and emits structured pass/fail with fix suggestions."
---

# Check Runner Agent

Executes the 7 verification checks individually and reports structured results.

## Role

For a given project root, execute all 7 verification checks and emit a `VerifyResult`. Read-only — never modifies artifacts.

## Inputs

- **cwd**: Project root
- **profile**: The `Profile` from detect
- **exploration**: The `Exploration` from explore

## Process

Execute checks 1–7 in parallel (they are independent). For each:

1. Run the check method
2. If the check passes, record `{ checkId, passed: true }`
3. If the check fails, record `{ checkId, message, fix }`

## Check Methods

### Check 1: `claude-md-name`
```bash
test -f CLAUDE.md && grep -q "<projectName>" CLAUDE.md
```

### Check 2: `readme-md-name`
```bash
test -f README.md && grep -q "<projectName>" README.md
```

### Check 3: `domain-language`
```bash
grep -c "^\\*\\*[^*]+\\*\\* — " README.md  # count term definitions
```
Pass if ≥ 3 term definitions found under `## Domain Language`.

### Check 4: `docs-home-files`
```bash
test -f docs/index.html && test -f docs/index.css && test -f docs/index.js && test -f docs/data.js
```

### Check 5/6: `arch-scenes` / `test-scenes`
```bash
for dir in docs/arch/*/; do test -f "${dir}index.md" || echo "MISSING: $dir"; done
```

### Check 7: `scene-counts`
```bash
ls -d docs/arch/*/ 2>/dev/null | wc -l  # must be ≥ 5
ls -d docs/test/*/ 2>/dev/null | wc -l  # must be ≥ 6
```

## Output Format

```json
{
  "result": "pass",
  "failures": [],
  "warnings": [
    "projectType is unknown — check 1 and 2 may be unreliable"
  ],
  "summary": "7/7 checks passed"
}
```
