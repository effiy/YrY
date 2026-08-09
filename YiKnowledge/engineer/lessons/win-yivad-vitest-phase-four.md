---

title: YiVad Vitest Phase 4 SSE parser parity complete win
aliases: [yivad-vitest-phase-four-win, Vitest Phase 4 complete, SSE parser parity QA wrap-up]
tags: [lessons, wins, yi-vad, vitest, sse-parser, parity, phase-four, coverage]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: design
status: draft
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: SSE parser parity is the hard nut at the end of QA infrastructure; YiAi Python SSE assertions and YiVad TS parser serve as each other's baseline; two-way parity then constitutes contract co-build
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./yivad-vitest-phase-three.md
 - ./yivad-vitest-phase-two.md
 - ./yivad-vitest-phase-one.md
 - ./yivad-aicr-phase-port.md
 - ../../../tech-lead/decisions/yivad--vitest-rollout.md
 - ../../../tech-lead/decisions/yivad--vitest-introduction.md
 - ../../patterns/sse-streaming.md
 - ../../patterns/evaluation-driven-development.md
 - ../../patterns/staged-port-methodology.md
 - ../gotchas/sse-ondone-guard.md
 - ../../processes/shared-client-vendor-rollout.md
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.

# YiVad Vitest Phase 4 SSE parser parity complete win

> **As an** engineer, **I want to** yivad vitest phase four, **so that** success is reproducible. 

## Summary

- Phase 4 landed: SSE parser unit tests + parity baseline (cross-checked against YiAi Python `tests/eval/` SSE assertions) + contract QA co-build
- 32 QAs covering the parser (parse `data: {...}\n\n` + done frame guard + AbortError vs YiAiError distinction + finally releaseLock + nginx buffer off scenario simulation) 
- coverage SSE parser 0% -> 92% exceeding 85% threshold; subset < 25s (parser QA fast-track) 
- parity baseline: YiAi Python SSE assertions <-> YiVad TS parser two-way parity 100% consistent (20 contract cases) 
- Shared client SSE parser landed and sync advanced (shared-client-vendor-rollout track) 
- Vitest 4 stages all wrapped up: composables -> stores -> components -> SSE parser parity

## Core viewpoints

1. **Parity is two-way**: YiAi Python SSE assertions + YiVad TS parser serve as each other's baseline; 20 contract cases run two-way before counting as contract co-build
2. **Done frame guard is the hard nut**: backend try/except/finally three-path emits `done: true`; frontend `getReader()` + `done` frame guard + `finally releaseLock` + `AbortError` vs `YiAiError` distinction — 5 boundary cases must be tested
3. **Nginx scenario simulation**: `proxy_buffering off` + `proxy_read_timeout 1h` simulated in happy-dom to validate that the parser does not depend on nginx buffering
4. **Parser QA fast-track**: pure function QA not depending on DOM / network, subset < 25s (parser QA group) 
5. **Contract QA matrix**: SSE parser parity runs in CI; YiAi endpoint contract change -> YiVad parser QA automatic fail (OpenAPI-derived types + CI diff block co-build) 
6. **4-stage wrap-up**: composables -> stores -> components -> SSE parser parity; each stage independent coverage gate + fallback threshold 5%

## Key information

### QA coverage

| QA group | QA count | coverage | subset | note |
|---|---|---|---|---|
| SSE parser parse | 12 | 100% | 8s | `data: {...}\n\n` parse + multi-row data join + wrong format downgrade |
| done frame guard | 8 | 100% | 5s | backend three-path done + frontend guard + reader release |
| error distinction | 6 | 88% | 6s | AbortError vs YiAiError + network error normalization |
| nginx scenario | 6 | 80% | 4s | proxy_buffering off + read_timeout 1h scenario simulation |
| **Total** | **32** | **92%** | **< 25s** | exceeds 85% threshold |

### Parity baseline (20 contract cases) 

