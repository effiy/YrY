---
title: 2026 Q4 Roadmap Preview
lifecycle: active
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
key: tl_roadmap-review_2026_q4_preview
tags:
- roadmap
- quarterly
- 2026-q4
- preview
quarter: 2026 Q4
initiative: Yi family Q4 — CI/CD baseline + multi-provider Phase 2 + aicr parity automation
  + test coverage 30%
priority: p1
status: stable
owner: CTO
category: tech-lead/roadmap
roles:
- tech-lead
- executive
benefit: Tech leads can align quarterly roadmap reviews with business priorities and capacity constraints
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
review_cycle: quarterly
tacit: false
related:
  - ./dashboard-roadmap-progress.md
  - ./decommission-a-service.md
  - ./define-an-slo.md
  - ../README.md
  - ../INDEX.md
---

# Roadmap Review — 2026 Q4 Preview

> **As a** tech lead, **I want to** tl_roadmap review_2026_q4_preview, **so that** roadmap aligned. 

## Initiative

Yi family Q4 focus: CI/CD baseline landing + multi-provider Phase 2 + aicr parity test automation + test coverage 30%. 

## Investment Distribution (Q4 preview)

| Domain | Investment (person-months) | vs Q3 | Strategic Alignment (1-5) |
|--------|---------------------------|-------|---------------------------|
| Platform (CI/CD + LLM multi-provider) | 4 | +33% | 5 |
| Middleware (test framework + contract test) | 2 | +100% | 5 |
| Business (aicr parity automation) | 1 | -50% | 4 |
| Infrastructure (deploy runbook + monitoring) | 1.5 | flat | 5 |

## Milestone Alignment (Q4)

| Milestone | Target Date | Status | Blocker? |
|-----------|-------------|--------|----------|
| Gitea Actions baseline (lint + build) three ends | 2026-10-31 | Planned | none |
| YiAi pytest + keypath coverage 30% | 2026-11-30 | Planned | pytest ADR landing |
| YiVad Vitest + SSE contract test | 2026-10-31 | Planned | Vitest ADR landing |
| YiAi LLM Multi-Provider Phase 2 (routing + fallback) | 2026-11-15 | Planned | Phase 1 done |
| YiAi Multi-Provider Phase 3 (cost dashboard) | 2026-12-15 | Planned | Phase 2 done |

## Risks & Blockers

- ADR-LLM-Multi-Provider-Rollout Phase 2 contract design depends on Phase 1 measured data. 
- Vitest / pytest ADR review if lagging, CI gate landing delayed. 
- YiAi GPU utilization peak 95%+ when cloud fallback must be ready. 

## Decision

- **Keep:** CI/CD baseline + multi-provider Phase 2 + test coverage. 
- **Adjust:** aicr Phase 5 parity test automation moved to end of Q4. 
- **Drop:** none. 

## Next Quarter Preview (2027 Q1)

- YiAi multi-provider Phase 4 (self-hosted vLLM PoC). 
- YiVad SSR exploration (SEO driven). 
- YiPet aicr Phase 6 (card / chart view React rewrite done + parity 100%). 
