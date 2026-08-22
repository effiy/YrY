---
title: Structured Latent Space Modeling over Multi-Scale Temporal Patches for Multivariate
  Time Series Forecasting
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2607.19404
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Xingsheng Chen, Deyu Yi, Siu-Ming Yiu
---

arXiv:2607.19404v2 Announce Type: replace-cross 
Abstract: Existing patching and multi-scale methods advance multivariate time series forecasting but treat learned representations as transient byproducts of prediction, lacking explicit mechanisms that enforce structural consistency across temporal scales. We propose M2Patch, a CNN-based architecture that organizes channel-independent observations into a structured latent space via two complementary differentiable penalties. Multi-scale patching decomposes the input into overlapping temporal granularities, depthwise separable CNN blocks with progressively growing dilation extracts scale-specific features at linear complexity, and per-scale learned projections compress these features into a compact latent representation. An intra-scale smoothness penalty enforces temporal continuity between adjacent patches, while an inter-scale alignment penalty restores cross-granularity interaction through learnable cross-scale mappings, so that all scales encode mutually consistent representations of the underlying dynamics. Extensive experiments on ten real-world benchmark datasets demonstrate that M2Patch significantly outperforms state-of-the-art baselines. Further analyses establish M2Patch as a structure-aware recognizer: it recovers channel functional groupings and remains robust under patch-level input corruption, confirming that the structured latent space captures the data's intrinsic dynamics.