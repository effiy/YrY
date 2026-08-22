---
title: 'SIDScope: A Diagnostic Resource for Semantic-ID Interfaces in Generative Recommendation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18779
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Jiandong Ding, Huijie Qin, Tiandeng Wu, Yi Cao
---

arXiv:2608.18779v1 Announce Type: cross 
Abstract: Semantic-ID mappings are reusable interfaces between item tokenizers and generative recommenders, yet released mappings rarely state whether they are coherent, what structure they expose, how generated paths resolve, or what must be revalidated after a refresh. SIDScope is a source-traced diagnostic resource for these decisions. It normalizes item-to-code artifacts, verifies provenance and joins, profiles mapping structure, compares paired revisions, and accounts for path-to-item outcomes in generated traces. Across nine source-traced tokenizer exports from seven families on Amazon and Yelp data - eight executable routes plus one auditable snapshot - SIDScope reveals that interface health is multi-signal rather than scalar. Its central finding is mechanism-conditional: prefix alignment strongly tracks held-out candidate exposure when retrieval consumes SID prefixes, then weakens as scoring becomes prefix-independent. Trained trace accounting exposes a second hidden gap: a valid target path can survive without uniquely retrieving the target item by 1.2-3.0 percentage points. A refresh case establishes a third: repairing the mapping does not by itself restore an inherited generator; model reuse requires a separate handoff check. The package provides frozen evidence summaries, conformance reports, trace labels, table builders, and CPU-only verifiers. It supports decisions about artifact readiness, interface risks, and revalidation before model reuse.