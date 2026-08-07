---
title: BRD-2026-072 Two-loop LLM Evaluation as Production Publish Gate
lifecycle: active
key: brd_brd-engineer_fde-two-loop-eval-gate
tags:
- engineer
- ai-engineer
- fde-playbook
- fde
- two-loop-eval
- adk
- agents-cli
- pairwise
- rag-triad
- model-monitoring
- production-gate
brd_id: BRD-2026-072
project: fde-playbook
domain: LLM Systems Evaluation
quarter: 2026 Q3
priority: p1
status: proposed
owner: FDE Practice Team + AI Architecture Team
tech_stack: Google ADK, Agents CLI, Agent Platform Evals, Pairwise Evaluation, Pointwise
  RAG Triad, Model Monitoring, LangSmith, BigQuery Agent Analytics, AgentOps, Phoenix,
  MLflow
key_metrics: production hallucination rate < 0.5%; agent evaluation coverage 100%; two-loop gate pass rate >= 95%; autorater versioned
  100%; golden dataset customer-signed >= 50 cases; Pairwise upgrade drift < 5%; Model Monitoring alert precision >= 90%
acceptance_criteria: '1. Inner Loop thresholds: tool_trajectory_avg_score >= 0.85 + response_match_score
  >= 0.7 + rubric >= 4/5

  2. Outer Loop Pairwise: new model vs old model win rate >= 55%

  3. Outer Loop Pointwise RAG triad: groundedness >= 0.95 + fulfillment >= 0.9 + coherence
  >= 0.85

  4. golden dataset must be customer-signed (>= 50 cases)

  5. Model Monitoring must be on: Prediction Drift + Feature Attribution

  6. agents-cli eval compare into CI gate

  7. eval set + autorater model versioned

  8. production incident retrospective must run Pairwise (new version vs launch version) '
stakeholders: CTO Office (decision); FDE Practice Team + AI Architecture Team (execution); customer CISO / Legal (approval);
  QA (acceptance); PMO (tracking); customer business stakeholders (sign golden set)
kb_path: ai-engineer/methodology/run-a-two-loop-llm-evaluation
notes: References Awesome-FDE-Roadmap LLM Systems Evaluation section. Any agent must pass the two-loop eval gate before production. Inner
  Loop (ADK dev-time + golden dataset + three metrics) must hit thresholds; Outer Loop (Agent Platform Pairwise
  + Pointwise RAG triad + Model Monitoring) CI/CD gate. Failing either gate = no release. Landing references run-a-two-loop-llm-evaluation
  + orchestrate-agents-with-adk-and-agents-cli.
review_cycle: quarterly
tacit: false
related: []
---

# BRD-2026-072 Two-loop LLM Evaluation as Production Publish Gate

**BRD ID**: BRD-2026-072  |  **Project**: fde-playbook  |  **Domain**: LLM Systems Evaluation  |  **Quarter**: 2026 Q3
**Priority**: P1  |  **Status**: Proposed  |  **Owner**: FDE Practice Team + AI Architecture Team
**KB Source**: ai-engineer/methodology/run-a-two-loop-llm-evaluation

## Context
References Awesome-FDE-Roadmap LLM Systems Evaluation section. FDE on customer sites often uses a "vibes-test" (manually running a few cases and shipping if it feels right) as the publish basis; production hallucination / drift / tool-call failure rates are high. 80% of agent projects have no golden dataset; production incidents are discovered via customer alerts. A single loop (dev-time only) misses production drift; a single loop (production only) misses early dev feedback. Autorater model upgrades (Gemini 2 → 3) cause scoring-scale drift; without Pairwise compare, rollback is impossible. 90% of production incidents come from a failure in one dimension of the RAG triad (groundedness / fulfillment / coherence). Customer legal requires a 0% hallucination baseline; compliance audits require eval evidence to be traceable.

This BRD makes the two-loop eval a production publish gate. Inner Loop (ADK dev-time + golden dataset + three metrics) must hit thresholds; Outer Loop (Agent Platform Pairwise + Pointwise RAG triad + Model Monitoring) CI/CD gate. Failing either gate = no release. Landing references [run-a-two-loop-llm-evaluation](../../ai-engineer/methodology/run-a-two-loop-llm-evaluation.md) + [orchestrate-agents-with-adk-and-agents-cli](../../ai-engineer/platform/orchestrate-agents-with-adk-and-agents-cli.md).

