---
title: Approximate Speculative Decoding
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.03447
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yuannuo Feng, Zegang Peng, Yuxin Xie, Yubing Ye, Yizhe Chen, Wenshuai Yao,
  Wenyong Zhou, Wang Kang
---

arXiv:2608.03447v2 Announce Type: replace-cross 
Abstract: Speculative decoding accelerates autoregressive generation by verifying a draft block with a target model in parallel. Under standard greedy verification, decoding stops at the first draft token that differs from the target argmax, discarding the remaining target-scored suffix. Although accepting such a mismatch changes the decoding trajectory, it can make a contiguous suffix reusable when its tokens remain target-greedy under the realized prefix. In this paper, we introduce \textbf{Approximate Speculative Decoding (ASD)}, a training-free verifier that replaces binary first-mismatch truncation with budgeted longest-prefix selection. ASD accepts selected mismatches subject to a local target-logit regret gate, a per-block exception cap, and a persistent request-level regret budget, then reuses the contiguous target-greedy suffix without additional approximate decisions or target-model forward passes. ASD requires neither a new draft model nor fine-tuning, and exactly reduces to standard greedy verification when the budget is zero. Experiments show that ASD improves fixed-workload throughput by $3.05\%$--$15.26\%$ over matched strict verification and averages a $7.78\%$ gain across seven Qwen3-14B + DSpark-14B tasks. On DeepSeek-V4-Flash (284B) with DSpark it also raises verifier-side acceptance by roughly $10\%$--$16\%$ on GSM8K and MATH-500 in an FP4-to-FP8 compatibility setting. The source code is publicly available at: https://github.com/Kissmetothemoon/ASD