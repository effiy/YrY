---
paths: [".claude/yry-init/steps/03-generate/STEP.md"]
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

1. Rewrite CDN paths from `../../yry-html-cdn/...` to `../yry-html-cdn/...` (the depth is one level up from `<cwd>/docs/` to `<cwd>`, then to the skill-root-relative CDN).
2. Rewrite the page title to `<profile.identity.name> · Documentation Center`.
3. Rewrite the `<body>` class to `yry-doc dashboard-page`.

`index.css` and `index.js` are copied verbatim; no rewrites.

## Idempotence Contract

Same `(profile, exploration)` input → identical output files. Running generate twice produces identical CLAUDE.md, README.md, and docs/data.js. Template copies are idempotent (same source, same destination).
