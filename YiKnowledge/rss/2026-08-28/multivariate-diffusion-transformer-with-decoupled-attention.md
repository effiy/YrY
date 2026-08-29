---
title: Multivariate Diffusion Transformer with Decoupled Attention for High-Fidelity
  Mask-Text Collaborative Facial Generation
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2511.12631
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yushe Cao, Dianxi Shi, Xing Fu, Xuechao Zou, Haikuo Peng, Xueqi Li, Chun Yu,
  Junliang Xing
---

arXiv:2511.12631v3 Announce Type: replace-cross 
Abstract: While significant progress has been achieved in multimodal facial generation using semantic masks and textual descriptions, conventional feature fusion approaches often fail to enable effective cross-modal interactions, thereby leading to suboptimal generation outcomes. To address this challenge, we introduce MDiTFace--a customized diffusion transformer framework that employs a unified tokenization strategy to process semantic mask and text inputs, eliminating discrepancies between heterogeneous modality representations. The framework facilitates comprehensive multimodal feature interaction through stacked, newly designed multivariate transformer blocks that process all conditions synchronously. Additionally, we design a novel decoupled attention mechanism by dissociating implicit dependencies between mask tokens and temporal embeddings. This mechanism segregates internal computations into dynamic and static pathways, enabling caching and reuse of features computed in static pathways after initial calculation, thereby reducing additional computational overhead introduced by mask condition by over 94% while maintaining performance. Extensive experiments demonstrate that MDiTFace significantly outperforms other competing methods in terms of both facial fidelity and conditional consistency.