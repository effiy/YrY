---
title: 'Denoising-Aware Inversion: Revealing Privacy Risks in Noise-Protected Text
  Embeddings'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18610
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yubo Wang, Shujie Cui, James Bailey, Hongzhi Yin, Wenyu Liang, Min Tang, Shiyue
  Qin, Weiqing Wang
---

arXiv:2608.18610v1 Announce Type: cross 
Abstract: Dense text embeddings are widely used in data mining, retrieval, and downstream machine learning systems due to their compact and semantically rich representations, but recent embedding inversion attacks have shown that they can expose substantial information about the original text, leading to serious privacy leakage risks. A common defense is to release perturbed embeddings by adding Gaussian noise, which is simple yet effective against standard inversion attacks and does not significantly degrade embedding utility for downstream tasks. However, it remains unclear whether such noise-protected embeddings are sufficiently safe against adaptive attackers that explicitly account for the perturbation process. In this paper, we study text embedding inversion in a noise-protected setting, where the attacker can observe only noisy embeddings and has no access to clean embedding targets. We first analyze why existing generative inversion methods fail under this setting and identify a "Double Noise Trap", which fundamentally prevents standard generative inversion models from achieving high-quality reconstruction. To address this challenge, we propose DAEI, a denoising-aware embedding inversion pipeline that combines a residual denoising autoencoder with generative text inversion where the denoiser is trained in an unsupervised manner using Stein's unbiased risk estimate to enable denoising from noisy observations alone. Extensive experiments show that DAEI achieves approximately 154\% relative improvement in BLEU over the existing generative inversion baseline, while also improving token-level F1 and ROUGE-L by 32--60\%. The promising inversion performance of DAEI challenges the prevailing assumption that simple Gaussian perturbation is sufficient to prevent sensitive information leakage from embedding representations.