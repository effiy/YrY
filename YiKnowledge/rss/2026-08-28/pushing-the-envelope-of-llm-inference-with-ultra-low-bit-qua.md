---
title: Pushing the Envelope of LLM Inference with Ultra-Low-Bit Quantized Models
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2508.06753
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Evangelos Georganas, Dhiraj Kalamkar, Alexander Heinecke, Pradeep Dubey
---

arXiv:2508.06753v3 Announce Type: replace 
Abstract: The advent of ultra-low-bit LLM models, approaching the perplexity and task accuracy of their full precision counterparts, is ushering in a new era of LLM inference. While these advances promise models that are cost-effective regarding latency, memory, throughput, and energy consumption, the efficiency of runtimes for deploying ultra-low-bit models remains under-explored. In this work, we take a bottom-up approach: we first implement 2-bit microkernels for modern CPUs, achieving close-to-roofline performance. We integrate these microkernels into LLM inference pipelines and present end-to-end results with 2-bit models, outperforming the state-of-the-art (SOTA) bitnet.cpp runtime by 2.2$\times$, and deliver up to 7$\times$ speedup compared to 16-bit inference. We extend this work to Intel Xe2 GPUs where we implement mixed-precision, 2-bit kernels, and show their performance to be close-to-optimal. We integrated the GPU kernels in the vLLM framework and evaluated end-to-end inference for a range of models and Xe2 GPUs. We obtain up to 6.7$\times$ speedup compared to the 16-bit pipeline, pushing the envelope of LLM inference.