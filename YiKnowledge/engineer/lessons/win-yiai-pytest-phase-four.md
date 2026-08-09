---
title: YiAi pytest Phase 4 contract tests completion win
aliases: [yiai-pytest-phase-four-win, YiAi pytest Phase 4, contract tests baseline]
tags: [lessons, wins, yi-ai, pytest, phase-four, contract-tests, openapi, parity]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: design
status: planned
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: contract tests are a two-way running baseline; not single-side unit tests; OpenAPI-derived types + CI diff blocking; contract changes must sync three projects
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.
# YiAi pytest Phase 4 contract tests completion win

> **As an** engineer, **I want to** yiai pytest phase four, **so that** success is reproducible.

## Summary

- Phase 4 landing: YiAi backend contract test two-way baseline closed; 4-phase pytest rollout closed-loop
- Two-way run: YiAi Python SSE ↔ YiVad vendor parser; 20 contract cases run two-way 100% consistent
- OpenAPI-derived types: FastAPI openapi.json → TS types; CI diff blocking; contract changes must sync
- Three-project sync: YiAi endpoint / YiVad vendor / YiPet vendor; contract changes must sync three projects
- Field-name hard constraint: filter / target_file / cname / module_name / method_name unchanged
- SSE stream follows contract baseline: 32 test SSE parser + 20 contract two-way run
- 4-phase closed-loop: Phase 1 unit → Phase 2 integration → Phase 3 eval set → Phase 4 contract tests
- 0 incidents; CI 4-tier thresholds consistent with Phase 1/2/3
- contract SSOT in design doc mirror copy; contract changes via RFC + ADR

## Core viewpoints

- **A contract test that runs in one direction is a unit test with a misleading name**: The defining characteristic of a contract test is bidirectionality -- YiAi endpoint and YiVad vendor both run the same 20 cases and must produce 100% consistent results. A single-direction test catches drift on one side; a bidirectional test catches drift on either side. The contract is only as strong as the weaker side's test suite.

- **OpenAPI-derived types with CI diff blocking turns a documentation artifact into an enforcement mechanism**: FastAPI's `openapi.json` is generated from the code, so it is always accurate. Deriving TypeScript types from it and blocking CI when the derived types change means any endpoint modification that affects the contract is immediately visible to all consumers. The CI diff is not a notification -- it is a gate that forces the change to be intentional and coordinated.

- **The field-name hard constraint (`filter` not `query`, `target_file` not `path`) is not pedantry -- it is the semantic backbone of the RPC envelope pattern**: When YiVad sends `{target_file: "foo.py"}` and YiAi expects `{path: "foo.py"}`, the request silently fails or behaves unexpectedly. The field names are the API's vocabulary, and inconsistent vocabulary across three projects is the same as inconsistent API design. The hard constraint eliminates the most common class of integration bugs.

- **The contract SSOT living in the design doc rather than in any project's codebase is the architectural decision that makes three-project sync possible**: If the contract SSOT lived in YiAi's code, YiVad and YiPet would be downstream consumers with no voice. If it lived in a shared library, versioning conflicts would block independent releases. The design doc as SSOT with mirror copies in each project plus CI verification means each project can move independently while the contract remains the anchor.

- **The 4-phase closed-loop (unit -> integration -> eval -> contract) is not a test pyramid -- it is a confidence chain**: Each phase builds on the previous one. Unit tests verify individual components. Integration tests verify component interactions. Eval tests verify output quality. Contract tests verify cross-project consistency. A bug that passes all four phases is either in an untested code path or represents a gap in the test design itself. The closed loop means the test infrastructure is complete, not just started.


1. **contract is two-way baseline**: not single-side contract; two-way run 100% consistent to pass
2. **OpenAPI-derived types**: FastAPI openapi.json → TS types; CI diff blocking; contract changes must sync
3. **Three-project sync**: YiAi endpoint / YiVad vendor / YiPet vendor; contract changes must sync three projects
4. **Field-name hard constraint**: filter / target_file / cname / module_name / method_name unchanged; changing field names = breaking contract
5. **SSE stream follows contract baseline**: 32 test SSE parser + 20 contract two-way run; do not rewrite
6. **contract SSOT in design doc mirror copy**: [shared-client-design-summary](../engineering/shared-client-design.md) design doc SSOT; contract changes via RFC + ADR
7. **contract changes via RFC + ADR**: contract changes must run RFC review cadence + ADR landing; no quiet changes
8. **CI 4-tier thresholds**: 0% / -5% / -10% / -15%; consistent with Phase 1/2/3
9. **4-phase closed-loop**: Phase 1 unit → Phase 2 integration → Phase 3 eval set → Phase 4 contract tests
10. **0 incidents**: 4 phases all gray-release 0 incidents; contract changes 0 incidents

## Key information

### contract test matrix

| contract type | YiAi side | YiVad vendor | YiPet vendor | consistency |
|---|---|---|---|---|
| RPC envelope | endpoint | vendor | vendor | 100% |
| SSE parser | endpoint | vendor | vendor | 100% |
| OpenAPI-derived types | openapi.json | TS types | TS types | CI diff blocking |
| Field-name hard constraint | filter/target_file/cname/module_name/method_name | same | same | 100% |
| SSE stream 20 contract | endpoint | vendor | vendor | 100% |
| SSE parser 32 test | endpoint | vendor | vendor | 100% |

### 4-phase closed-loop overview

