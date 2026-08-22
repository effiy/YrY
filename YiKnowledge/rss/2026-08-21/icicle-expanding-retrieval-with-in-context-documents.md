---
title: 'ICICLE: Expanding Retrieval with In-Context Documents'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2605.26902
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yu-Chen Den, Yung-Yu Shih, Zhi Rui Tam, Kuan-Yu Chen, Pu-Jen Cheng, Yun-Nung
  Chen, Eugene Yang
---

arXiv:2605.26902v3 Announce Type: replace-cross 
Abstract: Generative retrieval (GR) maps queries directly to document identifiers (docids) using parametric knowledge, However, this design makes corpus expansion costly: adding new documents requires updating model parameters to encode new document-docid associations incurs repeated training and catastrophic forgetting of previously indexed documents. In this work, we revisit incremental GR as an in-context retrieval problem, where newly added documents are supplied as inference-time document-docid evidence. We propose ICICLE, an in-context indexing framework that performs source-aware docid generation over both parametric memory and context-provided document-docid pairs. ICICLE combines a `[COPY]`-based routing mechanism, preference-based calibration, and large context adaptation to distinguish context-grounded retrieval from parametric retrieval. Experiments on MS MARCO and NQ320K show that ICICLE improves retrieval of newly introduced documents while preserving seen-document retention without corpus-specific retraining. Our analysis further shows that high-shot degradation is mainly caused by routing failure, highlighting source-selection calibration as a key bottleneck for scaling in-context generative retrieval.