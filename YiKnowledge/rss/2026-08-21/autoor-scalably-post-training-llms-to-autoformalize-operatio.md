---
title: 'AutoOR: Scalably Post-training LLMs to Autoformalize Operations Research Problems'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2604.16804
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Sumeet Ramesh Motwani, Chuan Du, Aleksander Petrov, Christopher Davis, Philip
  Torr, Antonio Papania-Davis, Weishi Yan
---

arXiv:2604.16804v3 Announce Type: replace-cross 
Abstract: Optimization problems are central to decision-making in manufacturing, logistics, scheduling, and other industrial settings. Translating complicated descriptions of these problems into solver-ready formulations requires specialized operations research (OR) expertise, making it hard to scale. We present AutoOR, a scalable synthetic data generation and reinforcement learning pipeline that trains LLMs to autoformalize optimization problems specified in natural language across linear, mixed-integer, and non-linear categories. AutoOR generates verified training data from standard optimization forms and uses solver execution feedback as the reward signal for RL post-training. AutoOR applied to an 8B model achieves state-of-the-art or competitive results across six established OR benchmarks, matching significantly larger frontier models. For a non-linear problem class involving physical dynamics, where frontier models score near 0%, we introduce a curriculum RL strategy that bootstraps from limited initial training data to make this class tractable for post-training. We believe that methods such as AutoOR can significantly accelerate industrial decision-making with AI.