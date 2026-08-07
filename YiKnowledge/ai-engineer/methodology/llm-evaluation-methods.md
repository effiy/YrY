---
title: LLM Evaluation Methods (HELM / MT-Bench / Self-consistency / Human Annotation)
aliases:
- LLM Evaluation Methods
- LLM-as-Judge
tags:
- AI
- methodology
- evaluation
- llm
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
- agent-architecture-patterns.md
- hallucination-mitigation.md
- rag-design-patterns.md
- prompt-engineering-guide.md
- ../platform/llm-observability-comparison.md
tacit: false
---

# LLM Evaluation Methods

> **As an** ai engineer, **I want to** llm evaluation methods, **so that** ai methodology sound.

> LLM evaluation has two layers: model capability (benchmark) + application quality (business eval set + user feedback + online monitoring).

## Summary
- LLM output has no definite ground truth; BLEU/ROUGE correlate weakly with human preference; need a combination of methods.
- Seven main methods: human annotation, LLM-as-judge, self-consistency, reference faithfulness, unit test, online AB, adversarial test.
- Business eval set 50-200 items; add 10-20% monthly; annotate "expected key points / acceptable variants / clear errors".
- LLM-as-judge note position bias / length bias / self-preference / homogenization; cross-vendor judge + forced distribution mitigate.

## Core viewpoints

**Evaluation is not a quality gate -- it is the development process itself.** In traditional software, evaluation is a phase that happens before release. In LLM applications, evaluation must be embedded in every step: prompt design (evaluation set guides iteration), model selection (evaluation set determines which model to use), deployment (evaluation set gates the release), and monitoring (evaluation set detects drift). The evaluation set is the team's shared understanding of what "good" means, and it is the only objective measure of whether the application is improving or degrading.

**LLM-as-judge is not a cheap replacement for human evaluation -- it is a different evaluation modality with its own failure modes.** The LLM judge is biased (position bias, length bias, self-preference), inconsistent (scores vary between runs), and limited (cannot evaluate subjective qualities). The correct approach is to use LLM-as-judge for scale (thousands of evaluations per day) and human evaluation for calibration (hundreds per week). The human evaluations calibrate the LLM judge, and the LLM judge scales the human judgments.

**An evaluation set that does not evolve is an evaluation set that is becoming less useful over time.** The model learns to pass the evaluation set, user behavior changes, and new failure modes are discovered. An evaluation set that was created at launch and never updated will gradually lose relevance. The evaluation set must be updated on a regular cadence: add 10-20% new examples monthly, retire examples that no longer represent the production distribution, and add adversarial examples for each new failure mode discovered in production.

**The most important evaluation metric is not accuracy -- it is the cost of failure.** A model that achieves 95% accuracy but fails catastrophically on the remaining 5% may be worse than a model that achieves 90% accuracy with graceful failures. The evaluation must measure not just the failure rate, but the failure severity: a hallucination that causes a wrong business decision is a different class of error than a minor formatting issue. The evaluation framework must distinguish between critical and non-critical failures.

**Online evaluation is more truthful than offline evaluation, but offline evaluation is the only pre-deployment signal.** Offline evaluation on a static dataset cannot capture the full distribution of user behavior, the interaction between components in production, or the latency and cost characteristics of a live system. But online evaluation requires a live deployment, which means you have already exposed users to the system. The two must work together: offline evaluation gates the deployment, and online evaluation validates the deployment.

- **Two-layer evaluation** — model capability (HELM / MMLU / MT-Bench / Arena) vs application quality (business set + online monitoring); do not mix.
- **Human annotation is the gold standard but expensive** — use LLM-as-judge at scale, human pairwise for key decisions.
- **Self-consistency only works for tasks with definite answers** — meaningless for creative tasks; for reasoning, sample multiple times and take the majority.
- **LLM-as-judge has biases** — position bias / length bias / self-preference / homogenization; must pair with rubric + cross-vendor judge.
- **Online monitoring is more truthful than offline evaluation** — regeneration rate, user copy rate, thumbs up/down ratio are implicit feedback; daily sample for human review.

