---
title: Training-Free Inference-Time Self-Reflection and Cost-Bounded Early Stopping
  for Large Language Models
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18884
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Wei Yu, Suxing Liu, Minjie Yu, Jiahao Wang, Zhijian Zheng, Haocheng Deng,
  Bing Li
---

arXiv:2608.18884v1 Announce Type: new 
Abstract: Reinforcement-learning training of reasoning LLMs (e.g., GRPO) is expensive and requires a controllable environment, committing every contribution to a full training pipeline. We present EvoResearcher, a training-free, inference-time protocol that adds cost-bounded self-reflection to a single frozen LLM backbone. The protocol iterates generate -> self-critique -> revise until a maximum depth D is reached or the critique returns the CONFIRMED sentinel, an implicit early stop that lets the backbone self-verify its answer under a strict compute budget. Four self-reflective meta-reward components (correctness, efficiency, reflection depth, tool-call diversity) act as design principles instantiated as prompt-level mechanisms, so their benefits accrue with zero gradient updates. We validate the protocol on Big-Bench Hard (100 questions) and establish cross-domain behavior on GSM8K (500) and MATH (500) on the same frozen backbone, with cross-model replication on Qwen2.5-72B. All experiments use pure-reasoning benchmarks; the tool-call diversity component is validated in prompt-level form, and the environment-level and multi-agent extensions are design blueprints left to future work. On clean BBH the protocol does not raise accuracy beyond the 95% Wilson interval; its value is cost-bounded self-verification, with the CONFIRMED early stop terminating 82-88% of items at equal accuracy (about 2.1 generations per question).