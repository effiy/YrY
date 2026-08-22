---
title: 'Which Negatives Matter? Ask Your Text Encoder: Adaptive Similarity Margins
  for Dense-Caption Retrieval'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18521
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Haoyue Liu, Ye Chen, Zhichao Wang, Xiaoying Tang
---

arXiv:2608.18521v2 Announce Type: new 
Abstract: Dense-caption retrieval has recently been improved by introducing segmentation, edge maps, LLM-filtered captions, and cross-modal modules into contrastive fine-tuning. However, these methods largely inherit the same InfoNCE objective, whose optimization can prematurely saturate under a strong pre-trained initialization: on dense captions, the loss falls below 10^-3 on 80% of batches within the first epoch, while its gradient becomes numerically zero in 47% of measurements. We find that this behavior is closely related to the large number of near-duplicate captions in dense-caption benchmarks, where a few highly similar negatives remain unresolved after the easy majority has already been separated. As a remedy, we introduce HN-CLIP, which uses the text encoder's own text-text geometry to construct per-negative adaptive similarity margins. Specifically, a detached caption-similarity matrix is added to the negative logits, assigning larger margins to more similar captions without mining, synthesizing, or resampling negatives. The resulting objective requires only one caption-similarity matrix and a masked logit addition during training, with no auxiliary data, additional parameters, offline preprocessing, or inference-time overhead. Extensive experiments on four dense-caption retrieval benchmarks show that HN-CLIP improves over the strongest competitors by +2.5 to +4.0 R@1 while training 2.4x faster than GOAL and 5.4x faster than StructXLIP. Moreover, the proposed objective improves all six tested fine-tuning frameworks on the in-domain benchmarks and reaches the strongest full-data baseline with only 20% of the training data.