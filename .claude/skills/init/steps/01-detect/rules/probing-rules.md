---
paths: [".claude/yry-init/steps/01-detect/STEP.md"]
description: "Filesystem probing rules — scan depth limits, file exclusion patterns, encoding handling, and fallback for unreadable files."
---

# Filesystem Probing Rules

## Scan Depth

| Scan target | Max depth | Rationale |
|-------------|:---:|-----------|
| Directory listing | 1 (top-level only) | Performance |
| Manifest parsing | 1 (root only) | Manifests are always at root |
| Security surface scan | 2 (one level into source dirs) | Balance coverage vs speed |
| Source file sampling | 2-3 | Representative sample |

## Exclusion Patterns

| Pattern | Reason |
|---------|--------|
| `node_modules/` | Dependencies, not project code |
| `.git/` | Version control |
| `dist/`, `build/`, `.next/` | Build artifacts |
| `__pycache__/`, `*.pyc` | Python cache |
| `.DS_Store` | macOS metadata |
| `*.min.js`, `*.bundle.js` | Minified/bundled |

## Encoding Handling

- Assume UTF-8 for all text files
- If UTF-8 decode fails, try Latin-1
- If both fail, skip the file with a warning
- Never attempt binary files

## Fallback

| Situation | Behavior |
|-----------|----------|
| Permission denied | Skip file, record warning |
| File too large (> 1MB) | Skip content scan, record size only |
| Binary file detected | Skip, record as non-text |
| Empty directory | Record as empty, continue |
