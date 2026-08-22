---
title: Whole-Piece Training for Symbolic Music Language Models via Full-Horizon Compressed
  Recurrence
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2602.19816
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yungang Yi, Weihua Li, Matthew Kuo, Catherine Shi, Quan Bai
---

arXiv:2602.19816v3 Announce Type: replace-cross 
Abstract: For computational efficiency, modern language models are typically trained on independently sampled fixed-length sequences. Symbolic music language models largely inherit this paradigm, despite musical structure naturally unfolding over complete compositions rather than isolated excerpts. Fragmenting compositions into independent training instances therefore prevents continuous conditioning over the complete work.
  We present a practical framework for whole-piece training of symbolic music language models via Full-Horizon Compressed Recurrence (FHCR). FHCR preserves the full temporal horizon of recurrent memory while reducing the dimensionality of its key-value (KV) representation, making continuous whole-piece training practical under limited GPU memory.
  To directly assess functional long-range dependence, we introduce KV-Reset Context Utilization (KRCU), an evaluation-time diagnostic. On the MAESTRO symbolic piano dataset, KRCU shows that full-horizon models utilize context far beyond the local segment window, whereas reducing the temporal extent of recurrent memory substantially weakens this measurable long-range dependence. FHCR preserves long-range context utilization while substantially reducing recurrent memory cost.
  These findings show that preserving the temporal extent of recurrent history is important for efficient whole-piece modeling, and that memory cost can instead be reduced through KV representation compression.
  The project demos and generated music samples are available at https://wholemusic.github.io.