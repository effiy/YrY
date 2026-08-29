---
title: Mutual Debiasing via Dual-Seed Comparison for Probabilistic Sampling in Large
  Language Models
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26161
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Zihao Guo, Hongtao Lv, Chaoli Zhang, Laiguo Yin, Lei Liu, Yonghui Xu, Lizhen
  Cui
---

arXiv:2608.26161v1 Announce Type: cross 
Abstract: Although Large Language Models (LLMs) demonstrate remarkable capabilities in reasoning and decision-making, high-fidelity probabilistic sampling remains a persistent challenge. When generating random variables, LLMs consistently exhibit systematic biases that warp the target probability distributions. Current approaches often rely on a single, self-generated seed, which inherits model-specific biases. To overcome this vulnerability, we introduce Dual-Seed Comparison (DSC), a transparent, tool-free protocol that utilizes two independent LLM-generated seeds to neutralize bias. DSC compares the character-level ordinal values of the two seeds to construct a bit sequence, converts and normalizes this sequence into a pseudo-uniform variate, and then maps the variate to the target distribution through the inverse cumulative distribution function (CDF). Empirical results show that DSC substantially outperforms existing methods across 96\% of evaluated settings. Beyond direct sampling, task-adapted variants based on the DSC comparison operator improve distributional control in MCQ generation and attribute-constrained text-to-image prompting.