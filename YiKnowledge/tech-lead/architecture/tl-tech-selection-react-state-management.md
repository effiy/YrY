---
title: React State Management (YiPet) — Zustand 5 vs Redux Toolkit
lifecycle: active
key: tl_tech-selection_react_state_management
tags:
- tech-selection
- react
- state
- zustand
- yipet
capability: React State Management
status: stable
evaluator: YiPet lead owner
candidates: Zustand 5, Redux Toolkit, Jotai, Valtio
conclusion: Zustand 5 — concise + persist + cross-world fit
adr_ref: ADR-YiPet-AICR-Port-Rollout
type: summary
category: tech-lead/architecture
created: 2026-08-07
updated: 2026-08-07
source: internal
roles:
- tech-lead
- engineer
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

# Tech Selection — React State Management (YiPet)

> **As a** tech lead, **I want to** tl_tech selection_react_state_management, **so that** architecture stays coherent. 

## Context

The YiPet aicr port needs to migrate YiVad's 9 Pinia stores to their React equivalents. Which React state management solution should we choose?

> **Note (2026-08-07)**: The YiVad aicr port (the baseline for this migration) has not been landed on YiVad master. This ADR is a technology selection reference for when the dependency is resolved.

## Non-Negotiable Constraints

- Must support a setup-function style concise API (align with the Pinia mental model).
- Must support persistence (chrome.storage for MV3).
- Must support TypeScript as a first-class citizen.
- Must support cross-world (content / background / popup) synchronization.

## Candidates

| Candidate | Type | License | Community | Notes |
|-----------|------|---------|-----------|-------|
| Zustand 5 | functional | MIT | mature | concise; persist middleware |
| Redux Toolkit | opinionated | MIT | very mature | boilerplate; strong DevTools |
| Jotai | atomic | MIT | mature | atom-based; suited to fine granularity |
| Valtio | proxy | MIT | mature | Vue-like reactive class |

## Evaluation Matrix (1-5 score, weighted)

| Dimension | Weight | Zustand | Redux Toolkit | Jotai | Valtio |
|-----------|--------|----------|---------------|-------|--------|
| Performance | 0.25 | 5 | 4 | 5 | 4 |
| Cost (3yr TCO) | 0.2 | 5 | 3 | 4 | 4 |
| Ecosystem | 0.15 | 4 | 5 | 4 | 3 |
| Maintainability | 0.2 | 5 | 3 | 4 | 4 |
| Risk | 0.2 | 5 | 4 | 4 | 3 |
| **Weighted Total** | | **4.85** | **3.7** | **4.25** | **3.65** |

## PoC Results

YiPet aicr Phase 4 plan: map the 9 Pinia stores 1:1 to Zustand stores + persist middleware (chrome.storage). A PoC of one store (aicr/chat) confirms feasibility.

## Decision

- **Selected:** Zustand 5
- **Fallback:** Jotai (if Zustand persist struggles across worlds)
- **Rationale:** Concise API + persist middleware + cross-world chrome.storage fit. The Pinia → Zustand mental model is consistent.

## Review Trigger

- After Phase 4 lands, evaluate whether cross-world synchronization is stable.
- After Zustand 6 is released, evaluate an upgrade.

---
> References: YiKnowledge → projects/YiPet/adr-aicr-port-rollout.md | methodology/engineering-patterns/one-to-one-mapping-migration-pattern.md
