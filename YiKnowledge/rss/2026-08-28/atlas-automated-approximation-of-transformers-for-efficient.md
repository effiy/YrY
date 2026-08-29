---
title: 'ATLAS: Automated Approximation of Transformers for Efficient Homomorphic Inference
  in One Hour'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2607.23478
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Jianhang Xie, Sicheng Tan, Vishnu Naresh Boddeti, Zhichao Lu
---

arXiv:2607.23478v2 Announce Type: replace-cross 
Abstract: Fully homomorphic encryption (FHE) lets a server run inference on encrypted data with strong privacy guarantees, but running a Transformer under FHE is expensive. Its non-linear operations, such as softmax, normalization, and activation, must be replaced with polynomial approximations that the CKKS scheme supports, and the depth of these approximations dominates inference cost. Existing FHE Transformers use hand-tuned approximation settings, such as iteration count and polynomial degree, applied uniformly across layers, models, and tasks. Hand-tuning is slow and error-prone. Even a single uniform setting has about $10^7$ choices, and manual search cannot exploit layer-wise variation. AutoFHE, the only automated method with multi-objective search, targets ReLU-only CNNs and needs full fine-tuning per candidate, which is too costly for Transformers. Per-layer settings also push the search space to about $10^{85}$ for BERT and ViT and $10^{228}$ for LLaMA3, beyond both manual and fine-tuning-based search. We present ATLAS, a training-free framework that automates this search by treating each layer's approximation setting as a multi-objective optimization over latency and accuracy. The problem is hard: the decision space is large (96 or 256 variables), each configuration takes 70 to 1,000 seconds to evaluate even in cleartext, and 85 to 90 percent of configurations are invalid. ATLAS handles this with a two-stage optimization strategy and a surrogate model, completing the search in about one hour. Compared to an iterative softmax baseline, ATLAS cuts multiplicative depth and end-to-end latency by about 35 percent with little accuracy loss, and works across encoder-only, decoder-only, and vision Transformers, complementing parallel work on packing and matrix multiplication.