---
title: 'MedFG-VQA: Low-Frequency Memory and Graph Attention for Lightweight Medical
  VQA'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26848
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Haowen Gu, Gensheng Pei, Zeren Sun, Mingwu Ren, Xiangbo Shu, Yazhou Yao, Fumin
  Shen
---

arXiv:2608.26848v1 Announce Type: cross 
Abstract: Medical Visual Question Answering (Med-VQA) holds significant promise for clinical decision support, yet faces challenges due to limited annotated data and the high computational demands of existing large vision-language models. We propose MedFG-VQA, a lightweight framework that leverages a memory bank to augment DCT-based low-frequency features and employs graph-enhanced cross-attention for effective visual-textual alignment. Specifically, our approach features two key components: Frequency-Memory Fusion (FMF), which enhances low-frequency features by retrieving from a learnable memory bank built on DCT decomposition, and Graph-Aware Cross-Attention (GACA), which aligns visual-textual features via cross-attention and refines them through graph-convolutional aggregation. To address data scarcity, we construct SynMed-VQA, a large-scale synthetic dataset comprising over 2 million question-answer pairs across 9 imaging modalities and 10 major organs, generated with GPT-4o. Extensive experiments on SynMed-VQA and three other standard biomedical VQA benchmarks demonstrate that MedFG-VQA achieves competitive or superior performance compared to much larger models while maintaining significantly lower computational costs, highlighting its efficiency and potential for clinical deployment.