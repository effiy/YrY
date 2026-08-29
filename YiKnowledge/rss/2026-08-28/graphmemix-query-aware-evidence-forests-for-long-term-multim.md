---
title: 'GraphMemix: Query-Aware Evidence Forests for Long-Term Multimodal Agent Memory'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26983
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Geng Li, Yuhao Wang, Dong Li, Jianye Hao, Yuxin Peng
---

arXiv:2608.26983v1 Announce Type: new 
Abstract: Organizing long-term memory for multimodal agents remains challenging because existing methods either suffer from expensive question-agnostic offline summaries or naive embedding similarity matching that introduces incomplete and redundant context. To address these issues, we propose GraphMemix, a combinatorial-optimization graph memory framework that models memory organization as query-aware evidence-forest construction. Specifically, our method consists of three key components:(1) candidate graph construction, which expands multi-view seed memories through schema and semantic relations to acquire query-aware original context; (2) evidence utility and activation costs, which decouples direct memory support from anchor-conditioned relation verification to suppress redundant or conflicting information; and (3) forest optimization, which jointly selects a forest-format memory context under a maximum evidence budget and its reliable relational structure. By organizing memory into a query-relevant subgraph, the method avoids substantial lifecycle cost and recovers low-similarity complementary evidence. Experimental results across four long-term multimodal memory benchmarks demonstrate significant improvements with different foundation models and establish a new Pareto frontier between accuracy and lifecycle cost.