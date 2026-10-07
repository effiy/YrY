# Changelog

## [1.2.1] — 2026-09-23

### Fixed — Storage Persistence (P0)

- **6-key storage prefix mismatch**: `_persistSetting` writes with `yipet:` prefix but `_loadPersistedState` read without it. Fixed by unifying all read keys to bracket notation with `yipet:` prefix. Affected: `sidebarWidth`, `sidebarCollapsed`, `chatWindowState` (was `windowState`), `chatColorIndex`, `chatCustomColor`, `promptHistory`.
- **promptHistory double serialization**: `pushPromptHistory` passed `JSON.stringify(arr)` to `_persistSetting` which auto-stringifies non-string values — resulting in a JSON string stored in chrome.storage instead of an array, causing `Array.isArray` check to fail on load.
- **ragContentSummary undefined propagation**: Added `|| 'unknown'` fallback when `RagSource.path` is undefined, preventing "undefined +N" display string.

### Fixed — Security (P0)

- **Mermaid XSS**: Changed `securityLevel` from `'loose'` to `'strict'` in `chat/utils.ts:162`. Prevents LLM-generated Mermaid diagrams from executing arbitrary HTML/JavaScript.
- **decodeHTMLEntities XSS**: Replaced `div.innerHTML` with `textarea.innerHTML` in `shared/utility-tools.ts:260`. Textarea provides pure-text semantics, eliminating the XSS attack surface.

### Fixed — API Path (P0–P1)

- **Compaction bypasses ApiClient (Critical)**: `useConversationCompact.ts` used bare `fetch('/')` to call the compaction RPC endpoint — on non-localhost pages, the request went to the page's origin instead of YiAi. Fixed by injecting `rpcCall` dependency through `ConversationCompactDeps` and routing through `getClient().rpc()`. Added `getClient()` export to `services.ts`.
- **relay.ts wrong apiBase port**: Changed `chatEl.dataset.apiBase` from `http://localhost:8848/api` (YiVad frontend) to `http://localhost:10086` (YiAi backend). Previously depended on YiVad Rsbuild dev proxy being running.

### Fixed — Code Quality (P2–P3)

- **injectServices type signature**: Added missing `client: ApiClient` and `dashboard: DashboardService` parameters to both `services.ts` and `chat.ts` local injection functions.
- **CDN loadCSS dead code**: Removed duplicate `loaded.set` and unreachable `onload` callback in `content/cdn/injector.ts`.
- **bootstrap.ts double semicolons**: Removed 3 occurrences of `;;` at lines 58, 72, 101.
- **Unused TodoItem import**: Removed from `chat/types.ts`.
- **MessageKey duplicate**: Removed duplicate `'aboutFeatureI18n'` from `shared/i18n/index.ts`.
- **Dead code documented**: `enums/index.ts` (5 enums, 0 imports), `createPopupConfig()` (0 callers, divergent VISIBLE default).

### Documentation

- 11 bug reports added to `YiKnowledge/projects/yipet/bugs/2026-09/代码质量/` (58–68)
- 3 PRD sets created: Storage Persistence (111), Security Hardening (112), API Path Fixes (113)
- Audit report: `YiKnowledge/projects/yipet/prds/2026-09/110-审计-代码质量审计报告.md`
- Bugs README index updated with new entries (#64–#74)
- This CHANGELOG added to project root

### Verification

- `npm run typecheck` — zero errors
- `npm test` — 138/138 passing (16 files, 0 regression)
- `npm run build` — 4 entries (popup/chat/cdn/bootstrap) all successful