## Key information

### Why evaluation is hard

LLM output is natural language with no definite ground truth; one question may have multiple correct answers; metrics (BLEU / ROUGE) correlate weakly with human preference; tasks vary (QA, summary, code, reasoning, safety) and need different dimensions.

Two layers of evaluation:

1. **Model capability** (benchmark): HELM, MMLU, MT-Bench, Arena
2. **Application quality** (business): business eval set + user feedback + online monitoring

### Key methods

| Method | Meaning | Applicable |
|---|---|---|
| Human annotation | Human scores 1-5 or pairwise comparison | Gold standard, expensive |
| Auto eval (LLM-as-judge) | Stronger model scores (GPT-4 / Claude) | Large scale, relative sort |
| Self-consistency | Sample multiple times, take majority | Reasoning tasks, definite answers |
| Reference faithfulness | Is the answer grounded in context | RAG |
| Unit test / compile | Output runs correctly | Code generation |
| Online AB | Real user CTR / retention | Launch decision |
| Adversarial test | Red team prompt attacks | Safety compliance |

### Mainstream benchmarks

| Benchmark | Tests | Pros/cons |
|---|---|---|
| MMLU | Academic multiple choice | Broad knowledge coverage, weak relation to real tasks |
| HELM | Comprehensive multi-dim (accuracy, robustness, fairness, bias) | Complete, expensive to run |
| MT-Bench | Multi-turn dialogue (GPT-4 scores) | Close to real usage |
| Chatbot Arena | Human pairwise voting | Strongest correlation with human preference, biased toward open source |
| HumanEval | Code unit test | Code capability gold standard |
| TruthfulQA | Anti-hallucination, anti-misleading | Specialized |
| MATH / GSM8K | Math reasoning | Reasoning capability |
| C-Eval / CMMLU | Chinese comprehensive | Chinese scenarios |

### Business eval set design

1. **Sample size**: 50-200 items, covering core scenarios and boundary cases
2. **Annotation spec**: each item annotated with "expected key points" / "acceptable variants" / "clear errors"
3. **Classification**: capability dimension (fact / reasoning / style / safety) × business scenario
4. **Update frequency**: monthly add 10-20%, avoid model overfitting
5. **Blind test**: do not reveal model version during evaluation, reduce subjective bias
6. **Archive**: keep complete output of each eval for traceability

### LLM-as-judge prompt skeleton

```
You are an impartial evaluator. Score the answer on a 1-5 scale.

Question: {question}
Reference answer: {gold}
Answer to evaluate: {answer}

Scoring rubric:
5 — Excellent: complete, accurate, clear
4 — Good: only minor flaws
3 — Acceptable: missing one key point or has a small error
2 — Poor: multiple errors or missing key points
1 — Wrong: completely wrong or off-topic

Output JSON: {"score": 1-5, "reason": "..."}
```

### LLM-as-judge biases and pitfalls

| Bias | Symptom | Mitigation |
|---|---|---|
| Position bias | Prefers the first answer | Pairwise position swap |
| Length bias | Prefers long answers | Emphasize length-irrelevance in rubric |
| Self-preference | GPT-4 prefers GPT output | Cross-vendor judge |
| Homogenization | All scored 4 | Add reference + forced distribution |

### Online evaluation

- **A/B gray**: 1-5% traffic to launch new prompt / model, compare core metrics
- **Implicit feedback**: user acceptance rate, copy rate, edit rate, regeneration rate
- **Explicit feedback**: thumbs up/down button, issue feedback entry
- **Log sampling**: daily sample 100 items for human review, quality regression

### Evaluation metric tiers

| Tier | Metric | Decision scenario |
|---|---|---|
| Task level | success rate, faithfulness, relevance | Whether to launch |
| Experience level | user satisfaction, NPS | Whether to promote |
| Cost level | avg tokens, cost per task | Whether economically viable |
| Safety level | hallucination rate, PII leak rate, prompt injection hit | Whether compliant |

