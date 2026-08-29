---
title: 'SymbolLKG: Towards Verifiable Logical Reasoning via Logical Knowledge Graph
  and Symbolic Solvers'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26836
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Haizhao Fan, Yuchi Xiong, Jize Wang, Xinping Guan, Xinyi Le
---

arXiv:2608.26836v1 Announce Type: new 
Abstract: Large Language Models (LLMs) have demonstrated remarkable proficiency in natural language understanding, yet they struggle with strict multi-step reasoning, frequently suffering from hallucinations and inconsistency. Existing solutions like Chain-of-Thought (CoT) lack rigorous verification mechanisms, while standard Retrieval-Augmented Generation (RAG) often misses the complex, structural dependencies inherent in logical tasks. To bridge this gap, we propose a Neuro-Symbolic architecture that integrates a Logical Knowledge Graph (LKG) with dynamic solver routing. Specifically, we introduce an ontology-based LKG that treats logical rules and constraints as first-class topological nodes, enabling explicit modeling of dependencies extracted from text. We further design a Logic Router to dynamically dispatch tasks to the optimal symbolic engine, which is supported by a topology-aware hybrid retrieval mechanism. Experimental results on logical reasoning benchmarks demonstrate that our framework significantly outperforms state-of-the-art prompting and RAG baselines, delivering higher accuracy and verifiable reasoning paths.