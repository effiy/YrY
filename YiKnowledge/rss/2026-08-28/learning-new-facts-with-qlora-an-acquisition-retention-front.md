---
title: 'Learning New Facts with QLoRA: An Acquisition-Retention Frontier'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.25677
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Estelle Zheng, S\'ebastien Warichet, Emmanuel Helbert, Christophe Cerisara
---

arXiv:2608.25677v2 Announce Type: replace-cross 
Abstract: Parameter-efficient fine-tuning is often assumed to preserve pretrained capabilities because it updates only a small number of parameters. We show that this assumption depends strongly on adapter capacity. We study factual acquisition in a controlled OpenStreetMap-derived benchmark where Qwen3-4B must acquire anonymized geographic associations while retaining unrelated capabilities. Comparing full fine-tuning (FFT) with quantized low-rank adaptation (QLoRA) at ranks 8, 16, 32, and 64, we find that rank induces a clear acquisition--retention frontier. Low-rank QLoRA preserves out-of-domain (OOD) performance but acquires fewer facts, whereas higher ranks improve same-fact paraphrase generalization at an increasing cost in performance on unrelated benchmarks. FFT behaves as a conservative baseline: it retains general capabilities well, but does not reach the highest factual-acquisition regime. Distributional, weight-space, and spectral diagnostics mirror this behavioral trade-off, with higher-rank QLoRA moving farther from the pretrained model. A separate math adaptation experiment shows a weaker frontier, suggesting that the effect is most pronounced when adaptation must install new factual associations rather than reinforce skills already supported by pretraining. Code and data are available at https://github.com/zhngstl/new_facts_forgetting.