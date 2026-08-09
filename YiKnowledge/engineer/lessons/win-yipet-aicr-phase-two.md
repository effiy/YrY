---

title: YiPet aicr Phase 2 shared client vendor landing win
aliases:
- yipet-aicr-phase-two-win
- YiPet aicr Phase 2
- vendor landing
tags:
- lessons
- wins
- yi-pet
- aicr
- phase-two
- shared-client
- vendor
- chrome-extension
- sse-parser
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: design
status: draft
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: The shared client vendor for the MV3 extension must land its base layer separately under the dual-world boundary; isolated world does not import React, only main
  world does
roles:
- engineer
- tech-lead
benefit: success is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./yipet-aicr-phase-one.md
- ./yivad-shared-client-vendor.md
- ../../../tech-lead/decisions/yipet--aicr-port-rollout.md
- ../../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md
- ../../patterns/dual-world-boundary.md
- ../../patterns/rpc-envelope.md
- ../../patterns/sse-streaming.md
- ../../processes/shared-client-vendor-rollout.md
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.

# YiPet aicr Phase 2 shared client vendor landing win

> **As an** engineer, **I want to** yipet aicr phase two, **so that** success is reproducible. 

## Summary

- Phase 2 landing: YiPet project `src/shared-client/` vendor landing (base RPC envelope + SSE parser + error normalization + per-project layer + feature module) + base layer landed separately under dual-world boundary
- MV3 specifics: isolated world does not import React (pure fetch + EventSource) ; main world imports React (consumes vendor hooks) 
- isolated world base layer: `isolated-base-rpc.ts` + `isolated-sse-parser.ts` (chrome.runtime.sendMessage channel) 
- main world per-project layer: `main-yipet-client.ts` (window.postMessage channel <-> isolated) 
- contract test matrix: YiAi endpoint <-> YiPet vendor bidirectional runs (OpenAPI-derived types + CI diff blocking co-built) 
- SSE parser reuses YiVad vendor tests (32 tests + parity baseline 20 contract cases) 
- parity aligned with YiVad vendor three-layer architecture + contract test 100% consistent
- 0 incidents; contract test 100% pass; vendor file count 14 (2 extra isolated base) 

## Core viewpoints

- **The MV3 dual-world constraint is not a Chrome limitation -- it is a security boundary that the vendor architecture must respect, not work around**: The isolated world (content script) cannot access the main world's DOM or React components. The main world cannot access the isolated world's `chrome.runtime.sendMessage` channel. The vendor's base layer must be split into two sets of files that communicate through a typed message envelope, not through shared state. Attempting to share code between worlds is an architectural error, not a code reuse opportunity.

- **The `__worldBrand` type branding and Biome lint rule forbidding `as any` across worlds is not TypeScript pedantry -- it is the only compile-time guarantee that cross-world communication is type-safe**: A message sent from the isolated world as `{kind: "chat", payload: "hello"}` and received in the main world as `{kind: "chat", payload: "hello"}` looks correct. But without type branding, the main world cannot distinguish a message from the isolated world from a message from any other source. The `__worldBrand` discriminator and the typed envelope `{kind, from, to, payload, id}` make the communication contract enforceable at compile time.

- **The isolated base layer using pure `fetch` + `EventSource` (no React, no DOM) is not a constraint -- it is the correct architecture for a content script that runs on every page**: The content script's job is to proxy network requests from the extension's isolated context to the YiAi backend. It does not need React, it does not need DOM access, and it should not have either. Keeping the isolated base layer dependency-free means it is small, fast, and auditable -- exactly what a content script should be.

- **Contract SSOT in the design doc with mirror copies in each project is the only architecture that allows three projects to move at different speeds**: YiVad's vendor is complete. YiPet's vendor is in Phase 2. YiAi's endpoint side is already landed. If the contract SSOT lived in YiVad's codebase, YiPet would be chasing a moving target. The design doc as SSOT means each project's vendor is a mirror copy that CI verifies against the design doc -- not against another project's implementation.

- **The SSE parser reuse (32 tests from YiVad Vitest Phase 4) is not code sharing -- it is test suite sharing, which is more valuable**: Reusing the parser code is useful. Reusing the 32 tests that verify the parser handles done frames, missing frames, interruptions, multi-data merges, heartbeat empty lines, error fields, aborts, and network jitter is invaluable. The test suite captures the accumulated knowledge of every SSE bug that has been fixed. Running the same tests in YiPet means YiPet inherits the fixes without inheriting the bugs.


1. **MV3 dual-world constraint**: isolated world does not import React / DOM; main world imports React -- vendor base layer must be split into isolated / main sets
2. **isolated base layer**: pure fetch + EventSource; chrome.runtime.sendMessage channel; does not import React / DOM
3. **main per-project layer**: React hooks consume vendor; window.postMessage <-> isolated communication
4. **contract SSOT unchanged**: contract SSOT lives in the design spec; YiPet vendor is a mirror copy + CI verifies consistency; co-built contract test with YiVad vendor
5. **SSE parser reuse**: YiVad Vitest Phase 4 tests 32 + parity baseline 20 contract cases -- YiPet reuses directly
6. **Dual-world type branding boundary guard**: `__worldBrand` + typed message envelope `{kind, from, to, payload, id}`; Biome lint forbids `as any` across worlds
7. **Supply chain hardening**: each project independent lockfile + min-release-age 7d + lifecycle allowlist; does not import pi-ai
8. **0 incidents**: launch 4-stage ramp 1% -> 10% -> 50% -> 100%; observe 1 day per stage

