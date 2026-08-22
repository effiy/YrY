---
title: 'CausalProfiler: Generating Synthetic Benchmarks for Rigorous and Transparent
  Evaluation of Causal Machine Learning'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2511.22842
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Panayiotis Panayiotou, Audrey Poinsot, Alessandro Leite, Nicolas Chesneau,
  Marc Schoenauer, \"Ozg\"ur \c{S}im\c{s}ek
---

arXiv:2511.22842v3 Announce Type: replace-cross 
Abstract: Causal machine learning (Causal ML) aims to answer "what if" questions using machine learning algorithms, making it a promising tool for high-stakes decision-making. Yet, empirical evaluation practices in Causal ML remain limited. Existing benchmarks often rely on a handful of hand-crafted or semi-synthetic datasets, leading to brittle, non-generalizable conclusions. To bridge this gap, we introduce CausalProfiler, a synthetic benchmark generator for Causal ML methods. Based on a set of explicit design choices about the class of causal models, queries, and data considered, the CausalProfiler randomly samples causal models, data, queries, and ground truths constituting the synthetic causal benchmarks. In this way, Causal ML methods can be rigorously and transparently evaluated under a variety of conditions. This work offers the first random generator of synthetic causal benchmarks with coverage guarantees and transparent assumptions operating on the three levels of causal reasoning: observation, intervention, and counterfactual. We demonstrate its utility by evaluating several state-of-the-art methods under diverse conditions and assumptions, both in and out of the identification regime, illustrating the types of analyses and insights the CausalProfiler enables.