---
title: 'RTNav: Towards Real-Time Zero-Shot Object Navigation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26496
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Easop Lee, Lingyu Zhang, Boyuan Chen
---

arXiv:2608.26496v1 Announce Type: cross 
Abstract: Navigation in unknown environments to find unforeseen objects has become increasingly feasible with capable vision and language foundation models. However, these models also introduce non-negligible inference latency, which becomes an important concern when agents must operate continuously in the real world. Most state-of-the-art methods are still developed in synchronous simulators, where the environment waits for the agent to act and inference time is effectively free. As a result, agents are often designed around the sequential execution of perception, reasoning, and action, with little regard for time constraints. Under real-time execution, where wall-clock time counts towards the task budget, the inefficiencies of these architectures become clear. We show that recent zero-shot object navigation methods suffer consistent performance degradation under such realistic timing conditions. Motivated by this observation, we propose RTNav, a simple but effective architecture that treats inference latency, asynchronous environment stepping, and bounded compute as explicit design considerations. Evaluated on real-time variants of HM3D-v1, HM3D-v2, and HM3D-OVON, RTNav improves the success rate by up to 11% and the Success weighted by Completion Time by up to 5.1 points over prior work.