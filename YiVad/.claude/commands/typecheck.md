---
description: TypeScript type-check without emitting
---

# /typecheck

Run TypeScript type-checking without generating output.

```bash
cd YiVad && pnpm type:check
```

Runs `vue-tsc --noEmit --skipLibCheck`. Must pass before commits — pre-commit hooks will block otherwise.
