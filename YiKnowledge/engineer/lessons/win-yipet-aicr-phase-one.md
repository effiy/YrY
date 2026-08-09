---

title: YiPet aicr port Phase 1 MV3 skeleton complete win
aliases: [yipet-aicr-phase-one-win, YiPet aicr Phase 1, MV3 skeleton complete]
tags: [lessons, wins, yi-pet, aicr, phase-one, mv3, chrome-manifest, dual-world, skeleton]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: design
status: planned
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: MV3 skeleton first establishes boundary then fills details; double world type branding lets compile-time guard channel isolation, than runtime detect early one phase earlier
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./yivad-aicr-phase-port.md
 - ../../../tech-lead/decisions/yipet--aicr-port-rollout.md
 - ../../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md
 - ../../../tech-lead/decisions/yipet--biome-lint-format.md
 - ../../patterns/dual-world-boundary.md
 - ../../patterns/staged-port-methodology.md
 - ../../patterns/one-to-one-mapping-migration.md
 - ../gotchas/react-jsxdev-mismatch.md
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.

# YiPet aicr port Phase 1 MV3 skeleton complete win

> **As an** engineer, **I want to** yipet aicr phase one, **so that** success is reproducible.

## Summary

- Phase 1 landed: MV3 skeleton + double world boundary (TS type branding `__worldBrand` + class-typed message envelope `{kind, from, to, payload, id}`) + chrome.runtime.sendMessage / window.postMessage channel isolation
- File skeleton: `chrome-manifest.json` + `isolated-` prefix (isolated world) + `main-` prefix (main world) + Biome lint forbidden `as any` cross world
- Skeleton first to establish boundary, not fill business logic; 5 stages after continue Phase 2 shared client vendor / Phase 3 ChatPanel+CodeViewer / Phase 4 9 store+8 modal / Phase 5 parity+gray release
- double world type branding lets compile-time guard channel isolation (runtime detect early one phase earlier)
- parity baseline aligned with YiVad aicr skeleton structure (manifest / background / content-script / popup / options)
- 0 business logic changes; pure skeleton PR; CI double world class-type Check + lint block

## Core viewpoints

1. **Skeleton first to establish boundary**: Phase 1 only establishes MV3 double world boundary + File skeleton, not fill business logic; boundary established wrong after leads to all rework
2. **type branding compile-time guard boundary**: `__worldBrand` lets TS compile-time identify world ownership, than runtime detect early one phase earlier
3. **class-typed message envelope**: `{kind, from, to, payload, id}` replaces `any`, cross world communication contract can be inferred
4. **File name prefix constraint**: `isolated-` / `main-` prefix hard-constrains world ownership, Biome lint forbidden `as any` cross world
5. **parity aligned with YiVad baseline**: manifest / background / content-script / popup / options structure aligned, avoid "YiPet self-invented naming"
6. **pure skeleton PR forbidden features**: Phase 1 PR only establishes skeleton not fill business, violating 1:1 map migration pattern forbidden features changes original intent
7. **5 stage methodology closure**: skeleton → vendor → UI rewrite → store/modal → parity+gray release; every stage independent and can fall back

## Key information

### File skeleton

| File | world | responsibility |
|---|---|---|
| `chrome-manifest.json` | — | MV3 manifest (service worker / content scripts / permissions / web_accessible_resources) |
| `isolated-background.ts` | isolated | service worker (event listener / cross world forwarding / chrome.storage read/write) |
| `isolated-content-script.ts` | isolated | injected into page (DOM observation / window.postMessage receive) |
| `main-app.tsx` | main | React application entry (UI render / window.postMessage send) |
| `main-chat-panel.tsx` | main | ChatPanel component (Phase 3 rewrite) |
| `main-code-viewer.tsx` | main | CodeViewer component (Phase 3 rewrite) |

### double world boundary (type branding)

```ts
type IsolatedWorld = { __worldBrand: 'isolated' };
type MainWorld = { __worldBrand: 'main' };
type MessageEnvelope<T = unknown> = {
 kind: string;
 from: IsolatedWorld | MainWorld;
 to: IsolatedWorld | MainWorld;
 payload: T;
 id: string;
};
```

