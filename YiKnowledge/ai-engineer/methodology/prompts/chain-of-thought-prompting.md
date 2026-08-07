---
title: Chain-of-Thought Prompting Patterns
aliases:
- chain-of-thought-prompting
- cot-prompting
- reasoning-prompt-patterns
tags:
- prompt-engineering
- chain-of-thought
- reasoning
- llm
- ai-engineer
category: ai-engineer/methodology/prompts
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- ai-engineer
- engineer
benefit: "AI engineers can design and evaluate chain-of-thought prompts that produce reliable, verifiable reasoning across diverse task types"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./agent-tool-use.md
- ./code-review.md
- ../agent-evaluation.md
- ../../foundations/sampling-strategy.md
tacit: false
---

# Chain-of-Thought Prompting Patterns

> **As an** AI engineer designing prompts for complex reasoning tasks, **I want to** understand the chain-of-thought prompting patterns that produce reliable, verifiable reasoning, **so that** I can choose the right pattern for each task type and evaluate whether the reasoning is correct or merely plausible.

> Chain-of-thought (CoT) prompting is the most widely used technique for improving LLM reasoning, but "just add 'think step by step'" is a blunt instrument. Different task types require different CoT patterns, and each pattern has distinct failure modes. This guide covers the four primary CoT patterns, when to use each, and how to evaluate the quality of the reasoning they produce.

## Summary

- Chain-of-thought prompting works by inducing the model to generate intermediate reasoning steps before producing a final answer, which improves accuracy on tasks requiring multi-step reasoning, arithmetic, or logical deduction
- Four primary patterns: zero-shot CoT ("let's think step by step"), few-shot CoT (demonstrating reasoning in examples), structured CoT (requiring specific reasoning formats), and self-consistency (sampling multiple reasoning paths and voting)
- The #1 failure mode is plausible-but-wrong reasoning — the model produces reasoning that sounds correct but contains a logical error that leads to the wrong answer. Structured CoT and self-consistency partially mitigate this
- CoT is most effective for tasks where the reasoning process is decomposable into discrete steps. It is least effective (and sometimes harmful) for tasks that require intuitive judgment, pattern recognition, or creative synthesis
- The cost of CoT is increased token usage (typically 3-10x more tokens than direct prompting) and increased latency. The decision to use CoT should be based on whether the accuracy gain justifies the cost

## Core viewpoints

### 1. The reasoning pattern must match the task structure

"Think step by step" is a generic instruction that works moderately well for many tasks but optimally for none. Different task types require different reasoning structures: arithmetic tasks need calculation decomposition, logical deduction tasks need premise-chaining, code generation tasks need specification-then-implementation, and analysis tasks need evidence-then-conclusion. The prompt should specify the reasoning structure, not just the instruction to reason. A prompt that says "break this into sub-problems, solve each independently, then combine the results" will outperform "think step by step" on decomposable tasks by a significant margin.

### 2. Structured CoT is the highest-accuracy pattern but requires the most design effort

Structured CoT requires the model to output reasoning in a specific format — typically with labeled sections, explicit intermediate results, and a clearly separated final answer. This format enables automated verification of the reasoning structure (are all required sections present? are intermediate results consistent with the final answer?) and makes it easier to spot reasoning errors. The design cost is higher because the structure must be specified for each task type, but the accuracy gain is typically 10-25% over zero-shot CoT for complex reasoning tasks.

### 3. Self-consistency is the most underutilized pattern

Running the same CoT prompt multiple times (with temperature > 0) and taking the majority answer is one of the simplest and most effective accuracy improvements available. Self-consistency works because reasoning errors are often stochastic — different samples make different errors — so the most common answer across samples is more likely to be correct. The cost is linear in the number of samples, but for high-stakes tasks (medical diagnosis, legal analysis, security review), the cost is justified. Self-consistency with 5-7 samples typically improves accuracy by 5-15% over single-sample CoT.

### 4. CoT is not always beneficial and can be actively harmful

For tasks that rely on pattern recognition, intuitive judgment, or creative synthesis, adding a reasoning step can degrade performance. The model may "overthink" a simple pattern-matching problem, introducing reasoning errors where a direct answer would have been correct. Before adopting CoT for a task, measure the accuracy with and without CoT on a representative evaluation set. If CoT does not improve accuracy by at least 5%, the token cost is probably not justified.

### 5. The quality of few-shot CoT examples determines the quality of the reasoning

The examples in a few-shot CoT prompt are not just demonstrations — they are the model's primary signal for what reasoning looks like. If the examples show shallow reasoning (jumping to conclusions, skipping steps, making unsupported assumptions), the model will replicate that pattern. The examples must show the reasoning you want: explicit step-by-step decomposition, clear labeling of intermediate results, verification of each step before proceeding, and explicit handling of edge cases and uncertainty. The time spent crafting high-quality CoT examples pays back in every subsequent inference.

## Key info

### Four primary CoT patterns

