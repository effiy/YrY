---
title: 'Event-Causal RAG: A Retrieval-Augmented Generation Framework for Long Video
  Reasoning in Complex Scenarios'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2605.06185
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Peizheng Yan, Yu Zhao, Liang Xie, Juntong Qi, Mingming Wang, Erwei Yin
---

arXiv:2605.06185v2 Announce Type: replace 
Abstract: Large vision-language models perform well on short- and medium-length video understanding but still struggle to maintain coherent event memory and recover long-range relationships in ultra-long videos. End-to-end methods are limited by visual-token growth and context length, while fixed-segment retrieval often fragments complete events and weakens state-transition modeling.We propose Event-Causal RAG (EC-RAG), a lightweight retrieval-augmented framework for ultra-long and streaming video reasoning. A dual visual-audio sentinel mechanism segments video streams into semantically complete events, represented as State-Event-State (SES) structures that organize observable pre-event states, central events, and post-event states as event-local causal transitions. These transitions are stored in dual vector-graph memory and temporally connected through entity-consistent trajectories. During question answering, bidirectional graph retrieval recovers relevant predecessor and successor events, and answers are generated using both structured memory and the corresponding video evidence.We further introduce ECV-1H, an hour-scale long-video QA benchmark dedicated to directed event-causal reasoning, with all source videos exceeding one hour. It covers over 150 hours of untrimmed video and contains 1,251 fully human-annotated QA pairs. EC-RAG improves overall accuracy by 4.96\%--11.67\% across three open-source video foundation models and achieves consistent gains across public datasets. On a single RTX 5090 GPU with 32 GB of memory, EC-RAG can continuously process videos while maintaining controlled streaming memory usage.