- cross world communication must run `chrome.runtime.sendMessage` (isolated ↔ background) or `window.postMessage` (isolated ↔ main)
- Biome lint forbidden `as any` cross world (`noExplicitAny` rule)
- File name prefix hard-constrains world ownership

### parity baseline (aligned with YiVad aicr skeleton)

| dimension | YiVad baseline | YiPet Phase 1 | consistency |
|---|---|---|---|
| manifest structure | 5 fields (name / version / permissions / host_permissions / web_accessible_resources) | 5 fields | 100% |
| background | service_worker + type: module | service_worker + type: module | 100% |
| content_scripts | matches + js + run_at | matches + js + run_at | 100% |
| options_page | single page + default_popup | single page + default_popup | 100% |
| File naming | `isolated-` / `main-` prefix | `isolated-` / `main-` prefix | 100% |

## Action recommendations

1. **Skeleton first to establish boundary**: Phase 1 only establishes MV3 double world boundary + File skeleton, not fill business logic
2. **type branding compile-time guard boundary**: `__worldBrand` + class-typed envelope, let TS compile-time guard channel isolation
3. **Biome lint forbidden `as any` cross world**: `noExplicitAny` rule in Biome config hard constraint
4. **File name prefix constraint**: `isolated-` / `main-` prefix hard-constrains world ownership, CI validation consistent
5. **parity aligned with YiVad baseline**: manifest / background / content-script / popup / options structure aligned, do not self-invent naming
6. **pure skeleton PR forbidden features**: Phase 1 PR only establishes skeleton, business PR in Phase 3 / 4 separate
7. **5 stage methodology closure**: skeleton → vendor → UI rewrite → store/modal → parity+gray release; every stage independent and can fall back
8. **continue Phase 2**: skeleton established, Phase 2 shared client vendor lands (base layer SSE parser + RPC envelope reuse)

## Anti-patterns

- **Filling business logic into the skeleton phase** — Phase 1 is exclusively for establishing the MV3 dual-world boundary and file skeleton. Sneaking ChatPanel or CodeViewer rewrites into the skeleton PR violates the 1:1 mapping migration principle and makes the PR unreviewable as a pure structural change.

- **Using runtime checks to determine world ownership** — checking `typeof window` or `typeof chrome` at runtime to decide which world code is running in is both slower and error-prone compared to compile-time type branding. The `__worldBrand` type system catches world-crossing mistakes at build time, one phase earlier.

- **Using `as any` to bypass type safety in cross-world communication** — casting message payloads to `any` disables the class-typed message envelope and makes cross-world communication contracts invisible to the type checker. Biome lint must hard-forbid `noExplicitAny` on cross-world boundaries.

- **Using arbitrary file names without world-ownership prefixes** — without `isolated-` and `main-` prefixes, CI cannot validate which world a file belongs to, and developers accidentally import React in the isolated world. The prefix convention is a hard constraint enforced by CI.

- **Inventing YiPet-specific manifest structure instead of aligning with YiVad** — creating a custom manifest field layout that differs from the YiVad baseline (5 fields: name, version, permissions, host_permissions, web_accessible_resources) breaks parity before the port even begins. The skeleton must match the YiVad baseline 100%.

## Related

- [./win-yipet-aicr-phase-two.md](./win-yipet-aicr-phase-two.md) — Phase 2 shared client vendor, next stage after MV3 skeleton
- [./win-yipet-aicr-phase-three.md](./win-yipet-aicr-phase-three.md) — Phase 3 ChatPanel/CodeViewer React rewrite
- [./win-yivad-aicr-phase-port.md](./win-yivad-aicr-phase-port.md) — YiVad aicr baseline that Phase 1 skeleton aligns with
- [../../tech-lead/decisions/yipet--aicr-port-rollout.md](../../tech-lead/decisions/yipet--aicr-port-rollout.md) — ADR for aicr port 5-stage rollout
- [../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md](../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md) — ADR for Chrome MV3 dual-world boundary design
