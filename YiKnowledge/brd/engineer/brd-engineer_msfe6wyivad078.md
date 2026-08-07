---
title: BRD-2026-078 Rsbuild 1 Migration and Build Unification
lifecycle: active
key: brd_brd-engineer_msfe6wyivad078
tags:
- engineer
- yivad
- rsbuild
- vite-migration
- l3-maturity
brd_id: BRD-2026-078
project: yivad
domain: Build Tool Migration (Vite → Rsbuild)
quarter: 2026 Q3
priority: p0
status: in_progress
owner: YiVad Frontend Platform Team
tech_stack: Rsbuild 1, Vue 3.5, Element Plus 2.14, svg-sprite, views-glob plugins
key_metrics: cold start 28s→4s (down 86%); HMR feedback 380ms→45ms (down 88%); build output 142MB→98MB (down 31%);
  build time 95s→32s (down 66%); env prefix VITE_→RSBUILD_ENV_* 100%; dropped vite features 0 compat regression
acceptance_criteria: '1. cold start <5s (5-run average)

  2. HMR feedback <50ms

  3. build output <100MB

  4. build time <35s

  5. env prefix 100% migrated to RSBUILD_ENV_*

  6. svg-sprite + views-glob plugin 100% replicated

  7. 8 new business lines 100% on new build

  8. oncall manual 100% coverage'
stakeholders: YiVad Tech Lead (decision); YiVad Frontend Platform Team 4 FTE (execution); 5 business frontend teams (consumption);
  SRE/DevOps (CI operations); architecture committee (tech review); finance (budget)
kb_path: engineer/projects/yivad/architecture
notes: Migrate Vite 8 build to Rsbuild 1, env prefix changed to RSBUILD_ENV_*, svg-sprite + views-glob custom plugin replicate features
  removed by Vite, with L3 platform maturity as goal, evolve to incremental build + remote cache (L4 100%) within 3 years. 
review_cycle: quarterly
tacit: false
related: []
---

# BRD-2026-078 Rsbuild 1 Migration and Build Unification

**BRD ID**: BRD-2026-078  |  **Project**: yivad  |  **Domain**: Build Tool Migration (Vite → Rsbuild)  |  **Quarter**: 2026 Q3
**Priority**: P0  |  **Status**: In Progress  |  **Owner**: YiVad Frontend Platform Team
**KB Source**: engineer/projects/yivad/architecture

## Context
Migrate Vite 8 build to Rsbuild 1, env prefix changed to RSBUILD_ENV_*, svg-sprite + views-glob custom plugin replicate features removed by Vite, with L3 platform maturity as goal, evolve to incremental build + remote cache (L4 100%) within 3 years. 

## Objectives & Key Metrics
cold start 28s→4s (down 86%); HMR feedback 380ms→45ms (down 88%); build output 142MB→98MB (down 31%); build time 95s→32s (down 66%); env prefix VITE_→RSBUILD_ENV_* 100%; dropped vite features 0 compat regression

## Acceptance Criteria
1. cold start <5s (5-run average)
2. HMR feedback <50ms
3. build output <100MB
4. build time <35s
5. env prefix 100% migrated to RSBUILD_ENV_*
6. svg-sprite + views-glob plugin 100% replicated
7. 8 new business lines 100% on new build
8. oncall manual 100% coverage

## Stakeholders
YiVad Tech Lead (decision); YiVad Frontend Platform Team 4 FTE (execution); 5 business frontend teams (consumption); SRE/DevOps (CI operations); architecture committee (tech review); finance (budget)

## Milestones
M1 (2026 Q3, 2 weeks): Rsbuild 1 onboarding + env prefix migration; M2 (2026 Q3, 3 weeks): svg-sprite + views-glob plugin replication; M3 (2026 Q4, 3 weeks): 8 new business lines onboarding + CI optimise; M4 (2027 Q1): incremental build pilot + 50% coverage; M5 (2027 Q3): 100% coverage + L3 achieved; M6 (2028 Q1): remote cache GA + L4 60%

## Risks
1. dropped vite features regression (P0) — custom plugin + contract test
2. env prefix missing migration (P0) — CI enforcement + lint
3. HMR compatibility (P1) — gradual rollout + rollback
4. business team refusing migration (P1) — OKR bonus incentive
5. CI cache hit rate (P2) — cache strategy optimise

## Long-term Evolution
3 years later cold start 2s, HMR 20ms, incremental build 100%; 5 years later remote cache GA, L4 100%. 

## References
- **KB Source**: `YiKnowledge/engineer/projects/yivad/architecture`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents
