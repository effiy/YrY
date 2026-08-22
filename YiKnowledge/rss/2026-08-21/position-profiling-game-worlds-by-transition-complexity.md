---
title: 'Position: Profiling Game Worlds by Transition Complexity'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18079
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Lele Cao
---

arXiv:2608.18079v1 Announce Type: new 
Abstract: Game world modeling (GWM) and reinforcement learning (RL) are often confounded because research papers rarely quantify how difficult the underlying transition prediction problem is at the declared interface (pixels/tokens/latents with finite history). We propose the Transition Complexity Profile (TCP): a small, reproducible set of metrics that characterizes an environment's (or gameplay dataset's) induced transition kernel by (i) intrinsic one-step branching, (ii) interaction-induced uncertainty and opponent influence when observable, and (iii) temporal/spatial dependency span via standardized probe curves. TCP is reported with an explicit reference distribution, protocol stochasticity, and a versioned measurement budget (sampling/resampling and fixed probe compute), enabling comparable numbers across benchmarks. We outline how common game families and modern "neural game engine" domains populate this landscape and call for TCP to become standard benchmark metadata and a required statistic in GWM and RL papers.