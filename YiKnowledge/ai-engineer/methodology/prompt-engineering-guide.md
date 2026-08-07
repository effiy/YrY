---
title: Prompt Engineering best practices guide
aliases:
- Prompt Engineering Guide
- Prompt Engineering Best Practices
tags:
- AI
- methodology
- prompt-engineering
- llm
category: ai-engineer/methodology
created: 2024-04-05
updated: 2026-08-07
source: https://example.com/prompt-engineering-guide
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- ai-engineer
- engineer
benefit: ai methodology sound
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- rag-design-patterns.md
- agent-architecture-patterns.md
- hallucination-mitigation.md
- prompt-injection-defense.md
- ./prompts/README.md
tacit: false
---

# Prompt Engineering best practices guide

> **As a** an ai engineer, **I want to** prompt engineering guide, **so that** ai methodology sound.

> Design LLM inputs in a structured, iterable way, covering role, task, constraints, output format and few-shot.

## Summary
- Basic four-piece set: role setting, structured delimiters, CoT / thinking, iterative optimization + prompt library.
- Advanced: RAG injection, structured output (JSON schema), function calling, few-shot selection, thinking budget.
- Stable parts (role, rules, examples) go up front, variable parts (user input) go at the end; enabling prompt caching brings cost down to 10%.
- Evaluation loop: accuracy, format compliance, P95 latency, stability variance, with LangSmith / Promptfoo / Braintrust.

## Core viewpoints

**Prompt engineering is not about writing better instructions -- it is about reducing the variance of the model's output distribution.** A well-engineered prompt does not make the model smarter; it constrains the model's output space so that the model consistently produces the desired output. The prompt is a specification of the output distribution, not a conversation with the model. Every element of the prompt (role, constraints, format, examples) serves to narrow the distribution, and the quality of the prompt is measured by the consistency of the output, not by the eloquence of the instructions.

**The most effective prompt is the one that has been iterated on the most, not the one that was written most carefully.** Prompt engineering is an empirical discipline, not a writing exercise. The prompt that works best is discovered through systematic iteration: write a prompt, evaluate on a test set, identify failure modes, modify the prompt, and repeat. The first draft of a prompt is rarely the best version, and the difference between the first draft and the tenth iteration is typically 10-30% on accuracy metrics. The iteration process is the prompt engineering, not the initial writing.

**The "thinking budget" is the most important and least understood prompt parameter.** For reasoning models (Opus 4.7, GPT-5, Gemini 2.5 Pro), the thinking budget controls how many tokens the model spends on internal reasoning before producing the output. The budget is a direct tradeoff between quality and cost: more thinking tokens improve reasoning quality but increase latency and cost. The optimal budget is task-dependent: 0 for simple classification, 2000-4000 for single-step reasoning, 8000-16000 for complex multi-step reasoning. The most common mistake is using the same budget for all tasks.

**The prompt is the interface between the application and the model -- and it should be versioned, tested, and deployed with the same rigor as application code.** A prompt change is a behavior change, and it can introduce regressions just like a code change. The prompt should be stored in version control, changes should be reviewed, and every change should be evaluated against a regression test set before deployment. The prompt is not a configuration file; it is part of the application logic.

**Prompt caching is not a performance optimization -- it is an architectural decision that changes how you structure prompts.** If you enable prompt caching, you must structure the prompt so that the cached portion (role, rules, examples) is at the beginning and the uncached portion (user input) is at the end. This structure is the opposite of many prompt templates that interleave instructions and input. The architectural constraint is worth it: with prompt caching, the cost of the fixed prefix can be reduced by 90%, which can change the economics of the entire application.

- **role + structure + example three-piece set** — role sets tone, delimiters frame instructions and content, few-shot demonstrates output style; missing any one hurts stability.
- **Opus 4.7 / GPT-5 / Gemini 2.5 have built-in thinking** — no longer need to handwrite "let's think step by step", but must be explicit about whether to enable.
- **Structured output beats free text** — `response_format` / `tool_use` strong-constraint JSON schema, avoiding parse failures.
- **Prompt caching is the cost-reduction lever** — stable parts up front + variable parts at the end + 5min/1h TTL, input cost down to 10%.
- **Simple tasks turn thinking off, complex tasks turn budget on** — simple tasks with thinking on burns money; reasoning tasks with thinking off degrades quality.

## Key information

### Basic techniques

**1.1 Role setting**: clarify the AI's role and domain expertise.
```
You are a senior Vue 3 + TypeScript engineer, familiar with Composition API, Pinia, Vitest.
```

