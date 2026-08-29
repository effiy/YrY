---
title: 'Exploring the Role of LLMs in HPC Programming: A Survey'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26110
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Strahinja Ljaljevic, Josep Jorba, Sergio Iserte
---

arXiv:2608.26110v1 Announce Type: cross 
Abstract: Large Language Models (LLMs) are emerging as promising assistants in High-Performance Computing (HPC), where programming remains complex and expertise-intensive. This survey systematically reviews their application across five categories: code generation, parallelization and optimization, frameworks and architectures, evaluation and benchmarking, and broader challenges. The analysis highlights both opportunities and limitations: while general-purpose LLMs perform reasonably well on serial and OpenMP-like tasks, they fall short in distributed paradigms such as MPI, where correctness and scalability are critical. Domain-specialized models (e.g., HPC-Coder, HPC-GPT, chatHPC) achieve higher accuracy through fine-tuning, curated datasets, and retrieval-augmented generation (RAG), yet their scope remains narrow and their evaluations largely limited to benchmarks or micro-kernels. The broader picture is one of dual potential and fragility: LLMs can lower barriers to entry, accelerate prototyping, and support code modernization, but they remain brittle under production-level requirements where correctness, performance portability, and scaling cannot be compromised.
  We conclude that LLMs are unlikely to replace HPC experts in the near term but are positioned to become powerful collaborators in the software development pipeline. Their effective deployment will require richer datasets, integration with performance analysis and schedulers, rigorous evaluation frameworks, and governance structures that ensure transparency and trust. The convergence of AI and HPC should therefore be understood as a long-term, co-evolutionary process, where each advance uncovers new challenges and opportunities for reshaping scientific software development.