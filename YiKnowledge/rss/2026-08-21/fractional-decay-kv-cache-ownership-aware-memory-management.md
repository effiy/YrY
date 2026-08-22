---
title: 'Fractional Decay KV-Cache: Ownership-Aware Memory Management for Improved
  Inference Relevancy in Dialog Systems'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18098
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Sukanta Ganguly
---

arXiv:2608.18098v1 Announce Type: cross 
Abstract: Key-value (KV) caching is essential for efficient autoregressive inference in transformer based dialog systems, yet existing strategies treat all cached entries uniformly or apply coarse eviction heuristics that fail to adapt as dialog topics evolve. We propose Fractional Decay KV-Cache (FD-KVC), a novel algorithm that maintains a dual-channel scoring mechanism for each cached KV pair: a cumulative attention channel that tracks aggregate importance (akin to H2O), and a recency-weighted relevance channel governed by temporal decay and reinforcement-inspired updates. The combination enables FD-KVC to both preserve historically important tokens and rapidly adapt when dialog topics shift. An adaptive learning rate driven by an ownership loss function ensures convergence without oscillation. FD-KVC operates entirely on CPU with negligible overhead. Across five diverse multi-turn dialog scenarios with 600 dialogs each, FD-KVC outperforms H2O, the state-of-the-art heavy-hitter baseline, by +6.7% on composite late-turn alignment, with improvements of +127% on topic-shift, +87% on gradual evolution, and +30% on mixed-topic dialogs. FD-KVC adapts to new topics 3.6X faster than H2O and achieves the highest topic diversity (80.6%) across all methods. Ablation studies confirm the contribution of each component.