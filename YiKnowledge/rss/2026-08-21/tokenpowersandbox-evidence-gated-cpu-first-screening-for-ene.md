---
title: 'TokenPowerSandbox: Evidence-Gated CPU-First Screening for Energy-Aware LLM
  Serving'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18149
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Chenxu Niu
---

arXiv:2608.18149v1 Announce Type: cross 
Abstract: Energy-aware LLM serving requires comparing configurations under realistic request shapes, yet exhaustive target-GPU profiling is costly and a cheap predictor can be dangerously confident outside its measured scope. We present TokenPowerSandbox, an evidence-gated workflow that combines an interpretable CPU-resident projector, short target-GPU probes, full-workload verification, and tamper-evident freeze-before-measurement provenance. On one NVIDIA H100 80GB serving Qwen2.5-7B-Instruct with vLLM, three anchor repeats and six development workloads calibrate workload transfer. The same frozen model is evaluated on a blind holdout and a separately predeclared no-refit confirmation totaling 51 post-freeze runs. Energy MAPE is 6.23% and 7.35%, with Spearman rank correlations of 0.976 and 0.933. However, a predeclared TTFT gate passes at concurrency four (9.27% MAPE) and triggers abstention below four (64.80%), showing why energy accuracy cannot certify latency.