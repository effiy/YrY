---
title: Fine-tune a model
aliases:
- I want to fine-tune a model
- finetune-journey
- sft-journey
- dpo-journey
- Model fine-tuning entry
tags:
- journeys
- finetune
- sft
- dpo
- rlhf
- llm
- training
category: ai-engineer/methodology
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- ai-engineer
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../platform/pick-an-llm-provider.md
- ./tune-prompts.md
- ../platform/evaluate-an-llm-app.md
- ../../ai-engineer/methodology/model-finetuning-decision-tree.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to fine-tune a model

> **As a** an ai engineer, **I want to** finetune a model, **so that** outcome is traceable. 

> "decision + data preparation + SFT/DPO/RLHF + evaluation + deploy + cost + retrospective" reachable within 2 hops to AI-specific + process + thinking + case studies. 

## Summary

- decision via [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) + [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md)
- engineering via [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) + [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) + [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md)
- deploy via [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) + [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md)
- thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)

## Core viewpoints

**Fine-tuning is the last resort, not the first instinct.** The default path for every AI engineering task is prompt engineering + RAG + few-shot. Fine-tuning should only be considered when all three have been exhausted and the remaining gap is measurable. The reason is not just cost -- it is that fine-tuning creates a fork of the base model that you must maintain, evaluate, and eventually upgrade. Every foundation model release (Claude 4.5 to 4.7, GPT-4 to GPT-5) means your fine-tuned model needs to be re-evaluated and potentially re-trained.

**Data quality matters more than data quantity, and "enough" data does not mean "good" data.** A dataset of 10,000 instruction pairs with inconsistent formatting, contradictory answers, and unlabeled edge cases will produce a worse fine-tuned model than 1,000 carefully curated pairs. The most common fine-tuning failure mode is not insufficient data -- it is data that teaches the model the wrong thing. Cleaning, deduplication, label consistency verification, and privacy masking are not optional preprocessing steps; they are the core of the fine-tuning process.

**The decision tree is not just about capability -- it is about maintenance burden.** Choosing Full FT over LoRA is not just a quality decision; it is a commitment to maintain a full model checkpoint, manage GPU memory for training, and handle deployment of a larger artifact. Choosing LoRA means you can hot-swap adapters and keep the base model shared. The decision tree should include a "maintenance burden" dimension that accounts for team size, GPU availability, and model update frequency.

**Catastrophic forgetting is invisible until it hurts your users.** A fine-tuned model that scores 95% on your task-specific evaluation may have silently degraded on general capabilities. Held-out evaluation sets (old tasks the model used to perform well on) are the only way to detect this. Without them, you discover the degradation when users report that the model "got worse" at something unrelated to your fine-tuning task.

**Fine-tuning without a baseline is fine-tuning without a reason to exist.** Every fine-tuning project must start with a rigorous evaluation of the base model on the target task. If you cannot measure the gap, you cannot justify the fine-tuning. If the gap is 2% on a task where prompt engineering costs $0.001 per call, fine-tuning is almost certainly the wrong answer.

## Key info

