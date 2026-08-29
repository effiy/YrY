---
title: 'Position Is All You Need: A Free Lunch Token Compression Strategy for MLLM-based
  Referring Expression Segmentation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26142
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yuhan Liu, Yixiong Zou, Yuhua Li, Ruixuan Li
---

arXiv:2608.26142v1 Announce Type: cross 
Abstract: Referring Expression Segmentation (RES) aims to generate pixel-wise segmentation masks from complex and implicit textual queries. While recent advances in Multimodal Large Language Models (MLLMs) have substantially boosted RES performance, their prohibitive computational overhead remains a critical bottleneck, which, however, is rarely explored. To fill this gap, we first evaluate typical token compression methods on this task and observe a surprising performance degradation. In this paper, we aim to understand this phenomenon for a solution. By extensive experiments, we find that token compression for RES requires preserving the original position embeddings and local neighboring spatial structures, indicating that visual token position information is far more critical than in other tasks. Building on this insight, we ask: Can we design the token compression method purely based on the position information? Therefore, we propose PAYN, a plug-and-play, training-free token compression method that relies solely on position information. PAYN retains tokens that are adequately distributed in every local neighboring region while strictly preserving original positional indices, thereby maintaining spatial relational consistency. Experiments on multiple RES benchmarks demonstrate that our method outperforms existing token compression methods, verifying that position is indeed all you need for token compression in the MLLM-based RES task. Codes are avaliable at https://github.com/YuhanLiu231/PAYN.