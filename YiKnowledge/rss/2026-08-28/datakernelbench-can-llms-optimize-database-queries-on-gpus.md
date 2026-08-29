---
title: 'DataKernelBench: Can LLMs Optimize Database Queries on GPUs?'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.25061
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Gokul Karthik Kumar, Yotam Perlitz, Corey Lammie, Andrea Giovannini, Katja
  Hose
---

arXiv:2608.25061v2 Announce Type: replace-cross 
Abstract: GPUs increasingly accelerate database systems, but query-specific peak performance still often relies on hand-written kernels. Existing LLM kernel benchmarks focus on machine learning operators, leaving irregular, heterogeneous, data-movement-heavy database-style operators untested. We introduce DataKernelBench, which translates SQL into validated PyTorch TorchPlan programs and evaluates LLMs that optimize either the core tensor-bounded snippet or the full query in CUDA or Triton through execution-guided repair. Across ten proprietary and open-weight models on TPC-H SF10 with an H100 GPU, the strongest full-query CUDA configuration achieves $2.11\times$ speedup over the TorchPlan baseline at full pass rate. We find that higher-performing implementations commonly use kernel fusion and execution-strategy changes, stronger models benefit most from full-query specialization, and workload context matters more than hardware context. To handle data larger than GPU memory, we extend TorchPlan with Dask-cuDF for on-demand partition loading on TPC-H SF100 with four H100 GPUs, achieving $2.54\times$ speedup.
  Project page: https://kerneldf.github.io/datakernelbench