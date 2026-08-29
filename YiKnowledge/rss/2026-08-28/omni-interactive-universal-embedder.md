---
title: Omni-Interactive Universal Embedder
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27044
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Wei-Yao Wang, Kazuya Tateishi, Shuyang Cui, Christian Simon, Takashi Shibuya,
  Shusuke Takahashi, Yuki Mitsufuji
---

arXiv:2608.27044v1 Announce Type: new 
Abstract: Multimodal representation learning has been shifting from traditional two-tower architectures to large language model (LLM)-based embedders due to their strong instruction-following capabilities. Despite this progress, existing approaches primarily focus on language and image modalities, which also remain the dominant modalities for user-conditioned interactions in current embedders. In this paper, we propose the first Omni-Interactive Universal Embedder (OmniUE), which not only learns a unified embedding space across text, video, and audio by leveraging intermediate-layer representations from dedicated learnable tokens, but also supports omni-interactive querying, enabling users to provide inputs in the form of text, visual regions of interest, and audio spans. Within OmniUE, visual and audio segmenters process diverse user interactions and integrate them with an omni-LLM to produce user-conditioned any-to-any embeddings via context aggregation. To evaluate OmniUE's omni-interactive capabilities, we introduce OmniCHOIR, benchmarking models for omni-interactive compositional audio retrieval based on the given text, video, and audio as well as unimodal or multimodal interaction prompts. OmniUE consistently surpasses state-of-the-art baselines across diverse modalities, with average improvements of 10.5% on textual-interactive video benchmarks (MMEB-v2-video), 1.1% on audio tasks (MAEB), 83.7% on visual-interactive benchmarks (SCaR), and 24.1% on our omni-interactive OmniCHOIR benchmark. We believe that jointly advancing omni-modal representation learning and omni-interactive querying paves the way toward universal embedders.