## Objectives & Key Metrics
Production hallucination rate < 0.5% (baseline 5-10%); agent evaluation coverage 100% (baseline 20%); two-loop gate pass rate >= 95% (baseline N/A); autorater versioned 100% (baseline 0%); golden dataset customer-signed >= 50 cases (baseline 0); Pairwise upgrade drift < 5% (baseline unmeasured); Model Monitoring alert precision >= 90% (baseline 60%)

## Acceptance Criteria
1. Inner Loop thresholds: tool_trajectory_avg_score >= 0.85 + response_match_score >= 0.7 + rubric >= 4/5
2. Outer Loop Pairwise: new model vs old model win rate >= 55%
3. Outer Loop Pointwise RAG triad: groundedness >= 0.95 + fulfillment >= 0.9 + coherence >= 0.85
4. golden dataset must be customer-signed (>= 50 cases)
5. Model Monitoring must be on: Prediction Drift + Feature Attribution
6. `agents-cli eval compare` enters CI gate
7. eval set + autorater model versioned
8. production incident retrospective must run Pairwise (new version vs launch version)
9. Inner / Outer share autorater version + full golden set + same tool source + anchored context window + explicit temperature
10. production hallucination rate < 0.5%

## Stakeholders
CTO Office (decision); FDE Practice Team + AI Architecture Team (execution); customer CISO / Legal (approval); QA (acceptance); PMO (tracking); customer business stakeholders (sign golden set)

## Milestones
M1 (2026 Q3): two-loop SOP + CI gate template launch
M2 (2026 Q4): 3 AI customers run the process end-to-end; first-quarter two-loop gate pass rate >= 85%
M3 (2027 Q1): golden dataset customer-sign rate >= 80%; production hallucination rate < 1%
M4 (2027 Q2-Q3): 5 AI customers GA; production hallucination rate < 0.5%
M5 (2027 Q4): L3 maturity — two-loop template cross-customer reuse rate >= 70%; ADR Two-loop eval gate quarterly review automated

## Risks
1. golden dataset not signed by customer (P1) — SOW explicitly marks customer-signed 50 cases as Acceptance; FDE Practice internal fallback 50 cases
2. autorater model upgrade scale drift (P1) — eval set + autorater versioned; upgrade runs Pairwise (new autorater × old run)
3. Pairwise cost (per version N cases × autorater) (P2) — sample 200 cases; full coverage for high-value scenarios
4. thresholds too strict block iteration (P1) — thresholds split into must (compliance) + should (business); should-fail can be PMO-signed off to ship
5. Inner dev-time eval slow (P2) — golden dataset sampled; offline run; nightly full run
6. Model Monitoring false positives (P2) — Prediction Drift thresholds split warn / page; Feature Attribution uses SHAP
7. customer legal rejects Pairwise (data egress) (P1) — autorater runs inside air-gap; no external transmission
8. Inner / Outer 5-class drift (autorater version / golden sampling / tool implementation differences / context window / temperature) (P1) — must share anchors

## Long-term Evolution
3 years out: production hallucination rate < 0.1%; agent evaluation coverage 100%; two-loop gate pass rate >= 99%; Pairwise upgrade drift < 2%; Model Monitoring alert precision >= 95%. FDE Practice Lead abstracts the two-loop template into a product-grade "AI Evaluation Package" feature, feeding back into the core product; autorater becomes adaptive (learns customer business terminology).

## References
- **KB Source**: `YiKnowledge/ai-engineer/methodology/run-a-two-loop-llm-evaluation.md`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents
- **Related leaves**: [orchestrate-agents-with-adk-and-agents-cli](../../ai-engineer/platform/orchestrate-agents-with-adk-and-agents-cli.md) / [prepare-an-agent-evaluation-strategy](../../ai-engineer/foundations/prepare-an-agent-evaluation-strategy.md) / [evaluate-an-llm-app](../../ai-engineer/platform/evaluate-an-llm-app.md)
- **Related ADR**: [ADR Two-loop eval as production gate](../../tech-lead/decisions/fde/two-loop-eval-as-production-gate.md)
- **Related gotchas**: [ADK eval drift between local and runtime](../../engineer/lessons/gotchas/adk-eval-drift-between-local-and-runtime.md) / [Agents CLI Alpha instability](../../engineer/lessons/gotchas/agents-cli-alpha-instability.md)
- **External**: [Awesome-FDE-Roadmap](https://github.com/pierpaolo28/Awesome-FDE-Roadmap) / [Anthropic — Demystifying AI Agent Evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) / [Google ADK](https://github.com/google/adk-python) / [Agents CLI](https://google.github.io/agents-cli/guide/getting-started/)
