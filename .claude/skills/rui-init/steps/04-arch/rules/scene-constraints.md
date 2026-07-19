---
paths: [".claude/rui-init-arch/SKILL.md"]
description: "Scene generation constraints — directory naming, §0–§4 content minimums, cross-scene consistency, and file output rules."
---

# Scene Generation Constraints

## Directory Naming

- kebab-case, semantic (not numeric)
- arch scenes: `module-location`, `data-flow-tracing`, etc.
- test scenes: `post-init-full-self-check`, etc.

## §0–§4 Content Minimums

| Section | Minimum content | Fail if |
|---------|----------------|---------|
| §0 | 2 paragraphs | Empty or < 50 words |
| §1 | 3+ verification steps | < 3 steps |
| §2 | Table with ≥1 file/directory | Empty table |
| §3 | Checkboxes for each §1 step | Missing steps |
| §4 | 2+ edge cases or improvements | Empty |

## Cross-Scene Consistency

1. File paths referenced in scenes must exist in `exploration.moduleMap`
2. §3 test reports must reference the §1 steps by number
3. Cross-references between scenes use relative paths

## Output Rules

- Each scene writes exactly `index.md` in its directory
- Scene content is regenerated on every pipeline run
- Never invent paths that don't exist in exploration data
- `projectType === 'unknown'` → include `# TODO` note in §0
