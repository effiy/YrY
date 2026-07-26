# YiVad — AI Assistant for YiVad

## Foundational beliefs

- **Trust the model.** Claude is capable of understanding this codebase at a deep level. Give it the context it needs and trust it to make the right calls.
- **Value attention.** Every line of code you write will be read many more times than it was written. Write for the reader, not the writer.
- **Verify reality.** Run the code. Read the results. Assertions beat confidence. The quickest way to be wrong is to skip verification.
- **Think before coding.** State assumptions explicitly; if multiple interpretations exist, present them; if a simpler approach exists, say so.

## Iron laws

- **Simplicity first.** No features beyond what was asked; no abstractions for single-use code; no error handling for impossible scenes.
- **Surgical changes.** Don't "improve" adjacent code; match existing style; every changed line traces to the user's request.
- **Goal-driven execution.** Transform tasks into verifiable goals; for multi-step tasks, state a brief plan with verify checks per step.

## Architecture direction

**Componentization** — as a Vue 3 frontend project, YiVad advances along the component-extraction axis. Extract reusable components, composables, and shared UI primitives. Define clear props/events APIs. Eliminate duplicated markup. Reference: [../../../rules/architecture-direction.md](../../rules/architecture-direction.md).

## Project profile

| Property | Value |
|----------|-------|
| Name | YiVad |
| Type | Frontend (SPA) |
| Version | 1.0.0 |
| Framework | Vue 3.4 + TypeScript |
| Build | Vite 5 |
| State | Pinia 2 |
| UI | Element Plus 2.7 |
| Charts | ECharts 5 |
| Router | Vue Router 4 (hash mode) |
| HTTP | Axios (custom RequestHttp wrapper) |
| i18n | Vue-i18n 9 (zh + en) |
| Architecture | Single SPA with dynamic routing |
| Runtime | Browser (Chrome, Edge, Firefox, Safari) |

## Project structure

```
src/
├── api/          — HTTP request layer (Axios interceptors, cancellation, error handling)
├── assets/       — Static resources (fonts, icons, images, mock JSON)
├── components/   — Reusable components (ProTable, ECharts, Upload, WangEditor, etc.)
├── config/       — Global constants (HOME_URL, DEFAULT_PRIMARY, route whitelist)
├── directives/   — Custom directives (auth, copy, debounce, throttle, draggable, longpress, watermark)
├── enums/        — HTTP status codes, request methods, content types
├── hooks/        — Composables (useTable, useTheme, useAuthButtons, useSelection, etc.)
├── languages/    — i18n setup (zh-CN + en)
├── layouts/      — Multi-layout system (vertical, classic, transverse, columns)
├── routers/      — Dynamic routing with permission guards and menu-to-route mapping
├── stores/       — Pinia stores (global, user, auth, tabs, keepAlive) with persistence
├── styles/       — Global SCSS, Element overrides, theme variables
├── typings/      — Global TypeScript type declarations
├── utils/        — General utilities (color, menu tree ops, localStorage, etc.)
└── views/        — Page components organized by feature domain
```

## Project constraints

### Non-negotiable baselines

- TypeScript strict mode (`tsconfig.json`)
- ESLint + Prettier + Stylelint pre-commit hooks
- Conventional commits enforced by commitlint + cz-git
- All API calls go through `src/api/index.ts` RequestHttp class
- Button permissions checked via `v-auth` directive
- Dynamic routes loaded from backend menu API (falls back to local JSON)

### Degradation countermeasures

| Condition | Action |
|-----------|--------|
| No test framework | Project has no test infrastructure yet — add vitest when test coverage becomes a priority |
| Menu API unavailable | Falls back to `src/assets/json/authMenuList.json` |
| Token expired | 401 interceptor redirects to login, clears stores |

### Self-constraints

- ProTable is the canonical table pattern — new table pages must use it
- New composables go in `src/hooks/`, new directives in `src/directives/modules/`
- Layout modes share the Header/Menu/Footer/Tabs component set

## Guidance

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview, quick start, domain language |
| [.env](./.env) | Environment variables |
| [vite.config.ts](./vite.config.ts) | Build configuration |
| [tsconfig.json](./tsconfig.json) | TypeScript configuration |
| [src/config/index.ts](./src/config/index.ts) | App-level constants |
