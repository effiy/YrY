---
title: BRD-2026-079 aiChat Port and Streaming SSE Experience Unified
lifecycle: active
key: brd_brd-engineer_msfe6wyivad079
tags:
- engineer
- yivad
- aichat
- sse
- session-chat
- l3-maturity
brd_id: BRD-2026-079
project: yivad
domain: aiChat Port & SSE Streaming UX
quarter: 2026 Q3
priority: p0
status: in_progress
owner: YiVad Frontend Platform Team
tech_stack: Vue 3.5, Element Plus, SSE, axios, YiAi sessionChat
key_metrics: Message actions missing 5 items → 0 items (down 100%); streaming interruption recovery 0% → 100% (up 100pp); first token 1.8s → 0.8s (down
  56%); scroll lag 23 times/day → 0 times/day (down 100%); sessionChat compatibility rate 0% → 100%
acceptance_criteria: '1. 5 message actions 100% ported (regenerate/retry/resend/delete/edit)

  2. Streaming interruption 100% recovery

  3. First token <1 second

  4. Scroll lag 0 times (3 consecutive months)

  5. sessionChat 100% compatible

  6. streamingType + aborted flag 100% implemented

  7. 8 new business items 100% onboarded to new process

  8. oncall handbook 100% coverage'
stakeholders: YiVad Tech Lead (Decision); YiVad Frontend Platform Team 4 FTE (execution); YiAi Backend
  Team (integration); 5 business frontend teams (consumption); SRE/DevOps (ops); Architecture committee (technology review)
kb_path: engineer/projects/yivad/functional-modules
notes: Port YiWeb sessionChat fully to YiVad aiChat, unify 5 message actions + streamingType + aborted
  flag + scrollTick, with L3 Platform maturity as target, evolve to unified AI conversation component library (L4 100%) within 3 years.
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# BRD-2026-079 aiChat Port and Streaming SSE Experience Unified

**BRD ID**: BRD-2026-079  |  **Project**: yivad  |  **Domain**: aiChat Port & SSE Streaming UX  |  **Quarter**: 2026 Q3
**Priority**: P0  |  **Status**: In Progress  |  **Owner**: YiVad Frontend Platform Team
**KB Source**: engineer/projects/yivad/functional-modules

## Context
Port YiWeb sessionChat fully to YiVad aiChat, unify 5 message actions + streamingType + aborted flag + scrollTick, with L3 Platform maturity as target, evolve to unified AI conversation component library (L4 100%) within 3 years.

## Objectives & Key Metrics
Message actions missing 5 items → 0 items (down 100%); streaming interruption recovery 0% → 100% (up 100pp); first token 1.8s → 0.8s (down 56%); scroll lag 23 times/day → 0 times/day (down 100%); sessionChat compatibility rate 0% → 100%

## Acceptance Criteria
1. 5 message actions 100% ported (regenerate/retry/resend/delete/edit)
2. Streaming interruption 100% recovery
3. First token <1 second
4. Scroll lag 0 times (3 consecutive months)
5. sessionChat 100% compatible
6. streamingType + aborted flag 100% implemented
7. 8 new business items 100% onboarded to new process
8. oncall handbook 100% coverage

## Stakeholders
YiVad Tech Lead (Decision); YiVad Frontend Platform Team 4 FTE (execution); YiAi Backend Team (integration); 5 business frontend teams (consumption); SRE/DevOps (ops); Architecture committee (technology review)

## Milestones
M1 (2026 Q3, 2 weeks): 5 message actions 100% ported; M2 (2026 Q3, 2 weeks): streamingType + aborted flag; M3 (2026 Q3, 1 week): scrollTick + scroll lag 0; M4 (2026 Q4, 3 weeks): 8 new business items onboarding; M5 (2027 Q1): unified component library pilot + 50% coverage; M6 (2027 Q3): 100% coverage + L3 achieved; M7 (2028 Q1): unified component library GA + L4 60%

## Risks
1. sessionChat compatibility (P0) — gradual rollout + rollback
2. Streaming interruption recovery (P0) — aborted flag + fallback
3. Scroll performance (P1) — scrollTick + virtual list
4. Backend interface drift (P1) — contract test
5. Business team refusal (P2) — OKR bonus incentives

## Long-term Evolution
In 3 years: first token 0.3s, message actions 100% coverage, unified component library 100%; in 5 years: unified AI conversation component library GA, L4 100%.

## References
- **KB Source**: `YiKnowledge/engineer/projects/yivad/functional-modules`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents
