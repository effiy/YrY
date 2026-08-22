---
title: Looped Language Models Improve Compositional Tool Calling
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18171
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Andrei Cristian Popescu, Haitz S\'aez de Oc\'ariz Borde, Pietro Li\`o
---

arXiv:2608.18171v1 Announce Type: new 
Abstract: Looped language models have shown promising results on reasoning benchmarks, yet their potential for agentic tool use remains largely unexplored. We study this question in compositional tool-calling settings, where models must coordinate multiple API calls, maintain intermediate state, and preserve dependencies across tool interactions. We evaluate native and retrofitted looped language models on API-Bank, BFCL, and NESTful, comparing looped and non-looped models trained under matched supervised fine-tuning recipes and varying recurrent depth at inference time. In controlled experiments, recurrent computation generally benefits compositional and dependency-aware tool use, while providing smaller and more model-dependent gains on isolated API invocation. Accuracy on multi-step tool use generally increases with recurrent depth; adaptive inference, however, achieves a more favorable compute-performance trade-off by allocating additional computation only when needed. Our results suggest that looped language models are a promising architecture for agentic systems that require reliable planning, coordination, and execution of compositional tool use workflows.