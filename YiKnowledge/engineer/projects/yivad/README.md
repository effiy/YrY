---
title: Readme
tags: [project, yivad, vue, readme]
category: engineer/projects
created: 2026-01-01
updated: 2026-08-09
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: >-
  Onboarding baseline for YiVad project context, architecture decisions,
  and development standards; prevents repeated question loops and
  inconsistent implementation patterns across contributors.
---

# YiVad

> **As an** engineer, **I want to** access project-specific documentation, **so that** I understand the context and decisions behind each codebase.

## Core viewpoints

**ProTable is the single most important architectural pattern in YiVad, and deviating from it is the most common source of inconsistency.** ProTable encapsulates search, pagination, sorting, and column configuration into a declarative API. Using raw `el-table` instead of ProTable means reimplementing pagination, search, and column config from scratch. The self-constraint exists because every table built without ProTable eventually needs the features ProTable provides.

**The `v-auth` directive represents the correct granularity for permission control -- button-level, not page-level.** Route guards control page access, but `v-auth` controls operation-level visibility within a page. Using inline `v-if` permission checks creates tight coupling between the permission model and every view. The directive approach keeps permission logic centralized and views clean.

**The `filter`/`query` and `target_file`/`path` bugs are the same class of error: RPC parameter name mismatches with no automated contract testing.** Both bugs were silent (no error, wrong results or 422) and both were fixed in the same week. The root cause is the absence of automated contract testing between YiVad and YiAi. Until that exists, every new RPC integration is a potential repeat.

**Dynamic routing from backend menu API is powerful but the static fallback must be maintained as a first-class asset.** When the backend menu API is unavailable, the entire navigation structure depends on `authMenuList.json`. A stale fallback means users see an outdated or broken menu. The fallback must be updated whenever new routes are added, not treated as a legacy artifact.

**The SSE `onDone` guard (`!aborted && !error`) is a lesson in side-effect safety for streaming protocols.** The 2026-07-28 fix in `aiChat.ts` prevents partial or aborted content from being auto-forwarded to WeCom. Every SSE `onDone` handler that has external side effects must include a similar guard.

## Project card

| Field | Value |
|---|---|
| Positioning | Main control web application, integrating aiChat / aicr / Knowledge and other modules |
| Main tech stack | Rsbuild 1 (migrated from Vite); see [architecture-summary.md](./architecture.md) / `engineering/claude.md` |
| Current main owner | See [project-management-summary.md](../../../product-manager/projects/yivad--project-management.md) §Current main owner |
| Business domain | Main control panel, AI chat, AI code review |

## Subdirectories

- [architecture-summary.md](./architecture.md) — architecture overview (tech stack / layered boundary / data flow / coding standards / graceful degradation / anti-patterns)
- [functional-modules-summary.md](./functional-modules.md) — functional module list (20 views / 18 api modules / 11 stores / common components / composables / directives / routes / layout)
- [dev-standards-summary.md](./dev-standards.md) — development standards (naming / SFC structure / ProTable / v-auth / SSE / env / commitlint / lint)
- [project-management-summary.md](../../../product-manager/projects/yivad--project-management.md) — project management (iteration cadence / deliverables / onboarding / handover / weekly & daily reports & retrospective / cross-project linkage)
- [adr-vitest-introduction.md](../../../tech-lead/decisions/yivad--vitest-introduction.md) — ADR: introduce Vitest 2 + @vue/test-utils + happy-dom + coverage-v8, priority composables → stores → components
- [adr-vitest-rollout.md](../../../tech-lead/decisions/yivad--vitest-rollout.md) — ADR (implementation): Vitest 4-phase rollout (composables → stores → components → SSE parser parity) + coverage gate + aicr parity co-build
- [adr-aicr-phase-port.md](../../../tech-lead/decisions/yivad--aicr-phase-port.md) — ADR: aicr 7-phase port methodology (baseline alignment + parity test + store/modal decoupling + /loop auto-regression)
- [rag-system-pages-reference.md](./rag-system-pages-reference.md) — RAG five-page menu + UI quick reference
- [manage-menu-catalog.md](./manage-menu-catalog.md) — menu catalog management: data model, management UI, CRUD operations, static vs dynamic routes
- [knowledge-preview-local-chat.md](./knowledge-preview-local-chat.md) — knowledge preview dialog local LLM chat model selector feature
- [knowledge-preview-dialog-modules.md](./knowledge-preview-dialog-modules.md) — knowledge preview dialog functional module inventory (10 parent modules + 10 chat sub-modules)
- [one-screen-layout.md](./one-screen-layout.md) — one-screen layout with scrollable overflow pattern (three-layer architecture, flex + min-height:0, calc(100vh-Npx), useResizable)
- [engineering/](./engineering/) — project engineering documentation mirror
  - `claude.md` — project CLAUDE.md mirror
  - `readme.md` — project README.md mirror
  - `changelog.md` — project CHANGELOG.md mirror

## Anti-patterns

- **Using raw `el-table` instead of ProTable for new table pages.** ProTable is the canonical table pattern. It encapsulates search, pagination, sorting, and column configuration into a declarative API. Using raw `el-table` means reimplementing all of these features from scratch.

- **Using `v-if` with permission state instead of `v-auth` directive.** The `v-auth` directive decouples permission logic from the view layer. Using `v-if` with `authStore.hasPermission('user:edit')` inline creates tight coupling and makes it impossible to change the permission model without touching every view.

- **Calling `axios` directly instead of going through `RequestHttp`.** The `RequestHttp` class wraps Axios with interceptors, cancellation, error mapping, and the RPC envelope. Bypassing it breaks authentication, error handling, and the unified response envelope.

- **Using `query` instead of `filter` or `path` instead of `target_file` in RPC calls.** Both parameter name mismatches have caused real bugs. Always use the contract names as documented in the cross-project protocol table.

- **Skipping the `!aborted && !error` guard before auto-forwarding SSE results to WeCom.** The 2026-07-28 fix prevents partial or aborted chat content from being auto-forwarded. Every SSE `onDone` handler with external side effects must include this guard.

## Notes

`stories/` currently has no content; create as needed during iteration.
