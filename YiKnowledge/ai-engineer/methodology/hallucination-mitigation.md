---
title: Hallucination Mitigation
aliases:
- Hallucination Mitigation
- LLM Hallucination
tags:
- AI
- methodology
- hallucination
- safety
category: ai-engineer/methodology
created: 2026-07-31
updated: 2026-08-07
source: internal
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
- llm-evaluation-methods.md
- prompt-engineering-guide.md
- prompt-injection-defense.md
tacit: false
---

# Hallucination Mitigation

> **As a** an ai engineer, **I want to** hallucination mitigation, **so that** ai methodology sound.

> Hallucination = the model generates content that looks plausible but is factually wrong or unsupported; mitigation relies on four stacked layers: prompt + RAG + post-processing + model layer.

## Summary
- Hallucinations fall into three classes: factual hallucination (conflicts with external facts), context hallucination (conflicts with the context), instruction hallucination (deviates from the instruction).
- Causes: training noise, poor long-tail coverage, autoregressive generation preserving coherence, over-alignment preferring fabrication over admitting ignorance, poor retrieval.
- Detection splits into internal and external: self-consistency + logprob + verbalized confidence; fact-checking + reference consistency + LLM-as-judge + tool verification.
- Mitigation in four layers: prompt (allow "don't know" + reference + structured + low temperature + refusal examples), RAG, post-processing, model layer (RLHF / DPO / RAG fine-tune).
- Hallucination rate and usability are a trade-off: zero hallucination -> refusal rate collapses; set the goal per scenario (customer service <1% / BRD <5% / summary faithfulness >95%).

## Core viewpoints

**Hallucination is not a bug -- it is an emergent property of the language modeling objective.** The model is trained to predict the next token, not to assert true facts. When the model encounters a gap between its training distribution and the query, it fills the gap with the most probable continuation, which may or may not be factually correct. Hallucination is the model doing exactly what it was trained to do: produce coherent text. The mitigation strategy must work with this property, not against it -- you cannot "fix" hallucination, you can only constrain it.

**RAG is the most effective hallucination mitigation strategy, but it is not a silver bullet -- it introduces its own failure modes.** RAG replaces the model's parametric knowledge with retrieved context, which reduces hallucination on factual queries. But RAG introduces new failure modes: retrieval failure (the right documents are not retrieved), context conflict (the retrieved documents contradict each other), and context hallucination (the model misreads the retrieved context). A RAG pipeline without hallucination monitoring is just a hallucination pipeline with a different source.

**The "zero hallucination" goal is a trap that leads to a product that refuses to answer most questions.** Every hallucination mitigation technique (low temperature, RAG, post-processing filters) has a false-positive rate: it blocks some correct answers along with the hallucinations. The aggregate effect is that as the hallucination rate approaches zero, the refusal rate approaches 100%. The correct goal is to set a hallucination rate target per scenario and accept the corresponding refusal rate.

**Hallucination detection is harder than hallucination generation -- the model is better at fabricating than at verifying.** The model's self-evaluation capability (LLM-as-judge, self-consistency, verbalized confidence) is weakly correlated with actual correctness. The model is systematically overconfident on its own hallucinations. This means that in-process detection (having the model check its own work) is insufficient. The detection must be external: fact-checking against authoritative sources, reference consistency checking, and human sampling.

**The hallucination rate is not a single number -- it is a multi-dimensional distribution that varies by query type, topic, and user.** A model may have a 2% hallucination rate on general Q&A but a 20% hallucination rate on specialized medical queries. The aggregate hallucination rate hides these variations. The monitoring system must track hallucination rates stratified by query category, topic domain, and user segment, and the mitigation strategy must target the highest-risk categories.

- **Distinguish hallucination from "reasonable uncertainty" and "creative expression"** — only counts as hallucination when the fact is verifiable and the model asserts it as fact.
- **Writing "do not hallucinate" in the prompt doesn't work** — the model verbally agrees but still fabricates; you must add RAG + reference + post-processing checks.
- **Strong constraints with poor retrieval equal turning RAG off** — optimize retrieval first, then suppress hallucination; otherwise it's equivalent to no RAG.
- **Zero hallucination ≠ a good product** — zero hallucination means massive refusals and collapsed usability; set a reasonable hallucination rate per scenario.
- **Hallucination rate must be monitored online** — LLM-as-judge faithfulness sampling 50 per day, monthly regression.

