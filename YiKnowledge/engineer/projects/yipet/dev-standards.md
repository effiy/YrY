---
title: YiPet development standards
aliases: [yipet-dev-standards, yipet-coding-conventions, yipet-extension-standards]
tags: [yipet, dev-standards, conventions, react18, typescript, biome, vitest, mv3]
category: engineer/projects/yipet
created: 2026-08-03
updated: 2026-08-07
source: ../../YiPet/CLAUDE.md
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer]
benefit: "Engineers follow YiPet coding standards, conventions, and development workflow"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
  - ./architecture.md
  - ./functional-modules.md
  - ./engineering/claude.md
  - ../yiai/dev-standards.md
  - ../yivad/dev-standards.md
---

# YiPet development standards

> **As an** engineer, **I want to** dev standards, **so that** project context preserved.

## Summary

YiPet is a Chrome MV3 extension (React 18.3 + Ant Design 5.21 + Rsbuild 1 + TypeScript 5.5 strict + Biome 2.5 + Vitest 2). Function components + hooks only; no class components, no direct `React.createElement` calls. MV3 dual execution context (ISOLATED + MAIN) is the core reality: `chrome.runtime.*` only in ISOLATED; page globals only in MAIN. API four tiers must not cross levels: `client.ts` → `endpoints.ts` → `types.ts` → `services/*.ts`. Styles co-located with components in the same directory. `@/` for cross-module, relative paths for siblings. i18n keys strictly synced with `messages.json` + `MessageKey` type union. UTC-first time. Before submit, must run `npm run typecheck && npm run build`.

## Core viewpoints

- **MV3 dual world boundary is the core reality** — ISOLATED can use `chrome.runtime.*`; MAIN can use page globals; do not mix.
- **MV3 CSP compliance** — no remote code / no eval / no inline script; vendor all local `public/cdn/vendor/`.
- **Function components + hooks only** — no class components; no direct `React.createElement` calls.
- **API four tiers must not cross levels** — types does not import services; client does not import services; services receive constructed `ApiClient` injection.
- **Styles co-located with components in the same directory** — `ChatWindow/ChatWindow.tsx` + `ChatWindow/ChatWindow.css`; `buildChatCSS()` assembles `dist/cdn/styles/chat.css`.
- **i18n key strict sync** — `messages.json` + `MessageKey` type union added together; if out of sync TS doesn't error but at runtime falls back to the key itself.
- **UTC-first** — timestamps stored as ISO 8601 UTC; displayed via `Intl.DateTimeFormat` + explicit timezone conversion.
- **TypeScript strict** — `tsconfig.base.json` `"strict": true`; `tsc --noEmit` must pass.

## Key information

### Naming conventions

| Category | Convention | example |
|---|---|---|
| File name | kebab-case or PascalCase (component)  | `api-client.ts`, `ChatWindow.tsx` |
| Component | PascalCase | `ChatWindow`, `MessageBubble` |
| Function / variable | camelCase | `streamChat`, `onChunk` |
| Composable / hook | camelCase + `use` prefix | `useSyncExternalStore` |
| TS interface / type | PascalCase | `SessionItem`, `ChatMessage` |
| Constant | UPPER_SNAKE | `CDN_CATALOG`, `DEFAULT_LOCALE` |
| CSS class | kebab-case | `.chat-window`, `.message-bubble` |
| i18n key | snake_case dot-separated | `chat.placeholder`, `common.confirm` |

### SFC / TSX structure

```tsx
// 1. Imports
// 2. Types + Interfaces
// 3. Component (function component)
// 4. Sub-components (if needed)
// 5. Export
```

Style co-located in same directory:

```
ChatWindow/
├── ChatWindow.tsx
├── ChatWindow.css
└── index.ts        # barrel export
```

### Layering hard constraints

| Rule | explanation |
|---|---|
| No class components | function components + hooks only |
| No direct `React.createElement` calls | JSX processed via `@rsbuild/plugin-react` |
| API tiers must not cross | types does not import services; client does not import services; service must not skip client to call `fetch` directly |
| No remote code / eval / inline script | MV3 CSP compliance; vendor local `public/cdn/vendor/` |
| No `chrome.runtime.*` in MAIN world | only in ISOLATED |
| No direct mutation of global for cross-component state | via `useSyncExternalStore` |
| No one-sided i18n changes | `messages.json` + `MessageKey` sync |
| No CDN resources written directly to manifest | via `src/content/cdn/catalog.ts` |

### API four-tier conventions

