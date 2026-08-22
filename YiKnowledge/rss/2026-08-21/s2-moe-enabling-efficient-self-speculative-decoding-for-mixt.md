---
title: 'S2-MoE: Enabling Efficient Self-Speculative Decoding for Mixture-of-Experts
  on Edge Devices'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.15018
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Haochen Huang, Shengxuan Qiu, Meng Li
---

arXiv:2608.15018v2 Announce Type: replace 
Abstract: Deploying large language models (LLMs) for inference on edge devices is challenging due to severe memory and bandwidth constraints. While speculative decoding and Mixture-of-Experts (MoE) have been proposed to improve inference efficiency, naively combining them often incurs excessive verification overhead and poor expert reuse, limiting their effectiveness in memory-bound edge settings. In this work, we propose S2-MoE, an efficient self-speculative decoding framework for MoE inference on edge devices. S2-MoE reduces redundant verification through routing-aware adaptive speculative expansion, improves verification efficiency with reuse-aware expert gating, and aligns draft and target execution via shared context. Implemented in llama$.$cpp, S2-MoE achieves up to $5.3\times$ speedup (about $2.0\times$ on average) over standard autoregressive decoding across diverse MoE models and datasets on edge devices. Code is available at https://github.com/angerybob/S2-MoE.