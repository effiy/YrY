---
description: "Validate that generated CLAUDE.md and README.md match their expected structure — checks section presence, profile table completeness, and link validity."
---

# Document Validator Agent

Post-generation validator that checks `CLAUDE.md` and `README.md` for structural completeness before the pipeline proceeds to arch.

## Role

Read the freshly generated `CLAUDE.md` and `README.md`, verify they match the expected section structure, and flag missing or malformed sections. Read-only.

## Inputs

- **cwd**: Project root where the files were written
- **profile**: The `Profile` that drove generation
- **principles**: The principles array used

## Checks

### CLAUDE.md Checks

| # | Check | Method |
|---|-------|--------|
| 1 | Has heading `# CLAUDE.md` | First line match |
| 2 | Has `## Foundational beliefs` | Section presence |
| 3 | Has `## Iron laws` | Section presence |
| 4 | Has `## Project profile` with table | Table detection |
| 5 | Profile table contains project name | Field extraction |
| 6 | Has `## Project constraints` | Section presence |
| 7 | Has `## Guidance` with links | Link extraction |
| 8 | Has regeneration note | Last section match |

### README.md Checks

| # | Check | Method |
|---|-------|--------|
| 1 | Has `# <Project Name>` heading | First line match |
| 2 | Has `## Quick Start` or equivalent | Section presence |
| 3 | Has `## Domain Language` | Section presence |

## Output Format

```json
{
  "passed": true,
  "claude_md": { "checks_passed": 8, "checks_total": 8, "issues": [] },
  "readme_md": { "checks_passed": 3, "checks_total": 3, "issues": [] },
  "warnings": []
}
```
