---
paths: [".claude/yry-init/steps/01-detect/STEP.md"]
description: "Detection contracts: decision tree rules, signal probing invariants, and fallback behavior for project type detection."
---

# Detection Contracts

`yry-init-detect` probes the filesystem to produce a fact baseline (`Profile`). These are the hard contracts that govern detection behavior.

## Decision Tree Invariants

1. **Must probe, not guess.** Every `Profile` field must be derived from filesystem evidence. If no evidence is found, the field is `null` or `"none"` — never invented.
2. **Manifest takes precedence.** If `package.json` exists, its contents drive project type, inventory, and test framework detection. Other manifests are fallbacks.
3. **Security surface cannot be skipped.** All five boolean dimensions must be present, even if all are `false`.

## Project Type Decision Tree (Immutable)

```
Has package.json?
├── yes → check deps for react/vue/svelte/next/nuxt → frontend
├── yes → check deps for express/koa/fastify/nest → backend
├── yes → frontend deps AND server/ or api/ dir → fullstack
├── yes → .claude-plugin/plugin.json OR only skills/ dir → meta
├── yes → none of the above → unknown
├── no → pyproject.toml/go.mod/Cargo.toml → non-node
└── no → none of the above → unknown
```

## Signal Probing Rules

| Dimension | Rule |
|-----------|------|
| User input | Scan for `req.body`, `req.query`, `req.params`, `input`, `form` in source files |
| API endpoints | Scan for `app.get`, `app.post`, `router.`, `@Get`, `@Post` |
| Data storage | Scan for `mongoose`, `sequelize`, `prisma`, `redis`, `fs.write` |
| Authentication | Scan for `jwt`, `passport`, `oauth`, `auth`, `session`, `token` |
| Third-party | Scan for `fetch`, `axios`, `http.request`, `got` |

## Fallback Contract

| Condition | Behavior |
|-----------|----------|
| `cwd` does not exist | Abort with `cwd-not-found` |
| `package.json` is invalid JSON | Mark `projectType: 'unknown'`, record parse error |
| Security scan finds zero matches | Return all `false` (not omitted) |
| Test framework cannot be resolved | Set `testFramework: 'none'` |

## Output Contract

The `Profile` object is the only artifact. It is never written to disk by this skill — the parent pipeline holds it in memory.
