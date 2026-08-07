---
title: The Orchestrator's Tax
tags: [coding-agents, orchestrator, subagents, context-window, delegation, AI-engineering, token-efficiency]
category: engineer/engineering
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/orchestrator-tax.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, ai-engineer]
benefit: "Reframe subagents as a tool for protecting the orchestrator's working memory (context window), not just for parallel execution -- and learn explicit ground rules for when and how to delegate."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ../../ai-engineer/methodology/agent-architecture-patterns.md
  - ../../ai-engineer/methodology/building-reliable-agentic-ai-systems-658fa0.md
  - ./do-a-code-archaeology.md
---

# The Orchestrator's Tax

> **As an** AI engineer designing agent systems, **I want to** understand the real cost of keeping information in the orchestrator's context window, **so that** I can design subagent delegation that protects the orchestrator's working memory rather than just optimizing for parallel execution.

## Summary

- Rahul Garg argues that subagents are typically justified by time saved and parallel execution, but that is not what matters most.
- Every token in the orchestrator's context window competes for its attention. The real value of a subagent is what it keeps OUT of that context.
- Subagents should be treated as a tool for protecting the orchestrator's working memory -- offloading reasoning it does not need to hold onto.
- Doing this well requires giving the orchestrator explicit ground rules for when and how to delegate. Without rules, delegation becomes inconsistent and the orchestrator's context still fills up.
- The "orchestrator's tax" is the cognitive overhead of holding too much information in context. Subagents reduce this tax by encapsulating reasoning.

## Core viewpoints

### 1. Context window is working memory, not storage

The orchestrator's context window is analogous to human working memory. It has limited capacity, and every token in it competes for attention. Information that is present but irrelevant still consumes capacity and degrades decision quality.

### 2. Subagent value is measured by context kept out, not work done

Parallel execution is a secondary benefit. The primary benefit is offloading: the orchestrator delegates a task along with the reasoning needed to complete it, and receives only the result. The intermediate reasoning never enters the orchestrator's context.

### 3. Explicit delegation rules are necessary

Without explicit ground rules for when and how to delegate, the orchestrator either delegates too little (keeping too much in context) or delegates too much (losing coherence). The rules should specify: what tasks are delegable, what information the orchestrator must retain, and how results are integrated.

### 4. The orchestrator's context budget should be treated as a finite resource

Every token in the orchestrator's context window has an opportunity cost. A token spent on intermediate reasoning is a token that could have been spent on understanding the user's intent, evaluating trade-offs, or maintaining conversation coherence. Teams should monitor context window utilization and treat it as a budget that must be allocated across competing demands.

### 5. Good delegation rules are specific about what the orchestrator must retain

The orchestrator should not delegate everything. Certain information -- the user's original intent, the overall task structure, cross-cutting constraints -- must remain in the orchestrator's context to maintain coherence. Delegation rules should specify not just what to delegate, but what the orchestrator must retain. Delegation without retention rules leads to fragmented context and loss of coherence.

## Key info

- The "orchestrator's tax" = cognitive overhead of holding too much in context.
- Subagents protect the orchestrator's working memory (context window), not just parallelize work.
- Explicit delegation rules are required for consistent, effective delegation.
- The pattern applies to any agent system where a central orchestrator coordinates multiple subagents.

## Action recommendations

1. Define explicit ground rules for when the orchestrator should delegate. Specify delegable task types, required retained information, and result integration patterns.
2. Measure subagent value by context tokens kept out, not by tasks completed.
3. Design subagent prompts to be self-contained: the orchestrator should not need to hold intermediate reasoning.
4. Monitor orchestrator context utilization. If it grows over time, review delegation rules.

## Anti-patterns

- **Do not justify subagents solely by parallel execution. The context protection benefit is more important.**

- **Do not delegate without explicit rules. Inconsistent delegation fills the orchestrator's context.**

- **Do not keep intermediate reasoning in the orchestrator's context. The subagent should return only the result.**

- **Using subagents as a replacement for prompt engineering.** Subagents offload reasoning, but they do not eliminate the need for well-structured prompts. If the orchestrator's prompt is vague, the subagent's prompt will be vague too, and the result will be low-quality. Subagents amplify prompt quality, not compensate for poor prompts. The orchestrator must be well-prompted before delegation can help.

- **Optimizing subagent parallelism without optimizing context retention.** Parallel execution reduces wall-clock time but does not reduce the orchestrator's context tax. If the orchestrator receives results from 10 parallel subagents and holds all 10 results in context, the context tax is 10x higher than a single subagent. Parallelism must be paired with result summarization to protect the orchestrator's working memory.

## Related

- [Agent Architecture Patterns](../../ai-engineer/methodology/agent-architecture-patterns.md) — Subagent delegation patterns
- [Building Reliable Agentic AI Systems](../../ai-engineer/methodology/building-reliable-agentic-ai-systems-658fa0.md) — Reliable agent design
- [Do a Code Archaeology](./do-a-code-archaeology.md) — Understanding complex codebases