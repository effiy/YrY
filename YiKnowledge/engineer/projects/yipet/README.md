---
title: YiPet project card
tags: [YiPet, project-card, browser-extension, MV3, React]
category: engineer/projects/yipet
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, new-hire]
benefit: "Engineers find YiPet architecture, dev standards, and functional modules with project-specific context"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./architecture.md
  - ./functional-modules.md
  - ./dev-standards.md
  - ../../../product-manager/projects/yipet--project-management.md
  - ../../../tech-lead/decisions/yipet--biome-lint-format.md
  - ../../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md
  - ../../../tech-lead/decisions/yipet--aicr-port-rollout.md
  - ../../../new-hire/onboarding/yipet--onboarding.md
  - ./engineering/claude.md
  - ./engineering/readme.md
  - ../INDEX.md
---

# YiPet

> **As an** engineer, **I want to** access project-specific documentation, **so that** I understand the context and decisions behind each codebase.

> Browser extension + desktop application. Chrome MV3, React 18 + Ant Design 5.

## Core viewpoints

**The dual-world boundary (ISOLATED + MAIN) is the single most important architectural constraint in YiPet.** Chrome MV3 isolates content scripts from page JavaScript. The bootstrap module's self-injection pattern bridges this gap, but every line of code must respect which APIs are available in which world. Breaking this boundary causes silent failures that are hard to debug because the error surfaces in a different execution context than the source code.

**The four-tier API layer is over-engineered for a single-backend project but pays off in cross-project consistency.** The `client -> endpoints -> types -> services` architecture is more structure than strictly necessary for a Chrome extension. However, the payoff is that the same pattern is used across YiPet and YiVad, making cross-project navigation predictable and the `filter`/`query` bug fixable in one place.

**CDN resource injection is the most brittle part of YiPet's architecture.** Loading 80+ vendor libraries from local `chrome-extension://` URLs requires precise catalog maintenance, version alignment, and global-existence checks to prevent double-loading. A single version mismatch between React and ReactDOM, or a missing CDN entry, can break the entire extension. The catalog is load-bearing infrastructure, not a convenience file.

**Rsbuild multi-entry builds multiply configuration complexity.** YiPet has four separate Rsbuild configs (popup, chat, CDN utils, bootstrap), each with its own entry, output, and plugin set. The `--mode production` requirement for the chat bundle (to avoid `jsxDEV is not a function`) is a gotcha that would not exist in a single-entry build. Each new entry point adds a new build config and new failure modes.

**MV3 CSP compliance means every dependency must be bundled locally, making dependency management significantly more manual.** The `script-src 'self'` policy means no remote code, no `eval`, no inline scripts. All 80+ vendor libraries must live under `public/cdn/vendor/` and be loaded via `chrome-extension://` URLs. Adding a new dependency means adding it to the CDN catalog, not just `npm install`.

## Project card

| Field | Value |
|---|---|
| Positioning | Browser extension (YiPett shortcut + chat box) + desktop application |
| Main tech stack | See [architecture-summary.md](./architecture.md) / `engineering/claude.md` |
| Current main owner | See [project-management-summary.md](../../../product-manager/projects/yipet--project-management.md) §Current main owner |
| Business domain | Personal productivity tool |

## Subdirectories

- [architecture-summary.md](./architecture.md) — architecture overview (tech stack / API four tiers / dual world boundary / data flow / degradation / anti-patterns)
- [functional-modules-summary.md](./functional-modules.md) — functional module inventory (10 top-level directories / 6 services / 4 popup components / 19 chat components / content / shared / background / config)
- [dev-standards-summary.md](./dev-standards.md) — development standards (naming / TSX structure / API four tiers / MV3 dual world / style co-location / i18n / time / CSP / Biome / Vitest)
- [project-management-summary.md](../../../product-manager/projects/yipet--project-management.md) — project management (iteration cadence / deliverables / onboarding / handoff / weekly daily retrospective / cross-project linkage)
- [adr-biome-lint-format.md](../../../tech-lead/decisions/yipet--biome-lint-format.md) — ADR: Biome 2.5 unified lint + format, removed ESLint + Prettier
- [adr-chrome-manifest-dual-world-boundary.md](../../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md) — ADR: MV3 dual world boundary enforcement (TS type branding + typed message envelope)
- [adr-aicr-port-rollout.md](../../../tech-lead/decisions/yipet--aicr-port-rollout.md) — ADR (implementation): aicr port 5 phases (MV3 skeleton + shared client vendor + ChatPanel/CodeViewer React rewrite + store/modal migration + parity test + grayscale)
- [engineering/](./engineering/) — project engineering documentation mirror
  - `claude.md` — project CLAUDE.md mirror
  - `readme.md` — project README.md mirror

## Anti-patterns

- **Calling `chrome.runtime.*` APIs from MAIN world code.** The dual-world boundary is absolute: Chrome APIs are only available in the ISOLATED world. Calling them from MAIN world code injected via bootstrap will throw silently. All Chrome API calls must stay in ISOLATED world code.

- **Adding a new Rsbuild entry without understanding the `--mode production` requirement.** The chat bundle requires `--mode production` to avoid the `jsxDEV is not a function` error. A new Rsbuild entry that uses React but runs in dev mode will hit the same bug. Always test new entries with both `npm run dev` and `npm run build`.

- **Skipping `npm run typecheck` before commit.** Rsbuild/SWC strips types at build time but does not check them. `tsc --noEmit` is the only type-checking pass. A build that succeeds with type errors will produce a runtime error that could have been caught at compile time.

- **Using `query` instead of `filter` in RPC calls to `data_service.query_documents`.** The YiAi backend's `_build_filter` reads the `filter` key, not `query`. Passing `query` silently returns all documents or none. This caused a real bug in `SessionService.list/get`. Always use `filter` in the parameters dict.

- **Modifying the CDN catalog without updating the global-existence check logic.** The `CDN_CATALOG` array is the single source of truth for all injectable resources. Adding a new entry without verifying the global-existence check will cause double-loading or missing dependencies. The catalog and injector must stay in sync.

## Note

`stories/` has no content yet; will be created when requirements iterate.
