---
title: Temporal Multi-Signal Fusion for Token-Level Hallucination Detection
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18115
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Igor Itkin
---

arXiv:2608.18115v1 Announce Type: cross 
Abstract: Token-level hallucination detectors score each token independently from a single signal, and fail exactly when the generating model is confidently wrong. This paper instead treats hallucination as a temporally extended span and detects it by sequence labeling: each token is scored from a 33-dimensional feature stream that fuses text statistics, Natural Language Inference (NLI) entailment, and language model surprisal, with no access to model internals. A Bidirectional Gated Recurrent Unit (BiGRU) over these features reaches an AUC of 0.840 on RAGTruth (10 seeds), an 11-point gain over an independent logistic-regression baseline (p = 0.002, Wilcoxon signed-rank). A controlled decomposition attributes most of the gain to temporal order rather than model capacity: evidence propagates from confident positions to ambiguous neighbors within a span. The same 0.845 ceiling recurs across recurrent, state-space (Mamba), and attention architectures, locating the bottleneck in the feature set rather than the model. Because it reads only the generated text and external signals, the detector works on closed-source models, and it keeps working on text produced by language models it never saw during training, losing under 4% AUC.