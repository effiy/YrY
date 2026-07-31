---
description: Run all linters — ESLint + Prettier + Stylelint
---

# /lint

Run all code quality checks and auto-fix where possible.

```bash
cd YiVad && pnpm lint:eslint && pnpm lint:prettier && pnpm lint:stylelint
```

Run type-check separately: `pnpm type:check` (vue-tsc --noEmit --skipLibCheck).
