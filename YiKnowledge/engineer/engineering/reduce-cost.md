---
title: Reduce cost
aliases:
- I want to reduce cost
- cost-optimization-journey
- cost-reduction-journey
- cost reduction entry
tags:
- journeys
- cost
- optimization
- capacity
- llm-cost
- supply-chain
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- engineer
benefit: optimization is measured
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../ai-engineer/platform/pick-an-llm-provider.md
- ../../tech-lead/roadmap/plan-tech-roadmap.md
- ../strategies/prepare-a-quarterly-review.md
- ../../oncall-sre/observability/capacity-and-cost.md
review_cycle: quarterly
tacit: false
---

# I want to reduce cost

> **As an** engineer, **I want to** reduce cost, **so that** optimization is measured.

> "LLM cost + infrastructure + third-party dependencies + people efficiency + supply-chain optimization" reaches capacity cost + thinking tools + multi-provider routing + fine-tuning decisions + case comparison within 2 hops.

## Summary

- Capacity cost via [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) + [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md)
- LLM routing via [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) + [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md)
- Fine-tuning decision via [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md)
- Inference engine via [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) — vLLM self-hosted vs closed-source API
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)

## Core viewpoints

- **LLM cost optimization is not about finding the cheapest model — it is about matching model capability to task complexity** — A simple classification task does not need Claude Opus; a complex BRD generation does not work with a 7B model. Multi-provider routing with a model selection strategy (small model for simple tasks, large model for complex tasks) typically reduces cost by 60-80% without degrading quality. The cost inflection point is the task complexity, not the model price.

- **Self-hosting (vLLM) is not always cheaper than API — the break-even requires steady traffic** — vLLM self-hosting has a fixed GPU cost regardless of usage. The API has a per-token cost that scales with usage. The break-even point is when monthly token consumption exceeds $5,000. Below that, API is cheaper; above that, self-hosting starts to pay off. But the break-even analysis must include ops burden (model updates, monitoring, failover), not just GPU cost.

- **Cost reduction that degrades user experience is not cost reduction — it is value destruction** — A cost reduction that increases latency by 2x or reduces answer quality by 20% saves money but loses users. The metric for cost reduction is not "dollars saved" but "dollars saved per unit of quality maintained." Cost reduction without quality baselines is gambling.

- **Third-party dependency cost is not the license fee — it is the integration cost** — A third-party API that costs $500/month but requires 10 hours of integration work per month has a true cost of $500 + (10 x hourly rate). The integration cost (maintenance, upgrades, debugging) often exceeds the license fee. Reducing the number of third-party dependencies is often more impactful than negotiating lower prices.

- **People efficiency is the largest cost lever, and it is the hardest to measure** — Developer time is the most expensive resource. A tool that saves 10 minutes per developer per day saves 40 hours per month across a team of 8. But measuring developer time savings is notoriously difficult. The cost of not measuring is that efficiency investments are deprioritized in favor of directly measurable infrastructure costs.

## Key info

