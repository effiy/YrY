---
title: 'SIGMA: Structured Noise-Effect-Aware Grouped Multi-Agent Aggregation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26683
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Li Mingqian
---

arXiv:2608.26683v1 Announce Type: new 
Abstract: Cooperative multi-agent reinforcement learning (MARL) faces significant challenges in maintaining robust coordination under noisy observations. Although observation disturbances are often introduced independently across agents, their downstream effects on cooperative decision-making can become structured through underlying cooperation structures. We characterize this phenomenon as structured noise effects, where noise-induced decision effects exhibit local correlation among agents with stronger task-related dependencies while remaining globally heterogeneous across different agents and local structures. Existing robust MARL methods, however, rarely explicitly characterize or exploit such structure-dependent noise effects. To address this limitation, we propose SIGMA, a hierarchical collaboration framework that exploits cooperation structures to learn robust representations under noisy observations. SIGMA first organizes agents into adaptive local structures through density-based grouping and performs intra-group consensus aggregation to preserve shared task-relevant information while smoothing agent-specific representation deviations. Inter-group attention then adaptively integrates information across different groups to preserve global coordination while accommodating their heterogeneous contributions. Experiments on noisy-observation tasks in StarCraft II empirically validate the structured noise effects and demonstrate that SIGMA consistently improves robustness under observation noise while maintaining competitive performance in noise-free environments.