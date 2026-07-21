---
description: "Module map and exploration schema reference — moduleMap shape, convention detection matrix, and security surface correction protocol."
---

# Module Map & Exploration Schema

## moduleMap Shape

```json
{
  "src/index.ts": ["src/App.tsx", "src/router.ts", "react", "react-dom"],
  "src/App.tsx": ["src/components/Header.tsx", "src/pages/Home.tsx"],
  "src/components/Header.tsx": ["react", "./Logo.svg"],
  "src/pages/Home.tsx": ["src/api/client.ts", "react"]
}
```

## Edge Classification

| Prefix | Type | Expansion |
|--------|------|-----------|
| `./` or `../` | Internal relative | Resolve to absolute module path |
| `@/` or `~/` | Aliased internal | Resolve via tsconfig paths |
| Bare specifier | External package | Record as-is, no expansion |
| `[unresolved]` | Broken path | Flag in warnings |

## Convention Detection Matrix

| Convention | Method | Confidence |
|-----------|--------|:---:|
| File naming | Scan top 20 files for dominant case | Medium |
| Import style | Named vs default import ratio | Medium |
| Export style | `export default` vs `export const` ratio | Medium |
| Indentation | `.editorconfig` or count leading spaces | High |
| Linting | `.eslintrc*`, `.prettierrc*`, `pyproject.toml [tool.ruff]` | High |

## Security Surface Correction

Exploration **corrects** (never shrinks) the security surface from detect:
- `authentication: false` → `true` if `jwt.verify()` or similar found
- `apiEndpoints: false` → `true` if route handlers found
- Every correction must cite file + line number