- **LLM cost optimization hierarchy (most impactful first)**: (1) Model selection by task complexity — route simple tasks (classification, extraction, summarization) to small models (Claude Haiku, GPT-4o-mini, $0.25-$1/MTok) and complex tasks (BRD generation, multi-step reasoning) to large models (Claude Opus, GPT-4.5, $15-$75/MTok). Typical savings: 60-80% vs. routing everything to the large model. (2) Prompt compression — shorter prompts cost less per call; remove redundant context, compress system prompts, summarize conversation history. Typical savings: 20-40%. (3) Caching — cache frequent LLM responses (semantic cache for similar queries, exact cache for identical queries). Typical savings: 30-50% for cacheable workloads. (4) Fine-tuning — replace few-shot prompting with a fine-tuned small model. Typical savings: 50-90% vs. prompting a large model, but requires training data and ongoing maintenance. (5) Self-hosting (vLLM) — for workloads exceeding $5K/month in API costs. The YiAi project uses multi-provider routing with model selection by task complexity.
- **Infrastructure cost optimization checklist**: (1) Right-sizing — are instances running at <30% CPU/memory? Downsize or use auto-scaling; (2) Reserved instances — for steady-state workloads, reserved instances save 30-50% vs. on-demand; (3) Spot/preemptible instances — for batch workloads (data pipelines, model training), spot instances save 60-90%; (4) Storage tiering — hot data on SSD, warm data on HDD, cold data on object storage (S3/OSS), saves 50-80% on storage; (5) Data transfer — cross-region and cross-cloud egress is the hidden cost; keep data transfer within the same region/cloud; (6) Idle resource cleanup — stop dev/staging instances outside business hours, auto-stop after 2 hours of inactivity. The Yi-family projects use MongoDB Atlas M0 (free tier) for development, which eliminates database cost for non-production environments.
- **Third-party dependency cost audit**: For each third-party service: (1) Direct cost — monthly subscription, per-call pricing, overage charges; (2) Integration cost — engineering hours spent on integration, maintenance, and debugging per month; (3) Opportunity cost — what features or improvements were deferred because engineering time went to integration maintenance; (4) Lock-in cost — estimated cost of migrating away (data export, code rewrite, retraining). A dependency whose total cost (direct + integration + opportunity + lock-in) exceeds its value should be replaced or removed. The Yi-family projects use: MongoDB Atlas (database), Anthropic/OpenAI (LLM API), GitHub (source control, CI), and no other paid third-party services.
- **vLLM self-hosting break-even analysis**: Fixed cost: GPU instance (A100 $1.5-3/hr, H100 $2-4/hr), 24/7 operation = $1,080-2,880/month. Variable cost: electricity, cooling, maintenance labor (estimate 10 hours/month). API cost: per-token pricing, varies by model and provider. Break-even: monthly token consumption × API price per token = GPU cost + maintenance. Example: GPT-4o-mini at $0.15/MTok input + $0.60/MTok output. If monthly usage is 500M input tokens + 100M output tokens, API cost = $75 + $60 = $135/month. Self-hosting at $1,080/month is 8x more expensive. Break-even requires ~4B tokens/month. The YiAi project is far below the break-even threshold and should use API-based models.
- **Cost reduction measurement framework**: (1) Baseline — current monthly cost by category (LLM, infrastructure, third-party, people); (2) Target — cost reduction goal, specific to each category (e.g., reduce LLM cost by 50% without quality degradation); (3) Quality guardrail — the metric that must not degrade (e.g., answer accuracy, latency p99); (4) Measurement period — run the cost reduction change for at least 2 weeks to capture a full business cycle; (5) Decision — if cost decreased AND quality guardrail held, keep the change; if cost decreased but quality degraded, revert; if cost increased, revert. The Yi-family projects currently have no formal cost reduction measurement framework.
- **Yi-family cost profile (estimated)**: YiAi — LLM API calls (primary cost, varies by usage), MongoDB Atlas (free tier M0, $0), compute (shared server, $0 marginal cost). YiVad — static frontend hosting (Vercel/Netlify free tier, $0), MongoDB Atlas (free tier, $0). YiPet — Chrome Web Store (one-time $5 developer registration), no server costs (client-side only). The total monthly cost for all Yi-family projects is estimated at under $200, with LLM API calls being the only meaningful cost. Cost optimization is currently not a high-priority concern given the low absolute spend.

## Scenario

