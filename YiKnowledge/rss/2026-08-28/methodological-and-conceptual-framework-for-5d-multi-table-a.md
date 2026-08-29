---
title: 'Methodological and Conceptual Framework for 5D Multi-Table Analysis: A Unified
  Approach for Complex Data Reuse'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26149
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Edouard Lansiaux, Hugo Kazzi, Aur\'elien Loison, Slim Hammadi, Emmanuel Chazard
---

arXiv:2608.26149v1 Announce Type: new 
Abstract: Multi-table learning remains a major challenge in machine learning for healthcare and other complex information systems. Relational data combine several sources of complexity, including large data volume, high-dimensional variables, high-cardinality categorical features, complex inter-table dependencies, and repeated temporal observations. We introduce the Relational Hypergraph Transformer (RHT), a unified architecture that represents relational databases as hypergraphs, learns pentadimensional embeddings (PentE), and performs sparse relational attention with complexity proportional to the average relational degree rather than the square of the number of entities. We formally define the architecture, derive the complexity of its attention mechanism, and provide an open-source reference implementation. We evaluate RHT on the public Synthea synthetic electronic health record dataset using multi-label prediction of SNOMED CT condition codes per encounter, a task characterized by high categorical cardinality and long-tailed label distributions. Comparisons with tabular, relational, and temporal graph baselines show that RHT produces more semantically coherent embeddings while remaining computationally scalable. In this benchmark, the highest rare-code recall is achieved by XGBoost, whereas RHT attains the strongest embedding semantic coherence. We also report ablation studies quantifying the contribution of each architectural component. Clinical validation on MIMIC-IV is planned following PhysioNet credentialing. Source code and experimental protocols are provided in the accompanying repository.