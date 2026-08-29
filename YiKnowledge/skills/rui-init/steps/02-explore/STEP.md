---
description: "Step 02-explore: scan source code, emit exploration (module map + conventions + corrected security surface)."
---
# 02-explore

> Input: `pipelineState.profile`.
> Output: `pipelineState.exploration` (Exploration).

## Role

You're a code archaeologist. The profile tells you what the project is — your
job is to understand how it's built. Read the source, trace the imports, spot
the patterns.

## Task

1. Read key source files to build a module dependency map.
2. Refine the architecture pattern from the profile's initial detection.
3. Extract coding conventions: naming, formatting, import style, file structure.
4. Correct the security surface — the profile's initial scan may have missed
   auth/secret patterns inside source files.
5. Populate and return the `Exploration` object.

## Exploration Fields

### moduleMap

Trace imports/requires across source files. For each source directory/module,
list the modules it depends on:

```
{
  "src/components": ["src/hooks", "src/utils", "element-plus"],
  "src/hooks": ["src/api", "vue"],
  "src/api": ["axios"],
  ...
}
```

Scope: capture the top 10-20 modules. Don't trace every leaf file.

### architecture

| Field | How to populate |
|-------|----------------|
| `pattern` | Refine from profile. If `monorepo`, list sub-projects and their roles. If `layered`, name the layers (e.g. `views → components → hooks → stores → api`). If `cli`, identify the command structure |
| `notes` | 2-4 sentence summary: what this project does, how it's structured, what stands out architecturally |

### securitySurface

Re-scan more thoroughly than 01-detect. Grep source files for:

| Pattern | Context |
|---------|---------|
| `auth`, `token`, `session`, `jwt`, `oauth` | Import statements, middleware, config keys |
| `secret`, `password`, `credential`, `api_key`, `apikey` | Variable names, config keys, env reads |
| `crypto`, `bcrypt`, `hash`, `encrypt`, `decrypt` | Import statements |
| `permission`, `rbac`, `role`, `acl` | Import statements, middleware |

Correct `authFiles`, `secretFiles`, `envFiles` from profile if any were missed.

### conventions

Extract the following into key-value pairs:

| Key | Example value | How to detect |
|-----|--------------|---------------|
| `naming.components` | `PascalCase` | Check component/class definitions |
| `naming.functions` | `camelCase` | Check function/method definitions |
| `naming.variables` | `camelCase` | Check variable declarations |
| `naming.constants` | `UPPER_SNAKE` | Check `const` declarations |
| `naming.files` | `kebab-case` | Check file naming patterns |
| `naming.directories` | `kebab-case` | Check directory naming patterns |
| `imports.style` | `@/` alias or `relative` | Check import statements in 3-5 files |
| `imports.order` | `external → internal → relative` | Check import grouping |
| `formatting.indent` | `2 spaces` | Check `.editorconfig`, `.prettierrc`, or actual code |
| `formatting.quotes` | `single` | Check string literals in source |
| `formatting.semicolons` | `false` | Check statement endings |
| `formatting.trailingComma` | `all` | Check multi-line objects/arrays |
| `language` | `TypeScript 5.x` | Check `tsconfig.json` or `package.json` devDependencies |
| `language.version` | `3.10+` | Check `pyproject.toml` `requires-python` or `go.mod` `go` directive |
| `framework` | `Vue 3.5` | Check `package.json` dependencies |
| `framework.version` | `^3.5.0` | Check exact version range |

## Pipeline Contract

- **Reads**: `pipelineState.profile`, source files in `<cwd>`
- **Writes**: `pipelineState.exploration`
- **Must not**: modify any files, read downstream state