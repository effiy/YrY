---
title: Discretizing Continuous Time Series for Imputation with Masked Diffusion Training
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.19119
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Dongbin Kim, Seungyun Lee, Geonwoo Shin, Jaewook Lee
---

arXiv:2608.19119v1 Announce Type: cross 
Abstract: Time series imputation is a crucial area for reliable time series analysis, yet it remains challenging due to the complex temporal dynamics and noise of real-world data. Existing approaches, however, exhibit two limitations: missing and observed values are embedded within the same representation space without explicit structural separation, and continuous diffusion-based methods are trained to predict added noise rather than the original signal. To address these, we propose the Masked Diffusion Time-series Imputation Model (MDTIM), which leverages the training paradigm of masked diffusion model for imputation tasks. The MASK token is structurally orthogonal to valid observations, and the model directly predicts the original values, naturally aligning both the representation and the learning objective with the imputation task. To bridge the gap between discrete masked diffusion and the continuous, ordinal nature of time series, we further introduce Stochastic Discretization, which maps continuous values to ordinal-aware tokens while preserving continuous dynamics. Our experiments on diverse benchmarks confirm that MDTIM achieves superior robustness and scalability, consistently outperforming state-of-the-art deterministic and generative baselines across various missing scenarios.