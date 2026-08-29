---
title: 'Don''t Overthink, Don''t Underthink: Toward Adaptive Reasoning in Agentic
  AI'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26442
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Md Jueal Mia, M. Hadi Amini
---

arXiv:2608.26442v1 Announce Type: new 
Abstract: Recent advances in Large Language Models (LLMs) have shown that increased inference-time reasoning can improve performance on complex tasks. However, many existing approaches rely on fixed or preallocated reasoning controls, such as fixed token budgets, pre-execution difficulty estimates, or activation-space interventions, and are often evaluated on standalone reasoning benchmarks rather than full agentic workflows. These assumptions may not hold in agentic AI systems, where reasoning requirements evolve dynamically through planning, tool use, memory retrieval, and agent-to-agent interactions. Consequently, reasoning can become either excessive or insufficient, resulting in unnecessary computation, increased latency, planning drift, excessive tool use, or incomplete solutions. We argue that a major challenge for next-generation agentic AI is not merely how much reasoning a language model should perform, but how it should allocate reasoning according to evolving task demands. We characterize over-reasoning and under-reasoning as recurring failure modes of misallocated reasoning and evaluate them on MATH-500 and the GAIA public validation benchmark. Using tool-decision latency, token consumption, token-limit exhaustion, and answer correctness, our results suggest that cases classified as over-reasoning are associated with higher computational cost without proportional accuracy gains, whereas cases classified as under-reasoning are consistently associated with incorrect or incomplete solutions. These findings motivate future research on adaptive reasoning mechanisms for agentic AI.