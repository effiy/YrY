---
title: 'PailitaoGR: Latent Think-with-Images for Generative Image Retrieval'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26658
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Xiaomeng Fan, Yueran Liu, Shengyu Zhou, Chenghan Fu, Wanxian Guan, Feng Li,
  Chuan Yu, Jian Xu, Bo Zheng
---

arXiv:2608.26658v1 Announce Type: cross 
Abstract: Generative retrieval has demonstrated strong performance by directly generating product semantic identifiers (SIDs).
  Extending this paradigm to image search, however, is nontrivial because real-world query images contain diverse information, including the search target, useful auxiliary evidence, and irrelevant visual content.
  This requires the model to identify and focus on the search target while selectively utilizing auxiliary evidence. In this paper, we propose \textbf{PailitaoGR}, a \emph{Latent Think-with-Images} method for generative image retrieval, which internalizes target-focused perception and selective auxiliary-evidence utilization into a the generative retrieval model, enabling \textit{Zooming without Cropping} and \textit{Reading without OCR}. Specifically, we design a target-focused perception mechanism that identifies and enhances visual tokens of the search target, consisting of a target Enhancer and a learning strategy based on on-policy distillation and attention guidance loss, enabling the model to focus on search-target regions. We also design a selective auxiliary-evidence utilization mechanism that identifies and enhances visual tokens of auxiliary evidence, including an auxiliary enhancer and an in-capacity incremental contrastive distillation strategy, enabling the model to exploit auxiliary evidence. We construct training and validation sets sampled from real-world online image-search logs. Experiments show that our method outperforms existing baselines by an average of 13.8\%, validating its effectiveness.