## Key information

### Hallucination classes

- **Factual hallucination** (factual hallucination): conflicts with verifiable external facts ("Company X was founded in 1970")
- **Context hallucination** (contextual hallucination): conflicts with the given context (RAG retrieved A but answered B)
- **Instruction hallucination** (instructional hallucination): deviates from the user instruction (asked for JSON output but got prose)

Distinguish hallucination from "reasonable uncertainty" and "creative expression" — only counts as hallucination when the fact is verifiable and the model asserts it as fact.

### Causes

| Cause | Mechanism |
|---|---|
| Training data noise | errors get learned |
| Poor long-tail coverage | low-frequency facts are misremembered |
| Autoregressive generation | once the preceding text is wrong, the following text continues the error to preserve coherence |
| Over-alignment | RLHF prefers fluent expression, prefers fabricating over admitting ignorance |
| Context conflict | system prompt / context / user query contradict each other, model picks one |
| Poor retrieval quality | RAG recalls noise, LLM answers based on noise |

### Detection methods

**Internal detection**

- **Self-consistency**: multiple samples, high answer agreement = low hallucination
- **Confidence calibration**: whether logprob correlates with correctness; most models' logprob is overly optimistic
- **Verbalized confidence**: ask the model to say "I'm 80% sure", weak correlation but useful as reference

**External detection**

- **Fact-checking**: extract key entities -> retrieve authoritative sources -> compare
- **Reference consistency** (faithfulness): can the RAG answer be derived from the context
- **LLM-as-judge**: have another model compare the answer with the reference, flag suspicious sentences
- **Tool verification**: for code / math / SQL, verify via execution results

**Online monitoring**

- Answers carry confidence distributions, long-tail low scores trigger manual sampling
- Monitor "regeneration rate" vs "user copy rate" differences; high former = user dissatisfaction
- Key entity chain extraction + comparison to detect fabricated entities

### Mitigation strategy

**Prompt layer**

1. **Explicitly allow "don't know"**: system prompt says explicitly "if there's no evidence in context, answer 'insufficient information'"
2. **Require references**: ask the model to annotate the source chunk at the end of each sentence
3. **Structured output**: fixed JSON fields, smaller fabrication space
4. **Lower temperature**: 0-0.3, reduce randomness
5. **Few-shot with refusal examples**: demonstrate how to answer when uncertain

**Retrieval layer (RAG)**

1. **Recall quality**: rerank + hybrid search, ensure context relevance
2. **Sufficient context**: top-k not too few, wide recall pool but strict rerank
3. **Verify retrieval results**: if scores are all below threshold, first tell the user "no relevant content in knowledge base", don't force an answer

**Post-processing layer**

1. **Fact filter**: extract key claims -> retrieve -> compare -> flag
2. **Reference verification**: check that the referenced chunk actually contains the referenced content
3. **Sensitive word detection**: entities / PII / medical-legal disclaimers

**Model layer**

1. **RLHF with "honesty" reward**: reward saying "don't know", penalize fabrication
2. **DPO preference alignment**: use real vs fabricated paired samples
3. **RAG fine-tune**: train the model to rely on context rather than parametric knowledge

### Evaluation metrics

| Metric | Meaning |
|---|---|
| Hallucination rate | proportion of answers containing hallucinations |
| Faithfulness | proportion of answer derivable from context |
| Factuality | proportion consistent with external facts |
| Citation accuracy | proportion of correct references |
| Refusal accuracy | proportion of refusals when refusal was appropriate |
| False refusal | proportion of refusals when refusal was inappropriate |

### Goal per scenario

| Scenario | Goal hallucination rate | Note |
|---|---|---|
| Customer service FAQ | < 1% | wrong answers directly harm users |
| BRD generation | < 5% | errors need manual review, but refusal rate can't be too high either |
| Creative writing | N/A | no fact constraint needed |
| Code generation | unit tests decide | pass compile/test = correct |
| Summary | faithfulness > 95% | must not fabricate content not in the source |

