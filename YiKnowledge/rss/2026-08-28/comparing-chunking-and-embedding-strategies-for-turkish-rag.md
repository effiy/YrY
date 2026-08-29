---
title: Comparing Chunking and Embedding Strategies for Turkish RAG Systems
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26192
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Mustafa Serta\c{c} T\"urkel, Fatma Nur Korkmaz, Ahmet Tu\u{g}rul Bayrak
---

arXiv:2608.26192v1 Announce Type: cross 
Abstract: How documents are segmented into retrievable chunks and how those chunks are embedded strongly affect Retrieval-Augmented Generation (RAG) quality, yet neither has been systematically studied for morphologically rich languages such as Turkish. We compare Turkish document question answering across three chunking strategies (fixed-length, semantic, and layout-aware Docling), five embedding models, and two generator LLMs, over three documents with contrasting layouts. The fully crossed design yields 9,000 graded question-answer evaluations, each scored by an independent judge model, and component comparisons are tested by paired McNemar tests under Holm correction. Four findings follow. The chunking strategy determines how much the embedding choice matters: layout-aware chunking compresses the spread between the modern embedding models to about a point. The three leading embedding models are statistically indistinguishable, so language specialization yields no measurable retrieval advantage. The faster generator is not the more accurate one. And the preferred configuration depends on content type, since layout-aware chunking helps documents containing tables far more than prose. The best individual components therefore do not compose into the best complete configuration, which reaches 87.0%.