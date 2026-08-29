---
title: 'Frequency Matters: Fast Model-Agnostic Data Curation for Pruning and Quantization'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2603.16105
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Francesco Pio Monaco, Elia Cunegatti, Flavio Vella, Giovanni Iacca
---

arXiv:2603.16105v4 Announce Type: replace-cross 
Abstract: Post-training model compression is essential for enhancing the portability of Large Language Models (LLMs) while preserving their performance. While several compression approaches have been proposed, less emphasis has been placed on selecting the most suitable set of data (the so-called \emph{calibration data}) for finding the compressed model configuration. The choice of calibration data is a critical step in preserving model capabilities both intra- and inter-tasks. In this work, we address the challenge of identifying high-performance calibration sets for both pruning and quantization by analyzing intrinsic data properties rather than model-specific signals. We introduce ZipCal, a model-agnostic data curation strategy that maximizes lexical diversity based on Zipfian power laws. Experiments demonstrate that our method outperforms standard uniform random sampling across various pruning benchmarks. Notably, it also performs on par, in terms of downstream performance, with a state-of-the-art method that relies on model perplexity. The latter becomes prohibitively expensive for large-scale models and datasets, while ZipCal is on average $\sim$240$\times$ faster due to its tractable linear complexity. We make the code and the experiments available at https://github.com/FrancescoMonaco/ZipCal.