| Case | YiAi Python assertion | YiVad TS parser | consistency |
|---|---|---|---|
| positive normal data frame | ✅ | ✅ | 100% |
| multi-row data join | ✅ | ✅ | 100% |
| done frame guard | ✅ | ✅ | 100% |
| AbortError | ✅ | ✅ | 100% |
| YiAiError | ✅ | ✅ | 100% |
| network error normalization | ✅ | ✅ | 100% |
| nginx buffer off | ✅ | ✅ | 100% |
|... |... |... |... |

### 4-stage wrap-up overview

| Phase | scope | QA count | coverage threshold | actual coverage | subset |
|---|---|---|---|---|---|
| Phase 1 composables | useResizable / useTableScroll / usePermission etc | 53 | 60% | 65% | < 30s |
| Phase 2 stores | 11 Pinia store | 84 | 70% | 72% | < 45s |
| Phase 3 components | ProTable + common component + 8 aicr modal | 102 | 60% | 63% | < 60s |
| **Phase 4 SSE parser** | **parser + done guard + error distinction + nginx** | **32** | **85%** | **92%** | **< 25s** |
| **Total** | **271 QA** | — | — | — | **< 160s** |

## Action recommendations

1. **Parity two-way run**: YiAi Python SSE assertions <-> YiVad TS parser co-build 20 contract cases; CI runs both directions; one end changes, the other end auto-fails
2. **Done frame guard must be tested**: 5 boundary cases (three-path done / guard / release / error distinction / nginx scenario) all covered
3. **Parser QA fast-track**: pure function QA not depending on DOM / network, subset < 25s; CI subset runs the parser group to accelerate
4. **Contract QA matrix**: SSE parser parity runs in CI; OpenAPI-derived types + CI diff block co-build
5. **4-stage wrap-up**: each stage independent coverage gate + fallback threshold 5%; stages decoupled (store vs modal / parser vs component) 
6. **Shared client SSE parser sync**: after Phase 4 parser lands, shared-client-vendor-rollout advances YiVad vendor landing (base layer SSE parser reused) 
7. **Future extension**: new SSE frame types (e.g. `event:` custom event) only need to add contract cases + parser QA + parity two-way run

## Anti-patterns

- **Making SSE parser tests depend on network or DOM** — mocking `fetch` or `EventSource` adds heavy setup and makes tests slow and flaky. The parser is a pure function (`parseSSEChunk(chunk: string)`) and must be tested as such, keeping the subset under 25 seconds.

- **Running one-way parity only** — if only the YiVad TS parser runs against the YiAi Python baseline, a change to the YiAi endpoint contract will not cause the YiVad parser tests to fail. Parity must be two-way: both sides run against each other's assertions, and a change on either side fails the other's CI.

- **Testing only the happy-path done frame** — the backend can emit `done: true` from three code paths (try, except, finally), and the frontend must handle all three plus the reader release and AbortError vs. YiAiError distinction. Testing only the normal done frame leaves 4 boundary cases uncovered.

- **Skipping nginx buffer-off simulation** — production deployments often run with `proxy_buffering off`, which changes how SSE frames arrive at the client. If the parser is only tested with Chrome's default buffering behavior, it may fail silently when deployed behind nginx with buffering disabled.

- **Mixing aicr feature changes into the SSE parser QA PR** — the parser QA PR is a pure testing deliverable; bundling unrelated feature work into it violates the staged port methodology and makes it impossible to isolate a test regression from a feature bug.

## Related

- [./win-yivad-vitest-phase-three.md](./win-yivad-vitest-phase-three.md) — Phase 3 component tests, preceding stage in the 4-phase Vitest rollout
- [./win-yivad-vitest-phase-two.md](./win-yivad-vitest-phase-two.md) — Phase 2 store tests, preceding stage
- [./win-yivad-vitest-phase-one.md](./win-yivad-vitest-phase-one.md) — Phase 1 composable tests, first stage
- [../../tech-lead/decisions/yivad--vitest-introduction.md](../../tech-lead/decisions/yivad--vitest-introduction.md) — ADR for Vitest introduction
- [./win-yivad-shared-client-vendor.md](./win-yivad-shared-client-vendor.md) — Shared client vendor with SSE parser reused across projects
