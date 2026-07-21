---
paths: [".claude/yry-init-generate/SKILL.md"]
description: "Output file ownership and path contracts — which files are regenerated, which are copied, path rewrite rules, and idempotence guarantees."
---

# Output Ownership & Path Contracts

## File Ownership Matrix

| File | Owner | Action | Idempotent? |
|------|-------|--------|:---:|
| `CLAUDE.md` | generate | Full rewrite | ✅ |
| `README.md` (main) | generate | Full rewrite | ✅ |
| `README.md` (Domain Language) | User | Preserved (append-once) | ✅ |
| `docs/index.html` | yry-init/templates/ | Copy + path rewrite | ✅ |
| `docs/index.css` | yry-init/templates/ | Copy verbatim | ✅ |
| `docs/index.js` | yry-init/templates/ | Copy verbatim | ✅ |
| `docs/data.js` | generate | Generated from CLAUDE.md + README.md | ✅ |

## Path Rewrite Rules

When copying `index.html` from `yry-init/templates/` to `<cwd>/docs/`:
- Depth calculation: count directory levels from project root to `docs/`

## Idempotence Contract

Same `(profile, exploration)` input → identical output files. Running generate twice produces identical CLAUDE.md, README.md, and docs/data.js. Template copies are idempotent (same source, same destination).