When reducing LLM cost / reducing infrastructure cost / cutting third-party dependencies / improving people efficiency / quarterly cost-reduction goals, architect + TL + finance + lead owner need to look up capacity cost + thinking tools + multi-provider routing + fine-tuning decisions + landing cases. This entry aggregates cost-reduction-related 4 leaves + routing ADR + fine-tuning decision + cases into a 2-hop path, avoiding "cutting cost by gut call / single-provider lock-in / cost reduction hurting experience / no retrospective after cutting".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/data/` | [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) — storage cost |
| `methodology/ai-specific/` | [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| `work/processes/` | [capacity-planning-process.md](../infrastructure/capacity-planning.md) · [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) · [dependency-upgrade-process.md](dependency-upgrade.md) · [tech-roadmap-review-summary.md](../process/tech-roadmap-review.md) · [engineering-productivity-metrics-summary.md](../process/engineering-productivity-metrics.md) · [org-productivity-diagnosis-summary.md](../process/org-productivity-diagnosis.md) |
| `work/tools/` | [vllm-ollama-deployment-summary.md](vllm-ollama-deployment.md) · [claude-code-tips-summary.md](claude-code-tips.md) · [pi-agent-harness-evolution-summary.md](pi-agent-harness-evolution.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../lessons) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) |
| `projects/YiAi/` | [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) · [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) · [adr-rag-evaluation-infra.md](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) |
| `product/metrics/` | [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) — revenue per user - cost per user |
| `industry/reports--` | [ai-industry-report-summary.md](../../executive/industry/reports--ai-industry-report.md) — industry cost benchmark |

## Action recommendations

1. **First principles**: First decompose cost structure (LLM / inference / storage / bandwidth / third-party / people / ops) then define cost-reduction goals; do not just look at the total bill; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: First imagine "cost reduction could hurt experience / how it could fail" then set guardrail metrics; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **LLM multi-provider routing**: simple tasks to cheap models / hard tasks to flagship / fallback to closed-source; see [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md).
4. **Prompt cache**: fixed system + fixed context via cache; high-frequency variable input not cached; monitor cache hit rate.
5. **Fine-tuning**: high-frequency scenarios + sufficient data → LoRA / QLoRA; low-frequency → no fine-tuning, use closed-source; see [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md).
6. **Self-hosting**: large scale + data-sensitive → vLLM self-hosting; see [vllm-ollama-deployment-summary.md](vllm-ollama-deployment.md) + [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md).
7. **Quantization**: FP8 / INT8 / INT4 trade off latency + memory + accuracy loss; do not quantize blindly.
8. **Storage**: cold/hot tiering + TTL + compression + index optimization; see [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) + [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md).
9. **Third-party dependencies**: audit SaaS licenses + utilization + alternatives; see [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) + [dependency-upgrade-process.md](dependency-upgrade.md).
10. **Tech debt**: pay off high-ROI debt first (saves future work hours + reduces incidents); see [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) + [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md).
11. **People efficiency**: automation + toolchain + documentation + AI assistance; see [engineering-productivity-metrics-summary.md](../process/engineering-productivity-metrics.md) + [claude-code-tips-summary.md](claude-code-tips.md).
12. **Flywheel**: money saved from cost reduction is reinvested in automation / eval sets / documentation → further cost reduction; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).
13. **Second-order**: cost reduction may make architecture more brittle / increase team cognitive load; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
14. **Retrospective**: quarterly retrospective on cost-reduction results + guardrail metrics + next-quarter goals; see [tech-roadmap-review-summary.md](../process/tech-roadmap-review.md).

## Anti-patterns

- **Cost reduction by switching to the cheapest model without quality baselines** — Switching from Claude Opus to a 7B open-source model may reduce cost by 90% but destroy answer quality. The metric for cost reduction is "dollars saved per unit of quality maintained," not "dollars saved." Without quality baselines (evaluation set + regression threshold), cost reduction is indistinguishable from quality regression.

- **Self-hosting without analyzing traffic patterns** — vLLM self-hosting has a fixed GPU cost regardless of usage. If traffic is spiky (high during business hours, near zero at night), the GPU is idle 50% of the time. The break-even analysis must account for utilization rate, not just monthly token volume. Self-hosting with 30% GPU utilization is more expensive than API.

- **Negotiating third-party discounts without reducing integration cost** — A third-party API that costs $500/month but requires 10 hours of integration work per month has a true cost far exceeding the license fee. Reducing the number of third-party dependencies is often more impactful than negotiating lower prices.

- **Cost reduction that silently degrades UX** — A cost reduction that increases latency by 2x or reduces answer quality by 20% saves money but loses users. The guardrail for cost reduction is not "cost decreased" but "cost decreased AND quality maintained." Absent quality metrics, cost reduction is a blind optimization.

- **Ignoring people efficiency as a cost lever** — Developer time is the most expensive resource. A tool that saves 10 minutes per developer per day saves 40 hours per month across a team of 8. But developer time savings are notoriously difficult to measure, so they are deprioritized in favor of directly measurable infrastructure costs. The cost of not measuring is that efficiency investments are underfunded.

## Related

- similar journey: [../../ai-engineer/platform/pick-an-llm-provider.md](../../ai-engineer/platform/pick-an-llm-provider.md) — LLM selection cost reduction
- similar journey: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — cost-reduction planning
- similar journey: [../strategies/prepare-a-quarterly-review.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-quarterly-review.md) — quarterly cost-reduction retrospective
- similar journey: [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) — debt + cost-reduction interplay
- Upstream: [../../oncall-sre/observability/README.md](../../oncall-sre/observability/README.md) — infra leaf entry
