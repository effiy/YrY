# CLAUDE.md — YiPet

> Chrome MV3 browser extension. Gentle Companion — an interactive pet companion in the browser, supporting multiple roles, chat windows, and CDN resource injection.

## Foundational beliefs

- **Trust the model, verify reality** — Code structure reflects the truth of the runtime architecture. The MV3 dual execution context (isolated world + MAIN world) is YiPet's core reality; all code changes must be made with a clear understanding of both contexts.
- **Think Before Coding** — State assumptions before acting. If multiple interpretations exist, present them; if a simpler approach exists, say so.

## Iron laws

1. **Simplicity First** — No features beyond what was asked; no abstractions for single-use code; no error handling for impossible scenarios.
2. **Surgical Changes** — Touch only what you must. Don't "improve" adjacent code; match existing style; every changed line traces to the user's request.
3. **Goal-Driven Execution** — Transform tasks into verifiable goals; for multi-step tasks, state a brief plan with verify checks per step.

## Architecture direction

> **Componentization axis** — YiPet is a hybrid project (MV3 extension: popup/content frontend + background). The frontend (popup UI, content script pet rendering) is evolving toward componentization; the background (storage, API communication) is evolving toward modularization.
>
> See also: [../../rules/architecture-direction.md](../../rules/architecture-direction.md)

## Project profile

| Dimension | Value |
|-----------|-------|
| Project name | YiPet |
| Type | frontend (Chrome MV3 extension) |
| Version | 1.1.2 |
| Architecture | single (single repo, no workspace) |
| Runtime | Chrome Extension Manifest V3 |
| Language | JavaScript (no TypeScript, no build step) |
| UI frameworks | React 15.6.1 (CDN), Vue 3.5.13 (CDN optional) |
| CSS framework | Bootstrap 5.2.3 + custom variables |
| Package management | None (all dependencies pre-bundled in CDN vendor directory) |
| Test framework | None |
| Self-hosted | Yes (API points to localhost:10086 / YiAi) |

## Project constraints

- **Zero build** — No package.json, no bundler, no transpilation step. All JS is written directly as IIFEs into the `window` global namespace.
- **Dual execution context** — `src/bootstrap/bootstrap.js` first runs in the content script isolated world, then injects itself into the page's MAIN world. The two contexts have different behaviors and available APIs (`chrome.runtime.getURL` is only available in the isolated world).
- **No module system** — Modules communicate through global namespaces like `window.YiPetPopup` and `window.PET_CONFIG`, with no ES module import/export. Load order is determined by `<script>` tag order in HTML.
- **CDN resource directory** — `cdn/vendor/` holds all pre-bundled third-party libraries. bootstrap.js maintains a CATALOG mapping keys to paths, supporting dynamic injection via `YiPet.load()` / `YiPet.css()`.
- **React 15.6.1** — The popup uses `React.createElement` (non-JSX), and components are based on `React.Component` prototype inheritance (non-ES class). No hooks, context, or function components.
- **API dependency** — At runtime, connects to `http://localhost:10086` (YiAi backend) via `fetch` for prompt streaming responses and session management.

## Guidance

| To do this | Look here |
|------------|-----------|
| Understand overall architecture | [CLAUDE.md](./CLAUDE.md) (this file) |
| Learn about extension entry and CDN loading mechanism | [src/bootstrap/bootstrap.js](./src/bootstrap/bootstrap.js) |
| Modify default configuration | [src/config/pet.defaults.js](./src/config/pet.defaults.js) |
| Modify popup control panel UI | [src/popup/index.js](./src/popup/index.js) |
| Add/modify popup components | [src/popup/components/](./src/popup/components/) |
| Learn about service layer (Chrome API, notifications) | [src/popup/services/](./src/popup/services/) |
| Modify design variables | [cdn/styles/variables.css](./cdn/styles/variables.css) |
| Learn about extension permissions and entry points | [manifest.json](./manifest.json) |
| Add new CDN resources | [src/bootstrap/bootstrap.js](./src/bootstrap/bootstrap.js) (CATALOG array) |
