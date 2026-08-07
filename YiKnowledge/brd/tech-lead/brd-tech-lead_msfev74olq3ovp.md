---
title: ADR — YiVad Vitest rollout implementation
lifecycle: active
key: brd_brd-tech-lead_msfev74olq3ovp
tags:
- adr
- yi-vad
- vitest
- rollout
- coverage
adr_id: ADR-Vitest-Rollout
project: yivad
domain: Vitest Rollout
decision_type: process
team_size: 4
status: in_progress
owner: YiVad lead owner
review_cycle: quarterly
kb_path: tech-lead/decisions/yivad/vitest-rollout.md
context: "Track the Vitest decision ADR landing progress. 4-phase rollout: composables → stores → components → SSE parser. Coverage threshold + CI gate + parity test co-build."
decision: "4-phase rollout: Phase 1 composables baseline (useTable / useTheme etc.); Phase 2 stores (global / user / auth / tabs); Phase 3 components (ProTable / SearchForm); Phase 4 SSE parser contract test. Each phase has an 80% coverage gate + CI blocking."
alternatives: B. One-shot full rollout — blocks PRs; C. Per-file granularity — high coordination cost. A selected (4 phases).
risks: 1. composables mock complexity — Vue 3 reactivity mock; 2. stores tests depend on Pinia plugin — standardize test setup; 3. component snapshot drift — theme/icon changes; 4. SSE parser contract drift — three-way co-build (YiAi/YiVad/YiPet).
rollback: Phase failure → revert to previous phase + fix + retry (1 business day).
stakeholders: YiVad lead owner (decision); CTO (approval); YiAi lead owner (contract co-build); QA
tacit: false
related: []
---

# ADR — YiVad Vitest rollout implementation

**ADR ID**: ADR-Vitest-Rollout  |  **Project**: yivad  |  **Domain**: Vitest Rollout
**Decision Type**: process  |  **Team Size**: 4  |  **Status**: in_progress  |  **Owner**: YiVad lead owner
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yivad/vitest-rollout.md

## Context
Track the Vitest decision ADR landing progress. 4-phase rollout: composables → stores → components → SSE parser. Coverage threshold + CI gate + parity test co-build.

## Decision
4-phase rollout: Phase 1 composables baseline (useTable / useTheme etc.); Phase 2 stores (global / user / auth / tabs); Phase 3 components (ProTable / SearchForm); Phase 4 SSE parser contract test. Each phase has an 80% coverage gate + CI blocking.

## Alternatives
B. One-shot full rollout — blocks PRs; C. Per-file granularity — high coordination cost. A selected (4 phases).

## Risks & Mitigations
1. composables mock complexity — Vue 3 reactivity mock; 2. stores tests depend on Pinia plugin — standardize test setup; 3. component snapshot drift — theme/icon changes; 4. SSE parser contract drift — three-way co-build (YiAi/YiVad/YiPet).

## Rollback Plan
Phase failure → revert to previous phase + fix + retry (1 business day).

## Stakeholders
YiVad lead owner (decision); CTO (approval); YiAi lead owner (contract co-build); QA

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yivad/vitest-rollout.md`
