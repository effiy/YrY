---
title: 'Partition the Support, Reconstruct the Residual: Training-Free Sparse Attention
  for Video Generation and World Models'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18484
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Pardis Taghavi, Reza Langari, Gaurav Pandey
---

arXiv:2608.18484v1 Announce Type: cross 
Abstract: Training-free block-sparse attention can accelerate video transformers, but row-wise attention concentration does not by itself specify an executable sparse operator. Queries sharing a block route may have poorly overlapping supports, while retained attention mass alone does not determine the post-softmax error from skipped interactions. We show that partition geometry affects both pooled support and the predictability of the remaining residual from the sparse output. We introduce SparsePR, which combines Response-Coupled Partitioning with Probe-Fitted Residual Reconstruction. Sampled-query key responses form paired K/V groups, whose centroids induce query-response coordinates for shared routing. A small set of exact query rows then calibrates a call-specific affine correction from the sparse output within the output subspace observed in the probe residuals. Across four heterogeneous video generation and world models, SparsePR consistently reduces attention-reconstruction error. Ablations show that probe fitting accounts for most of this reduction, while response-coupled partitioning lowers hard-drop error and improves reconstruction under a finite probe budget. SparsePR preserves generation quality at 22.0-26.0% realized executed-pair density while achieving 1.48x-2.61x end-to-end speedups. Project page: https://pardistaghavi.github.io/SparsePR-website/