**1.2 Structured tips**: use delimiters (```, ---, <task>...</task>) to separate instructions and content; provide clear output format requirements (JSON schema, table, Markdown); use few-shot examples to guide output style (3-5 examples work best).

**1.3 Chain-of-Thought**: guide the model to reason step by step. Opus 4.7 / GPT-5 / Gemini 2.5 Pro have built-in thinking mode; no need to manually add "let's think step by step", but you must be explicit about "whether thinking is enabled".

**1.4 Iterative optimization**: start from simple tips, gradually add complexity; record effective and failing tip patterns; build a team-internal prompt library (versioned, rollbackable).

### Advanced techniques

**2.1 RAG (Retrieval-Augmented Generation)**: inject external knowledge retrieval results into the prompt to avoid model hallucination.
```
[System] You are an after-sales business documentation assistant.
[Retrieved context]
- doc_1: rules about business regulations...
- doc_2: operation flow steps...
[Question] {user_question}
[Requirement] Answer only based on the above context; if the context is insufficient, state so.
```

**2.2 Structured output**: force the model to output JSON. Claude / GPT-5 / Gemini all support `response_format` or `tool_use` strong constraints.

**2.3 Function Calling**: let the model decide which tool to call.

**2.4 Few-shot selection**:
- **Zero-shot**: simple classification, transformation tasks
- **Few-shot (3-5)**: style control, complex output formats
- **Self-consistency**: sample multiple times for reasoning tasks then vote

**2.5 Thinking Budget**: Opus 4.7 / GPT-5 etc. can set a thinking token limit:
- Simple tasks: thinking budget = 0 (off)
- Complex reasoning: budget = 8000-16000 tokens
- Agent multi-step tasks: per-step budget = 2000-4000

### Recommended format

```
[Role] You are a...
[Task] Please help me...
[Constraints] 1... 2... 3...
[Output format] Please output in ... format
[Example] ...
```

### Prompt Caching optimization

- Put stable parts (role, rules, examples) up front in the prompt
- Put variable parts (user input) at the end
- Enable 5-minute / 1-hour TTL cache, input cost down to 10%

### Evaluation metrics

| Metric | Meaning |
|---|---|
| Accuracy | Matches ground truth |
| Format compliance | Whether JSON schema / table structure is correct |
| Latency and cost | P95 latency with thinking on vs off |
| Stability | Variance of results across multiple runs of the same prompt |

### Evaluation tools

- LangSmith / Langfuse: prompt version management and tracing
- Promptfoo: batch evaluation and comparison
- Braintrust: manual labeling + automated evaluation

### Applicable scenarios

- Single LLM call (basic techniques)
- RAG / Agent apps (advanced techniques + structured output + tool calling)
- Team-level prompt library building (iterative optimization + versioned)

## Action recommendations
1. Write prompts with a four-segment style: role + task + constraint + output format; none can be missing.
2. Use delimiters (XML tag / unique token) to frame user input for model recognition.
3. Turn thinking off for simple tasks; turn thinking budget 8000-16000 on for complex reasoning; 2000-4000 per step for Agent multi-step.
4. Use `response_format` or `tool_use` strong-constraint JSON schema for structured output; do not rely on natural-language descriptions.
5. Stable parts up front + variable parts at the end; enable prompt caching (5min / 1h TTL); input cost down to 10%.
6. Build a team prompt library: versioned, rollbackable, with LangSmith / Promptfoo auto-evaluation.
7. An evaluation set of 50-200 items; run regression on every prompt / model change.

## Anti-patterns

**Writing a prompt as a single block of prose without structure.** The model has no way to distinguish instructions from context from examples. The result is unpredictable behavior: the model may treat an example as an instruction, or a constraint as context. The minimum viable structure is: role, task, constraints, output format, and examples -- each clearly delimited with XML tags or markdown headers.

**Iterating prompts without an evaluation set.** Every prompt change is a hypothesis about what will improve the output. Without an evaluation set, you cannot test the hypothesis. The result is "prompt drift": the prompt accumulates changes that fix one failure mode while introducing new ones, and the overall quality degrades. The minimum viable evaluation set is 50-200 labeled examples that cover the core scenarios and known failure modes.

**Using the same thinking budget for all tasks.** Enabling thinking for simple tasks (classification, extraction, translation) wastes latency and cost without improving quality. Disabling thinking for complex reasoning tasks degrades quality. The thinking budget should be configured per task type, and the configuration should be tested on the evaluation set.

**Structuring the prompt without considering prompt caching.** If the prompt is structured with instructions interleaved with user input, prompt caching cannot be used because the entire prompt changes with each request. The fix is to put all static content (role, rules, examples) at the beginning and all dynamic content (user input) at the end. This single structural change can reduce input costs by 90%.

**Using natural language to describe the desired output format instead of a JSON schema.** The model's ability to follow natural-language format instructions is inconsistent. A JSON schema (via `response_format` or `tool_use`) provides a hard constraint that the model cannot violate. The difference between natural-language format instructions and JSON schema is the difference between "the model usually produces the right format" and "the model always produces the right format."


- **Tips too vague** — output unstable; add role, constraint, example.
- **Ignoring context window limits** — over-long input gets truncated; monitor token count + summary.
- **Over-reliance on a single tip** — lacks iteration; start simple, gradually add complexity.
- **Not enabling prompt caching** — repeated input burns tokens; stable parts up front + cache.
- **Contradictory styles across few-shot examples** — output style drifts; unify example styles.
- **Using natural-language descriptions for structured output** — parse failures; use JSON schema instead.
- **Disabling thinking for reasoning tasks** — quality drops; reasoning tasks must enable thinking.
- **Enabling thinking for simple tasks** — cost and latency spike; simple tasks budget=0.

## Related
- Same class: [rag-design-patterns-summary.md](./rag-design-patterns.md) (RAG prompt construction); [agent-architecture-patterns-summary.md](./agent-architecture-patterns.md) (tool description is the prompt); [hallucination-mitigation-summary.md](./hallucination-mitigation.md) (prompt-layer hallucination suppression); [prompt-injection-defense-summary.md](./prompt-injection-defense.md) (prompt security)
- upstream: [./prompts/README.md](./prompts/README.md) (team prompt library)
- downstream: all LLM apps in this team (YiAi BRD / YiVad chat)
