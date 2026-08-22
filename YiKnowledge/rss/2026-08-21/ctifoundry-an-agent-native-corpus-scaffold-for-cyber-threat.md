---
title: 'CTIFoundry: An Agent-Native Corpus Scaffold for Cyber Threat Intelligence'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18613
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yutong Cheng, Changze Li, Qian Cui, Wei Ding, Lingzhi Wang, Yan Chen, Peng
  Gao
---

arXiv:2608.18613v1 Announce Type: new 
Abstract: Cyber threat intelligence (CTI) is increasingly consumed not by human analysts but by LLM agents that compose multi-step investigations at query time. The harness side of this shift has matured rapidly (planning loops, tool protocols, context management), but the corpus side has not: threat reports and vulnerability databases are still packaged for retrieval-augmented generation, as opaque chunks behind an embedding index. We argue that this substrate, not model capability, is the bottleneck on agentic CTI investigation, and present CTIFoundry, an agent-native corpus scaffold. At build time, CTIFoundry materializes the latent structure of a CTI corpus: a deterministic ontology graph over four authoritative knowledge bases (CVE, CWE, CAPEC, ATT&amp;CK) whose official cross-references become typed, traversable edges; a span-grounded report layer whose canonical, alias-resolved cross-vendor entities index provenance-carrying chunks; and hybrid dense+lexical retrieval surfaces. At query time this structure is exposed through seven typed tools and three procedural skills mounted on a stock open-source agent harness. On the public CTIConnect benchmark, swapping only the action surface lifts the identically-harnessed agent by +0.19 to +0.28 overall F1 across a four-model, two-provider panel: a small model on CTIFoundry surpasses a flagship on the flat substrate, and the gain is not bought with search effort, since on both Claude models the scaffolded agent is more accurate at roughly half the tool calls. An ablation attributes it: typed structure carries the larger share, procedural skills convert structure into discipline, and the two compose super-additively, because skills bind only to structure that exists.