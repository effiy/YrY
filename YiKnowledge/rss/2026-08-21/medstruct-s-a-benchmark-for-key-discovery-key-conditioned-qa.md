---
title: 'MedStruct-S: A Benchmark for Key Discovery, Key-Conditioned QA and Semi-Structured
  Extraction from OCR Clinical Reports'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2605.03103
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yingyun Li, Yu Wang, Haiyang Qian
---

arXiv:2605.03103v2 Announce Type: replace-cross 
Abstract: Semi-structured information extraction (IE) from OCR-derived clinical reports is crucial for efficiently reconstructing patients' longitudinal medical histories. In practice, this scenario commonly involves three tasks: (i) field-header (key) discovery, (ii) key-conditioned question answering (QA), and (iii) end-to-end key-value pair extraction. However, existing evaluations often under-model two factors: heterogeneous and incompletely known key representations, and OCR-induced noise. This makes it difficult to assess model robustness in real-world settings.
  We present MedStruct-S, a benchmark specifically designed to evaluate these tasks under unknown keys and OCR noise. MedStruct-S contains 3,582 annotated real-world clinical report pages. Using MedStruct-S, we benchmark two representative paradigms: encoder-only sequence labeling with post-processing and decoder-only structured generation, covering four encoder-only and five decoder-only models spanning 0.11B to 103B parameters. Our results show that encoder-only models achieve the best performance for non-null-value key-conditioned QA despite being substantially smaller than decoder-only models. When comparing models of similar order of magnitude, encoder-only models still perform better overall. Without controlling for model scale, fine-tuned decoder-only models deliver the strongest overall results. These findings show that the benchmark provides a reliable and practical basis for selecting and comparing models across different semi-structured IE settings.