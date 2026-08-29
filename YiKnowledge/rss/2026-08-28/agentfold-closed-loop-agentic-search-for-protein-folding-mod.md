---
title: 'AgentFold: Closed-Loop Agentic Search for Protein Folding Model Design'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26747
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Mingquan Liu, Jiangyu Chen, Hanqun Cao, Xujun Zhang, Pengsen Ma, Xiangru Tang,
  Shuting Jin, Zhuo Yang, Tianfan Fu, Fang Wu, Xiangxiang Zeng
---

arXiv:2608.26747v1 Announce Type: new 
Abstract: Scientific LLM agents have shown promise in literature reasoning, tool use, and experiment planning, but it remains unclear whether they can autonomously improve large, tightly coupled scientific machine-learning systems through executable code changes and computationally expensive validation. We study this question in protein folding, where progress requires coordinated architectural modifications, multi-objective evaluation, and domain-aware interpretation. We present AgentFold, a multi-agent framework that formulates folding-model development as a closed-loop search over executable code variants. Starting from ESMFold, AgentFold proposes hypotheses, implements and debugs code-level modifications, evaluates model variants, analyzes experimental outcomes, and stores both successful and failed interventions in structured memory. An MCTS-style policy allocates computational resources across high-scoring search branches. On an engineering-scale protein-folding codebase comprising more than 2,000 lines of code, AgentFold explores approximately 80 model variants using approximately 5,000 GPU-hours and 170 million LLM tokens. Under a matched computational budget, AgentFold improves the best lDDT by 7.5% over independent Codex proposals and outperforms a random-search control. Beyond model improvement, the resulting intervention traces reveal recurring empirical design patterns: stable gains tend to arise from early, soft, learnable priors and gated refinement, whereas direct geometric perturbations and geometry-conditioned feedback often destabilize training. The code and experimental resources are publicly available at https://github.com/lmqfly/AgentFold.