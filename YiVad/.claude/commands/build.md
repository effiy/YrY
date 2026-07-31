---
description: Production build — type-check then build
---

# /build

Type-check and build YiVad for production.

```bash
cd YiVad && pnpm build:pro
```

Output goes to `dist/`. Deploy the contents of `dist/` to any static file server. Use `pnpm build:dev` or `pnpm build:test` for other environments.
