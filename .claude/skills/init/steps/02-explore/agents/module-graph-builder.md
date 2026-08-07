---
description: "Build a dependency graph from source imports — trace imports across the project and emit a module map with dependency edges."
---

# Module Graph Builder Agent

Traces all import/require statements across the project to build a `moduleMap: Record<string, string[]>` for the exploration phase.

## Role

Read source files, parse import statements, resolve relative paths, and emit a module dependency graph. Read-only — never modifies source.

## Inputs

- **project_root**: Absolute path
- **source_dirs**: Directories to scan (from `profile.inventory`)
- **ecosystem**: `node` | `python` | `go` | `rust` | `unknown`

## Process

### Step 1: Discover Source Files

Walk `source_dirs` for files matching the ecosystem's extensions:
- Node: `.js`, `.ts`, `.jsx`, `.tsx`, `.mjs`, `.cjs`
- Python: `.py`
- Go: `.go`
- Rust: `.rs`

### Step 2: Extract Imports

Per ecosystem:

| Ecosystem | Pattern |
|-----------|---------|
| Node (ESM) | `import ... from '...'` / `import '...'` |
| Node (CJS) | `require('...')` |
| Python | `import ...` / `from ... import ...` |
| Go | `import (...)` block |
| Rust | `use ...` / `extern crate ...` |

### Step 3: Classify Edges

| Type | Detection | Map value |
|------|-----------|-----------|
| Internal | Starts with `.` or `@/` or `~/` | Resolved relative path |
| External | Bare specifier (`react`, `lodash`) | Package name (not expanded) |
| Unresolved | Path doesn't exist on disk | `[unresolved] <path>` |
| Circular | A → B → A | Flag in `architecture.notes` |

### Step 4: Emit Module Map

```json
{
  "moduleMap": {
    "src/index.ts": ["src/App.tsx", "src/router.ts", "react", "react-dom"],
    "src/App.tsx": ["src/components/Header.tsx", "src/pages/Home.tsx"],
    "src/components/Header.tsx": ["react", "./Logo.svg"]
  },
  "warnings": [],
  "circular_dependencies": []
}
```