## Key information

### MV3 dual-world vendor architecture

| Layer | World | File | Responsibility |
|---|---|---|---|
| isolated base layer | isolated | `isolated-base-rpc.ts` + `isolated-sse-parser.ts` + `isolated-error-normalize.ts` | Pure fetch + EventSource; chrome.runtime.sendMessage channel |
| main per-project layer | main | `main-yipet-client.ts` | React hooks consume vendor; window.postMessage <-> isolated |
| feature module layer | main | `use-chat.ts` + `use-rag.ts` + `use-knowledge.ts` | YiPet features call per-project layer |

### Parity baseline (aligned with YiVad vendor) 

| Dimension | YiVad baseline | YiPet Phase 2 | Consistency |
|---|---|---|---|
| Three-layer architecture | base / per-project / feature | base (split isolated/main) / per-project / feature | 100% |
| contract test | 20 contract cases bidirectional | 20 contract cases bidirectional | 100% |
| SSE parser test | 32 tests reused | 32 tests reused | 100% |
| Field name hard constraint | `filter` / `target_file` / `cname` | `filter` / `target_file` / `cname` | 100% |
| OpenAPI-derived types | yes | yes | 100% |
| CI diff blocking | yes | yes | 100% |
| Independent lockfile | yes | yes | 100% |

### Landing metrics

| Metric | Goal | Actual | Notes |
|---|---|---|---|
| contract test pass rate | 100% | 100% | 20 contract cases bidirectional |
| SSE parser test reuse | 32 tests | 32 tests | YiVad co-built |
| vendor file count | < 16 | 14 | isolated base 3 + main per-project 1 + feature 8 + 2 main-isolated bridge |
| Independent lockfile | yes | yes | `package-lock.json` independent |
| CI verifies consistency | yes | yes | Consistent with design spec SSOT |
| Dual-world boundary guard | yes | yes | Biome lint noExplicitAny + type branding |
| Incidents | 0 | 0 | 4-stage ramp 0 failures |

## Action recommendations

1. **MV3 dual-world vendor split base layer**: isolated world pure fetch + EventSource + chrome.runtime.sendMessage; main world React hooks + window.postMessage
2. **Parity align with YiVad baseline**: three-layer architecture + contract test + SSE parser reuse + field name hard constraint + OpenAPI-derived types + CI diff blocking
3. **Dual-world type branding boundary guard**: `__worldBrand` + typed message envelope `{kind, from, to, payload, id}`; Biome lint forbids `as any` across worlds
4. **contract SSOT unchanged**: contract SSOT in design spec; YiPet vendor is mirror copy + CI verifies consistency
5. **SSE parser reuse**: YiVad Vitest Phase 4 tests 32 + parity baseline 20 contract cases -- YiPet reuses directly
6. **Supply chain hardening**: each project independent lockfile + min-release-age 7d + lifecycle allowlist; does not import pi-ai
7. **4-stage ramp**: 1% -> 10% -> 50% -> 100%; observe 1 day per stage; contract test gate
8. **Next Phase 3 push**: after vendor landing, Phase 3 ChatPanel + CodeViewer React rewrite

## Anti-patterns

- **isolated imports React**: isolated world importing React / DOM -> MV3 constraint -> must split isolated / main sets
- **base layer not split by world**: base layer using a single code path -> cross-world communication chaos -> must split isolated-base / main-yipet-client
- **Not parity-aligning with YiVad**: YiPet inventing its own vendor structure -> parity baseline fails -> must align
- **Using `as any` across worlds**: cross-world communication using `as any` to bypass types -> typed envelope fails -> Biome lint hard-forbids
- **Importing pi-ai**: MV3 vendor importing pi-ai -> supply chain risk + bundle size -> do not import pi-ai
- **No contract test built**: vendor landing without bidirectional contract test -> endpoint changes do not fail vendor -> must build contract test matrix

## Related

- upstream Phase 1: [./yipet-aicr-phase-one.md](win-yipet-aicr-phase-one.md) — MV3 skeleton established
- YiVad vendor baseline: [./yivad-shared-client-vendor.md](win-yivad-shared-client-vendor.md) — three-layer architecture reference
- Implementation ADR: [../../../tech-lead/decisions/yipet--aicr-port-rollout.md](../../tech-lead/decisions/yipet--aicr-port-rollout.md) — 5-stage push
- Dual-world ADR: [../../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md](../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md) — type branding co-built
- Pattern co-built: [dual-world-boundary-pattern](../engineering/dual-world-boundary.md) + [rpc-envelope-pattern](../architecture-design/rpc-envelope.md) + [sse-streaming-pattern](../architecture-design/sse-streaming.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md)
- Tracking leaf: [../../processes/shared-client-vendor-rollout.md](../engineering/shared-client-vendor-rollout.md) — three projects in parallel
- YiVad Vitest co-built: [../../../tech-lead/decisions/yivad--vitest-rollout.md](../../tech-lead/decisions/yivad--vitest-rollout.md) — Phase 4 SSE parser test reuse
- YiAi endpoint: [../../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) — Phase 5 endpoint contract
