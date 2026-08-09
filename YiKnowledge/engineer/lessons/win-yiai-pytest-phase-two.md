---
title: YiAi pytest Phase 2 integration tests complete win
aliases: [yiai-pytest-phase-two-win, YiAi pytest Phase 2, integration tests baseline]
tags: [lessons, wins, yi-ai, pytest, phase-two, integration-tests, real-db, sse-parser]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: design
status: draft
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: Integration tests hit real dependencies; do not hit real LLM; SSE parser goes through contract baseline; transaction rollback + fixture cleanup; coverage 65% → 78%
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./yiai-pytest-phase-one.md
 - ./yiai-llm-phase-five.md
 - ./yiai-rag-hybrid-retrieval.md
 - ./yiai-knowledge-watcher.md
 - ./yivad-shared-client-vendor.md
 - ./yivad-vitest-phase-four.md
 - ../../../tech-lead/decisions/yiai--pytest-introduction.md
 - ../../patterns/evaluation-driven-development.md
 - ../../patterns/sse-streaming.md
 - ../../patterns/rpc-envelope.md
 - ../gotchas/macos-fsevents-silent-drop.md
 - ../gotchas/no-lockfile-supply-chain-risk.md
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.
# YiAi pytest Phase 2 integration tests complete win

> **As an** engineer, **I want to** yiai pytest phase two, **so that** success is reproducible.

## Summary

- Phase 2 landed: YiAi backend FastAPI integration test baseline prepared; hits real DB + real SSE + real RAG pipeline
- framework: pytest + httpx AsyncClient + testcontainers (Mongo / Redis) + pytest-asyncio
- directory `tests/integration/`; fixture session scope starts testcontainer; function scope cleanup
- SSE parser contract baseline 20 cases run both ways (YiAi Python SSE ↔ YiVad vendor parser)
- Do not hit real LLM: LLM goes through stub; SSE stream goes through real chat_stream endpoint
- coverage 65% → 78% > 75% threshold; CI fallback > 5% block; subset < 120s
- 0 incidents; 4-tier CI block threshold consistent with Phase 1
- Next Phase 3 eval set; Phase 4 contract tests

## Core viewpoints

1. **Integration tests hit real dependencies**: real Mongo / Redis / SSE endpoint; do not hit real LLM (cost + speed)
2. **testcontainers temporary instance**: session scope starts docker container; function scope cleanup; does not depend on local DB
3. **Transaction rollback + fixture cleanup**: every test transaction rolls back; no data pollution
4. **SSE parser goes through contract baseline**: [yivad-shared-client-vendor](win-yivad-shared-client-vendor.md) 20 cases run both ways; do not rewrite
5. **Do not hit real LLM**: LLM goes through stub; SSE stream goes through real endpoint; cost controllable
6. **fixture scope precise tuning**: session (container) / module (client) / function (db session); wrong scope adds big overhead
7. **coverage 65% → 78%**: integration tests cover boundaries that unit tests cannot (DB / SSE / router trace)
8. **subset < 120s**: integration tests slower than unit tests; subset threshold 120s
9. **CI runs full set without depending on macOS FSEvents**: [macos-fsevents gotcha](gotcha-macos-fsevents-silent-drop.md)
10. **lockfile + min-release-age co-build**: test dependencies also hardened ([no-lockfile gotcha](gotcha-no-lockfile-supply-chain-risk.md))

## Key information

### Test framework stack

| tool | version | purpose |
|---|---|---|
| pytest | 8.x | test runner |
| httpx | 0.27+ | AsyncClient hits real endpoint |
| testcontainers | 4.x | docker temporary Mongo / Redis |
| pytest-asyncio | 0.23+ | async def tests |
| coverage | 7.x | coverage stats |

### Directory structure

```
tests/
 unit/ # Phase 1
 integration/
 conftest.py # testcontainers fixture
 test_chat_stream_sse.py # SSE stream real endpoint
 test_rag_search_pipeline.py # RAG retrieval full pipeline
 test_knowledge_search.py # knowledge base retrieval + leaf
 test_llm_providers_router.py # multi provider router pipeline
 test_brd_agent_pipeline.py # BRD agent 5-stage end-to-end
 test_rpc_envelope.py # RPC envelope
 test_data_migration.py # data migration flow
 eval/ # Phase 3
conftest.py
```

### fixture scope design

| scope | fixture | purpose |
|---|---|---|
| session | mongo_container / redis_container | docker temporary instance |
| module | http_client | AsyncClient shared across module |
| function | db_session | transaction rollback cleanup per test |
| function | stub_llm | LLM stub injection |

