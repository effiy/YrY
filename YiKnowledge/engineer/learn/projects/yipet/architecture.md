---
title: YiPet Architecture
tags: [yipet, architecture, chrome-extension, mv3]
category: engineer/learn/projects/yipet
created: 2026-08-21
updated: 2026-08-21
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Quick reference to YiPet dual-world architecture and data flows"
related:
  - ./README.md
  - ./functional-modules.md
  - ./dev-standards.md
---

# YiPet Architecture

> Full architecture in [README.md](./README.md). Quick reference below.

## Dual-world boundary (critical)

```
Popup (React 18) → chrome.tabs.sendMessage → Content Script (ISOLATED) → CustomEvent → MAIN world (window.YiPet)
```

- **ISOLATED world**: `chrome.runtime.*` APIs available, no page JS globals
- **MAIN world**: Page JS context, `window.YiPet` API, no Chrome APIs

## Layer stack

```
Popup UI (React 18 + Ant Design 5)
Chat Window (React 18, separate Rsbuild entry)
Content Script (ISOLATED → MAIN bridge)
API Layer (4-tier: client → endpoints → types → services)
YiAi Backend (FastAPI :10086)
```

## API layer (4-tier)

| Tier | File | Purpose |
|------|------|---------|
| Client | `api/client.ts` | Fetch wrapper + SSE + retry |
| Endpoints | `api/endpoints.ts` | Path constants |
| Types | `api/types.ts` | Request/response interfaces |
| Services | `api/services/*.ts` | Domain service classes |

## CDN resource injection

80+ vendor libraries bundled locally under `public/cdn/vendor/`. Loaded via `chrome-extension://` URLs (MV3 CSP: `script-src 'self'`). Catalog in `src/content/cdn/catalog.ts`.

## Build entries (4)

| Entry | Config | Notes |
|-------|--------|-------|
| Popup | `rsbuild.config.ts` | HTML entry |
| Chat | `rsbuild.config.chat.ts` | Requires `--mode production` |
| CDN Utils | `rsbuild.config.cdn.ts` | IIFE bundle |
| Bootstrap | `rsbuild.config.bootstrap.ts` | Content script entry |