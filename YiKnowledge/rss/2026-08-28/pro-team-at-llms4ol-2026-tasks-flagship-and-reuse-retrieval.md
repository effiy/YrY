---
title: 'pro-team at LLMs4OL 2026 Tasks Flagship and Reuse: Retrieval-Augmented Generation
  and Vocabulary-Constrained Filtering for Ontology Learning'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27101
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Shivam Mishra, Dhannu Ram Meena, Muneendra Ojha, Krishna Pratap Singh, Kuldeep
  Singh
---

arXiv:2608.27101v1 Announce Type: new 
Abstract: Ontology learning from text remains challenging despite significant progress in Large Language Models (LLMs), which can hallucinate domain terms, produce inconsistent formats, and favor hierarchical over associative relations. In the LLMs4OL 2026 Challenge, we address both the End-to-End Flagship Task (Task A) and Ontology Extension Reuse Task (Task B) using an offline retrieval-augmented few-shot prompting pipeline. Our system employs Qwen2.5-14B-Instruct with all-MiniLM-L6-v2 for demonstration retrieval, selecting the top-5 examples for Task A and top-2 for Task B. A left-truncated context-windowing strategy preserves task instructions within long prompts. For Task B, generated triples undergo deterministic vocabulary-constrained filtering, retaining triples when at least one endpoint belongs to the sample's closed term/type vocabulary and removing duplicates of the initial ontology. The approach achieves Semantic Graph Similarity of 0.8692, Term-Typing F1 of 0.9200, and Taxonomy Discovery F1 of 0.8540 on Task B, while Task A achieves 0.7416 Semantic Graph Similarity. However, no non-taxonomic relations are extracted, highlighting limitations of closed, taxonomy-oriented relation vocabularies.