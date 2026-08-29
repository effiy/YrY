---
title: 'LLMs in Digital EDA: A perspective on shifting roles from Generation to Orchestration'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27184
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Matthew Youngman, Cristian Sestito, Themis Prodromakis
---

arXiv:2608.27184v1 Announce Type: cross 
Abstract: Electronic design automation (EDA) has advanced engineering productivity through successive generations of tooling that progressively automate synthesis, optimisation, and verification. Large language models (LLMs) extend this trajectory by enabling direct translation from design intent to hardware implementations. In most of the EDA literature, LLM-based solutions are typically assisting siloed design stages or tasks, however this obscured the drivers by which capability emerges and systems scale. In this Perspective, we instead define three hierarchical roles that reveal how capability accumulates: a Generator that produces design artifacts in a single pass, an Agent that refines outputs through iterative tool feedback, and an Orchestrator that coordinates decisions across EDA-stages. Across published systems, this reveals a syntax trap in which models are trained to produce plausible code rather than physically correct hardware, compounded by fragmented tools and loss of design context that obscure how decisions affect later stages. Comparisons across the three roles show that current approaches struggle to scale to industrial designs, motivating a shift towards a standardised, physics-aware orchestrator that connects tools and agents across the EDA flow for more reliable and accessible hardware design.