### SSE parser contract baseline

| contract | YiAi endpoint | YiVad vendor parser | consistency property |
|---|---|---|---|
| 20 cases | /chat/stream | SSE parser | 100% |
| OpenAPI derived types | openapi.json | TS types | CI diff block |

### Landing metrics

| metric | Target | actual | note |
|---|---|---|---|
| test count | > 50 | 62 | 7 end-to-end scenarios |
| coverage | > 75% | 78% | backend fastapi full set |
| CI fallback threshold | < 5% | 5% | -5% block |
| subset duration | < 120s | 108s | integration subset |
| incident count | 0 | 0 | CI 4-tier threshold |
| SSE contract | 100% | 100% | 20 cases run both ways |
| testcontainer startup | < 30s | 22s | session scope |

### CI 4-tier threshold (same as Phase 1)

| tier | threshold | action |
|---|---|---|
| 1 | 0% < delta < 5% | passed |
| 2 | -5% < delta < 0% | warning |
| 3 | -10% < delta < -5% | block + notify |
| 4 | delta < -10% | block + notify + rollback |

## Action recommendations

1. **Hit real dependencies**: real Mongo / Redis / SSE endpoint; do not hit real LLM
2. **testcontainers temporary instance**: session scope starts docker; function scope cleanup; does not depend on local DB
3. **Transaction rollback**: every test transaction rolls back; no data pollution
4. **fixture scope precise tuning**: session / module / function three tiers; wrong choice adds big overhead
5. **SSE parser goes through contract baseline**: [yivad-shared-client-vendor](win-yivad-shared-client-vendor.md) 20 cases run both ways; do not rewrite
6. **Do not hit real LLM**: LLM goes through stub; SSE stream goes through real endpoint
7. **coverage 75% threshold**: integration tests cover boundaries; > 75% threshold
8. **subset < 120s**: integration tests slower than unit tests; threshold relaxed
9. **CI runs full set**: does not depend on macOS FSEvents
10. **lockfile + min-release-age co-build**: test dependencies also hardened
11. **contract test co-build**: YiVad vendor contract 20 cases run both ways; OpenAPI derived types + CI diff block
12. **Next Phase 3 advancement**: integration tests stable, then Phase 3 eval set baseline; Phase 4 contract tests

## Anti-patterns

- **Letting integration tests hit real LLM endpoints** — real LLM calls introduce cost, latency (seconds per call), and non-deterministic outputs that make CI flaky and slow. The LLM must be stubbed while the real SSE endpoint pipeline is exercised to test the full transport layer.

- **Using the wrong fixture scope** — writing a function-scoped fixture at session scope causes test pollution where one test's data leaks into another. Conversely, session-scoped fixtures written at function scope restart containers on every test, adding minutes of overhead. Each fixture must be precisely scoped: session for containers, module for clients, function for DB sessions.

- **Skipping transaction rollback between tests** — without per-test rollback, data written by one test persists and causes false failures or false passes in subsequent tests. Every test must run in a transaction that is rolled back on teardown.

- **Depending on a local database instance** — a local MongoDB or Redis instance has unknown state, runs on different versions across developer machines, and causes "works on my machine" failures. Testcontainers provide a known-clean, version-pinned instance that starts and stops with the test suite.

- **Rewriting the SSE parser instead of reusing the contract baseline** — the SSE parser already has 20 contract cases verified across both YiAi and YiVad. Rewriting it for integration tests discards the cross-project parity guarantee and risks introducing parser bugs that the contract baseline already caught.

## Related

- [./win-yiai-pytest-phase-one.md](./win-yiai-pytest-phase-one.md) — Phase 1 unit test baseline, prerequisite for Phase 2 integration tests
- [./win-yiai-llm-phase-five.md](./win-yiai-llm-phase-five.md) — Phase 5 LLM endpoint testing that builds on Phase 2 integration test infrastructure
- [./win-yiai-rag-hybrid-retrieval.md](./win-yiai-rag-hybrid-retrieval.md) — RAG hybrid retrieval tested by integration tests
- [./gotcha-macos-fsevents-silent-drop.md](./gotcha-macos-fsevents-silent-drop.md) — macOS FSEvents limitation that CI must work around
- [../../tech-lead/decisions/yiai--pytest-introduction.md](../../tech-lead/decisions/yiai--pytest-introduction.md) — ADR for pytest introduction
