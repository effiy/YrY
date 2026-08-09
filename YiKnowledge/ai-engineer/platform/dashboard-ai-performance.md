---
title: ai performance dashboard
aliases:
- AI dashboard
- LLM performance dashboard
- model performance dashboard
- AI metrics dashboard
tags:
- dashboard
- ai
- llm
- model-performance
- evaluation
- prompt
- cost
category: ai-engineer/platform
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
- product-manager
benefit: AI model and LLM application performance visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./evaluate-an-llm-app.md
- ./llm-observability-comparison.md
- ../methodology/run-a-two-loop-llm-evaluation.md
- ../methodology/tune-prompts.md
- ../../product-manager/discovery/metrics--ai-product-metrics.md
tacit: false
---

# ai performance dashboard

> **As an** ai engineer, **I want to** track AI model performance, cost, and quality across all LLM-powered features, **so that** model degradation is detected early and optimization decisions are data-driven.

> AI applications require unique observability: model quality (accuracy, faithfulness, relevance), latency (TTFT, TPOT), cost (tokens, $ per request), and prompt effectiveness. This dashboard aggregates all dimensions.

## Summary

- 5 AI dimensions: model quality, latency and throughput, cost efficiency, prompt performance, user satisfaction
- Quality metrics: accuracy, faithfulness (hallucination rate), relevance, completeness — per model, per feature
- Latency tracked as TTFT (Time to First Token) and TPOT (Time per Output Token) for streaming apps
- Cost tracked per request, per user, per day with token breakdown (input/output/cache)
- Prompt version performance compared via A/B eval results
- Dashboard refreshes per request aggregation (hourly); eval suite runs on every model/prompt change

## Core viewpoints

- LLM quality is multi-dimensional — accuracy, faithfulness, relevance, and safety must all be tracked
- Latency is a quality metric for AI — users tolerate < 2s for chat, < 500ms for autocomplete
- Cost per request must be tracked against value delivered — a $0.10 request that saves 10 minutes is worth it
- Prompt drift is real — prompt performance decays as models update; re-evaluate monthly

## Key information

### 5-panel AI overview