### Applicable scenarios

- Model selection (run full benchmark)
- Pre-launch regression (business eval set)
- Post-launch quality monitoring (online + sampling)

## Action recommendations
1. Build a business eval set: 50-200 items, classified by capability × business scenario, add 10-20% monthly.
2. Annotation spec: each item annotated "expected key points" / "acceptable variants" / "clear errors"; blind test to avoid subjective bias.
3. LLM-as-judge use a stronger model (Claude / GPT-4), pair with rubric + cross-vendor judge + forced distribution.
4. Pairwise must swap positions to mitigate position bias.
5. Online: A/B gray 1-5% + implicit feedback (regeneration rate / copy rate) + daily sample 100 items for human review.
6. Tiered metrics: task level (launch readiness) + experience level (NPS) + cost level (token) + safety level (hallucination rate).
7. Run full regression before each model / prompt change; launch after regression passes.

## Anti-patterns

**Evaluating an LLM application by manually testing a few examples and declaring it "good enough."** Manual testing of 5-10 examples is not evaluation -- it is confirmation bias. The developer selects examples that they expect the model to handle and interprets ambiguous outputs favorably. The minimum viable evaluation is 50-200 labeled examples across core scenarios, edge cases, and known failure modes, evaluated systematically on every change.

**Building an evaluation set that only contains "happy path" examples.** An evaluation set of 100 straightforward queries will report 95% accuracy while the system fails on 30% of real user queries. The evaluation set must include the distribution of queries that users actually ask, including ambiguous, malformed, out-of-domain, and adversarial queries. The accuracy on the "hard" subset is the more honest metric.

**Using LLM-as-judge without a human-calibrated rubric.** The LLM judge's scores are not absolute measures of quality -- they are relative rankings within the judge's own biases. Without a human-calibrated rubric that defines what each score means in terms of specific criteria, the judge's scores are not comparable across evaluations. The rubric must be validated by having human evaluators score the same examples and comparing the distributions.

**Running evaluation only on English-language examples when your users speak multiple languages.** All major models perform differently across languages, but most evaluation sets are English-only. The result is that the model's performance on non-English queries is unmeasured and unmonitored. If your user base is multilingual, your evaluation set must include representative samples in each language you support.

**Treating evaluation as a one-time gate rather than a continuous process.** A single evaluation before launch tells you the model's performance at a single point in time. Continuous evaluation tells you whether the model is improving or degrading over time. The minimum viable continuous evaluation setup is: run the full evaluation set weekly, track the trend of each metric, and alert on significant regressions.


- **Select model only by MMLU** — benchmark weakly correlates with real tasks; business set is the decision basis.
- **LLM-as-judge without bias control** — all 4s or prefer long answers; pair with rubric + forced distribution + cross-vendor judge.
- **Pairwise without position swap** — position bias misleads; must swap positions.
- **Eval set never changes** — model overfits; add 10-20% monthly.
- **Only offline, no online** — launch quality not truthful; add implicit feedback + daily sampling.
- **No tiered metrics** — task-level fine but cost-level collapses; task / experience / cost / safety four tiers in parallel.

## Related
- Same category: [agent-architecture-patterns-summary.md](./agent-architecture-patterns.md) (Agent evaluation methods); [hallucination-mitigation-summary.md](./hallucination-mitigation.md) (hallucination rate metrics); [rag-design-patterns-summary.md](./rag-design-patterns.md) (RAGAS evaluation); [prompt-engineering-guide-summary.md](./prompt-engineering-guide.md) (prompt changes must run regression)
- Upstream: [../platform/llm-observability-comparison.md](../platform/llm-observability-comparison.md)
- Downstream: YiAi BRD eval set (100 business queries × chapter type × language category)

## References
- HELM: https://crfm.stanford.edu/helm
- MT-Bench: https://github.com/lm-sys/FastChat
- Chatbot Arena: https://chat.lmsys.org
- LLM-as-judge: https://github.com/llm-attacks/llm-eval-best-practices
- RAGAS: https://docs.ragas.io
