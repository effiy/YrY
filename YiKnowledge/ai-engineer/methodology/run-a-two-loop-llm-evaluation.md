---
title: Run a two-loop LLM evaluation
aliases: [I want to run a two-loop LLM evaluation, two-loop-eval, inner-loop-eval, outer-loop-eval, pairwise-eval, pointwise-eval, rag-triad, model-monitoring]
tags: [journeys, methodology, two-loop-eval, inner-loop, outer-loop, pairwise, pointwise, rag-triad, groundedness, fulfillment, model-monitoring, prediction-drift]
category: ai-engineer/methodology
created: 2026-08-05
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "LLM quality is measured through inner-loop (development) and outer-loop (production) evaluation, catching regressions before users do"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
  - ./llm-evaluation-methods.md
  - ./rag-design-patterns.md
  - ./hallucination-mitigation.md
  - ../platform/orchestrate-agents-with-adk-and-agents-cli.md
  - ../platform/llm-observability-comparison.md
  - ../platform/evaluate-an-llm-app.md
  - ../../engineer/process/operate-as-a-forward-deployed-engineer.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Two-loop is not double work; it tests differently in dev vs prod. Inner = ADK dev-time + golden dataset + interaction debug; Outer = Agent Platform prod + Pairwise + RAG triad + drift monitoring; no vibes-test; do not skip either loop
---

# I want to run a two-loop LLM evaluation

> **As an** ai engineer, **I want to** run a two-loop LLM evaluation, **so that** launch is safe.

## Summary

- Two-loop = dev and prod tested differently; not double work
- Inner Loop: ADK dev-time `adk eval` + golden dataset + interaction debug
- Inner metrics: tool_trajectory_avg_score + response_match_score + rubric_based_final_response_quality
- Outer Loop: Agent Platform Evals; CI/CD integration
- Pairwise Evaluation: Model-as-Judge; Gemini 3 Pro autorater; Model A vs B
- Pointwise RAG Triad: Groundedness + Fulfillment + Summarization/Coherence
- Model Monitoring: Prediction Drift + Feature Attribution; Day 2 prevent degradation
- No vibes-test; do not skip either loop
- Distinction from agent-evaluation-strategy: this file leans toward FDE two-loop + GCP tooling
- publicly queryable; periodic review
- first principles / inversion / second-order / Occam

## Core viewpoints

**The inner loop and outer loop test different things, and skipping either creates a different class of failure.** The inner loop (dev-time, manual, interaction debug) catches problems in your agent's logic, tool selection, and response quality. The outer loop (prod-scale, automated, CI/CD) catches problems that only emerge at scale: drift, edge cases, and interactions between your agent and real user behavior. Skipping the inner loop means your agents are slow to develop and hard to debug. Skipping the outer loop means you discover problems through customer complaints. They are not redundant; they are complementary.

**"Vibes-testing" (evaluating by feel) is the most common and most dangerous evaluation anti-pattern.** When an engineer manually tests a few prompts and declares the system "good enough," they are sampling from the most convenient part of the input distribution. Real users will probe edges, combine features in unexpected ways, and encounter inputs the engineer never considered. The only defense is a structured golden dataset and automated evaluation that runs on every change.

**Pairwise evaluation (Model A vs B) is necessary but insufficient.** Pairwise tells you which model is better on average, but it does not tell you where each model fails. A model that wins 60% of pairwise comparisons but catastrophically fails on 5% of inputs is worse than a model that wins 55% but never catastrophically fails. Pairwise results must be accompanied by per-category breakdowns and failure-mode analysis.

**The RAG triad (Groundedness, Fulfillment, Coherence) measures three independent dimensions that must all be healthy.** A system with high Groundedness but low Fulfillment is a system that faithfully repeats irrelevant context. High Fulfillment but low Groundedness is hallucination. High Coherence but low Groundedness is eloquent fabrication. All three must be monitored; optimizing one at the expense of the others is a common failure mode.

**Evaluation infrastructure is not a nice-to-have -- it is the prerequisite for velocity.** Without automated evaluation, every model upgrade, prompt change, and pipeline modification is a leap of faith. Teams that invest in evaluation infrastructure early ship faster because they can experiment with confidence. Teams that defer evaluation infrastructure ship slower because every change requires manual validation.

## Key info

