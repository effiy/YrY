---
title: ai methodology dashboard
aliases:
- AI methodology dashboard
- prompt engineering dashboard
- eval methodology dashboard
- RAG pipeline dashboard
tags:
- dashboard
- ai-methodology
- prompt-engineering
- eval
- rag
- agent
category: ai-engineer/methodology
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- ai-engineer
- engineer
- tech-lead
benefit: AI methodology effectiveness and prompt engineering quality visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../platform/dashboard-ai-performance.md
- ../platform/evaluate-an-llm-app.md
- ./tune-prompts.md
- ./run-a-two-loop-llm-evaluation.md
- ./blueprint-an-enterprise-rag.md
tacit: false
---

# ai methodology dashboard

> **As an** ai engineer, **I want to** track AI methodology effectiveness across prompt engineering, evaluation, RAG, and agent systems, **so that** methodology improvements are data-driven and best practices are systematically adopted.

> AI methodology is the practice layer between theory and production. This dashboard tracks prompt engineering quality, evaluation methodology, RAG pipeline effectiveness, agent orchestration, and methodology adoption.

## Summary

- 5 methodology dimensions: prompt engineering, evaluation methodology, RAG pipeline quality, agent orchestration, methodology adoption
- Prompt engineering tracked by version performance, A/B results, and best-practice compliance
- Evaluation methodology tracked by eval coverage, diversity, contamination risk, and cadence
- RAG pipeline tracked by retrieval quality, chunking effectiveness, and embedding performance
- Agent orchestration tracked by task completion rate, tool call accuracy, and orchestration complexity
- Dashboard reviewed monthly; methodology retrospective quarterly

## Core viewpoints

- Prompt engineering is iterative science, not one-shot art — every prompt change should be evaluated, versioned, and tracked
- Evaluation is the foundation of AI quality — without good evals, you're flying blind
- RAG is a pipeline, not a feature — each stage (chunking → embedding → retrieval → generation) needs independent optimization
- Agent systems are chains of uncertainty — each tool call multiplies failure probability; keep agents as simple as possible

## Key information

### 5-panel methodology overview