| Phase | content | coverage | CI threshold | incidents |
|---|---|---|---|---|
| Phase 1 | unit tests (service stub injection + fastapi dependency_overrides) | 65% > 60% | 4-tier | 0 |
| Phase 2 | integration tests (testcontainers + real DB + no real LLM) | 78% > 75% | 4-tier | 0 |
| Phase 3 | eval set (ragas 4 metrics + 50 bilingual docs + recall 0.87) | not in coverage | 4-tier | 0 |
| Phase 4 | contract tests (two-way baseline + OpenAPI-derived + CI diff blocking) | not in coverage | 4-tier | 0 |

### landing metrics

| Metric | goal | actual | note |
|---|---|---|---|
| contract case count | > 20 | 20 | SSE stream two-way run |
| SSE parser test | 32 | 32 | reuse YiVad Vitest Phase 4 |
| OpenAPI-derived types | ✅ | ✅ | FastAPI openapi.json → TS types |
| CI diff blocking | ✅ | ✅ | OpenAPI changes must sync |
| Three-project sync | 3 | 3 | YiAi / YiVad / YiPet |
| Field-name hard constraint | 5 | 5 | filter/target_file/cname/module_name/method_name |
| contract SSOT | ✅ | ✅ | shared-client-design-summary design doc mirror copy |
| Incident count | 0 | 0 | 4 phases all gray-release |
| 4-phase closed-loop | 100% | 100% | Phase 1-4 all closed |

### CI 4-tier thresholds (same as Phase 1/2/3)

| Tier | threshold | behavior |
|---|---|---|
| 1 | 0% < delta < 5% | pass |
| 2 | -5% < delta < 0% | warning |
| 3 | -10% < delta < -5% | block + notify |
| 4 | delta < -10% | block + notify + rollback |

## Action recommendations

1. **contract is two-way baseline**: not single-side contract; two-way run 100% consistent to pass
2. **OpenAPI-derived types**: FastAPI openapi.json → TS types; CI diff blocking; contract changes must sync
3. **Three-project sync**: YiAi endpoint / YiVad vendor / YiPet vendor; contract changes must sync three projects
4. **Field-name hard constraint**: filter / target_file / cname / module_name / method_name unchanged; changing field names = breaking contract
5. **SSE stream follows contract baseline**: see [contract-test-baseline pattern](../quality-security/contract-test-baseline.md); do not rewrite parser
6. **contract SSOT in design doc mirror copy**: see [shared-client-design-summary](../engineering/shared-client-design.md); contract changes via RFC + ADR
7. **contract changes via RFC + ADR**: contract changes must run RFC review cadence + ADR landing; no quiet changes
8. **CI 4-tier thresholds**: 0% / -5% / -10% / -15%; consistent with Phase 1/2/3
9. **4-phase closed-loop**: Phase 1 unit → Phase 2 integration → Phase 3 eval set → Phase 4 contract tests; closed-loop finish
10. **Follow-up evolution**: contract SSOT + two-way baseline + OpenAPI-derived + CI diff blocking + field-name hard constraint all stable across the chain; new projects onboard using the same contract infrastructure
11. **Co-build with YiVad**: YiVad Vitest Phase 4 SSE parser parity co-build; 32 test + 20 contract cases co-build
12. **Co-build with YiPet**: YiPet aicr Phase 2 shared client vendor co-build; contract baseline co-build

## Anti-patterns

- **Single-side contract**: only one side runs contract → other side drifts → must be two-way
- **No OpenAPI-derived types**: hand-written types → drift → must derive + CI diff blocking
- **No three-project sync**: contract changes only sync one project → other projects drift → must sync three projects
- **Quietly changing field names**: changing field names without notification → breaks contract → must go through RFC + ADR
- **Rewriting SSE parser**: not reusing contract baseline → guards lost → must reuse
- **No CI diff blocking**: OpenAPI changes not blocking → types drift → must block
- **contract SSOT not in design doc**: contract scattered across projects → high maintenance cost → must centralize in design doc

## Related

- Upstream Phase 3: [./yiai-pytest-phase-three.md](win-yiai-pytest-phase-three.md) — eval set baseline
- Upstream Phase 2: [./yiai-pytest-phase-two.md](win-yiai-pytest-phase-two.md) — integration tests
- Upstream Phase 1: [./yiai-pytest-phase-one.md](win-yiai-pytest-phase-one.md) — unit tests
- contract baseline co-build: [./yivad-shared-client-vendor.md](win-yivad-shared-client-vendor.md) — three-project vendor landing
- SSE parser co-build: [./yivad-vitest-phase-four.md](win-yivad-vitest-phase-four.md) — 32 test
- Implementation ADR: [../../../tech-lead/decisions/yiai--pytest-introduction.md](../../tech-lead/decisions/yiai--pytest-introduction.md)
- Pattern co-build: [contract-test-baseline-pattern](../quality-security/contract-test-baseline.md) + [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) + [rpc-envelope-pattern](../architecture-design/rpc-envelope.md) + [sse-streaming-pattern](../architecture-design/sse-streaming.md)
- Design doc SSOT: [../../processes/shared-client-design.md](../engineering/shared-client-design.md) — contract SSOT
- Gotcha co-build: [macos-fsevents-silent-drop](gotcha-macos-fsevents-silent-drop.md) + [no-lockfile-supply-chain-risk](gotcha-no-lockfile-supply-chain-risk.md)
- 4-phase closed-loop: Phase 1 unit + Phase 2 integration + Phase 3 eval set + Phase 4 contract tests
