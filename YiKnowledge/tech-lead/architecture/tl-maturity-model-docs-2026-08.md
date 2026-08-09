---
title: Documentation Maturity 2026-08
lifecycle: active
status: stable
key: tl_maturity-model_docs_2026_08
tags:
- maturity
- docs
practice_area: docs
current_level: l3
target_level: l4
type: dashboard
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

# Maturity Assessment — Documentation

> **As a** tech lead, **I want to** tl_maturity model_docs_2026_08, **so that** architecture stays coherent. 

## Practice Area

Documentation

## Current State

- **Current level: ** L3 — Defined / Standardised
- **Evidence: 
  - YiKnowledge has established 4 diagrams + PARA + lifecycle cadence layer + _journeys scenario entry. 
  - Each project has all 4 dimensions: architecture-summary / functional-modules / dev-standards / project-management. 
  - 9 ADRs + 6 wins + 5 gotchas have been captured. 
  - onboarding.md 8 sections are standardised. 
  - Weakness: docs and code drift detection is missing; README / CLAUDE.md still require manual sync. 

## Target State

- **Target level: ** L4 — Measured
- **Rationale: ** L4 requires doc-coverage metrics + drift lint. 

## Gap Analysis

| Capability | L1 | L2 | L3 | L4 | L5 | Current | Target | Gap |
|------------|----|----|----|----|----|---------|--------|-----|
| Architecture summary | ✓ | | | | | ✓ | ✓ | 0 |
| ADR registry | | ✓ | | | | ✓ | ✓ | 0 |
| Onboarding template | | | ✓ | | | ✓ | ✓ | 0 |
| Doc-code drift lint | | | | ✓ | | ✗ | ✓ | 1 |
| Doc coverage metric | | | | ✓ | | ✗ | ✓ | 1 |

## Improvement Plan

| # | Action | From → To | Effort | Timeline | Owner |
|---|--------|-----------|--------|----------|-------|
| 1 | doc-code drift lint (README link + file existence)  | L3 → L4 | 2 d | 2026 Q4 | CTO |
| 2 | doc coverage metrics (per-module README + public API doc coverage)  | L3 → L4 | 3 d | 2026 Q4 | Each project |
| 3 | CI enforces ADR related (PRs involving architecture changes must link an ADR)  | L4 → L5 | 2 d | 2027 Q1 | CTO |

## Progress Tracking

- **Assessment date: ** 2026-08-03
- **Next review: ** 2026-11-30

---
> References: YiKnowledge → projects/<name>/onboarding.md | work/onboarding/
> Maturity levels: L1=Ad-hoc | L2=Managed | L3=Defined | L4=Measured | L5=Optimising
