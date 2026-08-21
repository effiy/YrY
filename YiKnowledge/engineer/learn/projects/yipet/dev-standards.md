---
title: YiPet Development Standards
tags: [yipet, standards, conventions, chrome-extension]
category: engineer/learn/projects/yipet
created: 2026-08-21
updated: 2026-08-21
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Quick reference to YiPet coding conventions and critical gotchas"
related:
  - ./README.md
  - ./architecture.md
  - ./functional-modules.md
---

# YiPet Development Standards

> Full standards in [README.md](./README.md) and [CLAUDE.md](../../../../YiPet/CLAUDE.md). Quick reference below.

## Naming

- **Components**: PascalCase, one folder per component (co-located TSX + CSS)
- **Services**: camelCase (`authService.ts`, `chatService.ts`)
- **Shared modules**: camelCase (`roles.ts`, `timezone.ts`)

## Critical gotchas

### Dual-world boundary
- `chrome.runtime.*` ONLY in ISOLATED world — calling from MAIN silently fails
- Page globals ONLY in MAIN world — not visible in ISOLATED

### CDN catalog
- All 80+ vendor libs must be in `CDN_CATALOG` + have global-existence checks
- Mismatch causes double-loading or missing deps

### Build
- Chat bundle REQUIRES `--mode production` (or `jsxDEV is not a function`)
- 4 separate Rsbuild configs — consolidate when possible

### Type checking
- `tsc --noEmit` is the ONLY type check — Rsbuild/SWC strips types silently
- Always run `npm run typecheck` before commit

### RPC contracts

| Correct | Wrong | Context |
|---------|-------|---------|
| `filter` | `query` | `data_service.query_documents` |

## i18n

- Chrome `chrome.i18n` API, 55+ keys in `_locales/{en,zh_CN}/messages.json`
- Use typed `t('key')` wrapper, never raw `chrome.i18n.getMessage`

## Lint & format

- Biome 2.5 (replaces ESLint + Prettier)
- `npx biome check --write` for auto-fix