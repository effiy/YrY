---
title: 'PILOT in the Loop: Live Self-Improvement for Long-Horizon Agents'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26530
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yang Xiao, Yusong Sun, Haoyi Wu, Wenyang Hui, Wen Da, Zhaokai Luo, Mu Chuan,
  Yao Hu, Wenjie Li, Chengyue Jiang
---

arXiv:2608.26530v1 Announce Type: new 
Abstract: Long-horizon agent runs generate experience that can improve both the current run and future work. Most self-improvement methods process this experience only after execution ends, so they cannot redirect the active run or immediately apply and validate lessons learned from it. We argue that self-improvement should instead be live, using emerging experience both to redirect the active run and to update the persistent harness. Existing agent architectures do not fully support this goal. Single-agent self-correction combines task execution and trajectory assessment within one context, while subagent delegation separates execution but typically cannot redirect an active subagent. We present PILOT, a supervisor-worker harness for live self-improvement through two coupled mechanisms: (1) live steering lets a separate supervisor redirect or abort the active worker during execution; and (2) live self-evolution distils procedures and failure modes revealed during execution into reusable skills and memory. Across two frozen backbones and three benchmarks, PILOT ranks first in five of six configurations. On Terminal-Bench 2.0, PILOT outperforms counterpart harnesses by up to 9.8 percentage points. In the self-improvement setting, PILOT gains 14.6 points with GLM-5.1 and 12.4 points with Kimi-K2.6. Mean output tokens fall by 42.9% and 47.4%, while successful evaluations per million output tokens rise by 110.3% and 134.0%, respectively.