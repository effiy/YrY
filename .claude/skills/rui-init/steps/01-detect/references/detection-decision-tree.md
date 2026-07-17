---
description: "Project type detection decision tree reference — full classification logic for frontend, backend, fullstack, meta, non-node, and unknown types."
---

# Detection Decision Tree Reference

## Project Type Classification

```
Has package.json?
├── YES → check dependencies
│   ├── react/vue/svelte/next/nuxt in deps → frontend
│   ├── express/koa/fastify/nest in deps → backend
│   ├── frontend deps AND server/ or api/ directory → fullstack
│   ├── .claude-plugin/plugin.json OR only skills/ dir → meta
│   └── none of above → unknown
├── NO → check other manifests
│   ├── pyproject.toml → non-node (Python)
│   ├── go.mod → non-node (Go)
│   ├── Cargo.toml → non-node (Rust)
│   └── none → unknown
```

## Security Surface Keywords

| Dimension | Keywords |
|-----------|----------|
| User input | `req.body`, `req.query`, `req.params`, `input`, `form` |
| API endpoints | `app.get`, `app.post`, `router.`, `@Get`, `@Post` |
| Data storage | `mongoose`, `sequelize`, `prisma`, `redis`, `fs.write` |
| Authentication | `jwt`, `passport`, `oauth`, `auth`, `session`, `token` |
| Third-party | `fetch`, `axios`, `http.request`, `got` |

## Test Framework Resolution

1. Config file match: `vitest.config.*` → vitest, `jest.config.*` → jest, `pytest.ini` → pytest
2. Script command match: `vitest` in test script → vitest, etc.
3. No config and no command → `none`

## Architecture Pattern Detection

| Pattern | Signal |
|---------|--------|
| `single` | One top-level `src/` directory |
| `monorepo` | `workspaces` field, `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json` |
| `microservice` | Multiple top-level service dirs each with own manifest |
| `plugin` | `.claude-plugin/plugin.json` or `addons/`/`plugins/` root |
| `unknown` | None of the above |
