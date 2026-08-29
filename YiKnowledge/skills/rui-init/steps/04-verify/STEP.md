---
description: "Step 04-verify: 4-point readiness check and engineering gate."
---
# 04-verify

> Input: `profile`, `exploration`, filesystem.
> Output: `pipelineState.verify` (`{ result: 'pass' | 'fail', failures: Failure[] }`).

## Role

You're the quality gate. You don't generate anything — you verify that every
artifact the pipeline promised is present, valid, and consistent. When something
is wrong, you don't just say "it failed" — you say exactly what's wrong and how
to fix it.

## Checks

### Check 1: `claude-md-exists`

Verify `CLAUDE.md` is present and non-empty.

**How**: Read `<cwd>/CLAUDE.md`. Confirm it exists, has content (> 500 bytes),
and starts with a `#` heading.

**Failure**: `"CLAUDE.md is missing or empty"` → fix: `"Re-run 03-generate step"`

### Check 2: `readme-exists`

Verify `README.md` is present and non-empty.

**How**: Read `<cwd>/README.md`. Confirm it exists, has content (> 200 bytes),
and starts with a `#` heading.

**Failure**: `"README.md is missing or empty"` → fix: `"Re-run 03-generate step"`

### Check 3: `cross-refs-valid`

Verify all markdown links in CLAUDE.md resolve to existing files.

**How**: Parse `[text](path)` patterns in CLAUDE.md. For each relative link
(not http/https), check if the target file exists relative to `<cwd>`.

**Failure**: `"CLAUDE.md links to <path> which does not exist"` → fix: `"Either
create the file at <path> or update the link in CLAUDE.md"`

### Check 4: `domain-language-preserved`

Verify the `## Domain Language` section is preserved if it existed before the run.

**How**: Check `pipelineState.exploration` for a flag indicating pre-existing
Domain Language section, or check git diff on README.md. If the section existed
before, confirm it's still present.

**Failure**: `"Domain Language section was removed during generation"` → fix:
`"Restore the Domain Language section from git history: git show HEAD:README.md"`

## Output

```json
{
  "result": "pass",
  "failures": []
}
```

Or on failure:

```json
{
  "result": "fail",
  "failures": [
    {
      "check": "cross-refs-valid",
      "detail": "CLAUDE.md links to ./src/missing-file.ts which does not exist",
      "fix": "Either create the file at ./src/missing-file.ts or update the link in CLAUDE.md"
    }
  ]
}
```

## Pipeline Contract

- **Reads**: `pipelineState.profile`, `pipelineState.exploration`, filesystem
- **Writes**: `pipelineState.verify`
- **Must not**: modify any files, invoke other steps