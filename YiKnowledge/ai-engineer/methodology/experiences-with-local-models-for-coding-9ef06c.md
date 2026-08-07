---
title: "Experiences with Local Models for Coding: Practical Evaluations"
tags: [local-models, coding-agents, llm-evaluation, model-comparison, qwen]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/exploring-gen-ai/local-models-for-coding-experiences.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Get practical evaluation results comparing local LLMs on standard coding tasks, with guidance on which model to try for day-to-day use."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/viability-of-local-models-for-coding-f769de.md
---

# Experiences with Local Models for Coding: Practical Evaluations

> **As a** developer exploring local models, **I want to** see real evaluation results comparing local LLMs on standard coding tasks, **so that** I can choose which model to try for day-to-day use without running my own benchmark suite.

## Summary

- Birgitta Boeckeler reports on her hands-on experiences trying local LLMs for coding tasks, comparing them using two standardized tasks and evaluating the most promising model for daily use.
- The evaluations are practical and task-specific, not generic benchmarks -- they reflect real coding workflows.
- Qwen 3.6 emerged as the sweet spot for local agentic programming, consistent with findings from other practitioners.
- The comparison includes both objective task success rates and subjective experience factors like latency, reliability, and integration with existing workflows.

## Core viewpoints

### 1. Task-specific evaluation beats generic benchmarks
The two standardized tasks used in the evaluation reflect actual coding workflows, not abstract reasoning benchmarks. This is critical because a model can score well on generic benchmarks while failing at the specific coding tasks your team does daily. The evaluation methodology is as important as the results.

### 2. The "sweet spot" model changes fast, but the evaluation framework is stable
Qwen 3.6 was the sweet spot at the time of writing, but the specific model will change within months. What is durable is the evaluation framework: test against your actual tasks, measure both capability and experience factors, and re-evaluate periodically as new models are released.

### 3. Day-to-day use reveals issues that benchmarks miss
The most valuable part of the evaluation was not the standardized task comparison but the day-to-day use trial. This surfaced issues with latency, context management, and integration friction that benchmark evaluations would never catch. The recommendation: always do a "daily driver" trial before committing to a model.

### 4. Latency perception is as important as raw capability
A model that is 10% more capable but takes 3x longer to respond is worse for interactive coding than a slightly less capable model that responds instantly. The subjective experience of latency -- the "thinking pause" that breaks flow -- is a first-class evaluation criterion that no benchmark measures. Local models that run on fast hardware can beat cloud models on this dimension even when they lose on accuracy.

### 5. The model you evaluate today is not the model you will use next month
Local model releases are accelerating, and each new release can shift the capability landscape significantly. The evaluation framework is durable, but the specific model recommendation has a shelf life measured in weeks. Teams should treat model evaluation as a recurring activity, not a one-time decision, and build infrastructure that makes switching models cheap.

## Key info

- Two standardized coding tasks were used for comparison across models.
- Qwen 3.6 was identified as the current sweet spot for local agentic programming.
- The evaluation considered both capability (does it work?) and experience (is it pleasant to use?).
- Local models were tested with the same harness configuration used for cloud models.

## Action recommendations

1. Create two standardized coding tasks that represent your team's most common workflows. Use these as your evaluation baseline for any model.
2. When evaluating a local model, do a "daily driver" trial for at least a week. Benchmarks will not reveal integration friction or latency issues.
3. Re-evaluate your model choice every 1-2 months. The local model landscape is changing fast, and the sweet spot shifts.
4. Test models with your actual harness configuration, not in isolation. A model that works well in raw prompts may behave differently with your skills and guides.

## Anti-patterns

- **Choosing a model based on benchmark scores alone.** Task-specific evaluation and daily use experience are more predictive of real-world satisfaction.

- **Assuming the model that was best last quarter is still best.** The local model landscape evolves rapidly.

- **Evaluating local models in isolation from your harness.** The harness can compensate for model weaknesses, so the evaluation should reflect your actual setup.

- **Dismissing local models because they trail cloud models on leaderboards.** Leaderboards measure peak capability on artificial tasks, not sustained performance on your actual coding workflows. A model that scores 5% lower on a benchmark but eliminates token costs and privacy concerns may be the better business decision.

- **Running model evaluations on inadequate hardware.** A local model tested on a machine with 8GB VRAM will produce worse results than the same model on 24GB VRAM due to aggressive quantization. The evaluation must match the hardware you intend to deploy on, or the results will be misleadingly pessimistic.

## Related

- ai-engineer/methodology/viability-of-local-models-for-coding-f769de.md
- ai-engineer/methodology/fragments-july-13-d3002f.md