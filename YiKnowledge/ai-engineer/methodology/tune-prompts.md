---
title: Tune prompts
aliases:
- i-want-to-tune-prompts
- prompt-tuning-journey
- prompt-iteration-journey
- prompt tuning entry
tags:
- journeys
- prompt-engineering
- prompt-tuning
- ab-testing
- llm-eval
category: ai-engineer/methodology
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- ai-engineer
benefit: optimization is measured
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../platform/evaluate-an-llm-app.md
- ../../engineer/projects/build-an-agent-system.md
- ../../engineer/quality-security/run-an-experiment.md
- ../../ai-engineer/methodology/prompt-engineering-guide.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to tune prompts

> **As a** an ai engineer, **I want to** tune prompts, **so that** optimization is measured.

> "Prompt design + iteration + A/B + eval set + cache + safety + case contrast" — reach within 2 hops the prompt guide + 7 prompt samples + evaluation + thinking tools.

## Summary

- Guide: [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md)
- Samples: `resources/prompts/` 7 entries: rag-system / code-review / agent-tool-use / sql-generation / multilingual-translation / brd-generation / weekly-report
- Evaluation: [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md)
- Defense: [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) + [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md)
- Thinking: [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md)

## Core viewpoints

**Prompt tuning is a scientific process, not an art form.** The difference between a prompt engineer and someone who "writes good prompts" is structured iteration with measurable outcomes. Every prompt change should be motivated by a specific, observed failure mode, and validated by an evaluation set that covers that failure mode. Tuning by intuition -- "this prompt feels better" -- is indistinguishable from random search. The process is: identify failure mode, hypothesize a fix, run evaluation, compare against baseline, repeat.

**The evaluation set is the prompt tuner's compass, and building it is the first deliverable.** A prompt tuning project that starts without an evaluation set is a project that has no way to know if it is making progress. The evaluation set should be 100-500 labeled items covering positive cases, negative cases, hard cases, and edge cases. It should be built before the first prompt change, not after. Every prompt change that improves one metric but degrades another is a signal that the evaluation set needs refinement, not that the prompt change is wrong.

**Prompt length has a non-linear relationship with quality.** A prompt that is too short is ambiguous. A prompt that is too long dilutes the model's attention, increases cost, and risks context truncation. The optimal prompt length is the shortest prompt that consistently produces the desired output. Each additional sentence should be justified by a specific, observed failure mode that it prevents. Prompts that grow over time without pruning accumulate dead instructions that the model learns to ignore.

**Prompt caching is the most underutilized cost optimization in prompt tuning.** Putting the stable parts of the prompt (role, rules, examples) at the front and the variable parts (user input) at the end enables prompt caching, which can reduce input costs by 90%. This is not a marginal optimization -- for high-volume applications, it can be the difference between profitable and unprofitable. Yet most teams tune prompts without considering cacheability.

**A/B testing prompts without a rollback mechanism is reckless.** Every prompt change should be deployed behind a feature flag with the ability to roll back in seconds. The A/B test should proceed through stages (1% -> 5% -> 25% -> 100%) with manual spot checks at each stage. A prompt that wins on evaluation but loses on real user metrics is a prompt that was not adequately tested. The rollback mechanism is the safety net that makes experimentation safe.

## Key info