- **Inner loop metrics**: `tool_trajectory_avg_score` (was the correct tool selected at each step? 0-1, measures agent decision quality), `response_match_score` (does the final response match the expected response? 0-1, semantic similarity, not exact match), `rubric_based_final_response_quality` (does the response meet the quality rubric? 1-5 scale, human-defined criteria). The inner loop runs on a golden dataset of 50-200 hand-curated examples, each with expected tool calls, expected response, and quality rubric. The inner loop runs on every `adk eval` invocation during development.
- **Outer loop metrics**: Pairwise (Model A vs B, autorater judges which response is better, win rate %), Pointwise RAG triad (Groundedness: is every claim supported by retrieved context? 0-1; Fulfillment: does the response address the user's question? 0-1; Coherence: is the response logically structured? 0-1), Prediction Drift (has the model's output distribution changed from baseline? KL divergence or KS test), Feature Attribution (which input features are driving model decisions? SHAP or LIME). The outer loop runs on a representative sample of production traffic (1-10% of requests) and in CI/CD on every PR.
- **Golden dataset curation**: 50-200 examples, manually curated, covering: 40% common cases (happy path), 30% edge cases (boundary conditions, rare inputs), 20% adversarial (inputs designed to trick the model), 10% regression guard (inputs that previously caused failures). Each example must have: input, expected tool calls, expected response, and quality rubric. The dataset must be reviewed and updated quarterly -- a golden dataset that is not updated decays as the product evolves and the examples become unrepresentative.
- **Model-as-Judge autorater**: use Gemini 3 Pro (or equivalent) as the autorater for pairwise and pointwise evaluation. The autorater prompt must specify: evaluation criteria, rating scale, and output format (JSON). The autorater's reliability must be validated against human judgments on a calibration set of 50 examples; inter-rater agreement (Cohen's kappa) should be >0.7. An autorater with kappa <0.7 is adding noise, not signal. The autorater itself must be re-validated quarterly.
- **Prediction drift detection**: compare the model's output distribution (embedding vectors, response length, sentiment, topic distribution) between the baseline (last validated model version) and the current version. Use KL divergence for continuous features and chi-squared for categorical features. Alert when drift >0.1 (moderate) or >0.3 (severe). Drift can be caused by: model version change, prompt change, data distribution shift, or upstream data pipeline change. The detection tells you that something changed; the root cause analysis tells you what.

## Scenario

Two-loop is not double work; it tests differently in dev vs prod. This entry provides the two-loop full path, covering Inner Loop (ADK dev-time + golden dataset + tool_trajectory + response_match) + Outer Loop (Agent Platform Pairwise + Pointwise RAG triad + Model Monitoring), linked with llm-evaluation-methods + rag-design-patterns + hallucination-mitigation + prepare-an-agent-evaluation-strategy + prepare-a-rag-evaluation-strategy + orchestrate-agents-with-adk-and-agents-cli + llm-observability-comparison + evaluate-an-llm-app + operate-as-a-forward-deployed-engineer, publicly queryable, periodic review, and links to llm-eval-methods / rag-patterns / hallucination / agent-eval-strategy / rag-eval-strategy / adk / observability / llm-eval / fde-role and other leaves. 

## 2-hop reachability paths

