---
title: 'SESSE: Sketch, Expand, Sort, Summarize, Evaluate -- LLM-as-Judge Evaluation
  via Structured Decomposition'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18303
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Dae Lee, Mihai Delgeanu, Adel Youssef
---

arXiv:2608.18303v1 Announce Type: new 
Abstract: LLM-as-judge evaluation reduces response quality assessment to a single holistic A/B preference choice, providing no mechanism to isolate which quality dimensions drove the preference or distinguish model errors from genuine label ambiguity. We propose SESSE (Sketch, Expand, Sort, Summarize, Evaluate), a training-free framework that decomposes holistic judgment into structured sub-questions mined directly from the judge's own error cases; requiring no oracle responses, task-specific rubrics, or fine-tuning. On RewardBench (n=1,000), SESSE achieves near-parity with the chain-of-thought baseline and is competitive with RISE-Judge-32B (92.7%), a fine-tuned specialist, while remaining fully training-free. Per-criterion vote evidence provides an interpretable audit trail for diagnosing label ambiguity and judge failure modes unavailable from a single holistic output token.