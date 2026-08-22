---
title: 'ReWEIGH the Evidence: Calibrating Token-Level Ordinal Visual Evidence to Mitigate
  Hallucinations in Large Vision-Language Models'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.19075
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Jihae Jeong, Junha Choi, Hwanjo Yu
---

arXiv:2608.19075v1 Announce Type: cross 
Abstract: Large vision-language models (LVLMs) often hallucinate, generating content that the input image does not support. Preventing such content during decoding calls for a candidate-specific measure of how strongly the image supports the token under consideration. The model's visual-token states offer a natural source of this evidence because projecting each state through the output head reveals which vocabulary items that position favors. These position-wise readouts cannot be pooled directly because their probability magnitudes are not comparable across visual positions. Vocabulary ranks provide a scale-invariant basis for pooling, but tokens still differ systematically in their typical rank-based evidence. We propose ReWEIGH, a training-free decoding intervention that aggregates these ranks across visual positions and compares each candidate with a token-specific reference estimated from unlabeled images. At inference, ReWEIGH caches the image evidence during prefill and applies a bounded penalty only to candidates that fall below their reference. On four 7B backbones, ReWEIGH reduces hallucinated object mentions by up to 21.3% while largely preserving or improving descriptive and general performance. With evidence cached, the average added latency is 1.33% per token, and the reductions extend across six architecture families to 32B parameters.