- **Fine-tuning methods**: SFT (Supervised Fine-Tuning, trains on instruction-response pairs, improves task-specific performance, 1-10K examples, $10-500 cost, 1-4 hours on 1-4 A100s), DPO (Direct Preference Optimization, trains on chosen/rejected pairs, aligns with human preferences, 500-5K pairs, no reward model needed, simpler than RLHF), RLHF (Reinforcement Learning from Human Feedback, requires reward model + PPO, most complex, best alignment, 10K+ human preference labels, $1K-10K cost). SFT is the default for task-specific improvement; DPO is the replacement for RLHF in most cases; RLHF is reserved for safety-critical alignment.
- **LoRA vs Full FT**: LoRA (Low-Rank Adaptation, trains 0.1-1% of parameters, 10-100MB adapter file, 1-2 A100s, hot-swappable, $10-100 cost, 90-95% of full FT performance) vs Full FT (trains all parameters, full model checkpoint, 4-8 A100s, $100-1000 cost, 100% performance). LoRA is the default for teams with limited GPU budget; Full FT is for when the 5-10% performance gap is material. The key LoRA hyperparameter: rank `r` (typically 8-64, higher = more capacity but larger adapter and more memory).
- **Data requirements**: minimum 500 high-quality examples for SFT (below 500, few-shot prompting outperforms fine-tuning), 1,000-10,000 for reliable improvement. Data format: `{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}`. Key quality checks: deduplication (exact + fuzzy match with 0.9 threshold), length distribution (trim outliers >95th percentile), label consistency (two annotators agree on >90% of examples), response diversity (no single response template used >20% of the time).
- **Catastrophic forgetting detection**: maintain a held-out evaluation set of 50-100 diverse tasks (general knowledge, reasoning, coding, math) that the model performed well on before fine-tuning. After fine-tuning, evaluate on all held-out tasks. If any task degrades >5%, the fine-tuning has caused forgetting. Mitigation: mix in 5-10% of general data during fine-tuning, or use LoRA with a lower learning rate. The held-out set must be created before fine-tuning starts; creating it afterward is measuring the model against an unknown baseline.
- **Cost comparison**: prompt engineering (free, 1-2 days of iteration), RAG (infrastructure cost, 2-5 days of setup), few-shot (slightly higher token cost, 1 day of example curation), SFT ($10-500, 3-7 days including data prep), DPO ($50-1000, 5-10 days), RLHF ($1K-10K, 2-4 weeks). The decision rule: try prompt engineering first (1 day), then RAG (2 days), then few-shot (1 day), then evaluate the gap. If the gap is >10% and you have >500 examples, consider SFT. If the gap is alignment-related and you have preference data, consider DPO.

## Scenario

