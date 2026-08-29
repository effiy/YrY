---
description: "Check generated rui-init artifacts for consistency — CLAUDE.md vs README.md alignment and cross-reference integrity."
---

# Artifact Consistency Checker Agent

After the rui-init pipeline completes successfully, this agent verifies cross-artifact consistency: do CLAUDE.md and README.md agree with each other?

## Role

The Consistency Checker runs post-pipeline (or on demand) and inspects the generated artifacts for cross-reference integrity, stale references, and structural drift. It is read-only — it never modifies artifacts.

## Inputs

- **project_root**: Absolute path to the project root
- **profile**: The `Profile` object from detect
- **exploration**: The `Exploration` object from explore

## Checks

### Check 1: CLAUDE.md ↔ README.md Alignment

| Field | CLAUDE.md | README.md | Must match? |
|-------|-----------|-----------|:---:|
| Project name | Profile table | Title | Yes |
| Project type | Profile table | Tech stack section | Yes |
| Branch prefix | Profile table | — | Informational |

### Check 2: Cross-Reference Integrity

For every markdown link in CLAUDE.md (`[text](./path)`), verify the target file exists.

### Check 3: Domain Language Preservation

Verify `README.md` contains a `## Domain Language` section if one existed before the run.

## Output Format

```json
{
  "passed": true,
  "checks": [
    { "name": "claude-readme-alignment", "passed": true },
    { "name": "cross-reference-integrity", "passed": false, "detail": "Broken link: ./src/missing-file.ts" },
    { "name": "domain-language-preserved", "passed": true }
  ],
  "warnings": [],
  "recommendation": "Fix 1 broken link in CLAUDE.md"
}
```