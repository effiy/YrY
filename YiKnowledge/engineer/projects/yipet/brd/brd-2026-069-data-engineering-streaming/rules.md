---
lifecycle: active
category: engineer/projects/yipet/brd/brd-2026-069-data-engineering-streaming
roles:
- engineer
benefit: project context preserved
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
review_cycle: quarterly
tacit: false
related: []
status: stable
type: brd
---

# brd-2026-069 YiPet MV3 dual-world boundary governance — Rules

> **As an** engineer, **I want to** rules, **so that** project context preserved.

## 1. MV3 dual-world rules
- ISOLATED world is the only one that can use `chrome.runtime.*`; MAIN world is the only one that can use page globals.
- Do not mix them: type branding with `WorldTag<'ISOLATED'>` / `WorldTag<'MAIN'>`.
- Messages must go through a typed envelope (`shared/types/messages.ts`).
- Biome lint forbids `as any` across worlds.
- CSP zero violations: no remote code / no eval / no inline script.
- All vendor files are local under `public/cdn/vendor/`.

## 2. API four-tier rules
- Tier 1 Client (`src/api/client.ts`) — wraps fetch + retry + SSE; calling fetch directly is forbidden.
- Tier 2 Endpoints (`src/api/endpoints.ts`) — path constants grouped by domain.
- Tier 3 Types (`src/api/types.ts`) — SSOT for all API shapes; importing services is forbidden.
- Tier 4 Services (`src/api/services/*.ts`) — domain service classes; `ApiClient` injected via constructor.
- Cross-tier blocking: types must not import services; client must not import services; services call fetch via the client.

## 3. Cross-project RPC contract rules
- Envelope: `{module_name, method_name, parameters}` (not action/args).
- `data_service.query_documents` uses `filter` (not query).
- `data_service.update_document` reads `data.key` (not parameters.key).
- `data_service.delete_document` uses `{cname, key}`.
- Chat SSE: `{model, messages, stream: true, system?, images?}` via `services.ai.chat_service.chat`.
- File operations use `target_file` (not path).

## 4. Review rules
- Typecheck blocks the build (`tsc --noEmit`).
- Biome lint blocks (`biome check`).
- Vitest blocks (`vitest run`).
- Supply-chain four-piece blocks (lockfile + audit + min-release-age + allowlist).
- Two-person review + dual-world type branding coverage = 100%.