When fine-tuning large models / SFT / DPO / RLHF / LoRA / QLoRA / data labeling / evaluation alignment / deploying fine-tuned models, AI engineers + algorithm + architects + business owners need to look up decision tree + process + thinking + case studies. This entry aggregates fine-tuning related AI-specific + process + thinking + case studies into a 2-hop path, avoiding "unnecessary fine-tuning / poor data quality / missing evaluation / cost explosion / inconsistent deployment / no baseline comparison". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/ai-specific/` | [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [inline-citation-rag-pattern.md](../../engineer/engineering/inline-citation-rag.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) |
| `tech/ai-platform/` | [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `tech/ai-foundations/` | [transformer-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [kv-cache-summary.md](../../ai-engineer/foundations/kv-cache-inference-optimization.md) · [long-context-summary.md](../../ai-engineer/foundations/long-context-techniques.md) · [moe-summary.md](../../ai-engineer/foundations/moe-architecture.md) · [multimodal-summary.md](../../ai-engineer/foundations/multimodal-fusion.md) · [rlhf-dpo-summary.md](../../ai-engineer/foundations/rlhf-dpo-alignment.md) |
| `work/processes/` | [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [incident-response-process.md](../../engineer/process/incident-response.md) |
| `work/tools/` | [vllm-ollama-deployment-summary.md](../../engineer/engineering/vllm-ollama-deployment.md) · [pi-agent-harness-evolution-summary.md](../../engineer/engineering/pi-agent-harness-evolution.md) |
| `product/metrics/` | [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) |
| `lessons/wins/` | [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons) · [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) · [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) |
| `lessons/gotchas/` | [react-jsxdev-mismatch.md](../../engineer/lessons/gotcha-react-jsxdev-mismatch.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) — fine-tuning data governance |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts--rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) — pre-fine-tune prompt baseline |
| `projects/YiAi/` | `adr-multi-provider-llm-routing.md` · `adr-llm-multi-provider-rollout.md` · `adr-brd-agent-launch.md` |
| `industry/competitors--` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md) — baseline model selection |

## Action recommendations

1. **first principles**: first ask "what does fine-tuning solve (style / domain / task / cost) / what if not fine-tuned / is data sufficient / ROI"; do not fine-tune for fine-tuning's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **decision tree**: must run [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md); prompt + RAG + few-shot first; fine-tuning as last resort. 
3. **inversion**: first think "what happens after fine-tuning (overfitting / catastrophic forgetting / deploy cost / data leak / hard iteration)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
4. **second-order effects**: one fine-tune → repeated iteration → version explosion → eval set can't keep up; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
5. **Occam**: simplest method that meets needs (LoRA > full SFT; SFT > DPO > RLHF); see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
6. **data**: quality > quantity; must do cleaning + dedup + label consistency + privacy masking; via [data-governance-summary.md](../../ai-engineer/data/data-governance.md). 
7. **baseline**: must first build baseline (original model + prompt + RAG) + eval set; no baseline, no comparison. 
8. **SFT**: supervised fine-tuning; suitable for style / format / task migration; data starts from 1k-10k. 
9. **DPO / RLHF**: preference alignment; suitable for aligning human preference / reducing hallucination; via [rlhf-dpo-summary.md](../../ai-engineer/foundations/rlhf-dpo-alignment.md). 
10. **LoRA / QLoRA**: parameter-efficient fine-tuning; low memory / fast iteration / easy deploy; preferred. 
11. **evaluation**: must run [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md); split into auto metrics + human labeling + business metrics. 
12. **hallucination**: must run [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md); after fine-tuning must scan hallucination rate. 
13. **security**: must scan [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md); fine-tuning may introduce new attack surface. 
14. **deploy**: via [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) + [vllm-ollama-deployment-summary.md](../../engineer/engineering/vllm-ollama-deployment.md); fine-tuned weights must be versioned + rollback plan. 
15. **monitoring**: via [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) + [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md); must monitor latency / throughput / hallucination rate / cost. 
16. **canary**: fine-tuned model via [canary-release-process.md](../../oncall-sre/release/canary-release.md); 1% → 25% → 100%; must be able to rollback to original model in seconds. 
17. **multi provider**: fine-tune + fallback to closed-source + self-hosted vLLM; see [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md). 
18. **cost**: must run [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md); training + inference + iteration frequency must be total accounted. 
19. **ADR**: fine-tuning decision must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
20. **retrospective**: after fine-tuning launch, archive to [lessons/wins/](../../engineer/lessons) or [lessons/failures/](../../engineer/lessons).

## Anti-patterns

- **Fine-tuning because "the base model doesn't know our domain."** Domain knowledge is the primary use case for RAG, not fine-tuning. If your domain knowledge is documented (and it should be), RAG can inject it at inference time. Fine-tuning for domain knowledge bakes it into the model weights, making it stale the moment your domain knowledge changes. Only fine-tune for style, format, or task-specific behavior that cannot be achieved through prompting.

- **Starting with Full FT on a 7B model.** Full fine-tuning a 7B model is almost never the right choice. LoRA achieves 95% of Full FT quality at a fraction of the cost. Full FT on a 7B model is a sign that you have not evaluated whether LoRA would suffice. Reserve Full FT for models where you genuinely need to exceed the base model's capability ceiling and have the compute budget to justify it.

- **Collecting training data before defining the evaluation set.** The evaluation set defines what "good" means for your fine-tuned model. Building the training data first means you are optimizing for whatever your data happens to contain, rather than for the outcomes you actually want. Define the evaluation set first, then collect training data that covers the same distribution.

- **Deploying a fine-tuned model without a rollback plan.** Every fine-tuned model must be deployable alongside the base model, with a feature flag that can switch between them in seconds. If your fine-tuned model regresses on a subset of inputs that your evaluation set missed, you need to be able to roll back immediately. A deployment without a rollback plan is a deployment without a safety net.

- **Treating fine-tuning as a one-time project.** Fine-tuning is a recurring process. The base model will be updated, your training data will grow, and your evaluation criteria will evolve. A fine-tuned model that is not re-evaluated and re-trained on a quarterly cadence is a model that is silently degrading relative to the state of the art.

## Related

- Same-category journey: [../platform/pick-an-llm-provider.md](../platform/pick-an-llm-provider.md) — baseline model selection
- Same-category journey: [./tune-prompts.md](./tune-prompts.md) — prompt first over fine-tuning
- Same-category journey: [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) — evaluation
- Same-category journey: [../../engineer/engineering/reduce-cost.md](../../engineer/engineering/reduce-cost.md) — inference cost
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — ai-specific leaf entry
