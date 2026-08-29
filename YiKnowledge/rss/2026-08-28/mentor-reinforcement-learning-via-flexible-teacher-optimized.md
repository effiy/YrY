---
title: 'MENTOR: Reinforcement Learning via Flexible Teacher-Optimized Rewards for
  Tool-Use Distillation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2510.18383
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: ChangSu Choi, Hoyun Song, Dongyeon Kim, Minkyung Cho, WooHyeon Jung, Sunjin
  Park, NohHyeob Bae, Seona Yu, KyungTae Lim
---

arXiv:2510.18383v4 Announce Type: replace-cross 
Abstract: Distilling the tool-use capabilities of large language models (LLMs) into small language models (SLMs) is essential for their practical application. The predominant approach, supervised fine-tuning (SFT), is an off-policy distillation method that suffers from poor out-of-domain (OOD) generalization because it rigidly aligns with static teacher trajectories. While reinforcement learning (RL) offers an alternative, the capacity limitations of SLMs pose a severe dilemma: sparse outcome rewards provide insufficient guidance, whereas strict trajectory matching imposes overly restrictive constraints. To bridge this capacity-driven gap, we propose MENTOR, an on-policy distillation framework that introduces a flexible yet process-aware reward structure. Instead of enforcing rigid replication, MENTOR uses the teacher's reference to guide tool-use behavior, balancing behavioral alignment with downstream performance. Extensive experiments on controlled executable-tool benchmarks demonstrate that MENTOR improves OOD tool-use performance compared to SFT and strict RL baselines. Our findings suggest that within verifiable tool-use environments, flexible tool-use alignment offers a more effective approach than strict trajectory replication for developing adaptable small models.