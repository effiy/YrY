---
title: YiPet Onboarding
aliases:
- YiPet onboarding
tags:
- new-hire
- onboarding
- browser-extension
- Chrome MV3
- React
- TypeScript
- YiPet
category: new-hire/onboarding/yipet
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- new-hire
benefit: onboarded quickly
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../../engineer/projects/yipet/README.md
- ../../../engineer/projects/yipet/engineering/claude.md
- ../../../engineer/projects/yipet/engineering/readme.md
- ../../../engineer/projects/INDEX.md
tacit: false
---

# YiPet Onboarding

> **As a** new hire, **I want to** onboarding, **so that** onboarded quickly.

> Chrome MV3 browser extension. Injects a pet companion + multi-role AI chat on any web page, React 18 + Ant Design 5.

## Summary

- YiPet is the Yi family's Chrome MV3 browser extension, providing a pet avatar and multi-role AI chat window injected into any web page via a three-layer architecture: content scripts (ISOLATED + MAIN dual worlds), Popup control panel, and Chat window (independent Rsbuild entry)
- The dual-world execution model is the most important architectural concept — ISOLATED world has `chrome.*` API access but no page JavaScript access; MAIN world has page JavaScript access but no `chrome.*` API access; all cross-world communication goes through CustomEvent bridges
- Browser extension development has a 10-20x slower feedback loop than web development (save → rebuild → reload extension → refresh page), and the onboarding workflow must explicitly set this expectation to prevent new hires from thinking the dev environment is broken
- The pitfalls cheatsheet captures MV3-specific gotchas: `jsxDEV is not a function` (dev React plugin + production NODE_ENV conflict), `chrome.runtime is undefined` in MAIN world, CSP violations from remote CDN references
- Day-1 setup compresses time from clone to PR merged with a `HelloBox` component exercise that touches the full development pipeline: create component, import, rebuild, reload extension

## 1. Project positioning

YiPet is the Yi family's browser extension, providing the ability to "inject a pet avatar + multi-role AI chat window on any web page". Three-layer architecture: content scripts (ISOLATED + MAIN dual worlds), Popup control panel, Chat window (independent Rsbuild entry). Tech stack: React 18.3 + Ant Design 5.21 + Rsbuild 1 + TypeScript 5.5 + Biome 2.5. Backend via YiAi `http://localhost:10086`.

## 2. Day-1 setup (30 minutes to get going)

### Prerequisites

- Node.js 18+ / npm
- YiAi backend running at `http://localhost:10086`
- Chrome 114+

### Steps

```bash
# 1. Clone (skip if already inside the YrY repo)
cd /path/to/YrY/YiPet

# 2. Install dependencies
npm install

# 3. Build (first time must be a full build, because popup/chat/bootstrap/cdn are four independent bundles)
npm run build

# 4. Start dev watch (recommended for daily dev: auto-rebuild on source changes)
npm run dev
# This launches 3 watch processes: popup / chat / bootstrap, outputs in dist/

# 5. Load the extension
# 5a. Open chrome://extensions
# 5b. Toggle Developer mode on the top right
# 5c. Click Load unpacked → select YiPet/dist/
# 5d. Click the YiPet toolbar icon on any page → popup appears

# 6. Type check (optional)
npm run typecheck   # tsc --noEmit
```

### Verification checklist

- [ ] `chrome://extensions` shows the YiPet card, status Enabled
- [ ] Click the toolbar icon on any page, the React popup appears (see role switcher / theme color etc.)
- [ ] `Ctrl+Shift+X` (macOS `⌘+Shift+X`) opens the chat window
- [ ] Type a sentence in the chat window, see SSE streaming return (depends on YiAi + Ollama running)
- [ ] DevTools Console (page context) input `YiPet.help()` produces output
- [ ] `npm run typecheck` exits 0

## 3. Three high-frequency workflows

### Workflow A: add a chat-window UI component

Example: add a "Clear conversation" button to the chat window.

1. Create `ClearButton.tsx` + `ClearButton.css` (co-located) under `src/chat/components/ClearButton/`
2. `ClearButton.tsx`: React function component, call `useChatController` to get dispatch
3. Mount it in the parent component (e.g. `ChatWindow.tsx`)
4. CSS imported in the parent will be merged into `dist/cdn/styles/chat.css` by `buildChatCSS()`
5. After changes, no need to refresh the extension — dev watch rebuilds, but the extension needs a reload click at `chrome://extensions`

