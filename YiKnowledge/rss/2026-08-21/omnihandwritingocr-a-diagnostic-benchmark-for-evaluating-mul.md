---
title: 'OmniHandwritingOCR: A Diagnostic Benchmark for Evaluating Multimodal LLMs
  in Handwritten OCR Scenarios'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18586
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Zinuo Guo, Min Zhang, Bo Jiang
---

arXiv:2608.18586v1 Announce Type: cross 
Abstract: Multimodal large language models (MLLMs) are increasingly used as OCR systems in document and knowledge-processing pipelines, but their ability to faithfully read real handwriting remains underexplored. Existing OCR benchmarks focus largely on printed text or clean single-line inputs, leaving limited coverage of realistic handwritten OCR scenarios such as multilingual handwriting, writer errors, and structurally complex mathematical expressions. We introduce OmniHandwritingOCR, a diagnostic benchmark for evaluating MLLMs and OCR systems on handwritten OCR. It covers handwritten text recognition and handwritten mathematical expression recognition across six subtasks and twelve subsets, totaling 77.57K labeled images from public datasets and newly collected student writings. A key component is a difficulty-stratified multi-line formula corpus designed to test robustness under increasing structural complexity. We evaluate thirteen open- and closed-source systems with five complementary metrics under a unified protocol. Results show that current systems remain far from faithful transcription: performance drops sharply on complex multi-line formulas, model rankings vary across language and formula settings, and several generative models hallucinate plausible but visually unsupported corrections. OmniHandwritingOCR provides a challenging testbed for diagnosing language, content, structural, and visual-grounding failure modes of multimodal models in handwritten OCR scenarios.