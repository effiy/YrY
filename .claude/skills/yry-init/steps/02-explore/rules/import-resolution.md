---
paths: [".claude/yry-init-explore/SKILL.md"]
description: "Import resolution rules — path resolution algorithm, alias handling, external package classification, and circular dependency detection."
---

# Import Resolution Rules

## Resolution Algorithm

```
parse import → classify (relative/alias/external) → resolve → record edge
```

## Path Classification

| Prefix | Type | Resolution |
|--------|------|-----------|
| `./` | Relative (same dir) | Resolve against importing file's directory |
| `../` | Relative (parent dir) | Resolve upward, normalize |
| `@/` | Path alias | Resolve via `tsconfig.json` paths or `jsconfig.json` |
| `~/` | Path alias | Resolve via configured root alias |
| Bare specifier | External package | Record as-is, do not expand |
| `[unresolved]` | Broken | Path doesn't exist on disk |

## External Classification

| Pattern | Classification |
|---------|---------------|
| Starts with `@scope/` | Scoped package |
| No `.` or `/` prefix | Bare package |
| Listed in `package.json` dependencies | Known external |
| Not in dependencies | Suspected external (flag) |

## Circular Dependency Detection

```
DFS with recStack → found back-edge → extract cycle → record → continue
```

- Cycles sorted by length (shortest first)
- Maximum 20 cycles reported
- Each cycle includes full path for traceability