- **Prompt iteration cycle (6 steps)**: (1) Identify failure mode — analyze production logs, user feedback, or eval set results to find a specific, recurring failure pattern (e.g., "model answers in English when the user asks in Chinese"); (2) Hypothesize fix — propose a specific prompt change that addresses the failure mode (e.g., "add explicit instruction: 'Always respond in the same language as the user's query'"); (3) Create test cases — add 5-10 new examples to the eval set that specifically test the failure mode; (4) Run evaluation — compare the new prompt against the baseline on the full eval set, not just the new test cases; (5) Check for regressions — verify that the fix doesn't degrade performance on previously passing cases; (6) Deploy canary — if eval passes, deploy behind feature flag with 1% canary and monitor for 24 hours. The cycle repeats for each failure mode. The Yi-family projects use this cycle for BRD generation and aiChat prompts.
- **Prompt structure optimization (4-part template)**: (1) Role — define the model's persona ("You are a senior BRD analyst with 10 years of experience in automotive after-sales"), placed at the beginning for cacheability; (2) Rules — 3-5 specific, non-negotiable constraints ("Always respond in Chinese. Never invent data. Cite sources with [source_id]."); (3) Examples — 2-3 few-shot examples showing desired input→output pairs, placed after rules; (4) Variable input — the user's query, placed at the end for cacheability. The role and rules are cacheable (same for every request); the examples are partially cacheable; the variable input is not. Structuring the prompt this way enables prompt caching, reducing input costs by up to 90% for high-volume applications.
- **Prompt cache optimization strategy**: Put the stable, cacheable content at the beginning of the prompt (role + rules + system context). Put the variable, non-cacheable content at the end (user query + dynamic context). The cache boundary is the point where the prompt content changes between requests. Most LLM providers (Anthropic, OpenAI) cache the prefix of the prompt up to the first differing token. A prompt with 2000 tokens of cacheable content and 200 tokens of variable content pays for only 200 tokens per request (90% savings). The YiAi project uses prompt caching for BRD generation (role + domain knowledge cached, user requirements variable).
- **Few-shot example selection strategy**: (1) Diversity — examples should cover different scenarios, not just the most common one; (2) Difficulty gradient — include easy (obvious answer), medium (requires reasoning), and hard (edge case) examples; (3) Counter-examples — include examples of what NOT to do, labeled as negative examples; (4) Format consistency — all examples must follow the exact same output format (JSON schema, markdown structure); (5) Number — 2-3 examples for simple tasks, 5-8 for complex tasks. More than 8 examples is diminishing returns; the model's attention is diluted across too many examples. The Yi-family BRD generation prompt uses 3 few-shot examples covering different business domains.
- **Prompt evaluation metrics by task type**: (1) Classification/extraction — accuracy, precision, recall, F1; (2) Generation/summarization — faithfulness (are claims grounded in source), relevance (is response on-topic), coherence (is response logically structured); (3) Translation — BLEU, COMET, human preference; (4) Code generation — pass@k (does the generated code pass tests), functional correctness; (5) Conversational AI — user satisfaction (thumbs up/down), task completion rate, engagement (messages per session). The Yi-family projects use faithfulness + relevance for BRD generation, and user satisfaction + engagement for aiChat.
- **Yi-family prompt inventory**: YiAi BRD generation — role + domain knowledge + 3 few-shot examples + user requirements, ~2000 tokens, cached prefix; YiAi aiChat — role + conversation context + user message, ~500-2000 tokens, partially cached; YiAi code review — role + code diff + review guidelines, ~1000-5000 tokens, not cached (code diff is unique per request); YiVad/Pet aiChat — prompt constructed server-side (YiAi), client sends only user message. The prompt tuning process is centralized in YiAi; changes benefit all three projects.

## Scenario