| Tier | file | Convention |
|---|---|---|
| 1 — Client | `src/api/client.ts` | `ApiClient` class, wraps `public/cdn/utils/api-client.ts`; other tiers must not call `fetch` directly |
| 2 — Endpoints | `src/api/endpoints.ts` | Path constants grouped by domain; new endpoints added here |
| 3 — Types | `src/api/types.ts` | Request / response interface SSOT; new shapes added here; consumed by services and callers |
| 4 — Services | `src/api/services/*.ts` | Domain service classes; constructor-injected `ApiClient`; new services added here + aggregated in `index.ts` |

New service template:

```ts
// src/api/services/foo.ts
import type { ApiClient } from '../client';
import type { FooRequest, FooResponse } from '../types';
import { FOO_ENDPOINTS } from '../endpoints';

export class FooService {
  constructor(private client: ApiClient) {}

  async bar(req: FooRequest): Promise<FooResponse> {
    return this.client.post<FooResponse>(FOO_ENDPOINTS.bar, req);
  }
}

// src/api/services/index.ts
export class ApiServices {
  foo: FooService;
  // ...
  constructor(client: ApiClient) {
    this.foo = new FooService(client);
    // ...
  }
}

export function createApiServices(config: Config) {
  const client = new ApiClient(config);
  return new ApiServices(client);
}
```

### Cross-project RPC field contract

| Field | Convention | Common pitfall |
|---|---|---|
| `filter` | Mongo query condition | not `query` (silently dropped)  |
| `target_file` | file path | not `path` (422)  |
| `cname` / `collection_name` | MongoDB collection name | either one |
| `pageNum` / `pageSize` | 1-based page | — |
| `stream: true` | SSE flag | required for chat |
| `system` / `images` | chat system tip / multimodal image | optional |

### React component conventions

| Item | Convention |
|---|---|
| Function component | no class; `function Foo() {}` or `const Foo = () => {}` |
| Hooks | `useSyncExternalStore` for external state; other standard hooks |
| Ant Design | via `antd` package; icons `@ant-design/icons` |
| Path alias | `@/` maps to `src/` (tsconfig + rsbuild + vitest in sync)  |
| Barrel export | each directory aggregates via `index.ts` |
| Props | typed `interface FooProps` or `type FooProps = {...}` |
| state | `useState` / `useReducer` / `useSyncExternalStore` |
| Side effects | `useEffect`; subscriptions must clean up |

### Style conventions

| Item | Convention |
|---|---|
| Co-location | `Component.tsx` + `Component.css` in same directory |
| Global variables | `public/cdn/styles/variables.css` |
| Class names | kebab-case |
| Global classes | prefix with `yipet-` or component name prefix to avoid pollution |
| Runtime load | `buildChatCSS()` assembled into `dist/cdn/styles/chat.css` |
| No inline styles (except dynamic values)  | use className + CSS variables |

### i18n conventions

| Item | Convention |
|---|---|
| Entry | `src/shared/i18n/index.ts` exposes `t('key')` |
| Message file | `public/_locales/{en,zh_CN}/messages.json` |
| Type union | `MessageKey` sync add new key |
| Fallback chain | `zh_CN` → `en` → key itself |
| Detection | `src/shared/i18n/locale.ts` (`chrome.i18n.getUILanguage()` + navigator)  |
| Timezone | `src/shared/i18n/timezone.ts` |

### Time conventions

| Item | Convention |
|---|---|
| Storage | ISO 8601 UTC string |
| Display conversion | `src/shared/datetime.ts` uses `Intl.DateTimeFormat` + explicit timezone |
| Input | user local time → convert to UTC for storage |
| Output | UTC → user local timezone for display |
| Forbidden | `Date.toLocaleString()` direct call (loses timezone context)  |

### MV3 dual world conventions

| Item | Convention |
|---|---|
| ISOLATED world | content script default; can use `chrome.runtime.*` / `chrome.tabs.*` |
| MAIN world | page globals accessible; `chrome.runtime.*` unavailable |
| Bootstrap | `src/content/bootstrap.ts` runs in ISOLATED first, then self-injects into MAIN |
| IPC | popup → content (ISOLATED) → MAIN world via `CustomEvent` |
| Forbidden | MAIN world code calling `chrome.runtime.*` |
| Forbidden | ISOLATED world code calling page globals (e.g. `window.foo` injected)  |

### CDN resource conventions

| Item | Convention |
|---|---|
| Catalog | `public/cdn/` (rsbuild copies to `dist/`)  |
| Vendor | `public/cdn/vendor/` local (MV3 CSP compliance)  |
| Catalog SSOT | `src/content/cdn/catalog.ts` (`CDN_CATALOG` array)  |
| Injection mechanism | `src/content/cdn/injector.ts` |
| Already-loaded check | short-circuit on global existence before injecting |
| Forbidden | writing resources directly to manifest; not through catalog |

