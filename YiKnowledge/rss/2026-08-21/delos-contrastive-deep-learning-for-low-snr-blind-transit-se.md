---
title: 'DELOS: Contrastive Deep Learning for Low-SNR Blind Transit Searches in Kepler
  Photometry'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2605.29428
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Qingtian Liu, Jian Ge, XingChen Yan, Kevin Willis, Xinyu Yao, QuanQuan Hu,
  Jiapeng Zhu
---

arXiv:2605.29428v3 Announce Type: replace-cross 
Abstract: We present DEtection in phase-folded Light curves with cOntrastive Scoring (DELOS), a deep-learning framework that uses contrastive scoring to perform blind searches for shallow transits in Kepler photometry. DELOS combines GPU-accelerated phase folding, optimized phase binning, and a custom one-dimensional convolutional encoder to assign a transit-likeness score to each folded light curve, thereby producing a score periodogram over trial periods without relying on pre-detected threshold-crossing events. Focusing on intermediate-to-long-period signals with orbital periods of 100-150 days, DELOS was trained on 20 million synthetic light curves generated with realistic transit models and Kepler-like noise properties, achieving a validation accuracy of 99.3% on the synthetic validation set. In controlled injection-recovery experiments, DELOS improves the combined precision-recall performance by 15.5% relative to Box-fitting Least Squares (BLS) and 11.25% relative to Transit Least Squares (TLS) in the low Signal-to-Noise Ratios (low-SNR) regime. It also accelerates the search by factors of approximately 3-5 and 74-80 compared with BLS and TLS, respectively. Applied to a selected Kepler validation sample, DELOS recovered all known shallow intermediate-to-long-period transit signals in the tested period range. These results demonstrate that DELOS provides an efficient and sensitive framework for low-SNR transit searches and represents a practical step toward future searches for longer-period terrestrial planets in Kepler, K2, TESS, PLATO, and Earth 2.0 data. Accordingly, this work is intended as a methodological development and validation study, with the detailed astrophysical validation of newly identified candidates deferred to future work.