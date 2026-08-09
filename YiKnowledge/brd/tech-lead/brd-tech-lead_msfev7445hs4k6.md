---
title: ADR — YiVad introduces Vitest testing infrastructure
lifecycle: active
key: brd_brd-tech-lead_msfev7445hs4k6
tags:
- adr
- yi-vad
- vitest
- testing
adr_id: ADR-Vitest-Introduction
project: yivad
domain: Frontend Testing
decision_type: process
team_size: 4
status: accepted
owner: YiVad primary owner + architecture team
review_cycle: quarterly
kb_path: tech-lead/decisions/yivad/vitest-introduction.md
context: YiVad project management §blocker "no Vitest, high regression risk". retrospective Try item "Vitest introduction (composable + store priority)" pending. Vue
  3 + Composition API ecosystem recommends Vitest. 
decision: introduce Vitest 2 + `@vue/test-utils` + `happy-dom` + `@vitest/coverage-v8`; priority
  composables → stores → components. coverage threshold phased increase 50% → 80%. 
alternatives: B. Jest — weak Vue 3 support; C. no testing — high regression risk. A selected (Vitest). 
risks: 1. happy-dom drift vs browser behavior — use jsdom fallback for key scenarios; 2. complex composables test — mock Vue 3 reactivity; 3.
  coverage blocks PR — phased threshold increase. 
rollback: Vitest exception → keep manual test + fix + re-enable (1 workday). 
stakeholders: YiVad primary owner + architecture team (decision); CTO (approval); QA; frontend lead
tacit: false
related: []
type: reference
---

# ADR — YiVad introduces Vitest testing infrastructure

**ADR ID**: ADR-Vitest-Introduction  |  **Project**: yivad  |  **Domain**: Frontend Testing
**Decision Type**: process  |  **Team Size**: 4  |  **Status**: accepted  |  **Owner**: YiVad primary owner + architecture team
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yivad/vitest-introduction.md

## Context
YiVad project management §blocker "no Vitest, high regression risk". retrospective Try item "Vitest introduction (composable + store priority)" pending. Vue 3 + Composition API ecosystem recommends Vitest. 

## Decision
Introduce Vitest 2 + `@vue/test-utils` + `happy-dom` + `@vitest/coverage-v8`; priority composables → stores → components. coverage threshold phased increase 50% → 80%. 

## Alternatives
B. Jest — weak Vue 3 support; C. no testing — high regression risk. A selected (Vitest). 

## Risks & Mitigations
1. happy-dom drift vs browser behavior — use jsdom fallback for key scenarios; 2. complex composables test — mock Vue 3 reactivity; 3. coverage blocks PR — phased threshold increase. 

## Rollback Plan
Vitest exception → keep manual test + fix + re-enable (1 workday). 

## Stakeholders
YiVad primary owner + architecture team (decision); CTO (approval); QA; frontend lead

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yivad/vitest-introduction.md`
