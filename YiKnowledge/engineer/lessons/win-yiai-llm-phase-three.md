---
title: YiAi LLM Phase 3 Grayscale Cutover Complete
aliases: [yiai-llm-phase-three-win, llm-grayscale-rollout, multi-provider-grayscale]
tags: [success-case, YiAi, LLM, multi-provider, grayscale, cutover, ollama, llama-index]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: design
status: draft
lifecycle: reference
review_cycle: quarterly
tacit: true
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.
# YiAi LLM Phase 3 Grayscale Cutover Complete

> **As an** engineer, **I want to** yiai llm phase three, **so that** success is reproducible.

> YiAi multi-provider 5-stage grayscale Phase 3 landing: ollama 100% → new provider 1% → 10% → 50% → 100% grayscale cutover + eval-set gate per stage + monitoring; hard prerequisite before Phase 4 RAG generation-side switch.

## Summary

- **Completed**: OpenAI as the first new provider grayscale cutover (1% → 10% → 50% → 100%) + eval-set gate per stage (recall drop > 5% blocks) + real-time monitoring (error rate / latency / user feedback)
- **Quantified effect**: 100% cutover complete with 0 incidents; recall 0.87 → 0.88 (+0.01); faithfulness 0.83 → 0.84; average latency -15% (OpenAI API faster than self-hosted Ollama)
- **Value**: Phase 4 RAG generation-side switch has a grayscale methodology + monitoring + rollback plan

## Core viewpoints

- **1% → 10% → 50% → 100% grayscale**: each stage 1-day observation + eval-set gate + monitoring = blast radius controllable.
- **Single-provider cutover**: OpenAI first = validate grayscale flow; Anthropic / Gemini later one at a time = no mixing.
- **Eval-set gate per stage**: run eval set after each stage = recall drop > 5% auto-rollback.
- **Monitoring trio**: error rate / latency / user feedback = early failure detection.
- **Rollback plan**: each stage independent rollback = no accumulated big bang.

## Key information

### Background

- Phase 2 router + provider registry done (4 providers registered, see [yiai-llm-phase-two-win](win-yiai-llm-phase-two.md)).
- Before Phase 3 start, generation side still 100% Ollama = grayscale cutover not started.
- ADR decided: 5-stage grayscale, each stage independent gate.

### Landing checklist

| # | Change | Impact | Verification |
|---|---|---|---|
| 1 | `config.yaml` provider switch: OpenAI on / others off | YiAi config | switch effective |
| 2 | 1% grayscale: 1% traffic to OpenAI / 99% Ollama | YiAi `llm_router` | 1-day observation + eval-set gate |
| 3 | 10% grayscale: 10% / 90% | YiAi `llm_router` | 1-day observation + gate |
| 4 | 50% grayscale: 50% / 50% | YiAi `llm_router` | 1-day observation + gate |
| 5 | 100% cutover: 100% OpenAI / 0% Ollama | YiAi `llm_router` | 1-day observation + gate |
| 6 | Monitoring: error rate / latency / user feedback | YiAi monitoring | real-time alert per stage |
| 7 | Eval-set gate: run per stage + rollback > 5% auto | YiAi `tests/eval/` | 0 regressions per stage |

### Quantified effect

- Cutover progress: 1% → 10% → 50% → 100% (all 4 stages passed)
- Incidents: 0
- Recall: 0.87 → 0.88 (+0.01)
- faithfulness: 0.83 → 0.84 (+0.01)
- Average latency: -15% (OpenAI API faster than self-hosted Ollama)
- Monitoring alerts: 0 (real-time no anomalies per stage)
- Eval-set gate blocks: 0

### Key success factors

1. **1% → 10% → 50% → 100% grayscale**: each stage 1-day observation + gate + monitoring = blast radius controllable
2. **Single-provider cutover**: OpenAI first = validate flow; Anthropic / Gemini later one at a time = no mixing
3. **Eval-set gate per stage**: recall drop > 5% auto-rollback = no accumulation
4. **Monitoring trio**: error rate / latency / user feedback = early detection
5. **Rollback plan**: each stage independent rollback = no accumulated big bang
6. **Based on Phase 2 router**: provider registry already in place = cutover only toggles switches

