# JSON Language Prompt Snippet

## Key Concepts

- **Strict Syntax**: No trailing commas, no comments (unlike JSONC or JSON5), double-quoted strings only
- **Data Types**: Objects, arrays, strings, numbers, booleans, and null — no undefined or date types
- **Nested Structure**: Arbitrary nesting depth for hierarchical configuration or data
- **Schema Validation**: JSON Schema (`$schema` keyword) for validating structure and types
- **JSONC**: JSON with Comments variant used by VS Code, tsconfig.json, and other tooling
- **JSON5**: Extended JSON allowing comments, trailing commas, unquoted keys, and more
- **JSON Lines** (`.jsonl`): One JSON object per line for streaming data processing

## Notable File Patterns

- `package.json` — Node.js project manifest with dependencies, scripts, and metadata
- `tsconfig.json` — TypeScript compiler configuration (actually JSONC)
- `.eslintrc.json` — ESLint linting rules and configuration
- `*.schema.json` — JSON Schema definitions for validation
- `composer.json` — PHP Composer project manifest
- `appsettings.json` — .NET application configuration
- `manifest.json` — Browser extension or PWA manifest

## Edge Detection Heuristics

**Package manifest dependency graph** — `package.json` `dependencies`, `devDependencies`, `peerDependencies` → `depends_on` edges from the project to each listed package. `devDependencies` are build-time only; `peerDependencies` are host-provided.

**Workspace monorepo links** — `"workspaces": ["packages/*"]` in root `package.json` → `contains` edges from the root to each workspace package. Cross-package `"@scope/foo": "*"` → `depends_on` edges between workspace members.

**tsconfig path aliases** — `"paths": { "@app/*": ["./src/*"] }` in `tsconfig.json` → `configures` edges from tsconfig to each aliased directory. Path aliases create import shortcuts that must be resolved during analysis.

**JSON Schema validation** — `"$schema": "https://json-schema.org/draft/2020-12/schema"` + `"properties": { ... }` → `defines_schema` edges from the schema file to any JSON validated against it. `"$ref"` creates schema composition dependencies.

**ESLint/Prettier configuration** — `.eslintrc.json`, `.prettierrc` → `configures` edges from the config to all files matching its glob patterns. Config inheritance (`"extends": [...]`) creates config chain dependencies.

**Environment-specific configs** — `config.development.json`, `config.production.json` → each `configures` the application for a specific environment. The environment variable `NODE_ENV` determines which config is loaded.

## Summary Style

> "Node.js project manifest defining N dependencies, build scripts, and project metadata."
> "TypeScript compiler configuration enabling strict mode with path aliases for monorepo packages."
> "JSON Schema defining the request/response structure for the user API endpoint."
