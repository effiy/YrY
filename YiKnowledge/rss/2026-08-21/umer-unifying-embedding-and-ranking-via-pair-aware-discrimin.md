---
title: 'UMER: Unifying Embedding and Ranking via Pair-Aware Discriminative Reasoning
  for Universal Multimodal Retrieval'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18504
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Libiao Chen, Xiyang Liu, Yanheng Wei, Tao Wang, Zhenyu Tang
---

arXiv:2608.18504v1 Announce Type: new 
Abstract: Universal multimodal retrieval aims to support diverse instruction-aware retrieval tasks, demanding both efficient corpus-scale matching and fine-grained semantic reasoning. Recent MLLM-based embedding methods typically derive representations from hidden states, while Chain-of-Thought (CoT) reasoning is emerging as a promising strategy for embedding enhancement by encoding intermediate semantic evidence into the representation space. However, existing CoT methods typically use item-wise reasoning over queries and candidates in isolation, providing no explicit evidence to distinguish a positive from a semantically confusable hard negative. Moreover, contrastive embeddings capture global similarity but struggle with meta-tasks requiring answer verification, category judgment or fine-grained reasoning. In this paper, we propose UMER, a Unified Multimodal Embedding and Ranking framework for universal multimodal retrieval. UMER replaces item-wise reflection with Pair-Aware Discriminative Reasoning, which compares query--candidate pairs to identify instruction-relevant matching and discrepancy evidence. UMER jointly learns contrastive embeddings for efficient global matching and discriminative ranking for explicit pairwise relevance judgment within a single MLLM. A complementary mutual distillation strategy further transfers reliable pairwise preferences between the embedding and ranking functions. On the MMEB-V2 benchmark, UMER achieves state-of-the-art performance under comparable experimental settings while supporting budget-adjustable inference.