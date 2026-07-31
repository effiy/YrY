---
description: Start Rsbuild dev server with HMR
---

# /dev

Start the YiVad Rsbuild dev server with hot module replacement.

```bash
cd YiVad && pnpm dev
```

The dev server starts on the port configured in `.env.development` (default 8848). Env prefix is `RSBUILD_ENV_*` since the Vite→Rsbuild migration.
