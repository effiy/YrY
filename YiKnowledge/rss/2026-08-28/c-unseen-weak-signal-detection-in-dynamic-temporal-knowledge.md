---
title: 'C-Unseen: Weak Signal Detection in Dynamic Temporal Knowledge Graphs via LLM
  Reasoning'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26870
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yassir Lairgi, Ludovic Moncla, Khalid Benabdeslem, R\'emy Cazabet, Pierre
  Cl\'eau
---

arXiv:2608.26870v1 Announce Type: new 
Abstract: Weak signals are early, low-visibility indicators that precede significant changes before those changes become established. Existing detection methods, based on keyword frequency, topic modeling, or untyped graph topology, fail to capture the semantic and relational structure through which such signals manifest. In this paper, we propose C-Unseen, a self-interpretable framework for weak signal detection in Dynamic Temporal Knowledge Graphs (DTKGs). We define a weak signal as a rare, semantically coherent subgraph that proliferates across consecutive TKG snapshots. The framework operates through two modules: a Rare Subgraphs Extractor, in which an LLM identifies subgraphs whose content is in tension with the dominant snapshot narrative via chain-of-thought reasoning, and a Weak Signal Alerter, in which the persistence of these rare subgraphs is tracked across time steps to isolate true weak signals. Experimental results demonstrate that C-Unseen outperforms keyword-, topic-, and graph-based baselines.