| Hops | Goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | llm-eval-methods | [./llm-evaluation-methods.md](./llm-evaluation-methods.md) |
| 1 hop | agent-eval-strategy | [../foundations/prepare-an-agent-evaluation-strategy.md](../../knowledge-curator/archive/strategies-legacy/ai-engineer/prepare-an-agent-evaluation-strategy.md) |
| 2 hops | adk | [../platform/orchestrate-agents-with-adk-and-agents-cli.md](../platform/orchestrate-agents-with-adk-and-agents-cli.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **Two-loop anchor**: dev and prod tested differently; not double work
2. **No vibes-test**: testing by feel = customer onsite wreck
3. **Inner Loop goal**: dev-time fast, manual, interaction debug
4. **Inner tooling**: `adk eval` CLI + Web UI; golden dataset
5. **Inner metrics**: tool_trajectory_avg_score (right tool used?) + response_match_score (ROUGE similarity) + rubric_based_final_response_quality
6. **Outer Loop goal**: prod scale, automated, CI/CD integration
7. **Outer tooling**: Gemini Enterprise Agent Platform Evals (Rapid sync + Pipeline async) 
8. **Pairwise Evaluation**: Model-as-Judge; Gemini 3 Pro autorater; Model A vs B; win rate + judgment reason
9. **Pointwise RAG Triad**: Groundedness (strictly follow context) + Fulfillment (follow system prompt) + Summarization/Coherence (language quality + density) 
10. **Rapid Eval API**: sync dev/test; fast iteration
11. **Pipeline Eval**: async massive datasets; CI/CD gate
12. **Model Monitoring**: Prediction Drift + Feature Attribution; Day 2 prevent degradation
13. **Golden Dataset human-annotated**: customer-annotated 0% hallucination baseline
14. **Eval Compare**: `agents-cli eval compare run_v1.json run_v2.json`; not by gut feel
15. **Do not skip either loop**: skip Inner = dev slow; skip Outer = prod wreck
16. **Not eval for eval's sake**: every metric ties to business measurement
17. **not sloganeering**: every metric marked with command and threshold
18. **versioned**: eval set has versions; evolution is traceable
19. **link with llm-eval-methods**: two-loop + general method co-build
20. **link with rag-design-patterns**: two-loop + RAG patterns co-build
21. **link with hallucination-mitigation**: two-loop + hallucination mitigation co-build
22. **link with agent-eval-strategy**: two-loop + agent eval principles co-build
23. **link with rag-eval-strategy**: two-loop + RAG eval co-build
24. **link with adk**: two-loop + ADK tool stack co-build
25. **link with llm-observability**: two-loop + observability co-build
26. **link with llm-eval**: two-loop + LLM app eval co-build
27. **link with fde-role**: two-loop + FDE co-build
28. **Distinction from agent-eval-strategy**: this file leans FDE two-loop + GCP tooling; latter leans general principles
29. **Toolchain**: `adk eval` / Agents CLI eval / Gemini Enterprise Evals / Rapid Eval API / Pipeline Eval / LangSmith / AgentOps / Phoenix / MLflow / BigQuery Agent Analytics
30. **publicly queryable**: two-loop process everyone can query; not hidden
31. **periodic review**: evolution updates; not one-shot (autorater model changing) 
32. **first principles**: why must two-loop; worst consequence of not doing (prod wreck / customer churn / contract non-renewal) 
33. **inversion thinking**: how much can single-loop solve; whether prod risk is tolerable
34. **second-order thinking**: second-order consequences after two-loop (iteration speed / customer trust / model upgrade rollback-able) 
35. **Occam**: two-loop the simpler the better; redundant metrics cut

## Anti-patterns

- **Running the inner loop and declaring the system production-ready.** The inner loop uses golden datasets that are, by definition, curated and clean. Production data is messy, contains edge cases, and shifts over time. A system that passes inner-loop evaluation but has never been tested against real user traffic is a system that has never been evaluated.

- **Building a golden dataset without human annotation.** An auto-generated golden dataset (e.g., using LLM-as-judge to create "correct" answers) embeds the biases of the judge model into your evaluation. The golden dataset must be human-annotated, with explicit agreement on what constitutes a correct answer, an acceptable variant, and a clear error. Without this, your evaluation is measuring conformance to the judge model's preferences, not actual quality.

- **Treating evaluation metrics as pass/fail gates.** A metric that drops from 0.92 to 0.91 is not necessarily a regression -- it may be noise, or it may reflect a genuine change in the input distribution. Metrics should be treated as signals that trigger investigation, not as binary gates. The response to a metric drop should be "let's look at the examples that changed," not "roll back immediately."

- **Monitoring only aggregate metrics without per-category breakdowns.** An aggregate Groundedness score of 0.90 can hide a 0.60 score on a specific category of inputs. Per-category monitoring (by task type, by input length, by user segment) is the only way to detect that a model upgrade improved one category while degrading another.

- **Skipping drift monitoring because "the model doesn't change."** Even if your model weights are frozen, the input distribution changes. User behavior shifts, new topics emerge, and the knowledge base grows. Prediction drift monitoring (tracking whether the distribution of model outputs is shifting) catches these changes before they become user-visible problems.

## Related

- llm-eval-methods: [./llm-evaluation-methods.md](./llm-evaluation-methods.md) — general eval method co-build
- rag-design-patterns: [./rag-design-patterns.md](./rag-design-patterns.md) — RAG patterns co-build
- hallucination-mitigation: [./hallucination-mitigation.md](./hallucination-mitigation.md) — hallucination mitigation co-build
- agent-eval-strategy: [../foundations/prepare-an-agent-evaluation-strategy.md](../../knowledge-curator/archive/strategies-legacy/ai-engineer/prepare-an-agent-evaluation-strategy.md) — agent eval principles complementary
- rag-eval-strategy: [../foundations/prepare-a-rag-evaluation-strategy.md](../../knowledge-curator/archive/strategies-legacy/ai-engineer/prepare-a-rag-evaluation-strategy.md) — RAG eval co-build
- adk: [../platform/orchestrate-agents-with-adk-and-agents-cli.md](../platform/orchestrate-agents-with-adk-and-agents-cli.md) — ADK tool stack co-build
- llm-observability: [../platform/llm-observability-comparison.md](../platform/llm-observability-comparison.md) — observability co-build
- llm-eval: [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) — LLM app eval co-build
- fde-role: [../../engineer/process/operate-as-a-forward-deployed-engineer.md](../../engineer/process/operate-as-a-forward-deployed-engineer.md) — FDE co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
