---
title: 'GAMMA: Global Bit Allocation for Mixed-Precision Models under Arbitrary Budgets'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2605.18475
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Zhangyang Yao, Haiyan Zhao, Haoyu Wang, Xu Han
---

arXiv:2605.18475v2 Announce Type: replace-cross 
Abstract: Mixed-precision quantization improves the budget--accuracy trade-off for large language models (LLMs) by allocating more bits to sensitive modules. However, automating this allocation at LLM scale faces a unique combination of constraints: learnable approaches require quantization-aware training, which is infeasible for billion-parameter models; training-free alternatives rely on static proxy metrics that miss cross-module interactions and must be recomputed per target budget; and search-based methods are expensive without guaranteeing exact budget compliance. We propose GAMMA, a quantizer-agnostic framework that learns module-wise precision preferences entirely within a post-training pipeline. GAMMA optimizes a teacher-forced hidden-state reconstruction objective under an augmented Lagrangian constraint, and projects the learned preferences into exact budget-feasible discrete assignments via integer programming. A key property is score reuse: because the learned preferences encode a stable sensitivity ranking rather than budget-specific weights, a single training run serves arbitrary deployment targets by re-solving only the integer program, reducing per-budget adaptation from hours to a few minutes. Across Llama and Qwen models (8B--32B), GAMMA outperforms both fixed-precision baselines (up to +12.99 Avg.) and search-based mixed-precision methods (up to +7.00 Avg.), and can match fixed 3-bit quality at 2.5-bit average precision, enabling deployment at substantially smaller memory footprints.