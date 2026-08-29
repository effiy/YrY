---
title: 'GROUND: Reducing Hallucinations in LLM-Based Enterprise Analytics Through
  Governed Semantic Definitions'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26157
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Aravind Sasidharan Pillai
---

arXiv:2608.26157v1 Announce Type: new 
Abstract: Natural-language analytics over enterprise data warehouses is increasingly important, but production use is limited by hallucinated metrics, invalid joins, wrong grain, unsafe data access, and unsupported explanations. Existing text-to-SQL systems often ground generation in database schemas or retrieved documentation, while enterprise reporting also requires governed business semantics: approved metrics, dimensions, join paths, filters, and row-level security. This paper introduces GROUND, Governed Retrieval Over Unified Normalized Definitions, a framework that constrains LLM-generated analytics to a governed semantic layer. GROUND supplies approved definitions, binds user intent to governed metrics and dimensions, and validates generated SQL against schema, metric, join, grain, filter, security, and cost rules before execution. On violations, it retries or abstains.
  In a 100-question synthetic enterprise-reporting benchmark, GROUND is compared with direct schema-only text-to-SQL, schema-RAG, and semantic-only grounding under one shared model. GROUND is the only system free of measured hallucinations across all six evaluated categories, while ungoverned systems violate row-level security on many questions. A semantic-only condition with exact metric definitions but no access policy still leaks data, showing that governance cannot be replaced by metric fidelity alone. The findings are replicated on real U.S. NHTSA vehicle-safety data with independent hand-authored gold and tested on an adversarial set across four models from three providers. GROUND's enforced guarantees, especially filters and row-level security, hold with zero violations on every model, while judgment-dependent behaviors such as refusing undefined metrics remain fallible.