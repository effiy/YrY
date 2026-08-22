---
title: Vector Symbolic Policy Gradient
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18404
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Ryozo Masukawa, Sanggeon Yun, SungHeon Jeong, Hyunwoo Oh, Raheeb Hassan, Pietro
  Mercati, Nathaniel D. Bastian, Mahdi Imani, Mohsen Imani
---

arXiv:2608.18404v1 Announce Type: cross 
Abstract: We answer this question with Vector-Symbolic Policy Gradient (VSPG), a discrete-action actor that represents each action by a unit-norm hypervector and scores it by similarity to the encoded state. Under the standard softmax policy-gradient surrogate, we prove that its update is exactly advantage-weighted hypervector bundling followed by normalization, and therefore supports standard advantage estimators. We further show that each trained action hypervector is a fixed-size compressed kernel memory, storing an advantage-weighted kernel expansion over visited states and transferring evidence according to the encoder-induced similarity. This provides a concrete mechanism that can support sample-efficient learning without increasing inference-time memory. Finally, for bipolar action memories, we prove that greedy action selection is stable under random bit flips, with failure probability decaying exponentially in the hypervector dimension. VSPG thus connects VSA action memories, log-linear policy gradients, and kernel policy search while providing a quantitative robustness guarantee.