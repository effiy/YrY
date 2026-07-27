# CLAUDE.md — YiPet

> Chrome MV3 browser extension. Gentle Companion — an interactive pet companion in the browser, supporting multiple roles, chat windows, CDN resource injection, i18n (en + zh_CN), and timezone-aware display. Built with **Vite + TypeScript**.

## Foundational beliefs

- **Trust the model, verify reality** — Code structure reflects the runtime architecture. The MV3 dual execution context (ISOLATED world + MAIN world) is YiPet's core reality; all code changes must respect this boundary. TypeScript types describe the contract, but only Chrome's runtime validates it.
- **Think Before Coding** — State assumptions before acting. If multiple interpretations exist, present them; if a simpler approach exists, say so.

## Iron laws

1. **Simplicity First** — No features beyond what was asked; no abstractions for single-use code; no error handling for impossible scenarios.
2. **Surgical Changes** — Touch only what you must. Don't "improve" adjacent code; match existing style; every changed line traces to the user's request.
3. **Goal-Driven Execution** — Transform tasks into verifiable goals; for multi-step tasks, state a brief plan with verify checks per step.
4. **Build before commit** — Run `npm run typecheck && npm run build` before considering work complete. Type errors and build failures are not acceptable.

## Architecture direction

> **Componentization + API layering** — YiPet is a Vite + TypeScript Chrome extension. The frontend (popup UI, content script pet rendering) uses React 15.6.1 from CDN with JSX transpilation. The API layer (`src/api/`) follows a four-tier architecture: client → endpoints → types → services. The HTTP client wraps `public/cdn/utils/api-client.ts` (the canonical base shared with CDN injection), adding the extension's dev-gated logger and SSE streaming. Shared modules (`src/shared/`) are organized by concern: `i18n/` (locale, timezone, messaging), `theme/` (color palettes), `ipc/` (message types), `storage/` (Chrome storage helpers).
>
> Engineering conventions are inspired by **Ant Design Pro** patterns: `@/` path alias, barrel exports (`index.ts`), co-located components (`components/` per feature), `.editorconfig` for editor consistency, and `src/typings.d.ts` for module declarations.
>
> See also: [../../rules/architecture-direction.md](../../rules/architecture-direction.md)

## Project profile

| Dimension | Value |
|-----------|-------|
| Project name | YiPet |
| Type | frontend (Chrome MV3 extension) |
| Version | 1.2.0 |
| Architecture | single (single repo, no workspace) |
| Runtime | Chrome Extension Manifest V3 |
| Language | TypeScript (strict mode) |
| Build tool | Vite 5.x (multi-entry: popup, bootstrap, background, chat) |
| UI framework | React 15.6.1 (CDN, JSX via tsc → React.createElement) |
| CSS framework | Bootstrap 5.2.3 (CDN) + custom variables |
| Package management | npm — `vite`, `typescript`, `@types/chrome` |
| Test framework | Vitest |
| Self-hosted | Yes (API → `http://localhost:10086` / YiAi FastAPI backend) |

## Project constraints

- **TypeScript strict mode** — `"strict": true` in `tsconfig.json`. `tsc --noEmit` must pass. Vite/esbuild strips types at build time but does not check them.
- **React 15.6.1 from CDN** — React runtime loads via `<script>` tag in `popup.html`. TypeScript types are in `src/types/react-cdn.d.ts` (declare global). JSX transpiles to `React.createElement(...)`. No hooks, context, or function components.
- **Dual execution context** — `src/content/bootstrap.ts` first runs as a content script (ISOLATED world), then self-injects into the MAIN world. `chrome.runtime.getURL` is only available in ISOLATED.
- **Path alias `@/`** — `@/` maps to `src/` (configured in tsconfig, vite, and vitest). Prefer `@/` for cross-module imports; use relative paths only for same-directory or sibling files. Example: `import { t } from '@/shared/i18n'` instead of `'../../../shared/i18n'`.
- **ES modules everywhere** — No IIFE, no global namespace. Imports are resolved by Vite at build time. The directory structure IS the namespace.
- **CDN resources in `public/cdn/`** — Vite copies `public/` → `dist/` as-is. All vendor libs are local (MV3 CSP compliant). The catalog in `src/content/cdn/catalog.ts` is the single source of truth.
- **i18n via `chrome.i18n`** — All user-facing strings use `t('key')` from `src/shared/i18n/index.ts`. Message files at `public/_locales/<lang>/messages.json`. `MessageKey` type union must stay in sync.
- **API layer in `src/api/`** — Four-tier: `client.ts` (fetch wrapper) → `endpoints.ts` (path constants) → `types.ts` (interfaces) → `services/*.ts` (domain classes). Service classes take `ApiClient` via constructor injection.
- **UTC-first datetime** — All timestamps stored in ISO 8601 UTC. Display conversion via `src/shared/datetime.ts` using `Intl.DateTimeFormat` with explicit timezone.
- **Build output in `dist/`** — Chrome loads from `dist/` directory. Run `npm run build && cp manifest.json dist/` to produce a loadable extension.

