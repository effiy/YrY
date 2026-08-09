---
title: ADR — Two-loop eval as production release gate
aliases: [adr-two-loop-eval-as-production-gate, fde-two-loop-eval-gate-adr, two-loop-eval-gate-adr]
tags: [adr, fde, two-loop-eval, adk, agent-platform, pairwise, rag-triad, production-gate, architecture-decision]
category: tech-lead/decisions/fde
created: 2026-08-05
updated: 2026-08-05
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-05
tacit: false
roles: [tech-lead, engineer, ai-engineer]
benefit: "two-loop eval as production release gate; offline + online dual-track captures drift"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - "consequences and reversal path are stated"
related:
 - ../../../ai-engineer/methodology/run-a-two-loop-llm-evaluation.md
 - ../../../ai-engineer/platform/orchestrate-agents-with-adk-and-agents-cli.md
 - ../../../ai-engineer/foundations/prepare-an-agent-evaluation-strategy.md
 - ../../../engineer/process/operate-as-a-forward-deployed-engineer.md
 - ../../../knowledge-curator/templates/adr.md
---

# ADR — Two-loop eval as production release gate

> **As a** tech lead, **I want to** make two-loop eval the production release gate (offline nightly + online shadow), **so that** post-launch nomenclature drift / prompt drift is caught offline, user-side exceptions are caught by shadow, not by feel-good launches.

> Decision: any agent before production must pass the two-loop eval gate. Inner Loop (ADK dev-time `adk eval` + golden dataset + tool_trajectory_avg_score + response_match_score) must reach threshold; Outer Loop (Agent Platform Pairwise + Pointwise RAG triad + Model Monitoring) CI/CD gate. Failing either gate = no launch. Implementation per [two-loop LLM eval](../../../ai-engineer/methodology/run-a-two-loop-llm-evaluation.md) + [ADK + Agents CLI](../../../ai-engineer/platform/orchestrate-agents-with-adk-and-agents-cli.md).

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-Fde-Two-Loop-Eval-Gate |
| Title | Two-loop eval as production release gate |
| Status | Accepted |
| Date | 2026-08-05 |
| Decision maker | FDE Practice Lead + AI Architecture team |
| Reviewer | CTO, QA, customer CISO |
| Related project | FDE Playbook (AI customer general) |
| Related PR/Issue | — |
| Supersedes | — |
| Superseded by | — |
| Re-review trigger | Quarterly re-review / signal: prod hallucination rate > 0.5% / autorater model upgrade / golden dataset drift / customer reports hallucination |

## 2. Background (Context)

- **Current state**: FDE on-site at customer often relies on "vibes-test" (manually run a few prompts, feels right, then launch) as release basis; prod hallucination / drift / tool call failure rate high.
- **Pain quantification**:
 - 80% of agent projects have no golden dataset; prod incidents discovered via customer alerts.
 - single-loop (dev-time only) misses prod drift; single-loop (prod only) misses early dev feedback.
 - Autorater model upgrade (Gemini 2 → 3) causes scale drift in eval; without Pairwise comparison cannot roll back.
 - 90% of prod incidents come from one RAG triad dimension failing (groundedness / fulfillment / coherence).
