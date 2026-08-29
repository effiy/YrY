---
title: 'RedEvoAgent: Automatic Red-Teaming Agent with Experience-Driven Skill Evolution'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27439
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Junjie Zhang, Hui Liu, Kecheng Chen, Xianbo Mo, Changsheng Chen, Haoliang
  Li
---

arXiv:2608.27439v1 Announce Type: cross 
Abstract: LLM-based agents are increasingly deployed in product-level execution harnesses, where jailbreaks can trigger harmful tool use and persistent state changes, creating greater risks than unsafe text generation alone. Existing automatic red-teaming methods often rely on fixed attacks, while recent agentic attackers coordinate multiple jailbreak tools and show stronger potential through trajectory-based retrieval. However, such retrieval can reuse misleading experiences due to retrieval bias and unclear tool credit, and full trajectories add context overhead while reducing interpretability. We propose RedEvoAgent, a black-box red-teaming agent that distills cross-case attack trajectories into a concise, human-readable attack skill. The attack skill adaptively evolves through tool-effectiveness profiling and Deciding-Tool Attribution for skill updates, and a validation ratchet that retains only updates improving validation performance. Experiments on multiple benchmarks, target models, and target execution harnesses show that RedEvoAgent outperforms fixed and agentic baselines, improves tool efficiency, and transfers across attacker models and target execution harnesses.