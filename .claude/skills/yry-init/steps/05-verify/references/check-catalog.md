---
description: "Verification check catalog — all 7 checks with methods, failure messages, and fix suggestions."
---

# Verification Check Catalog

| # | Check ID | Method | Fix on failure |
|---|----------|--------|----------------|
| 1 | `claude-md-name` | `grep <projectName> CLAUDE.md` | Re-run yry-init-generate |
| 2 | `readme-md-name` | `grep <projectName> README.md` | Add project name to README |
| 3 | `domain-language` | `grep -c "**term** — " README.md` ≥ 3 | Add domain-language section with ≥ 3 term definitions |
| 4 | `docs-home-files` | Check `docs/index.html`, `index.css`, `index.js`, `data.js` exist | Re-run yry-init-generate |
| 5 | `arch-scenes` | Each `docs/arch/*/` has `index.md` | Re-run yry-init-arch |
| 6 | `test-scenes` | Each `docs/test/*/` has `index.md` | Re-run yry-init-arch |
| 7 | `scene-counts` | arch ≥ 5 dirs, test ≥ 6 dirs | Add missing scene directories |

## Failure Response Format

```json
{
  "checkId": 3,
  "message": "README.md: ## Domain Language section has only 1 term definition (need ≥ 3)",
  "fix": "Add at least 2 more term definitions under ## Domain Language. Format: **Term** — definition."
}
```

## Edge Cases

| Scene | Handling |
|----------|----------|
| `cwd` doesn't exist | All checks fail with `cwd-not-found` |
| `projectType === 'unknown'` | Check 1 passes if name present; warning recorded |
| Empty `moduleMap` | Check 5 passes if index.md well-formed; warning recorded |
| Permission error reading file | Treat as missing; include permission error in message |
