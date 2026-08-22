---
title: 'DART-SD: Diamond-topology Aware Retrieval and Tuning for Self-Distillation
  of Multi-Turn Tool-Calling Agents'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18524
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Hangrui Xu, Jiarui Wang, Yang Yang, Chuanbo Zhu, Fangda Chen, Ziqi Wu, Jingming
  Cai, Yan Song
---

arXiv:2608.18524v1 Announce Type: cross 
Abstract: Equipping Large Language Models (LLMs) with multi-turn tool-calling capabilities is essential for building autonomous agents. However, progress is fundamentally limited by the reliance on full-length trajectory imitation. For tasks involving multiple order-independent sub-goals, the optimal solution space forms a vast combinatorial diamond lattice. Forcing this rich topology into monolithic trajectories causes a severe topological collapse, indiscriminately penalizing valid alternative explorations and severely degrading policy diversity. To address this, we propose DART-SD (Diamond-topology Aware Retrieval and Tuning for Self-Distillation), a novel framework that shifts the paradigm from global forcing to topology-guided localized correction. DART-SD first models the execution process as a converging Interaction-State Transition Graph (ISTG), faithfully capturing the inherent diamond topology of successful and failed exploratory paths. During autonomous rollouts, the framework identifies the Critical Topological Breakpoint (CTB) and retrieves success-supported recovery references. Finally, we introduce a progressive self-distillation paradigm through CTB-guided localized supervision, ensuring that the training loss is calculated exclusively on the generated recovery steps while strictly protecting the valid reasoning prefix from destructive gradient updates. Experiments on complex multi-turn tool-calling benchmarks demonstrate that DART-SD significantly outperforms traditional full-trajectory baselines.