## Guidance

| To do this | Look here |
|------------|-----------|
| Understand overall architecture | [CLAUDE.md](./CLAUDE.md) (this file) |
| Build and type-check the project | `npm run build`, `npm run typecheck` — see [package.json](./package.json) |
| Learn about Vite multi-entry setup | [vite.config.ts](./vite.config.ts) |
| Learn about content script dual-world injection | [src/content/bootstrap.ts](./src/content/bootstrap.ts) + [src/content/ipc/relay.ts](./src/content/ipc/relay.ts) |
| Learn about CDN resource catalog | [src/content/cdn/catalog.ts](./src/content/cdn/catalog.ts) |
| Learn about CDN injection mechanism | [src/content/cdn/injector.ts](./src/content/cdn/injector.ts) |
| Learn about pet rendering overlay | [src/content/rendering/overlay.ts](./src/content/rendering/overlay.ts) |
| Modify default configuration | [src/config/defaults.ts](./src/config/defaults.ts) |
| Modify environment-aware config | [src/config/config.ts](./src/config/config.ts) |
| Modify popup UI (state, actions, lifecycle) | [src/popup/App.tsx](./src/popup/App.tsx) |
| Modify popup entry point | [src/popup/index.tsx](./src/popup/index.tsx) |
| Add/modify popup components | [src/popup/components/](./src/popup/components/) |
| Learn about service layer (Chrome API, connection) | [src/popup/services/](./src/popup/services/) |
| Add/modify i18n strings | [public/_locales/en/messages.json](./public/_locales/en/messages.json) + [src/shared/i18n/index.ts](./src/shared/i18n/index.ts) |
| Learn about locale detection | [src/shared/i18n/locale.ts](./src/shared/i18n/locale.ts) |
| Learn about timezone handling | [src/shared/i18n/timezone.ts](./src/shared/i18n/timezone.ts) |
| Learn about datetime formatting | [src/utils/datetime.ts](./src/utils/datetime.ts) |
| Learn about IPC message types | [src/shared/ipc/messages.ts](./src/shared/ipc/messages.ts) |
| Learn about Chrome storage helpers | [src/shared/storage/state.ts](./src/shared/storage/state.ts) |
| Learn about chat widget components | [src/chat/components/](./src/chat/components/) |
| Learn about chat controller | [src/chat/controller.ts](./src/chat/controller.ts) |
| Call the YiAi backend API | [src/api/services/](./src/api/services/) — use `createApiServices(config)`. Client wraps `public/cdn/utils/api-client.ts` with logger injection. |
| Understand API client (base: fetch, retry, error extraction) | [public/cdn/utils/api-client.ts](./public/cdn/utils/api-client.ts) |
| Understand API client (extension: logger + SSE streaming) | [src/api/client.ts](./src/api/client.ts) |
| Understand API endpoint paths | [src/api/endpoints.ts](./src/api/endpoints.ts) |
| Understand API request/response shapes | [src/api/types.ts](./src/api/types.ts) |
| Modify design variables | [public/cdn/styles/variables.css](./public/cdn/styles/variables.css) |
| Learn about extension permissions and entries | [manifest.json](./manifest.json) |
| Add new CDN resources | [src/content/cdn/catalog.ts](./src/content/cdn/catalog.ts) (CDN_CATALOG array) |
| Learn about React 15 CDN type declarations | [src/types/react-cdn.d.ts](./src/types/react-cdn.d.ts) |
| Understand dev/production mode config | [.env](./.env) + [.env.production](./.env.production) + [src/utils/env.ts](./src/utils/env.ts) |
| Learn about shared utility functions | [src/utils/](./src/utils/) — datetime, env, log |
| Find barrel export indexes | [src/utils/index.ts](./src/utils/index.ts) + [src/shared/index.ts](./src/shared/index.ts) + [src/popup/components/index.ts](./src/popup/components/index.ts) + [src/chat/components/index.ts](./src/chat/components/index.ts) |
| Module type declarations (*.css, *.png) | [src/typings.d.ts](./src/typings.d.ts) |
| Editor settings (indent, charset, etc.) | [.editorconfig](./.editorconfig) |