### Workflow B: add a popup component + chrome API integration

Example: add an "Export conversation" button.

1. `src/popup/components/ExportButton/ExportButton.tsx` + `.css`
2. Use the `chrome.storage` / `chrome.tabs` API wrapped in `src/popup/services/chrome.ts`
3. Notify the content script via `chrome.tabs.sendMessage`, which forwards to the MAIN world (if in-page execution is needed)
4. Add i18n strings to `public/_locales/en/messages.json` + `zh_CN/messages.json`, use `t('exportButtonLabel')` in the component

### Workflow C: add an API service

Example: call a new YiAi endpoint `/foo`.

1. Add `FOO = "/foo"` to `src/api/endpoints.ts`
2. Define `FooRequest` / `FooResponse` interface in `src/api/types.ts`
3. Write `FooService` class in `src/api/services/foo.ts`, constructor takes `ApiClient`
4. Instantiate and export in `src/api/services/index.ts` `createApiServices`
5. Caller imports `api.foo.xxx(...)`, do not directly `fetch` (iron rule)

## 4. New-hire pitfalls cheatsheet

| Symptom | Cause | Fix |
|---|---|---|
| `SessionService.list()` returns all / empty | RPC param used `query` | Switch to `filter` (iron rule, fixed but easy to regress) |
| Chat window runtime `jsxDEV is not a function` | dev-mode React plugin + production `NODE_ENV` define conflict | chat bundle dev script must be `--mode production` (fixed, see `package.json:scripts.dev`) |
| Calling `chrome.runtime.*` in MAIN world code | MV3 limit: chrome API only available in ISOLATED | Use `CustomEvent` + `window.dispatchEvent` for cross-world communication |
| `Cannot find module '@/xxx'` | path alias | Use `@/` alias (points to `src/`), do not use `../../../` |
| Extension changes not taking effect | dist/ not updated / extension not reloaded | Click the reload icon on the YiPet card at `chrome://extensions` |
| `chrome.i18n` cannot find key | `messages.json` not added / key typo | Check `public/_locales/en/messages.json`; `MessageKey` type union must be kept in sync |
| Double-loading CDN library | global-existence check failed | See `src/content/cdn/injector.ts`, verify global-existence check |
| `npm run build` then popup blank | popup entry HTML path wrong | Check `source.entry` in `rsbuild.config.ts` |

## 5. What to read next

| Doc | What to look at |
|---|---|
| `YiPet/CLAUDE.md` (repo root) | Module boundaries, cross-project protocol, iron rules |
| `YiKnowledge/engineer/projects/yipet/engineering/readme.md` | Architecture diagram, data flow, command flow, directory structure |
| `YiPet/manifest.json` | MV3 manifest — permissions, content_scripts, commands |
| `YiPet/src/content/bootstrap.ts` | Dual-world self-injection logic (core difficulty) |
| `YiPet/src/api/` | Four-layer API architecture (client → endpoints → types → services) |
| `YiPet/src/chat/controller.ts` | Chat state machine + SSE + per-message actions |
| `YiPet/biome.json` | Biome config (replaces ESLint + Prettier) |

## 6. Day-1 task checklist

- [ ] `npm install` + `npm run build` runs, `dist/` generated
- [ ] `chrome://extensions` Load unpacked → select `YiPet/dist/`
- [ ] Click toolbar icon on any page to see popup, `Ctrl+Shift+X` opens chat
- [ ] `npm run typecheck` exits 0
- [ ] Read Module Boundaries + Dual Execution Context in `YiPet/CLAUDE.md`
- [ ] Add a `HelloBox` component (static text) under `src/popup/components/`, displayed in popup, submit a PR
- [ ] Run `YiPet.help()` and `YiPet.list()` once in DevTools
- [ ] Do a 30-minute walkthrough with a colleague

## 7. Owners / contacts

| Role | Name | Contact |
|---|---|---|
| Project owner | TBD | TBD |
| MV3 / content scripts | TBD | TBD |
| Popup / Chat UI | TBD | TBD |
| API layer | TBD | TBD |
| Code review | TBD | TBD |

