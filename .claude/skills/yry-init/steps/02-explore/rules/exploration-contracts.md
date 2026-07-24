---
paths:
  - ".claude/yry-init/steps/02-explore/STEP.md"
description: "Exploration contracts: module map construction rules, convention detection invariants, and security surface correction protocol."
---

# Exploration Contracts

`yry-init-explore` reads source code to produce an `Exploration` object (module map + conventions + corrected security surface). These are the hard contracts.

## Module Map Rules

1. **Must trace imports, not guess.** Every edge in the module map must correspond to an actual `import` / `require` statement in source.
2. **Relative imports are resolved.** `../../lib/foo` → absolute module path.
3. **External packages are recorded but not expanded.** `import React from 'react'` → module `react` in the map, no sub-module expansion.
4. **Circular dependencies are flagged, not broken.** A cycle is recorded as a warning in `architecture.notes`.

## Convention Detection

| Convention | Detection method | Reliability |
|-----------|-----------------|:---:|
| File naming | Scan top 20 source files for dominant pattern (kebab-case, camelCase, PascalCase) | Medium |
| Import style | Count named vs default imports in entry files | Medium |
| Export style | Count `export default` vs `export const` | Medium |
| Indentation | Read `.editorconfig` or count leading spaces | High |
| Linting | Check for `.eslintrc*`, `.prettierrc*`, `pyproject.toml [tool.ruff]` | High |

## Security Surface Correction

The `exploration.securitySurface` **corrects** `profile.securitySurface`:
- If detect marked `authentication: false` but explore finds `jwt.verify()` in source → correct to `true`
- If detect marked `apiEndpoints: false` but explore finds route handlers → correct to `true`
- Corrections must cite the file + line number as evidence

## Fallback Contract

| Condition | Behavior |
|-----------|----------|
| No source files found | Return empty module map, note "no source" in architecture.notes |
| Import resolution fails (broken path) | Record as `[unresolved]` in module map |
| Parse error in a source file | Skip the file, record warning |
