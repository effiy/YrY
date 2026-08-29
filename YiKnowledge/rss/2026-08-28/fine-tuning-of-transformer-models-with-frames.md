---
title: Fine-Tuning of Transformer models with Frames
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26430
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Harshavardhan Adepu, Li Zhang, Sanjiv Kumar, Vikas Singh
---

arXiv:2608.26430v1 Announce Type: new 
Abstract: Parameter-Efficient Fine-Tuning (PEFT) strategies such as Low-Rank Adaptation (LoRA) are effective solutions for fine-tuning large-scale pre-trained models; however, their memory requirements scale with the size of the model, $\mathcal{O}(dr)$, where $d$ is the model's hidden dimension and $r$ is the rank. Our proposal, FrameFT, models the parameter update $\Delta W$ with a sparse coefficient matrix in a Fusion Frame basis. Fusion Frames can be generated algorithmically and shared across model layers, enabling very efficient updates. Only the sparse coefficients of the basis expansion are stored/optimized, reducing the memory footprint. The sparse structure of the coefficient matrix in FrameFT and the sparsity in the Fusion Frames give large compute benefits, and our analysis provides formal convergence results. We evaluate the idea across a suite of supervised fine-tuning benchmarks, focusing on language tasks, but also report application to vision models. Our experiments show that FrameFT achieves performance on par with/exceeding state-of-the-art PEFT techniques, but needs far fewer trainable parameters.