> Placeholder fields — please have the project owner fill them in and then delete this line.

## 8. Common error cheatsheet

| Error message | Cause | Fix |
|---|---|---|
| `Module not found: 'react'` | npm install not run / lockfile broken | Delete `node_modules` + `package-lock.json`, reinstall |
| `jsxDEV is not a function` | dev React plugin + production NODE_ENV | chat bundle dev script `--mode production` |
| `chrome.runtime is undefined` in MAIN world | cross-world restriction | chrome API only in ISOLATED; MAIN via CustomEvent |
| `Cannot read properties of undefined (reading 'locale')` | i18n not initialized | See `src/shared/i18n/index.ts`, ensure `t()` called after mount |
| `Uncaught (in promise) TypeError: api.chat.stream` | ApiClient not injected | Check `createApiServices(config)`, ensure ChatService instantiated |
| CSP violation `script-src 'self'` | referenced remote CDN / inline script | MV3 forbids remote code; vendor all local `public/cdn/vendor/` |
| `Extension manifest v2 is deprecated` | used MV2 manifest | YiPet is MV3; do not install the old version by mistake |
| `chrome.tabs.sendMessage` no response | content script not injected / ISOLATED listener not up | Check `manifest.json:content_scripts`; check console in DevTools |

---

If in doubt, check §4 and §8 first; if you can't find the answer, ask the relevant owner in §7.

## Core viewpoints

- **The fastest way to build trust in a new codebase is to ship a trivial change on day one.** The day-1 task checklist is designed to compress the time from "clone" to "PR merged" to under 4 hours. Adding a `HelloBox` component to the popup exercises the full development pipeline: create a component, import it, rebuild, and reload the extension. The psychological barrier of a new codebase is broken by the act of shipping.

- **The dual-world execution model (ISOLATED + MAIN) is the most important architectural concept to understand on day one.** Unlike a typical web app, a Chrome MV3 extension runs in two separate JavaScript contexts with different API surfaces. The ISOLATED world has access to `chrome.*` APIs but cannot access the page's JavaScript objects. The MAIN world can access the page's JavaScript but cannot call `chrome.*` APIs. Understanding this boundary explains every architectural decision in YiPet: the CustomEvent bridge, the CDN injection pattern, and why `chrome.runtime` is undefined in some contexts.

- **The pitfalls cheatsheet is the highest-ROI section of onboarding documentation.** Every item in the cheatsheet represents a real incident where a previous new hire lost hours to a non-obvious convention. The `jsxDEV is not a function` error, the `chrome.runtime is undefined` error, and the CSP violation error are all consequences of the dual-world architecture that are obvious in hindsight but baffling to a new hire. Maintaining this cheatsheet is a continuous investment in reducing time-to-productivity.

- **Browser extension development has a slower feedback loop than web development, and the onboarding workflow must account for this.** Unlike a web app where saving a file triggers HMR, a browser extension requires a rebuild step and a manual reload at `chrome://extensions`. The dev watch mode reduces this to a reload click, but it is still slower than HMR. New hires who are accustomed to instant feedback will interpret the slower loop as "something is broken" unless this is explicitly addressed in onboarding.

- **The "What to read next" section provides the graduated path from operational competence to architectural understanding.** A new hire who completes the day-1 tasks can build and load the extension, but they don't understand why the bootstrap self-injects into two worlds, or how the chat state machine handles SSE streaming with abort. The reading list provides the specific documents that answer the questions that naturally arise after the first week.

## Action recommendations

1. **Add a "Break the dual-world boundary" exercise to the day-1 task list:** The dual-world architecture is the single most important concept in YiPet, and the most common source of new-hire bugs. Add a deliberate exercise: "In the chat window, try to call `chrome.storage.local.get()` directly. Observe the error. Then trace the correct path: chat window -> `chrome.runtime.sendMessage` -> background service worker -> `chrome.storage.local.get()` -> response via `sendResponse`." This experiential learning is more effective than reading about the dual-world boundary, and it takes 10 minutes.

