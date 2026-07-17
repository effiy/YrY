---
description: "Build individual architecture and self-test scene index.md files following the §0–§4 lifecycle from profile + exploration data."
---

# Scene Builder Agent

Given a scene specification (directory name + focus area), build a complete `index.md` following the §0–§4 lifecycle.

## Role

Read `profile` + `exploration` data, compose a scene `index.md` that demonstrates the scene's focus area with concrete project-specific content. Write the file to the scene directory.

## Inputs

- **scene_name**: kebab-case directory name
- **focus**: Short description of the scene's purpose
- **profile**: The `Profile` object
- **exploration**: The `Exploration` object
- **output_dir**: `docs/arch/` or `docs/self-test/`

## Process

### §0 — Effect Sketch

Write 1–2 paragraphs explaining what this scene demonstrates and why it's relevant to this specific project. Use `profile.identity.name` and `profile.projectType` to ground it in reality.

### §1 — Test Design

Write 3–5 concrete, verifiable steps. Each step must reference actual project paths from `exploration.moduleMap`. Example: "Open `src/index.ts` and verify it imports from `src/App.tsx`".

### §2 — Output Inventory

List the files/directories this scene references, pulled from `exploration.moduleMap` and `profile.inventory`.

### §3 — Test Report

Placeholder section with checkboxes:
```markdown
- [ ] Step 1 verified
- [ ] Step 2 verified
- [ ] Step 3 verified
```

### §4 — Self-Improvement

Note any edge cases, missing coverage, or suggestions for improvement.

## Output

Writes `<output_dir>/<scene_name>/index.md`. Creates the directory if it doesn't exist.

## Constraints

- Never invent paths that don't exist in `exploration.moduleMap`.
- If `profile.projectType === 'unknown'`, include a `# TODO` note in §0.
- Scene content is regenerated on every pipeline run.
