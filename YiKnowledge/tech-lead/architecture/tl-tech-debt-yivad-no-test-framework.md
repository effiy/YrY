---
title: YiVad No Test Framework
lifecycle: active
status: stable
key: tl_tech-debt_yivad_no_test_framework
tags:
- yivad
- test
- vitest
- quality
domain: test
severity: medium
repayment_cost: '5'
type: summary
category: tech-lead/architecture
created: 2026-08-07
updated: 2026-08-07
source: internal
roles:
- tech-lead
benefit: Tech leads can evaluate architectural choices with structured criteria, keeping the system coherent as it evolves
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
review_cycle: quarterly
tacit: false
related:
  - ./dashboard-architecture-review.md
  - ./design-architecture-decision.md
  - ./tl-dora-metrics-2026-q2-baseline.md
  - ../README.md
  - ../INDEX.md
---

# Tech Debt — YiVad No Test Framework

> **As a** tech lead, **I want to** tl_tech debt_yivad_no_test_framework, **so that** architecture stays coherent.

## Debt Item

- YiVad (Vue 3.5 SPA) currently has no test framework (Vitest to be introduced).
- History: early PoC stage skipped tests for fast iteration.
- Current: relies on manual smoke + pre-commit lint.
- Related: an ADR-Vitest-Rollout plan exists, but not landed.

## Classification

- **Type:** Deliberate (early trade-off) → now Reckless.
- **Domain:** Test
- **Severity:** Medium — affects specific modules (SSE parser / ProTable / state management without regression protection).

## Impact

- **Interest rate:** about 1.5 person-days/mo (per-regression investigation + manual verification cost for store/component changes).
- **Affected modules:** SSE parser (streamChat / onChunk / onDone), ProTable, Pinia stores (aiChat, knowledge, rag, story).
- **Downstream effects:** store/component changes rely on manual verification; jsxDEV / SSE onDone guard bugs lack contract-test protection.

## Repayment Plan

- **Estimated cost:** 5 person-days (Vitest introduction + SSE parser contract tests + ProTable render tests).
- **Approach:** progressive — first Vitest baseline + SSE parser contract tests (cover onDone aborted guard), then add tests per PR.
- **Target quarter:** 2026 Q3.
- **Dependencies:** ADR-Vitest-Rollout review approved.

## Verification

- `vitest run` pass rate 100%.
- SSE parser contract tests cover onDone / onError / onChunk guards.
- Key store (aiChat) coverage ≥ 30%.

---
> References: YiKnowledge → projects/YiVad/adr-vitest-rollout.md | tech/infra/tech-debt-inventory-template.md