- **Trigger event**: see [Awesome-FDE-Roadmap](https://github.com/pierpaolo28/Awesome-FDE-Roadmap) LLM Systems Evaluation; FDE Practice AI customer retrospective.
- **External constraint**: customer legal demands 0% hallucination benchmark; compliance audit requires eval evidence traceable.

## 3. Decision

FDE Practice makes two-loop eval the production release gate. Inner Loop (ADK dev-time + golden dataset + three metrics) must reach threshold; Outer Loop (Agent Platform Pairwise + Pointwise RAG triad + Model Monitoring) CI/CD gate. Failing either gate = no launch.

Implementation checklist:

| No. | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Inner Loop threshold: tool_trajectory_avg_score ≥ 0.85 + response_match_score ≥ 0.7 + rubric ≥ 4/5 | FDE Practice AI customers | One-shot rollout |
| 2 | Outer Loop Pairwise: new model vs old model win rate ≥ 55% | FDE Practice AI customer CI | One-shot rollout |
| 3 | Outer Loop Pointwise RAG triad: groundedness ≥ 0.95 + fulfillment ≥ 0.9 + coherence ≥ 0.85 | FDE Practice AI customer CI | One-shot rollout |
| 4 | Golden dataset must be signed off by customer (≥ 50 cases) | FDE Practice AI customers | Per project |
| 5 | Model Monitoring must enable: Prediction Drift + Feature Attribution | FDE Practice deployment template | One-shot rollout |
| 6 | `agents-cli eval compare run_v1.json run_v2.json` into CI gate | FDE Practice CI template | One-shot rollout |
| 7 | Eval set versioned + autorater model versioned | FDE Practice eval template | One-shot rollout |
| 8 | Prod incident retrospective must run Pairwise (new version vs launch version) | FDE Practice incident SOP | Per incident |

## 4. Options considered

| Option | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. Two-loop (Inner ADK + Outer Agent Platform) | Dev + prod dual gates | Double insurance; can roll back; can falsify | Higher setup cost; autorater cost | ✅ Chosen |
| B. Inner Loop only (ADK dev-time) | Dev-only eval | Light | Misses prod drift; customer incidents | ❌ |
| C. Outer Loop only (prod Pairwise) | Prod-only eval | One-shot in place | Misses early dev feedback; slow iteration | ❌ |
| D. Vibes-test | Manual feel | Lightest | Prod incidents; customer churn | ❌ |
| E. Single LLM-as-Judge | Single autorater | Simple | Single point of failure; scale drift | ❌ (retain as Inner sub-metric) |

## 5. Evaluation dimensions

| Dimension | A. Two-loop | B. Inner only | C. Outer only | D. Vibes | E. Single judge |
|---|---|---|---|---|---|
| Prod drift defense | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| Early dev feedback | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Can roll back | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| Can falsify | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| Setup cost | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Autorater cost | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Customer compliance audit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |

## 6. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Golden dataset not signed by customer | High | High | SOW explicitly requires customer signs 50 cases for Acceptance; FDE Practice internal fallback 50 cases |
| Autorater model upgrade causes scale drift | High | Medium | Eval set + autorater versioned; upgrade runs Pairwise (new autorater × old run) |
| Pairwise cost (N items × autorater per release) | Medium | Medium | Sample 200 items; high-value scenarios all quantities |
| Threshold too strict blocks iteration | High | Medium | Threshold split must (compliance) + should (business); should-fail can be PMO-signed off to launch |
| Inner dev-time eval slow | Medium | Medium | Sample golden dataset; offline run; nightly full run |
| Model Monitoring false positives | Medium | Low | Prediction Drift threshold split warn / page; Feature Attribution with SHAP |
| Customer legal rejects Pairwise (data egress) | Medium | High | Autorater runs air-gapped internally; no egress |

## 7. Rollback plan

| Trigger | Rollback action | Owner | Estimated recovery time |
|---|---|---|---|
| Threshold too strict blocks release | Lower should-threshold + PMO sign-off | FDE Practice Lead | 1 business day |
| Autorater upgrade causes scale drift | Lock old autorater + upgrade runs Pairwise then switch | FDE Practice Lead | 1 business day |
| Golden dataset drift (customer sign invalid) | Re-sign + Pairwise (new golden × old run) | FDE Practice Lead + customer | 1 week |
| Model Monitoring false positive | Split warn / page threshold + reset measurement baseline | FDE Practice Lead | 1 business day |
| Pairwise rejected (compliance) | Autorater air-gap internal run + results not egressed | FDE Practice Lead + legal | 1 week |