| Pattern | Description | Best For | Cost | Accuracy Gain |
|---|---|---|---|---|
| **Zero-shot CoT** | Add "let's think step by step" to the prompt | Quick improvement for any reasoning task | 3-5x tokens | 5-15% |
| **Few-shot CoT** | Provide 2-5 examples with reasoning | Tasks with consistent reasoning patterns | 3-5x tokens | 10-25% |
| **Structured CoT** | Require specific reasoning format with sections | Tasks requiring verifiable reasoning | 5-10x tokens | 15-30% |
| **Self-consistency** | Run CoT N times, take majority answer | High-stakes tasks where errors are costly | N × 3-10x tokens | +5-15% over base CoT |

### Structured CoT output format template

```markdown
## Problem Restatement
[Restate the problem in your own words, identifying key constraints and goals]

## Decomposition
1. [Sub-problem 1]
2. [Sub-problem 2]
...

## Solution
### Sub-problem 1
[Reasoning]
[Intermediate result]

### Sub-problem 2
[Reasoning]
[Intermediate result]

## Verification
- [Check 1: do intermediate results satisfy all constraints?]
- [Check 2: is the final answer consistent with all intermediate results?]
- [Check 3: are there edge cases that would produce a different answer?]

## Final Answer
[Clear, unambiguous answer]
```

### Task-to-pattern mapping

| Task Type | Recommended Pattern | Why |
|---|---|---|
| Arithmetic / math | Zero-shot CoT + self-consistency | Decomposable, deterministic answer |
| Logical deduction | Structured CoT | Premises must be explicitly tracked |
| Code generation | Structured CoT (spec → impl) | Specification before implementation prevents drift |
| Data analysis | Few-shot CoT | Analysis patterns are consistent within a domain |
| Legal / compliance | Structured CoT + self-consistency | High stakes, reasoning must be auditable |
| Creative writing | None (direct) | CoT degrades creative output |
| Classification | None (direct) | Pattern recognition, not reasoning |
| Translation | None (direct) | CoT adds latency without accuracy gain |

### Evaluation framework for CoT quality

| Dimension | Metric | Target |
|---|---|---|
| **Accuracy** | % of correct final answers | > baseline + 10% |
| **Reasoning validity** | % of reasoning chains without logical errors | > 90% |
| **Step completeness** | % of reasoning chains with all necessary steps | > 95% |
| **Self-consistency** | Agreement rate across 5 samples | > 80% |
| **Token efficiency** | Tokens per correct answer | < 3x direct prompt |

## Action recommendations

1. **Start with zero-shot CoT, measure the gain, then decide whether to invest in structured CoT.** The cost of structured CoT design is only justified if zero-shot CoT shows a meaningful accuracy gap that structure can close.
2. **Use self-consistency for any task where an incorrect answer has a business cost.** The additional token cost of 5-7 samples is negligible compared to the cost of a wrong answer in production. Default to self-consistency with N=5 for high-stakes tasks.
3. **Design the output format before writing the prompt.** The structured output format forces clarity about what the reasoning should look like. If you cannot specify the format, you do not understand the task well enough to prompt it effectively.
4. **Evaluate on a representative dataset, not on anecdotal examples.** A prompt that works perfectly on 3 hand-picked examples may fail on 30% of real inputs. Build a small evaluation set (50-100 examples) before deploying any CoT prompt to production.
5. **Monitor reasoning quality in production, not just final answer accuracy.** A prompt that produces the right answer with wrong reasoning will eventually produce the wrong answer. Periodically review reasoning chains from production traffic to detect reasoning drift.

## Anti-patterns

- **Adding "think step by step" to every prompt without measuring whether it helps.** CoT is not free — it increases token usage, latency, and (for some tasks) error rates. The decision to use CoT should be evidence-based, not habitual. Measure accuracy with and without CoT on your actual task before adopting it.
- **Using few-shot CoT with examples that show shallow or incomplete reasoning.** The model learns the reasoning pattern from the examples. If the examples skip steps, make unsupported leaps, or fail to verify intermediate results, the model will replicate those flaws. Few-shot CoT examples must be the best reasoning you can produce, not the first reasoning that comes to mind.
- **Evaluating CoT prompts by final answer accuracy alone, ignoring reasoning quality.** A prompt that gets 90% accuracy with reasoning that is wrong 30% of the time (but the wrong reasoning happens to lead to the right answer) will eventually fail when the task distribution shifts. Reasoning quality and answer accuracy must be evaluated independently.
- **Applying CoT to tasks that rely on intuition, pattern recognition, or creative synthesis.** For these tasks, CoT can degrade performance by forcing the model into an analytical mode that overrides its pattern-matching capabilities. Creative writing, sentiment analysis, and image description are examples where CoT typically hurts. Always run an A/B test before adopting CoT for a new task type.
- **Using the same CoT pattern for all tasks in a pipeline.** Different stages of an AI pipeline require different reasoning approaches. The classification stage may need direct prompting, the analysis stage may need structured CoT, and the generation stage may need few-shot CoT. Applying the same pattern everywhere is a missed optimization opportunity. Design the reasoning strategy per stage, not per pipeline.

## Related

- [Agent Tool Use](./agent-tool-use.md) — CoT patterns for tool-using agents
- [Code Review Prompts](./code-review.md) — Structured CoT for code review
- [Agent Evaluation](../agent-evaluation.md) — Evaluating reasoning quality in agent systems
- [Sampling Strategy](../../foundations/sampling-strategy.md) — How sampling parameters affect CoT self-consistency