### Config conventions

| Item | Convention |
|---|---|
| Defaults | `src/config/defaults.ts` (data)  |
| Env-aware | `src/config/config.ts` (orchestration)  |
| Env file | `.env` / `.env.production` |
| Env read | `src/utils/env.ts` |
| Dev mode | `--mode production` for chat bundle (avoid `jsxDEV is not a function`)  |

### Submit and version control

| Item | Convention |
|---|---|
| Before submit must run | `npm run typecheck && npm run build` |
| Lint / format | Biome 2.5 (replaces ESLint + Prettier)  |
| Config | `biome.json` |
| Test | Vitest 2 + jsdom 29; `npm test` |
| Test config | `vitest.config.ts` |
| Branch | main trunk `master` |
| Lockfile | `pnpm-lock.yaml` (ground truth)  |

### Lint / Format conventions

| Tool | Purpose | Config |
|---|---|---|
| Biome 2.5 | Lint + format | `biome.json` |
| Vitest 2 | Unit tests | `vitest.config.ts` |
| TypeScript | Type check | `tsconfig.base.json` + `tsconfig.json` |
| Rsbuild 1 | Build | `rsbuild.config.ts` + `rsbuild.config.{chat,cdn,bootstrap}.ts` |
| `.editorconfig` | Editor consistency | `.editorconfig` |

### Test conventions

| Item | Convention |
|---|---|
| Framework | Vitest 2 + jsdom 29 |
| Config | `vitest.config.ts` |
| Unit tests | services / utils first |
| Component tests | `@testing-library/react` |
| E2E | none yet (Playwright if needed)  |
| LLM-dependent tests | skip when no API key |
| Command | `npm test` |

## Action recommendations

1. **New component → `src/popup/components/` or `src/chat/components/`** — one component per directory, TSX + CSS co-located; barrel export `index.ts`.
2. **New api service → `src/api/services/`** — constructor-injected `ApiClient`; types go in `types.ts`; paths go in `endpoints.ts`; aggregated in `index.ts`.
3. **i18n new key** — sync `public/_locales/{en,zh_CN}/messages.json` + `src/shared/i18n/index.ts` `MessageKey`.
4. **New CDN resource** — add to `src/content/cdn/catalog.ts` (`CDN_CATALOG`).
5. **New env variable** — add read in `src/utils/env.ts`; add key in `.env` / `.env.production`.
6. **Cross-project call to YiAi** — field names per contract; `filter` not `query`, `target_file` not `path`.
7. **New chat state** — via `controller.ts` using `useSyncExternalStore`; no direct global mutation.
8. **New time field** — UTC storage; display via `src/shared/datetime.ts`.
9. **Before submit** — must run `npm run typecheck && npm run build`; type error / build failure blocks submit.
10. **Chat bundle dev modification** — keep `--mode production` to avoid `jsxDEV is not a function`.

## Anti-patterns

- **API tier crossing** — types import services, client imports services, service skips client to call `fetch`: all violate the four tiers.
- **MV3 CSP violation** — remote code / eval / inline script; vendor not local.
- **`query` to call `data_service.query_documents`** — silently drops filter.
- **MAIN world calling `chrome.runtime.*`** — unavailable; only in ISOLATED.
- **Dev mode chat bundle without `--mode production`** — triggers `jsxDEV is not a function`.
- **Cross-component shared state not via `useSyncExternalStore`** — direct global mutation loses reactivity.
- **i18n key changed on one side only** — `messages.json` and `MessageKey` out of sync; runtime falls back to key itself.
- **New CDN resource written directly to manifest** — bypasses catalog; injection mechanism fails.
- **`Date.toLocaleString()` direct call** — loses timezone context; use `Intl.DateTimeFormat` + explicit timezone.
- **Inline styles** — forbidden (except dynamic values); use className + CSS variables.
- **Class components** — forbidden; function components + hooks only.
- **`React.createElement` direct call** — forbidden; use JSX.

## Related

- [YiPet architecture overview](./architecture.md) — dual world boundary / API four tiers / data flow / fallbacks
- [YiPet functional module list](./functional-modules.md) — module map
- [YiAi development standards](../yiai/dev-standards.md) — backend standards comparison
- [YiVad development standards](../yivad/dev-standards.md) — frontend standards comparison
- [Biome / ESLint / Prettier comparison](../../engineering/biome-eslint-prettier.md)
- [Claude Code tips](../../engineering/claude-code-tips.md)
- [Code review prompt](../../../ai-engineer/methodology/prompts/code-review.md)
- [Pi Agent Harness evolution tracking](../../engineering/pi-agent-harness-evolution.md) — TS multi-provider candidate
