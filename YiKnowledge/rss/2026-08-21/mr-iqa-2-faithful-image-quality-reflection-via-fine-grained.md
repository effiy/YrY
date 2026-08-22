---
title: 'MR-IQA-2: Faithful Image Quality Reflection via Fine-Grained Credit Assignment'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18579
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yuan li, Youyuan Lin, Chenhui Chu, Shin'ya Nishida
---

arXiv:2608.18579v1 Announce Type: cross 
Abstract: Multimodal large language models (MLLMs) have shown strong potential for image quality assessment (IQA) by improving consistency between quality ratings and their underlying reasoning. However, most approaches supervise reasoning through human-provided ratings and rarely examine whether it faithfully reflects image quality. Rating accuracy alone does not ensure faithful reasoning; a shared reward also obscures supervision sources and may reinforce unfaithful reasoning when a correct rating occurs by chance. To improve the faithfulness and reliability of blind IQA, we aim to (1) decouple credit assignment for reasoning and rating and (2) provide verifiable supervision for faithful reasoning. We introduce MR-IQA-2, an actor-editor-judge framework that operationalizes reasoning-editing-reflection. The actor generates quality reasoning for an input image, and the editor revises the image according to the identified quality factors. A frozen judge compares the original and edited images and provides reflective supervision for the actor's reasoning. MR-IQA-2 further uses fine-grained credit assignment to decouple reasoning and rating supervision. Judge feedback supervises reasoning, whereas human ratings supervise the predicted rating. Masked token-specific updates distinguish these signals while preserving the causal relation from reasoning to rating. Across IQA benchmarks, MR-IQA-2 achieves competitive rating alignment with humans. Visual reflection also enables richer and more faithful visual understanding beyond rating, which may inform image-quality optimization and related downstream tasks. Code is available at https://github.com/RobinY99/MR-IQA-2.