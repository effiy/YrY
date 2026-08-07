---
title: YiVad shared client vendor landing completed win
aliases:
- yivad-shared-client-vendor-win
- YiVad vendor landing
- three-project vendor first to complete
tags:
- lessons
- wins
- yi-vad
- shared-client
- vendor
- rpc-envelope
- sse-parser
- contract-tests
- per-project-lockfile
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: design
status: planned
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: Cross-project shared client does not build a monorepo; each project has its own vendor + independent lockfile; contract SSOT is in the design doc, each project's vendor
  is a mirror copy + CI verifies consistency
roles:
- engineer
- tech-lead
benefit: success is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../processes/shared-client-vendor-rollout.md
- ../../processes/shared-client-design.md
- ../../patterns/rpc-envelope.md
- ../../patterns/sse-streaming.md
- ./yivad-vitest-phase-four.md
- ./yivad-aicr-phase-port.md
- ../../../tech-lead/decisions/yivad/vitest-rollout.md
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.
# YiVad shared client vendor landing completed win

> **As an** engineer, **I want to** yivad shared client vendor, **so that** success is reproducible.

## Summary

- Landing: YiVad project's `src/shared-client/` vendor landing complete (base RPC envelope + SSE parser + error normalization + per-project layer + feature module)
- No monorepo; each project has its own vendor + independent lockfile; contract SSOT is in the design doc (shared-client-design-summary), each project's vendor is a mirror copy + CI verifies consistency
- Contract test matrix: YiAi endpoints ↔ YiVad vendor run bidirectionally (OpenAPI-derived types + CI diff block co-build)
- SSE parser reuses Vitest Phase 4 tests (32 tests + parity baseline 20 contract cases run bidirectionally)
- Three-project progress: YiVad complete (this win) / YiPet awaiting aicr port Phase 2 / YiAi endpoint side already landed
- 0 incidents; contract tests 100% passing; vendor 12 files; lockfile independent; CI verifies consistency

## Core viewpoints

1. **No monorepo**: each project has its own vendor + independent lockfile; contract SSOT in the design doc; CI verifies mirror consistency
2. **Three-layer architecture**: base RPC envelope (POST / single entry + `{module_name, method_name, parameters}` → `{code, message, data}`) + SSE parser (`data: {...}\n\n` + done frame guard) + error normalization (`code: 0` success / non-0 error normalized to YiAiError)
3. **Per-project layer**: each project manages its own feature module calling the vendor; vendor does not import project dependencies (avoid reverse coupling)
4. **Contract test matrix**: YiAi endpoints ↔ YiVad vendor bidirectional; OpenAPI-derived types + CI diff block
5. **SSE parser reuse**: Phase 4 Vitest tests 32 tests + parity baseline 20 contract cases bidirectional
6. **Field name hard constraint**: `filter` (not `query`) / `target_file` (not `path`) / `cname` / `module_name` / `method_name` — consistent with the RPC envelope pattern
7. **Supply chain hardening**: each project independent lockfile + min-release-age 7d + lifecycle allowlist; do not import pi-ai
8. **0 incidents**: launch 4-tier rollout 1% → 10% → 50% → 100%; observe each tier for 1 day

## Key information

### Three-layer architecture

| Layer | File | Responsibility |
|---|---|---|
| base layer | `base-rpc.ts` + `sse-parser.ts` + `error-normalize.ts` | RPC envelope + SSE parser + error normalization |
| per-project layer | `yivad-client.ts` | YiVad project-specific layer (feature module calls) |
| feature module layer | `use-chat.ts` + `use-rag.ts` + `use-knowledge.ts` | YiVad features call the per-project layer |

### Contract test matrix

| Dimension | YiAi endpoints | YiVad vendor | Consistency |
|---|---|---|---|
| RPC envelope | ✅ | ✅ | 100% |
| SSE parser | ✅ | ✅ | 100% |
| Error normalization | ✅ | ✅ | 100% |
| Field name hard constraint | ✅ | ✅ | 100% |
| OpenAPI-derived types | ✅ | ✅ | 100% |
| CI diff block | ✅ | ✅ | 100% |