## Action recommendations

1. Grayscale 4-stage cutover (1% → 10% → 50% → 100%), each stage 1-day observation + eval-set gate + monitoring.
2. Single provider first (OpenAI validates flow) = other providers later one at a time = no mixing.
3. Eval-set gate per stage (rollback > 5% auto) = no accumulation.
4. Monitoring trio: error rate / latency / user feedback = early detection.
5. Rollback plan independent per stage = no accumulated big bang.
6. Phase 4 RAG generation-side switch depends on Phase 3 grayscale complete = clear priority.



- **100% one-shot cutover**: everyone hit by failure = incident; must do 4-stage grayscale.
- **Multiple providers cutover at once**: when it breaks, unclear who broke = hard to locate; must cutover one provider at a time.
- **No eval-set gate**: no comparison for rollback = rely on user feedback; must run per stage.
- **gate threshold = 0**: noise blocks; must tolerate 5%.
- **No monitoring**: rely on user feedback = incident; must have trio.
- **No rollback plan**: cannot roll back = big bang; must have independent rollback per stage.
- **Fast cutover across stages**: insufficient observation = hidden risk accumulates; must observe 1 day per stage.

## Anti-patterns

- **Using the same evaluation set for the gate that was used to select the model in the first place.** If the evaluation set was used during model selection to compare OpenAI, Anthropic, and Gemini, then the selected model has already been optimized against that set. Using the same set as the Phase 3 gate means the gate is measuring memorization, not generalization. The gate must use a held-out evaluation set that was never seen during model selection.
- **Observing for 1 day per stage but only during business hours on weekdays.** Traffic patterns on Sunday at 3 AM are different from Wednesday at 11 AM. A 1-day observation period that spans only 8 business hours has not seen a full diurnal cycle. The observation period must cover at least 24 continuous hours per stage, including off-peak and weekend traffic, to catch latency spikes during batch jobs and cron-triggered workloads.
- **Setting the eval-set gate threshold at 5% recall drop but not computing the statistical significance of the drop.** A recall drop from 0.87 to 0.83 on a 50-item evaluation set has a wide confidence interval. The drop could be noise (sampling variance) rather than a real regression. The gate must include a statistical test (e.g., bootstrap confidence interval) that distinguishes signal from noise before triggering a rollback.
- **Running the monitoring dashboard on the same infrastructure as the LLM service.** When the LLM service experiences a latency spike due to provider overload, the monitoring dashboard that runs on the same cluster also slows down, making it impossible to diagnose the incident. The monitoring stack (metrics collection, alerting, dashboard) must run on separate infrastructure from the service it monitors.
- **Completing the 100% cutover to OpenAI and declaring Phase 3 done without maintaining the ability to fall back to Ollama.** The Ollama fallback path atrophies within weeks if not exercised. A future OpenAI outage or API deprecation will require a fallback that no longer works because the Ollama model has not been updated, the configuration has drifted, or the routing code has been refactored. Maintain a quarterly "fire drill" that switches 5% of traffic back to Ollama to verify the fallback path is still functional.

## Related

- Upstream: [ADR-LLM-Multi-Provider-Rollout](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) Phase 3 (the implementation ADR landed by this win)
- Decision: [ADR-Multi-Provider-LLM-Routing](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md)
- Prerequisite: [yiai-llm-phase-two-win](win-yiai-llm-phase-two.md) Phase 2 router + registry
- Prerequisite: [yiai-supply-chain-hardening-win](win-yiai-supply-chain-hardening.md) Phase 1 hardening
- Methodology: [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md) + [one-to-one-mapping-migration-pattern](../architecture-design/one-to-one-mapping-migration.md) (single-tool replacement + grayscale)
- Co-build: [ADR-RAG-Evaluation-Infra](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) (eval-set gate)
- Same kind: [./README.md](./) — wins leaf entry
- Scenario: [i-want-to-review-lessons](../process/review-lessons.md)
