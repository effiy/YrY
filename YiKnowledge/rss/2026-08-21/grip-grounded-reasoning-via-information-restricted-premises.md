---
title: 'GRIP: Grounded Reasoning via Information-Restricted Premises'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.16776
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Lirui Teng
---

arXiv:2608.16776v2 Announce Type: replace 
Abstract: High-capacity encoders in retrieval-augmented generation (RAG) can let the query dominate the latent state, leaving retrieved evidence functionally irrelevant. We call this failure mode query dominance. To address it, we introduce \textbf{GRIP} (Grounded Reasoning via Information-Restricted Premises), which imposes capacity asymmetry: the decoder keeps full-dimensional access to the query, while retrieved evidence passes through a severe stochastic bottleneck. This forces the evidence channel to encode only the residual information unavailable from the query. Across five reasoning benchmarks, GRIP outperforms strong iterative baselines, cuts a query--latent mutual-information diagnostic by roughly 30$\times$ (14.8 $\to$ 0.47 bits), and reduces hallucination by 73\%. Residual-alignment analysis further shows that the bottleneck output occupies subspaces less aligned with the query than baseline representations.