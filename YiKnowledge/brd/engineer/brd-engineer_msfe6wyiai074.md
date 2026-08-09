---
title: BRD-2026-074 Multi-Provider LLM routing gradual rollout
lifecycle: active
key: brd_brd-engineer_msfe6wyiai074
tags:
- engineer
- yiai
- llm
- multi-provider
- llama-index
- l3-maturity
brd_id: BRD-2026-074
project: yiai
domain: Multi-Provider LLM Routing
quarter: 2026 Q3
priority: p0
status: in_progress
owner: YiAi Platform Team
tech_stack: FastAPI, llama_index.llms.*, OpenAI, Claude, DeepSeek, Qwen
key_metrics: Provider lock-in rate 100%→0% (down 100%); call failure rate 4.2%→0.3% (down 93%); switch time
  2h→5min (down 96%); monthly cost ¥180k→¥110k (down 39%); gradual rollout coverage 0%→100%; rollback time 30min→1min (down 97%)
acceptance_criteria: '1. 5-stage gradual rollout 100% complete (supply chain hardening → router → config rollout → RAG generation → endpoint selector)

  2. Call failure rate <0.5% (3-month statistics)

  3. Provider switch <5 minutes

  4. Monthly cost reduction >30%

  5. Gradual rollback <1 minute

  6. CI enforces supply chain hardening checks

  7. oncall manual 100% coverage

  8. 8 new businesses 100% follow the process'
stakeholders: CTO Office (decision + budget); YiAi Platform Team 6 FTE (execution); 5 business teams (consumption);
  SRE/DevOps (operations); security & compliance (supply chain approval); finance (budget); architecture committee (technical review)
kb_path: tech-lead/decisions/yiai/llm-multi-provider-rollout
notes: Via the llama_index.llms.* abstraction layer + 5-stage gradual rollout, change single-Provider lock-in
  to multi-Provider routing + supply chain hardening + endpoint selector, with L3 platform maturity as the goal, evolving to an intelligent routing engine (L4 100%) within 3 years.
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# BRD-2026-074 Multi-Provider LLM routing gradual rollout

**BRD ID**: BRD-2026-074  |  **Project**: yiai  |  **Domain**: Multi-Provider LLM Routing  |  **Quarter**: 2026 Q3
**Priority**: P0  |  **Status**: In Progress  |  **Owner**: YiAi Platform Team
**KB Source**: tech-lead/decisions/yiai/llm-multi-provider-rollout

## Context
Via the llama_index.llms.* abstraction layer + 5-stage gradual rollout, change single-Provider lock-in to multi-Provider routing + supply chain hardening + endpoint selector, with L3 platform maturity as the goal, evolving to an intelligent routing engine (L4 100%) within 3 years.

## Objectives & Key Metrics
Provider lock-in rate 100%→0% (down 100%); call failure rate 4.2%→0.3% (down 93%); switch time 2h→5min (down 96%); monthly cost ¥180k→¥110k (down 39%); gradual rollout coverage 0%→100%; rollback time 30min→1min (down 97%)

## Acceptance Criteria
1. 5-stage gradual rollout 100% complete (supply chain hardening → router → config rollout → RAG generation → endpoint selector)
2. Call failure rate <0.5% (3-month statistics)
3. Provider switch <5 minutes
4. Monthly cost reduction >30%
5. Gradual rollback <1 minute
6. CI enforces supply chain hardening checks
7. oncall manual 100% coverage
8. 8 new businesses 100% follow the process

## Stakeholders
CTO Office (decision + budget); YiAi Platform Team 6 FTE (execution); 5 business teams (consumption); SRE/DevOps (operations); security & compliance (supply chain approval); finance (budget); architecture committee (technical review)

## Milestones
M1 (2026 Q3, 3 weeks): supply chain hardening prework + SBOM + SLSA; M2 (2026 Q3, 3 weeks): router abstraction + config rollout 10%; M3 (2026 Q4, 6 weeks): RAG generation-side rollout 50%; M4 (2026 Q4, 4 weeks): endpoint + frontend model selector 100%; M5 (2027 Q1): intelligent routing pilot + L3 achieved; M6 (2027 Q4): intelligent routing GA + L4 60%

## Risks
1. Supply chain attack (P0) — SBOM + SLSA + image signing
2. Incomplete gradual rollback (P0) — rollback drill + contract test
3. Provider compatibility (P1) — abstraction layer + fallback
4. Cost accounting deviation (P1) — quarterly finance review
5. Business side rejects gradual rollout (P2) — OKR bonus incentive

## Long-term Evolution
In 3 years: Provider lock-in 0%, failure rate 0.1%, switch 1 minute, cost reduction 50%, intelligent routing 100%; in 5 years: intelligent routing engine GA, L4 100%.

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yiai/llm-multi-provider-rollout`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents
