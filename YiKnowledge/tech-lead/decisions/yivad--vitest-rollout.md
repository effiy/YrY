---
title: ADR — YiVad Vitest rollout implementation
aliases: [adr-vitest-rollout, yi-vad-vitest-rollout-adr, vitest-rollout]
tags: [adr, yi-vad, vitest, test, implementation, rollout, coverage]
category: tech-lead/decisions/yivad
created: 2026-08-03
updated: 2026-08-03
source: internal
type: adr
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [tech-lead, engineer]
benefit: "YiVad Vitest rollout plan is documented with phases and success criteria, enabling measured adoption"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - "consequences and reversal path are stated
related:
  - ./vitest-introduction.md
  - ../../../engineer/projects/yivad/architecture.md
  - ../../../engineer/projects/yivad/dev-standards.md
  - ../../../product-manager/projects/yivad/project-management.md
  - ../../../engineer/architecture-design/sse-streaming.md
  - ../../../engineer/architecture-design/ssot-view-layer.md
  - ../../../engineer/engineering/evaluation-driven-development.md
  - ../../../engineer/architecture-design/one-to-one-mapping-migration.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — YiVad Vitest rollout implementation

> **As a** tech lead, **I want to** vitest rollout, **so that** decision documented and reversible.

> Track landing progress of the [Vitest decision ADR](./vitest-introduction.md): 4-phase rollout (composables → stores → components → SSE parser) + coverage threshold + CI gate + parity test co-build.

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-Vitest-Rollout |
| Title | YiVad Vitest rollout implementation: 4 phases + coverage gate |
| State | InProgress (Phase 1 / 4)  |
| Date | 2026-08-03 started |
| Decision maker | YiVad lead owner |
| Reviewer | CTO, YiAi lead owner |
| Related project | YiVad (direct)  |
| Related PR | `test(vitest): phase-1 composables baseline` in progress |
| Upstream ADR | [ADR-Vitest-Introduction](./vitest-introduction.md) (decision)  |
| Review trigger | End of each phase / coverage regression > 5% / Vitest major version upgrade |

## 2. Background

- Decision ADR is set: choose Vitest 2 + @vue/test-utils + happy-dom + coverage-v8, priority composables → stores → components.
- This ADR tracks implementation: 4 phases + coverage gate per phase + SSE parser parity test co-build (with YiPet shared client SSE parser contract).
- Risk surface: Vitest major upgrades may introduce breaking changes = lock version + quarterly review.
- Blocking downstream: aicr 7-phase port parity test depends on Vitest baseline.

## 3. Decision

4-phase rollout (each phase has coverage gate + blocks merge):

| Number | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | composables tests: `useResizable` / `useTableScroll` / `usePermission` etc. | YiVad `src/composables/` | One-shot, coverage threshold 60% |
| 2 | stores tests: 11 Pinia stores + state mutation + action side effects | YiVad `src/stores/` | Follows #1, coverage threshold 70% |
| 3 | components tests: ProTable / common components / 8 modals | YiVad `src/components/` | Follows #2, coverage threshold 60% |
| 4 | SSE parser tests: shared client `sseStream` + `done` frame guard + abort distinction + reader release | YiVad `src/api/shared/` + co-build with YiPet | Follows #3, parity test co-built with YiPet |

## 4. Alternatives

| Alternative | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. 4-phase rollout | Current approach | Clear priorities; gate per phase; does not block aicr parity | Long cadence | ✅ Selected |
| B. One-shot all-at-once | Write all modules at once | Fast | No gate; hard to localize failures | ❌ Rejected |
| C. Test components only | Skip composables / stores | UI tests more intuitive | No foundation layer guarantee; regression hard to locate | ❌ Rejected |

## 5. Evaluation dimensions

| Dimension | Goal | Current state |
|---|---|---|
| coverage | composables 60% / stores 70% / components 60% | Phase 1 started |
| CI gate | coverage regression > 5% blocks | Configured |
| SSE parser parity | Consistent with YiPet shared client contract | Phase 4 |
| aicr parity test | 7-phase port baseline alignment | Phase 4 co-build |
| Runtime | Full test suite < 3 min | Phase 1 running |

## 6. Risk

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Vitest major breaking change | Low | Medium | Lockfile pins version + quarterly review |
| happy-dom vs browser behavior gap | Medium | Medium | Add e2e (Playwright) on key paths to supplement |
| coverage regression | Medium | Medium | CI gate blocks |
| SSE parser parity drift | Medium | High | Phase 4 co-build with YiPet + contract test |
| Test runtime exceeds 3 min | Medium | Medium | Subset / parallel run |

## 7. Rollback

Independent rollback per phase:
- Phase 1 failure: delete composables tests + adjust coverage threshold
- Phase 2 failure: delete stores tests + keep Phase 1
- Phase 3 failure: delete components tests + keep Phase 1-2
- Phase 4 failure: delete SSE parser tests + keep Phase 1-3 + YiPet co-build portion rolled back separately

## 8. Implementation plan

```
Phase 1 (composables tests) 🔄 in progress
  - useResizable / useTableScroll / usePermission
  - coverage threshold 60%
  - estimated to complete within 1 week

Phase 2 (stores tests) ⏳
  - 11 Pinia stores
  - state mutation + action side effects
  - coverage threshold 70%

Phase 3 (components tests) ⏳
  - ProTable / common components / 8 modals
  - coverage threshold 60%

Phase 4 (SSE parser + parity) ⏳
  - sseStream + done frame guard + abort distinction + reader release
  - co-build SSE parser contract test with YiPet shared client
  - aicr 7-phase port parity test baseline
```

## 9. Follow-up tracking metrics

- coverage: composables / stores / components three-layer coverage
- CI: test runtime / coverage regression rate / number of blocked PRs
- SSE parser: parity test pass rate (consistent with YiPet contract)
- aicr parity: 7-phase port baseline alignment rate

## 10. Methodology reusability

- 4-phase rollout + coverage gate per phase = general test rollout methodology
- Priority composables → stores → components = foundation first
- SSE parser parity co-build = cross-project contract test pattern (see [sse-streaming-pattern](../../../engineer/architecture-design/sse-streaming.md))
- parity test baseline = staged port methodology co-build (see [staged-port-methodology-pattern](../../../engineer/architecture-design/staged-port-methodology.md) + [one-to-one-mapping-migration-pattern](../../../engineer/architecture-design/one-to-one-mapping-migration.md))

## 11. Coupling with other ADRs

- Upstream decision: [ADR-Vitest-Introduction](./vitest-introduction.md)
- Co-build: [ADR-AICR-Phase-Port](./aicr-phase-port.md) (parity test + Vitest co-build)
- Contract: [shared-client-design-summary](../../../engineer/engineering/shared-client-design.md) (SSE parser + RPC envelope base layer)
- SSE guard: [sse-ondone-guard gotcha](../../../engineer/lessons/gotcha-sse-ondone-guard.md)
- YiAi co-build: [ADR-Pytest-Introduction](../yiai/pytest-introduction.md) (§SSE assertion co-build) + [ADR-LLM-Multi-Provider-Rollout](../yiai/llm-multi-provider-rollout.md) (endpoint contract alignment)
- YiPet co-build: [ADR-Biome-Lint-Format](../yipet/biome-lint-format.md) + [ADR-Chrome-Manifest-Dual-World-Boundary](../yipet/chrome-manifest-dual-world-boundary.md) (dual world message test co-build)

## 12. References

- [ADR template](../../../knowledge-curator/templates/adr.md)
- [YiVad architecture overview](../../../engineer/projects/yivad/architecture.md)
- [YiVad development standards](../../../engineer/projects/yivad/dev-standards.md)
