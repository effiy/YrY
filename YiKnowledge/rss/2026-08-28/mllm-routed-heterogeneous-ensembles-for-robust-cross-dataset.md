---
title: MLLM-Routed Heterogeneous Ensembles for Robust Cross-Dataset Image Classification
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.13463
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Daniel Perkins, John Squires, Janou Milligan, Chandra Raskoti, Linda Ungerboeck
---

arXiv:2608.13463v2 Announce Type: replace-cross 
Abstract: Modern image classification models excel when trained on single task-specific datasets but often struggle to generalize across domains and difficulty levels. We propose ARMDIL, an Adaptive Router for Multi-Domain Image Classification with LLMs. ARMDIL is an ensemble that uses a multimodal large language model (MLLM) agent to dynamically route each image to the most suitable vision backbone. Our diverse ensemble employs convolutional neural networks (ResNets), self-supervised representation learners (SSL), and vision language models (VLMs), each trained on a unified label space constructed from multiple image datasets with differing distributions and characteristics. Empirical evaluations illuminate the distinct capabilities and vulnerabilities of each architecture across disparate visual domains. Crucially, we show that ARMDIL effectively navigates these tradeoffs, performing competitively with specialized training-based routers. Furthermore, it drastically improves adaptability by allowing new information to be integrated via simple prompt modifications, while enhancing interpretability through natural language reasoning traces. These advances in cross-dataset image classification pave the way for more reliable general-purpose vision systems such as AI assistants and autonomous robots.