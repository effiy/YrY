---
title: Handle an AI failure
aliases:
- i-want-to-handle-an-ai-failure
- ai-failure-journey
- hallucination-incident-journey
- AI failure entry
tags:
- journeys
- ai-failure
- hallucination-incident
- ai-incident
- model-accident
category: ai-engineer/foundations
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
roles:
- ai-engineer
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ./handle-a-model-drift.md
- ../../tech-lead/risk/write-a-postmortem.md
- ../../ai-engineer/methodology/hallucination-mitigation.md
review_cycle: quarterly
tacit: false
---

# I want to handle an AI failure

> **As an** ai engineer, **I want to** handle an ai failure, **so that** incident is contained.

> "Triage + stop the bleeding + cut to fallback + root cause + notify + retrospective + patch the eval set + quarterly audit" — reach AI-specific + process + thinking + cases within 2 hops.

## Summary

- AI-specific: [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) + [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) + [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md)
- process: [incident-response-process.md](../../engineer/process/incident-response.md) + [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) + [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) + [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md)
- thinking: [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- cases: [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) + [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) + [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md)

## Core viewpoints

**AI failures are not software bugs -- they are systematic failures of the model's training distribution to cover the deployment distribution.** A traditional software bug is a deterministic error in logic that can be fixed by changing the code. An AI failure is a probabilistic error in behavior that can only be fixed by changing the model's training data, alignment, or deployment constraints. The implication is that the postmortem process for an AI failure must be fundamentally different: root cause is not "a bug in line 42" but "a gap in the training distribution" or "an alignment failure mode." The fix is not a code change but a data, prompt, or model change -- and the verification process is regression testing on a distribution, not unit testing on a specific input.

**The most dangerous AI failures are not the ones you can detect, but the ones that look plausible.** A hallucination that produces obviously wrong output is easy to catch. A hallucination that produces a confident, well-structured, and internally consistent but factually incorrect answer is the real threat. This is the "plausibility gap" -- the distance between what the model can produce and what it can verify. The model's generation capability far exceeds its self-verification capability, which means that post-hoc detection (having the model check its own work) is insufficient. The defense must be architectural: retrieval grounding, citation enforcement, and external verification.

**The "stop the bleeding" phase of AI incident response has no analog in traditional incident response.** In a traditional incident, stopping the bleeding often means rolling back a deployment. In an AI incident, the options are more nuanced: revert to the previous model, switch to a fallback provider, disable the AI feature and fall back to a deterministic system, or add a post-processing guard. The decision depends on the failure type: a hallucination spike may require a model rollback, a jailbreak exploit may require a prompt update, and a provider outage may require a routing change. The incident response playbook must enumerate the stop-the-bleeding options for each failure type.

**The evaluation set is the canary in the coal mine -- and it must evolve faster than the model.** Every AI failure that reaches production represents a case that the evaluation set did not cover. The single most important post-incident action is to add the failure case to the evaluation set and run regression. But this is not enough: the evaluation set must also be proactively expanded to cover cases that are structurally similar to the failure, not just the exact failure case. Without this, the model will learn to pass the specific test while still failing on similar cases.

**User trust in AI systems follows an asymmetric curve: one failure erases the trust built by a hundred successes.** This is the fundamental economics of AI reliability. The cost of a single visible failure -- a hallucination that causes a user to make a wrong decision, a jailbreak that leaks sensitive information, a bias that generates PR backlash -- can exceed the total value created by thousands of successful interactions. The reliability investment should be concentrated on the most visible and highest-consequence failures, not evenly distributed across all possible failures.

## Key info

- **AI failure classification taxonomy (6 types with stop-the-bleeding responses)**: (1) Hallucination — model generates factually incorrect output; stop-the-bleeding: revert to previous model, switch to fallback provider, add post-processing fact-check guard; (2) Jailbreak/Prompt injection — user bypasses safety constraints; stop-the-bleeding: update system prompt, add input filtering, disable the exploited feature; (3) Bias/discrimination — model produces biased output against a protected group; stop-the-bleeding: revert to previous model, add output filtering, disable the feature for affected user segments; (4) Data leak — model regurgitates training data or exposes PII; stop-the-bleeding: disable the model, investigate data exposure scope, notify affected users; (5) Provider outage — LLM API is unavailable; stop-the-bleeding: switch to fallback provider via multi-provider routing; (6) Quality degradation — model output quality degrades without a clear failure mode; stop-the-bleeding: revert to previous model, investigate root cause. Each failure type has a pre-defined stop-the-bleeding playbook that is tested quarterly.
- **AI incident severity classification (P0-P3 with response SLAs)**: P0 (Critical) — hallucination causes user harm, data leak exposes PII, jailbreak bypasses safety for > 100 users; response: stop-the-bleeding in < 15 minutes, notify legal in < 30 minutes, notify users in < 2 hours; P1 (High) — hallucination rate > 20% for a major feature, provider outage affecting > 50% of traffic; response: stop-the-bleeding in < 30 minutes, notify stakeholders in < 1 hour; P2 (Medium) — hallucination spike on a specific query type, quality degradation on a non-critical feature; response: investigate in < 4 hours, fix in < 24 hours; P3 (Low) — single-user hallucination report, minor quality issue; response: investigate in < 24 hours, fix in next sprint. The Yi-family projects use this classification for AI incidents.
- **AI failure root cause diagnostic framework (5 Whys adapted for AI)**: Why 1: Why did the model produce the wrong output? → The model hallucinated on a specific query type. Why 2: Why did the model hallucinate on this query type? → The retrieved context was insufficient or irrelevant. Why 3: Why was the retrieved context insufficient? → The retrieval system returned documents that were topically similar but factually wrong. Why 4: Why did the retrieval system return wrong documents? → The embedding model maps semantically similar but factually distinct concepts to nearby vectors. Why 5: Why wasn't this caught in testing? → The evaluation set did not include queries that test for this distinction. The root cause is almost always: the evaluation set was incomplete. The fix is: add this failure mode to the evaluation set and structurally similar cases.
- **Post-incident eval set patching protocol**: (1) Add the exact failure case to the evaluation set; (2) Generate 10-50 structurally similar cases (same query type, same topic, same failure mode) using an LLM or human annotation; (3) Verify that the current model fails on the new cases; (4) Apply the fix (prompt change, retrieval change, model change); (5) Verify that the fix resolves the new cases without regressing on existing cases; (6) Add the new cases to the regression suite with a "failure mode" tag for future analysis. The Yi-family standard: every AI incident must produce at least 10 new eval set entries within 48 hours of incident resolution.
- **AI failure communication template (internal vs. external)**: Internal — incident ID, failure type, severity, affected users (% of traffic), stop-the-bleeding action taken, current status, estimated resolution time, who is on point; External (user-facing) — what happened (non-technical), what we did about it, what the impact was (specific and honest), what we are doing to prevent it from happening again, how to contact us. The legal threshold for external communication: P0 incidents always require external communication; P1 incidents require external communication if user-visible; P2/P3 incidents do not require external communication unless user-reported. The Yi-family projects follow this template for AI incidents.
- **Yi-family AI failure history (2026-08)**: No P0 or P1 AI incidents have occurred. Known P2/P3 issues: SSE onDone not firing (caused incomplete streaming responses, fixed with guard), RAG token limit on long queries (hybrid retrieval returns incomplete results for queries > 2000 tokens, not yet fixed), model outputs in wrong language (fixed by adding explicit language instruction to system prompt). The absence of P0/P1 incidents may reflect the early-stage nature of the Yi-family AI features rather than robust incident prevention. The incident response playbook and postmortem template are in place but have not been tested in a real P0/P1 incident.

## Scenario

When handling AI failure / hallucination incident / model incident / jailbreak incident / prompt injection incident / user churn / compliance violation / misleading / bias / data leak / provider outage, AI engineering + algorithm + platform + business owner + legal need to look up AI-specific + process + thinking + cases. This entry aggregates AI-failure-related AI-specific + process + thinking to 2-hop paths, avoiding "unclear triage / late stop-bleeding / missing fallback / shallow root cause / lagging notification / missing retrospective / unpached eval set / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/ai-specific/` | [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) |
| `methodology/thinking/` | [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-thinking of loss of control · [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of failure · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [inline-citation-rag-pattern.md](../../engineer/engineering/inline-citation-rag.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [eval-driven](../../engineer/engineering/evaluation-driven-development.md) · [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md) |
| `work/processes/` | [incident-response-process.md](../../engineer/process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) · [oncall-rotation-process.md](../../engineer/process/oncall-rotation.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `tech/ai-foundations/` | [transformer-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [long-context-summary.md](../../ai-engineer/foundations/long-context-techniques.md) · [moe-summary.md](../../ai-engineer/foundations/moe-architecture.md) · [rlhf-dpo-summary.md](../../ai-engineer/foundations/rlhf-dpo-alignment.md) · [multimodal-summary.md](../../ai-engineer/foundations/multimodal-fusion.md) · [kv-cache-summary.md](../../ai-engineer/foundations/kv-cache-inference-optimization.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) · [multilingual-translation-prompt.md](../../ai-engineer/methodology/prompts/multilingual-translation.md) |
| `resources/templates/` | [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [runbook-template.md](../../engineer/infrastructure/write-a-runbook.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [bugs/](../../engineer/lessons) — AI failure archive |
| `lessons/gotchas/` | [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) · [react-jsxdev-mismatch.md](../../engineer/lessons/gotcha-react-jsxdev-mismatch.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) · [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons) |
| `product/metrics/` | [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux/ai-product-ux-patterns.md) · [nielsen-heuristics-summary.md](../../product-manager/discovery/ux/nielsen-heuristics.md) · [cross-cultural-ux-summary.md](../../product-manager/discovery/ux/cross-cultural-ux.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — AI incident notification |
| `people/experts/` | [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) — legal / compliance |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) |
| `brd/reference/` | [countries.md](./../../brd/README.md) · [regulations.md](./../../brd/README.md) — cross-border compliance |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) |
| `industry/competitors/` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) — provider outage |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — AI incident quarterly audit |
| `projects/YiAi/` | `adr-multi-provider-llm-routing.md` · `adr-llm-multi-provider-rollout.md` · `adr-brd-agent-launch.md` · `adr-rag-evaluation-infra.md` |
| `journeys/` | [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) · [./handle-a-model-drift.md](./handle-a-model-drift.md) · [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) · [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) |

## Action recommendations

1. **first principles**: first ask "failure type (hallucination / jailbreak / injection / bias / data leak / provider outage) / user impact / consequences of not solving / ROI"; don't triage for triage's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "how AI failure could unfold (user churn / trust collapse / compliance violation / misleading incident / brand loss)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one failure → user trust fluctuation → renewal impact → more scrutiny; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest fix that stops the bleeding wins; don't pile up guardrails; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **triage**: must run P0 / P1 / P2; grade by user impact + scope + security + compliance.
6. **stop the bleeding**: first stop the bleeding (revert to old model / cut to fallback provider / downgrade prompt / disable feature / cut to human); follow [incident-response-process.md](../../engineer/process/incident-response.md).
7. **rollback**: must be able to revert in seconds; follow [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) + [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md).
8. **root cause**: must run 5 whys; common root causes: prompt drift / RAG retrieval degradation / provider upgrade / stale eval set / data contamination / new jailbreak attack.
9. **hallucination**: must run [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md); citation consistency + retrieval filtering + fallback.
10. **jailbreak**: must run [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md); input filtering + system prompt hardening + output filtering.
11. **notify**: must run [i-want-to-handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) to notify sponsor + legal + users.
12. **legal**: must pull in [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) + follow [i-want-to-handle-a-regulatory-change.md](../../executive/strategy/handle-a-regulatory-change.md) + notify regulators when necessary.
13. **monitoring**: must run [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) + [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md); monitor hallucination rate / jailbreak rate / user feedback / business metrics.
14. **patch the eval set**: after failure, patch golden set + reproduce + add to regression set; follow [i-want-to-build-an-eval-harness.md](../../engineer/projects/build-an-eval-harness.md).
15. **user follow-up**: within 24-72h after fix, follow up + verify + apologize + commit to improvements; follow [i-want-to-handle-customer-feedback.md](../../engineer/process/handle-customer-feedback.md).
16. **freeze period**: during AI incident, follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) (exception: stop-bleeding release).
17. **retrospective**: must run [i-want-to-write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) + [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) retrospective + archive under [bugs/](../../engineer/lessons).
18. **process improvement**: after retrospective, land process improvements + runbook updates + quarterly sweep of same category.
19. **ADR**: stop-bleeding decisions must be recorded in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
20. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to sweep whether golden still represents production distribution + whether guardrails are still effective.
21. **flywheel**: handle failures well → trust grows → more AI investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Anti-patterns

- **Treating an AI failure as a standard software incident and following the same playbook.** The standard software incident playbook (rollback, fix, deploy, verify) is necessary but insufficient for AI failures. An AI failure requires additional steps: analyzing the model's behavior on the failure case and similar cases, determining whether the fix is a prompt change, a model change, or a data change, and updating the evaluation set to prevent regression. Without these steps, the same failure mode will recur in a slightly different form.

- **Applying a fix without understanding the failure's distribution, not just the failure's instance.** When a model hallucinates on a specific query, the natural response is to add that query to the evaluation set and move on. But the model's failure is rarely a single point -- it is a region of the input space where the model's behavior degrades. The right approach is to characterize the failure region: what types of queries, what topics, what input formats, what languages trigger the failure. Only then can you apply a fix that addresses the distribution, not just the instance.

- **Relying on the model to detect its own failures in production.** Model self-evaluation (LLM-as-judge, self-consistency checks, verbalized confidence) is unreliable as a primary detection mechanism. The model's confidence and its accuracy are weakly correlated, and the model is systematically overconfident on its own failure modes. Detection must be external: user feedback signals (regeneration rate, copy rate, thumbs down), consistency checks against external knowledge sources, and human sampling of production outputs.

- **Running the postmortem before the incident is fully contained.** The urge to understand "why" before the bleeding is stopped is strong but counterproductive. During an active AI incident, the only priority is containing the blast radius. Root cause analysis, retrospective, and process improvement happen after the incident is resolved. Pre-writing postmortem templates with the sections that can be filled during the incident (timeline, actions taken) helps resist the temptation to analyze prematurely.

- **Forgetting that AI failures compound across the system boundary.** A hallucination in a RAG pipeline may originate in the retrieval step (wrong documents), the generation step (misreading documents), or the interaction between the two (retrieving correct documents but generating from parametric knowledge instead). The failure mode is systemic, not component-level. Fixing only the generation step without addressing the retrieval step will cause the failure to recur through a different path.

## Related

- same-category journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — incident response
- same-category journey: [./handle-a-model-drift.md](./handle-a-model-drift.md) — model drift
- same-category journey: [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) — retrospective
- same-category journey: [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) — LLM evaluation
- upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — ai-specific leaf entry
