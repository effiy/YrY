---
name: skill-creator-package
description: >
  Package a finalized skill into a distributable .skill file — run the
  packaging script and present the result to the user for installation.
---

# Skill Creator — Package and Present

Package the finalized skill into a distributable `.skill` file.

## Available Tools

| Tool | Purpose |
|------|---------|
| `RunCommand` | Run `scripts.package_skill` |
| `Skill` (present_files) | Present the .skill file to the user |

## Prerequisites

- Skill is finalized (improvement loop and optional description optimization are complete)
- Check whether the `present_files` tool is available — if not, skip the presentation step

## Package the Skill

From the skill-creator directory:

```bash
python -m scripts.package_skill <path/to/skill-folder>
```

After packaging, direct the user to the resulting `.skill` file path so they can install it.

## Important Notes

- **Preserve the original name** when updating an existing skill. If the installed skill is `research-helper`, output `research-helper.skill` (not `research-helper-v2`).
- **Copy to a writable location before editing** if the installed skill path is read-only. Copy to `/tmp/skill-name/`, edit there, and package from the copy.
- **Stage in `/tmp/` first** if packaging fails due to permissions, then copy to the target directory.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `present_files` tool not available | Skip presentation; direct user to the .skill file path |
| `package_skill.py` fails due to permissions | Stage in `/tmp/` first, then copy to target |
| Installed skill path is read-only | Copy to `/tmp/skill-name/` before editing and packaging |
