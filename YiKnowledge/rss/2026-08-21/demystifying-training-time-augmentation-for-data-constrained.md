---
title: Demystifying Training-Time Augmentation for Data-Constrained Language Model
  Pretraining
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2606.16246
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Michael K. Chen, Xikun Zhang, Fan Bai, Zhengding Hu, Zhen Wang
---

arXiv:2606.16246v3 Announce Type: replace-cross 
Abstract: As AI labs approach a data ceiling where compute capacity outpaces the rate of new high-quality text generation, language model pretraining is shifting toward a data-constrained, compute-abundant regime that demands productive multi-epoch training on fixed corpora. Standard autoregressive (AR) pretraining overfits severely in this setting, reaching its optimum early and then continuously deteriorating. We investigate training-time data augmentation as a regularizer to mitigate this overfitting and enable productive training for hundreds of epochs on the same data. We introduce three orthogonal categories of augmentation for AR pretraining: token-level noise (masking, random replacement), sequence permutations (right-to-left prediction, Fill-in-the-Middle), and target offset prediction ($x_{t+i}$ for $i > 1$). Through systematic ablations, we find that individual augmentations delay overfitting and lower validation loss relative to the baseline, with random token replacement achieving the best minimum loss among individual methods. Combining augmentation categories further lowers the minimum validation loss. Our experiments demonstrate that data augmentations mitigate AR pretraining's data inefficiency and offer a promising solution to the data-constrained regime~\footnote{All code and data are available at https://github.com/ michaelchen-lab/ data-augmentations-for-pretraining.