### Applicable scenarios

- RAG applications (faithfulness + reference consistency)
- Knowledge-intensive QA (fact-checking + LLM-as-judge)
- Code generation (unit tests decide)
- Creative writing (not applicable)

## Action recommendations
1. Set hallucination rate goal per scenario: customer service <1% / BRD <5% / summary faithfulness >95% / code via tests.
2. Prompt layer four-piece set: allow "don't know" + require references + structured output + low temperature + refusal example few-shot.
3. RAG layer: rerank + hybrid search + active refusal when recall scores are all low.
4. Post-processing: fact filter + reference verification + sensitive word detection.
5. Online monitoring: LLM-as-judge faithfulness daily sample 50 + regeneration rate alerts + key entity chain comparison.
6. Monthly regression: run full evaluation set, compare to baseline, investigate immediately on degradation.
7. Model layer (optional): RLHF honesty reward / DPO preference alignment / RAG fine-tune.

## Anti-patterns

**Adding "do not hallucinate" to the prompt and considering the problem solved.** The model does not understand "do not hallucinate" as a constraint on its output distribution -- it understands it as a stylistic preference that it can acknowledge without applying. The model will respond "I will not hallucinate" and then proceed to hallucinate. The fix requires architectural changes: RAG grounding, citation enforcement, and post-processing verification.

**Pursuing zero hallucination at the cost of making the product unusable.** Every hallucination mitigation technique has a false-positive rate. The cumulative effect of layering multiple mitigation techniques is that the model refuses to answer most questions. The correct approach is to set a hallucination rate target per scenario (customer service <1%, BRD <5%, creative writing N/A) and accept the corresponding refusal rate.

**Implementing hallucination detection without human calibration.** The automated hallucination detection metrics (LLM-as-judge faithfulness, self-consistency, reference consistency) are biased. Without human calibration -- having human evaluators score the same examples and comparing the distributions -- the automated metrics can drift without detection. The human calibration should be done weekly on a sample of 50-100 production outputs.

**Monitoring only the aggregate hallucination rate without stratification.** The aggregate rate hides the fact that certain query types, topics, or user segments have much higher hallucination rates. The monitoring system must track hallucination rates stratified by query category, topic domain, and user segment, and the mitigation strategy must target the highest-risk categories.

**Applying the same hallucination mitigation strategy to all scenarios.** The appropriate hallucination rate and mitigation strategy depend on the cost of failure. A customer service bot that gives wrong information about a refund policy has a different cost of failure than a creative writing assistant that invents a fictional character. The mitigation strategy must be configured per scenario, not applied uniformly.


- **Relying only on prompt "do not hallucinate"** — the model verbally agrees but still fabricates; add RAG + reference + post-processing checks.
- **Pursuing zero hallucination** — massive refusals, usability collapse; accept a reasonable hallucination rate, tiered per scenario.
- **Strong constraints with poor retrieval** — the model can only say "don't know", equivalent to no RAG; optimize retrieval first, then suppress hallucination.
- **No evaluation** — post-launch hallucination rate unknown; evaluation set + online monitoring + sampling.
- **No scenario tiering** — one-size-fits-all temperature 0, creative scenarios become rigid; configure per task tier.

## Related
- Same class: [rag-design-patterns-summary.md](./rag-design-patterns.md) (RAG is the main hallucination suppressor); [llm-evaluation-methods-summary.md](./llm-evaluation-methods.md) (faithfulness evaluation); [prompt-engineering-guide-summary.md](./prompt-engineering-guide.md) (prompt layer suppression); [prompt-injection-defense-summary.md](./prompt-injection-defense.md) (safety guardrails)
- upstream: model capability itself (uncontrollable)
- downstream: YiAi BRD (<5% goal), YiVad chat (10% accepted)

## References
- Ji et al., 2023 — *Survey of Hallucination in NLG*
- RAGAS faithfulness: https://docs.ragas.io
- TruthfulQA: https://github.com/sylinrl/TruthfulQA
- Self-Consistency: Wang et al., 2022