When designing prompts / iterating prompts / A/B testing prompts / canary-rolling out new prompts / optimizing cache / defending against injection / defending against hallucination, PM + algorithm + engineer need to look up the prompt guide + samples + evaluation + defense + thinking tools. This entry aggregates 7 prompt-tuning samples + guide + evaluation into a 2-hop path, avoiding "tuning by gut feel / no eval set / problems only surface at launch / no injection defense".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/ai-specific/` | [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts--rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts--sql-generation.md) · [multilingual-translation-prompt.md](../../ai-engineer/methodology/prompts--multilingual-translation.md) · [brd-generation-prompt.md](../../ai-engineer/methodology/prompts--brd-generation.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [inline-citation-rag-pattern.md](../../engineer/engineering/inline-citation-rag.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) — A/B dual world |
| `methodology/thinking/` | [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) — simplify · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — invert failure modes · [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — second-order effects |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) — model + engine + observability |
| `product/metrics/` | [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) — business metrics after prompt launch |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux--ai-product-ux-patterns.md) — UX degradation on prompt failure |
| `work/processes/` | [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) — canary + rollback + monitoring |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) — BRD Agent prompt landing · [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons) — prompt iteration stages |
| `lessons/gotchas/` | [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) — streaming prompt onDone guard · [react-jsxdev-mismatch.md](../../engineer/lessons/gotcha-react-jsxdev-mismatch.md) |
| `projects/YiAi/` | [adr-brd-agent-launch.md](../../tech-lead/decisions/yiai--brd-agent-launch.md) · [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) · [adr-rag-evaluation-infra.md](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) |
| `resources/templates/` | [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) — prompt archived to knowledge base |

## Action recommendations

1. **Structured**: system / context / instruction / format / examples / fallback six-section; do not write prose.
2. **Few-shot**: 3-5 positive examples + 1-2 negative examples + expected output; see [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md).
3. **Occam**: the longer the prompt the more likely it derails; the simplest version that meets the need wins; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
4. **Inversion**: first think "how can this prompt be bypassed / how can it hallucinate / how can it be misinterpreted" then harden; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
5. **Eval set**: build 100-500 labeled items (positive + negative + hard cases + edge cases); run full comparison against baseline on every prompt change; see [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md).
6. **A/B**: new prompt canary 1% → 5% → 25% → 100%; observe core metrics + manual spot checks at each stage; see [canary-release-process.md](../../oncall-sre/release/canary-release.md).
7. **Rollback**: prompt changes must support second-level rollback (versioned + feature flag); see [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md).
8. **Injection defense**: user input goes through isolation + schema validation + refusal strategy; see [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md).
9. **Hallucination mitigation**: retrieval grounding + forced references + self-consistency check; see [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) + [inline-citation-rag-pattern.md](../../engineer/engineering/inline-citation-rag.md).
10. **Cache**: fixed prompt + fixed input goes through prompt cache; high-frequency changing input is not cached; monitor cache hit rate.
11. **Observability**: launch monitoring of faithfulness / error rate / latency / cost / user reuse rate; see [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md).
12. **Archive**: launched prompts must be archived to `resources/prompts/` for external reuse; see [brd-generation-prompt.md](../../ai-engineer/methodology/prompts--brd-generation.md) pattern.
13. **Second-order**: prompts that are too long push up cost + latency + context truncation; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).

## Anti-patterns

- **Tuning prompts by gut feel.** "This prompt looks better" is not a valid evaluation criterion. Every prompt change must be backed by evaluation set results comparing the new prompt against the baseline on accuracy, format compliance, latency, and cost. Tuning by gut feel is the most common prompt engineering failure mode because it feels productive -- the prompt is changing, so something must be improving -- but it is indistinguishable from random walk.

- **Adding instructions without removing old ones.** Prompts that accumulate instructions over time become bloated. The model learns to ignore dead instructions, and the prompt's effective behavior is determined by the most recent instructions, not the most comprehensive ones. Each prompt revision should include a pruning step: remove any instruction that is no longer necessary, redundant with another instruction, or contradicted by a newer instruction.

- **A/B testing without statistical rigor.** Running an A/B test on 100 requests and declaring a winner is noise, not signal. A/B tests for prompt changes require sufficient sample size to detect meaningful differences, and the metrics being compared must be pre-registered. Cherry-picking the metric that shows the largest improvement after seeing the results is p-hacking applied to prompt engineering.

- **Testing prompts only on the "happy path."** The evaluation set must include negative cases (inputs where the model should refuse or say "I don't know"), hard cases (inputs that are close to the boundary), and edge cases (unusual input formats, very long inputs, very short inputs). A prompt that handles the happy path perfectly but fails on edge cases is a prompt that will fail in production.

- **Deploying a new prompt without monitoring its cache hit rate.** If the new prompt changes the structure of the stable portion (role, rules, examples), it may break prompt caching. A prompt that improves quality by 5% but increases cost by 10x due to lost caching is a net negative. Cache hit rate must be monitored alongside quality metrics during every prompt deployment.

## Related

- Same-class journey: [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) — evaluation method
- Same-class journey: [../../engineer/projects/build-an-agent-system.md](../../engineer/projects/build-an-agent-system.md) — Agent prompt
- Same-class journey: [../../engineer/quality-security/run-an-experiment.md](../../engineer/quality-security/run-an-experiment.md) — A/B experiment
- Same-class journey: [../../engineer/engineering/find-templates-and-prompts.md](../../engineer/engineering/find-templates-and-prompts.md) — prompt library
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — ai-specific leaf entry
