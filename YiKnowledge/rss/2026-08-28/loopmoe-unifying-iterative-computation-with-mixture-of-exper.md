---
title: 'LoopMoE: Unifying Iterative Computation with Mixture-of-Experts for Language
  Modeling'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2606.04438
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Wenkai Chen, Tianshu Li, Wenyong Huang, Yichun Yin, Lifeng Shang, Chengwei
  Qin
---

arXiv:2606.04438v2 Announce Type: replace-cross 
Abstract: Mixture-of-Experts (MoE) and looped architectures scale models along two orthogonal axes, namely parameter capacity and effective depth. However, mainstream looped architectures rely on dense backbones that couple parameter count with per-token FLOPs, which makes it impossible to isolate the effect of iterative computation under matched budgets. To this end, we present LoopMoE, a looped MoE language model that integrates sparse routing with iterative weight-shared computation through two designs. The first is IterAdaLN, which resolves weight-sharing symmetry via a modulation signal jointly conditioned on the iteration index and the per-token hidden state. The second is a capacity-balancing strategy that recovers the attention-to-FFN active parameter ratio of well-tuned non-looped references. Together, these designs enable the first strictly controlled, head-to-head evaluation of a looped MoE against a Vanilla MoE under identical total parameters, per-token FLOPs, and active sublayer ratios. Across nine downstream benchmarks, LoopMoE's average improvement over its matched vanilla MoE increases from over 1 point at the 3B scale to approximately 3 points at the 9B scale. These results provide initial evidence that the benefits of iterative sparse computation may strengthen with scale, positioning LoopMoE as a promising architecture for scalable looped language models.