2. **Create a pre-built VM snapshot or Docker image with the full YiPet dev environment:** The current onboarding requires the new hire to: install Node.js, install npm dependencies, build the extension, load it in Chrome, and configure the YiAi backend. A pre-built environment (Dev Container or VM snapshot) reduces the setup time from 30 minutes to 5 minutes and eliminates the "it works on my machine" debugging that consumes the first hour. The snapshot should include a running YiAi backend with mock endpoints so the new hire can test chat streaming without a local Ollama instance.

3. **Add a CDN catalog integrity check to the build pipeline:** The CDN catalog in `src/content/cdn/catalog.ts` is load-bearing infrastructure. A single version mismatch or missing entry can break the entire extension. Add a build step that: (1) verifies every file referenced in the catalog exists in `public/cdn/vendor/`, (2) verifies that the global-existence check in `injector.ts` matches the expected global name for each entry, and (3) fails the build if any check fails. This prevents the catalog from silently drifting and breaking the extension at runtime.

4. **Document the reload-click cycle explicitly in the onboarding workflow:** The onboarding doc mentions that the extension needs a reload at `chrome://extensions`, but it does not emphasize how different this is from web development HMR. Add a dedicated note: "Unlike web development where saving a file triggers instant HMR, Chrome extension development requires: (1) save the file, (2) wait for the dev watch to rebuild (~3-10 seconds), (3) click the reload icon on the YiPet card at `chrome://extensions`, (4) refresh the target page. This is 10-20x slower than web HMR. Plan your development workflow accordingly -- batch changes before reloading." This expectation-setting prevents new hires from thinking the dev environment is broken.

5. **Schedule a quarterly MV3 manifest review to catch breaking changes before Chrome deprecation:** Chrome deprecates MV3 APIs and enforces new CSP rules on a rolling basis. Schedule a quarterly 30-minute review: (1) check the Chrome Platform Status page for any MV3-related deprecations or changes, (2) test the extension against Chrome Canary to catch issues before they reach stable, (3) review the manifest permissions to ensure they are still the minimum required, and (4) verify that all vendor libraries are still CSP-compliant. This proactive review prevents the extension from breaking silently when Chrome updates.

## Anti-patterns

- **Treating onboarding documentation as a one-time write-and-forget artifact.** The §4 pitfalls cheatsheet reflects the current state of the codebase. When the build system changes or the API layer is refactored, the cheatsheet must be updated in the same PR. An outdated cheatsheet is worse than no cheatsheet.

- **Writing onboarding docs that assume the reader understands MV3 extension architecture.** "Calling `chrome.runtime.*` in MAIN world code" is only meaningful to someone who already knows that MV3 extensions have separate ISOLATED and MAIN execution contexts. The cheatsheet pairs each symptom with its cause and fix because the new hire may not know which world they're in.

- **Omitting the "why" behind iron rules.** "Do not directly `fetch`" is a rule. "Because the API layer provides typed request/response contracts, auth token injection, and error normalization" is the understanding that prevents the new hire from bypassing the layer in a different context.

- **Expecting new hires to find the relevant documentation on their own.** The "What to read next" section exists because new hires don't know what they don't know. Without explicit guidance, they will read the README (accessible) rather than the dual-world bootstrap logic (critical for understanding the architecture).

- **Using the onboarding doc as a substitute for a 30-minute walkthrough with a colleague.** The onboarding doc can teach conventions, but it cannot answer "why did we choose CustomEvent over postMessage for cross-world communication?" The walkthrough is where tacit knowledge transfers; the doc is the reference material.

---

## Related

- [../../../engineer/projects/yipet/README.md](../../../engineer/projects/yipet/README.md) — YiPet project README
- [../../../engineer/projects/yipet/engineering/readme.md](../../../engineer/projects/yipet/engineering/readme.md) — YiPet architecture and data flow
- [../../../engineer/projects/yipet/engineering/claude.md](../../../engineer/projects/yipet/engineering/claude.md) — YiPet CLAUDE.md module boundaries and iron rules
- [../../../engineer/projects/INDEX.md](../../../engineer/projects/INDEX.md) — Project index with all Yi-family projects
- [../../../engineer/lessons/win-yipet-aicr-phase-one.md](../../../engineer/lessons/win-yipet-aicr-phase-one.md) — YiPet aicr port MV3 skeleton context for new hires