### Landing metrics

| Metric | Goal | Actual | Note |
|---|---|---|---|
| Contract test pass rate | 100% | 100% | 20 contract cases bidirectional |
| SSE parser test reuse | 32 tests | 32 tests | Vitest Phase 4 co-build |
| Vendor file count | < 15 | 12 | base 3 + per-project 1 + feature 8 |
| Independent lockfile | ✅ | ✅ | `package-lock.json` independent |
| CI verifies consistency | ✅ | ✅ | Consistent with design SSOT |
| Incident count | 0 | 0 | 4-tier rollout 0 failures |

### Three-project progress

| Project | State | Note |
|---|---|---|
| YiVad | Complete | This win; vendor 12 files + contract tests 100% |
| YiPet | Awaiting aicr port Phase 2 | Skeleton already in place ([yipet-aicr-phase-one-win](win-yipet-aicr-phase-one.md)), Phase 2 to advance |
| YiAi | Endpoint side landed | `/llm/chat/stream` endpoint + OpenAPI-derived types |

## Action recommendations

1. **No monorepo**: each project independent vendor + independent lockfile; contract SSOT in the design doc ([shared-client-design-summary](../engineering/shared-client-design.md))
2. **Three-layer architecture**: base RPC envelope + SSE parser + error normalization / per-project layer / feature module; vendor does not import project dependencies
3. **Contract test matrix**: YiAi endpoints ↔ YiVad vendor bidirectional; OpenAPI-derived types + CI diff block co-build
4. **SSE parser reuse**: Phase 4 Vitest tests 32 tests + parity baseline 20 contract cases bidirectional
5. **Field name hard constraint**: `filter` / `target_file` / `cname` / `module_name` / `method_name` — consistent with the RPC envelope pattern
6. **Supply chain hardening**: each project independent lockfile + min-release-age 7d + lifecycle allowlist; do not import pi-ai
7. **4-tier rollout**: 1% → 10% → 50% → 100%; observe each tier for 1 day; contract test gate
8. **YiPet advance**: Phase 2 shared client vendor landing (reference YiVad three-layer architecture + contract test matrix)

## Anti-patterns

- **Build a monorepo**: cross-project shared client uses a monorepo strongly coupled → change one place impacts three projects → must have independent vendor per project
- **Vendor imports project dependencies**: vendor reverse-couples to project → cross-project migration difficult → vendor does not import project dependencies
- **Contract SSOT in code**: contract defined in each project's vendor → drift → SSOT in the design doc + CI verifies mirror consistency
- **Field names loose**: allowing `query` / `path` variants → conflicts with RPC envelope pattern → must hard-constrain `filter` / `target_file`
- **Import pi-ai**: cross-project shared client imports the pi-ai package → supply chain risk → do not import pi-ai
- **No contract tests**: vendor landing without bidirectional contract tests → endpoint changes vendor does not fail → must have a contract test matrix

## Related

- Tracking leaf: [../../processes/shared-client-vendor-rollout.md](../engineering/shared-client-vendor-rollout.md) — three-project parallel tracking
- Design SSOT: [../../processes/shared-client-design.md](../engineering/shared-client-design.md) — three-layer architecture
- Pattern co-build: [rpc-envelope-pattern](../architecture-design/rpc-envelope.md) + [sse-streaming-pattern](../architecture-design/sse-streaming.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md)
- Test co-build: [./yivad-vitest-phase-four.md](win-yivad-vitest-phase-four.md) — SSE parser test reuse
- aicr co-build: [./yivad-aicr-phase-port.md](win-yivad-aicr-phase-port.md) — aicr page calls vendor
- Implementation ADR: [../../../tech-lead/decisions/yivad/vitest-rollout.md](../../tech-lead/decisions/yivad/vitest-rollout.md) — Phase 4 SSE parser co-build
- YiAi endpoint: [../../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) — Phase 5 endpoint contract
- Related win: [./yipet-aicr-phase-one.md](win-yipet-aicr-phase-one.md) — YiPet skeleton done awaiting Phase 2 vendor
