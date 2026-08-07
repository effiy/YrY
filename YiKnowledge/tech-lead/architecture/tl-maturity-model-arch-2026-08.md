---
title: Architecture Maturity 2026-08
lifecycle: active
status: stable
key: tl_maturity-model_arch_2026_08
tags:
- maturity
- architecture
practice_area: arch
current_level: l3
target_level: l4
type: dashboard
category: tech-lead/architecture
roles:
- tech-lead
benefit: Tech leads can evaluate architectural choices with structured criteria, keeping the system coherent as it evolves
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"review_cycle: quarterly
tacit: false
related:
  - ./dashboard-architecture-review.md
  - ./design-architecture-decision.md
  - ./tl-dora-metrics-2026-q2-baseline.md
  - ../README.md
  - ../INDEX.md
---

# Maturity Assessment — Architecture

> **As a** tech lead, **I want to** tl_maturity model_arch_2026_08, **so that** architecture stays coherent. 

## Practice Area

Architecture

## Current State

- **Current level: ** L3 — Defined / Standardised
- **Evidence: 
  - All three projects have architecture-summary.md + functional-modules-summary.md + dev-standards-summary.md (YiKnowledge accumulated).
  - Cross-project RPC envelope contract unified (CLAUDE.md SSOT).
  - Shared client base layer design (work/processes/shared-client-design-summary.md).
  - 9 ADR items accumulated (YiPet 3 + YiVad 3 + YiAi 6).
  - Weakness: contract documentation scattered (CLAUDE.md / YiKnowledge / code comments three places), no machine-validatable schema. 

## Target State

- **Target level: ** L4 — Measured
- **Rationale: ** L3 → L4 requires OpenAPI schema auto-generated + architecture fitness function auto-validation. 

## Gap Analysis

| Capability | L1 | L2 | L3 | L4 | L5 | Current | Target | Gap |
|------------|----|----|----|----|----|---------|--------|-----|
| Architecture summary | ✓ | | | | | ✓ | ✓ | 0 |
| ADR registry | | ✓ | | | | ✓ | ✓ | 0 |
| Contract schema SSOT | | | ✓ | | | ✗ | ✓ | 1 |
| Fitness function | | | | ✓ | | ✗ | ✓ | 1 |

## Improvement Plan

| # | Action | From → To | Effort | Timeline | Owner |
|---|--------|-----------|--------|----------|-------|
| 1 | YiAi Pydantic schema → OpenAPI export | L3 → L4 | 2 d | 2026 Q4 | YiAi backend |
| 2 | Frontend types auto-generated (openapi-typescript)  | L3 → L4 | 2 d | 2026 Q4 | YiVad primary owner |
| 3 | Architecture fitness function (dependency-direction lint)  | L4 → L5 | 3 d | 2027 Q1 | CTO |

## Progress Tracking

- **Assessment date: ** 2026-08-03
- **Next review: ** 2026-11-30

---
> References: YiKnowledge → projects/YiAi/architecture-summary.md | projects/YiVad/architecture-summary.md | projects/YiPet/architecture-summary.md
> Maturity levels: L1=Ad-hoc | L2=Managed | L3=Defined | L4=Measured | L5=Optimising
