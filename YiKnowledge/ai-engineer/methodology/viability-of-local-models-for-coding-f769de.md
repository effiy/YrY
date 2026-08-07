---
title: "Viability of Local Models for Coding: Key Factors"
tags: [local-models, coding-agents, llm-evaluation, model-selection, cost-optimization]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/exploring-gen-ai/local-models-for-coding-factors.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Evaluate whether local LLMs are viable for your programming tasks based on concrete factors like model capability, hardware, and task complexity."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/experiences-with-local-models-for-coding-9ef06c.md
---

# Viability of Local Models for Coding: Key Factors

> **As a** developer, **I want to** evaluate whether local LLMs can replace cloud models for coding tasks, **so that** I can make cost-effective and privacy-conscious tooling decisions.

## Summary

- Birgitta Boeckeler systematically evaluates factors that determine whether local LLMs are viable for programming.
- The key dimensions are model capability, task complexity, hardware requirements, and developer workflow integration.
- Local models are crossing the threshold of "good enough" for many daily coding tasks, but frontier cloud models still lead for complex agentic workflows.
- The evaluation framework can be applied to any team's specific context to make an informed build-vs-buy decision for AI coding tools.

## Core viewpoints

### 1. Model capability is a moving target -- evaluate against your specific tasks, not benchmarks
Local models are improving rapidly, with open-weight models catching up to frontier models in months rather than years. The relevant question is not "is this model as good as Claude" but "can this model handle the specific coding tasks my team does daily." Create a task-specific evaluation suite rather than relying on generic benchmarks.

### 2. The harness matters as much as the model
A well-configured coding agent harness (guides + sensors) can compensate for a weaker model. Conversely, a powerful model with a poor harness produces unreliable output. When evaluating local models, test them with the same harness configuration you would use in production, not in isolation.

### 3. Hardware is the binding constraint, not the model
The viability question is often not about model quality but about whether you have GPUs with sufficient VRAM (16GB+ recommended) and whether the inference latency is acceptable for interactive use. The economics shift when you already have GPU capacity versus needing to procure it.

### 4. The hybrid model strategy is the pragmatic middle path
The most practical approach is neither all-cloud nor all-local, but a tiered strategy: use local models for routine tasks (code completion, simple refactoring, documentation generation) and cloud models for complex agentic workflows (multi-file refactoring, architectural design, debugging). This captures the cost and privacy benefits of local models while retaining the capability ceiling of frontier models for the hardest tasks. The routing decision can be automated based on task complexity.

### 5. The operational burden of local models is the hidden cost that benchmarks ignore
Running local models requires GPU driver management, model downloading and updating, inference server configuration, and monitoring. These operational tasks do not show up in benchmark comparisons but consume real engineering time. Teams that underestimate this burden find that the token cost savings are offset by the engineering time spent maintaining the inference infrastructure. The operational burden decreases over time as tooling improves, but it is not zero today.

## Key info

- Open-weight models are closing the gap with frontier models, with cycle times decreasing from 13-18 months to 2-7 months.
- Local models eliminate data privacy concerns and token costs, but introduce hardware capital costs and operational complexity.
- The Qwen 3.6 model emerged as a sweet spot for local agentic programming in recent evaluations.

## Action recommendations

1. Build a task-specific benchmark suite for your team's most common coding tasks before evaluating any local model.
2. Test local models with your actual harness configuration (not just raw prompts) to get realistic quality assessments.
3. Calculate total cost of ownership including GPU hardware, electricity, and engineering time for model management -- not just the avoided token costs.
4. Start with a hybrid approach: use local models for routine tasks and cloud models for complex agentic workflows.

## Anti-patterns

- **Assuming local models are categorically "not ready" without testing....** Assuming local models are categorically "not ready" without testing against your specific tasks. The gap is closing faster than most teams realize.

- **Assuming local models will save money without accounting for hardwa....** Assuming local models will save money without accounting for hardware costs and the engineering time to set up and maintain the inference infrastructure.

- **Evaluating models on benchmarks alone without testing with your act....** Evaluating models on benchmarks alone without testing with your actual harness and workflow.

- **Adopting local models without planning for the operational burden.** GPU driver management, model updates, and inference server maintenance consume real engineering time. The cost comparison must include this operational overhead, not just hardware and token costs.

- **Treating local and cloud models as an either-or decision.** The hybrid approach -- local for routine tasks, cloud for complex ones -- captures the benefits of both. A binary choice between all-local and all-cloud leaves value on the table.

## Related

- ai-engineer/methodology/experiences-with-local-models-for-coding-9ef06c.md
- ai-engineer/methodology/fragments-july-13-d3002f.md