```
┌──────────────────────────────────────────────────────────────────┐
│  MODEL QUALITY                  │  LATENCY & THROUGHPUT           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Accuracy:   92% ████▌  │   │  │  TTFT P50:  320ms      │   │
│  │  Faithful:   96% ████▌  │   │  │  TTFT P95:  850ms      │   │
│  │  Relevant:   89% ████   │   │  │  TPOT:       45ms/tok  │   │
│  │  Complete:   94% ████▌  │   │  │  Throughput: 120 req/s │   │
│  │  Eval score: 8.4/10     │   │  │  Timeout:    0.2%      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  COST EFFICIENCY                │  PROMPT PERFORMANCE             │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Daily:     $142.50     │   │  │  v2.3: 8.6/10 ████▌    │   │
│  │  Per req:   $0.008      │   │  │  v2.2: 8.2/10 ████     │   │
│  │  Cache hit: 34%         │   │  │  v2.1: 7.8/10 ███▌     │   │
│  │  Waste:     12%         │   │  │  A/B: v2.3 +4.8% ↑     │   │
│  │  Budget:    68% used    │   │  │  Drift:    0.3% stable  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Quality metrics by model and feature

| Feature | Model | Accuracy | Faithfulness | Relevance | Completeness | Eval Score |
|---|---|---|---|---|---|---|
| Chat (general) | Claude Opus 4.7 | 94% | 97% | 91% | 95% | 9.1/10 |
| Chat (general) | Claude Sonnet 4.6 | 91% | 95% | 88% | 93% | 8.5/10 |
| Code generation | Claude Opus 4.7 | 89% | 94% | 87% | 92% | 8.3/10 |
| Code generation | Claude Sonnet 4.6 | 87% | 92% | 85% | 90% | 7.9/10 |
| RAG (knowledge) | Claude Haiku + RAG | 85% | 90% | 82% | 88% | 7.6/10 |
| Summarization | Claude Haiku 4.5 | 92% | 96% | 90% | 94% | 8.8/10 |
| Classification | Claude Haiku 4.5 | 96% | 98% | N/A | N/A | 9.3/10 |

### Latency targets by use case

| Use case | TTFT Target (P95) | Total Time Target (P95) | User expectation |
|---|---|---|---|
| Chat / conversational | < 1s | < 5s | Conversational rhythm |
| Code autocomplete | < 300ms | < 500ms | Feels instant |
| Search / RAG | < 500ms | < 2s | Search engine speed |
| Document summarization | < 2s | < 15s | Willing to wait for quality |
| Batch processing | N/A | < 5 min | Background job expectation |
| Classification / extraction | < 200ms | < 1s | API-like speed |

### Cost breakdown

| Model | Input $/1M tokens | Output $/1M tokens | Cache $/1M tokens | % of total spend |
|---|---|---|---|---|
| Claude Opus 4.7 | $15.00 | $75.00 | $1.50 | 52% |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 | 28% |
| Claude Haiku 4.5 | $0.80 | $4.00 | $0.08 | 12% |
| Embedding (Voyage) | $0.10 | N/A | N/A | 5% |
| Other / experiments | — | — | — | 3% |

### Cost optimization levers

| Lever | Potential savings | Implementation effort | Status |
|---|---|---|---|
| Prompt caching | 20-40% | Low | Implemented (34% hit rate) |
| Model routing (simple→Haiku) | 15-25% | Medium | Evaluating |
| Context window right-sizing | 10-20% | Low | Partial |
| Batch processing for non-realtime | 30-50% | Medium | Not started |
| Response length optimization | 5-15% | Low | In progress |
| Cache hit rate improvement | 10-20% | Medium | Target 50%+ |

### Prompt version performance history

| Version | Date | Eval score | Accuracy | Latency P95 | Cost/req | Status |
|---|---|---|---|---|---|---|
| v2.3 | 2026-08-01 | 8.6/10 | 92% | 4.2s | $0.008 | Active |
| v2.2 | 2026-07-15 | 8.2/10 | 90% | 4.5s | $0.009 | Shadow |
| v2.1 | 2026-06-20 | 7.8/10 | 88% | 5.1s | $0.011 | Deprecated |
| v2.0 | 2026-05-10 | 7.5/10 | 86% | 5.8s | $0.013 | Deprecated |
| v1.0 | 2026-04-01 | 6.8/10 | 82% | 7.2s | $0.015 | Deprecated |

### User satisfaction signals

| Signal | Measurement | Current | Target |
|---|---|---|---|
| Thumbs up/down ratio | Positive / total feedback | 87% | > 85% |
| Regeneration rate | % responses regenerated | 12% | < 10% |
| Abandonment rate | % sessions abandoned mid-response | 8% | < 5% |
| Copy/share rate | % responses copied or shared | 23% | > 20% |
| Edit-and-resend rate | % user messages edited and resent | 6% | < 5% |
| Session length | Avg messages per session | 5.2 | 4-8 |

### Model drift detection

| Metric | Baseline (Jul) | Current (Aug) | Drift | Threshold | Alert |
|---|---|---|---|---|---|
| Accuracy | 92.1% | 91.8% | -0.3% | ±3% | No |
| Faithfulness | 96.2% | 96.0% | -0.2% | ±2% | No |
| Relevance | 89.5% | 89.1% | -0.4% | ±5% | No |
| Latency P95 | 4.1s | 4.2s | +2.4% | ±10% | No |
| Cost/request | $0.0078 | $0.0080 | +2.6% | ±10% | No |

## Action recommendations

1. **Eval on every change**: run full eval suite on every model upgrade, prompt change, or RAG pipeline change
2. **Monitor faithfulness first**: hallucination is the #1 AI quality killer; faithfulness < 90% triggers immediate investigation
3. **Optimize cache hit rate**: target > 50% cache hit rate; use static system prompts, cache common context prefixes
4. **Right-size model routing**: route simple queries to Haiku, complex to Sonnet/Opus; target 30% cost reduction
5. **Track per-feature cost**: attribute cost to features; identify high-cost/low-value features
6. **Monthly prompt audit**: re-evaluate all active prompts; deprecate prompts with declining scores
7. **User feedback loop**: every thumbs-down triggers automatic eval re-run; identify patterns in negative feedback
8. **A/B test prompts**: never ship a prompt change without A/B testing against the current version



- Eval set leakage → eval questions appearing in training data; rotate eval sets monthly, use synthetic data for edge cases
- Single-metric optimization → optimizing accuracy while ignoring cost and latency; use composite score
- Ignoring non-determinism → LLM outputs vary; run each eval case 3+ times and aggregate
- Prompt over-engineering → adding too many instructions that confuse the model; simple, clear prompts outperform complex ones
- No cost attribution → not knowing which features drive cost; attribute every API call to a feature

## Related

- Same class: [dashboard-data-pipeline](../data/dashboard-data-pipeline.md) — data pipeline health
- Downstream: [evaluate-an-llm-app](evaluate-an-llm-app.md) — LLM evaluation guide
- Downstream: [llm-observability-comparison](llm-observability-comparison.md) — observability tool comparison
- Downstream: [tune-prompts](../methodology/tune-prompts.md) — prompt tuning methodology
- References: Anthropic — *Prompt Engineering Guide*; OpenAI — *Evals Guide*; Chip Huyen — *Building LLM Applications*