```
┌──────────────────────────────────────────────────────────────────┐
│  PROMPT ENGINEERING              │  EVALUATION METHODOLOGY         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Active:    42 prompts  │   │  │  Eval cases: 850 total   │   │
│  │  Versioned: 88% ████   │   │  │  Coverage:   82% ████    │   │
│  │  A/B tested: 35% █▌     │   │  │  Diversity:  75% ███▌   │   │
│  │  Best-prac:  78% ███▌   │   │  │  Contam risk: Low       │   │
│  │  Drift:      0.3% stable│   │  │  Cadence:    2.8/month  │   │
│  │  vNext:      4 in dev  │   │  │  Auto-eval:  65% ███    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RAG PIPELINE QUALITY            │  AGENT ORCHESTRATION           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Recall@5:   88% ████   │   │  │  Active:     3 agents   │   │
│  │  Recall@10:  94% ████▌  │   │  │  Task succ:   82% ████  │   │
│  │  MRR:        0.78       │   │  │  Tool acc:    91% ████▌ │   │
│  │  Chunk size: 512 tokens │   │  │  Steps/task:  4.2 avg   │   │
│  │  Embedding:  Voyage v3  │   │  │  Loop det:    2/mo      │   │
│  │  Rerank:     +12% MRR   │   │  │  Timeout:     3.5%      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Prompt engineering — version management

| Prompt | Active version | Total versions | A/B tested | Best-practice score | Eval score | Drift (30d) |
|---|---|---|---|---|---|---|
| chat-system | v3.2 | 12 | Yes | 85% | 8.8/10 | 0.2% |
| chat-context-assembly | v2.1 | 8 | Yes | 90% | 8.5/10 | 0.3% |
| code-review-system | v2.0 | 5 | Yes | 80% | 8.2/10 | 0.5% |
| code-review-diff | v1.8 | 6 | No | 75% | 7.8/10 | 0.4% |
| rag-query-rewrite | v2.3 | 9 | Yes | 88% | 8.6/10 | 0.1% |
| rag-answer-synthesis | v1.5 | 4 | No | 70% | 7.5/10 | 0.6% |
| intent-classification | v2.1 | 7 | Yes | 92% | 9.1/10 | 0.1% |
| toxicity-detection | v1.2 | 3 | No | 65% | 8.0/10 | 0.8% |
| summary-short | v1.4 | 5 | No | 72% | 7.8/10 | 0.3% |
| summary-long | v1.3 | 4 | No | 68% | 7.5/10 | 0.5% |

### Prompt best-practice checklist

| Best practice | % Compliant | Gap |
|---|---|---|
| Clear role/persona definition | 92% | 3 prompts missing |
| Structured output format specified | 85% | 6 prompts use free text |
| Few-shot examples provided | 72% | 12 prompts lack examples |
| Chain-of-thought for complex tasks | 68% | 8 prompts need CoT |
| Negative examples (what NOT to do) | 45% | 23 prompts missing |
| Context window budget documented | 82% | 8 prompts undocumented |
| Version header with date and author | 88% | 5 prompts missing |
| Rollback plan documented | 55% | 19 prompts |
| **Overall best-practice score** | **78%** | |

### Evaluation methodology

| Eval dimension | Cases | Coverage | Diversity | Auto-graded | Update frequency |
|---|---|---|---|---|---|
| Accuracy/factual | 250 | 85% | 72% | 60% | Monthly |
| Faithfulness | 180 | 90% | 80% | 45% | Biweekly |
| Relevance | 150 | 78% | 75% | 70% | Monthly |
| Safety/toxicity | 120 | 95% | 85% | 85% | Weekly |
| Instruction following | 80 | 70% | 65% | 75% | Monthly |
| Edge cases | 40 | 55% | 60% | 30% | Quarterly |
| Multilingual | 30 | 40% | 50% | 50% | Quarterly |
| **Total** | **850** | **82%** | **75%** | **65%** | |

### Eval health metrics

| Metric | Current | Target | Status |
|---|---|---|---|
| Eval coverage (% of prompt features) | 82% | > 90% | Yellow |
| Eval diversity (distinct scenarios) | 75% | > 80% | Yellow |
| Contamination risk (eval in training data) | Low | Low | Green |
| Eval cadence (runs per month) | 2.8 | > 4 | Yellow |
| Auto-eval percentage | 65% | > 80% | Yellow |
| Eval drift detection | 0.3% | < 1% | Green |
| Eval set rotation (last rotated) | 45 days | < 30 days | Yellow |
| Human eval correlation | 0.82 | > 0.80 | Green |

### RAG pipeline quality metrics

| Stage | Metric | Current | Target | Status |
|---|---|---|---|---|
| **Chunking** | Avg chunk size | 512 tokens | 256-1024 | Green |
| | Overlap ratio | 15% | 10-20% | Green |
| | Chunk boundary quality | 85% | > 90% | Yellow |
| **Embedding** | Model | Voyage v3 | — | Green |
| | Dimension | 1024 | — | Green |
| | Batch latency | 45ms | < 50ms | Green |
| **Retrieval** | Recall@5 | 88% | > 90% | Yellow |
| | Recall@10 | 94% | > 95% | Yellow |
| | MRR (Mean Reciprocal Rank) | 0.78 | > 0.80 | Yellow |
| | Query rewrite effectiveness | +8% recall | > +10% | Yellow |
| **Reranking** | MRR improvement | +12% | > +10% | Green |
| | Latency overhead | 85ms | < 100ms | Green |
| **Generation** | Faithfulness | 96% | > 95% | Green |
| | Citation accuracy | 89% | > 90% | Yellow |
| | Answer completeness | 94% | > 90% | Green |

### RAG chunking strategy comparison

| Strategy | Chunk size | Overlap | Recall@5 | Recall@10 | MRR | Best for |
|---|---|---|---|---|---|---|
| Fixed-size (current) | 512 | 15% | 88% | 94% | 0.78 | General docs |
| Semantic (experiment) | Variable | 10% | 91% | 96% | 0.82 | Long-form articles |
| Recursive | 256 | 20% | 85% | 92% | 0.75 | Code files |
| Sentence-window | 384 | 25% | 89% | 95% | 0.80 | Technical docs |

### Agent orchestration

| Agent | Task type | Success rate | Avg steps | Tool calls | Loop rate | Timeout rate | Status |
|---|---|---|---|---|---|---|---|
| Code Review Agent | Multi-step review | 85% | 5.2 | 3.8 | 2.1% | 2.5% | Active |
| Knowledge Q&A Agent | RAG + tool use | 88% | 3.5 | 2.2 | 1.2% | 1.8% | Active |
| Data Analysis Agent | SQL + chart | 72% | 6.8 | 5.5 | 4.5% | 8.2% | Beta |
| **Overall** | | **82%** | **4.2** | **3.1** | **2.0%** | **3.5%** | |

### Agent failure analysis

| Failure mode | Frequency | % of failures | Root cause | Mitigation |
|---|---|---|---|---|
| Tool call error | 8/month | 35% | Wrong parameters, API schema mismatch | Stricter tool schemas |
| Task timeout | 6/month | 26% | Too many steps, no early termination | Max steps limit, timeout |
| Infinite loop | 2/month | 9% | Agent oscillates between 2 states | Loop detection, step limit |
| Wrong tool selection | 3/month | 13% | Similar tool names, poor descriptions | Better tool descriptions |
| Hallucination in tool output | 2/month | 9% | Tool output too large, context overflow | Output truncation |
| Other | 2/month | 9% | Various | Case-by-case |

### Methodology adoption

| Practice | Adoption | Target | Maturity |
|---|---|---|---|
| Prompt versioning (git) | 88% | 100% | L3 |
| A/B testing for prompt changes | 35% | 80% | L2 |
| Eval-driven development | 65% | 90% | L3 |
| Automated eval pipeline | 65% | 90% | L3 |
| RAG chunking strategy documented | 60% | 100% | L2 |
| Agent loop detection | 75% | 100% | L2 |
| Prompt best-practice checklist | 45% | 90% | L2 |
| Monthly methodology review | 50% | 100% | L2 |

## Action recommendations

1. **Increase eval cadence**: 2.8/month → 4/month; run evals on every prompt change, not just weekly
2. **A/B test all prompt changes**: 35% A/B tested is too low; every prompt change should be A/B tested before production
3. **Improve chunk boundary quality**: 85% → 90%; semantic chunking experiment shows +3% recall; prioritize migration
4. **Fix agent timeout rate**: Data Analysis Agent at 8.2% timeout; add max steps, break complex tasks into sub-tasks
5. **Reduce agent loop rate**: 2/month loops; add stricter loop detection with 2-cycle threshold
6. **Rotate eval sets**: 45 days since last rotation; rotate 20% of eval cases monthly to prevent contamination
7. **Prompt best-practice score**: 78% → 90%; add negative examples and rollback plans to all critical prompts
8. **Monthly methodology retrospective**: review what worked, what didn't; update best practices



- Prompt as magic incantation → adding more instructions hoping the model "gets it"; simple, clear prompts beat complex ones
- Eval set overfitting → optimizing prompts to eval scores without checking real user behavior; eval-human correlation must stay > 0.80
- RAG as black box → treating the entire RAG pipeline as one unit; each stage needs independent measurement and optimization
- Agent complexity addiction → adding more tools and steps because it's cool; simpler agents are more reliable
- No prompt rollback → changing prompts without ability to revert; every prompt change needs a rollback plan

## Related

- Same class: [dashboard-ai-performance](../platform/dashboard-ai-performance.md) — AI performance metrics
- Same class: [dashboard-ai-maturity](../foundations/dashboard-ai-maturity.md) — AI maturity assessment
- Downstream: [tune-prompts](tune-prompts.md) — prompt tuning guide
- Downstream: [run-a-two-loop-llm-evaluation](run-a-two-loop-llm-evaluation.md) — eval methodology
- Downstream: [blueprint-an-enterprise-rag](blueprint-an-enterprise-rag.md) — RAG blueprint
- References: Anthropic — *Prompt Engineering Guide*; LlamaIndex — *RAG Best Practices*; LangChain — *Agent Design Patterns*