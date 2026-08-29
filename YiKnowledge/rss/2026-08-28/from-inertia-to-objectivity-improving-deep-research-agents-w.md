---
title: 'From Inertia to Objectivity: Improving Deep Research Agents with Noise Isolation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.23045
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Xiangxin Zhang, Zhanwei Zhang, Zhihang Fu, Binbin Lin, Wenxiao Wang
---

arXiv:2608.23045v2 Announce Type: replace 
Abstract: Web search agents powered by Large Language Models (LLMs) show strong promise, but deep research tasks expose a recurring failure mode: once an agent has produced a query, plan, or intermediate conclusion, it becomes less objective when later judging the consequences of that same action. We term this phenomenon inertia bias. To make it measurable, we introduce the IBIS benchmark, which controls the search observations while varying whether the model is evaluating the outcome of its own prior action. We find that models are substantially worse when they "own" the preceding search step, showing that self-authored action history can systematically distort subsequent judgment. We further show that this bias propagates into two forms of system-level degradation: search noise at the worker level and contextual noise at the manager level. To address this problem, we propose NIS-Agent, which applies context isolation at the two decision points most vulnerable to inertia bias: webpage triage and final-answer validation. Across GAIA, WebWalkerQA, BrowseComp, and BrowseComp-zh, NIS-Agent achieves competitive performance while reducing token cost by 33% compared to our baseline. We further train an 8B model to be intrinsically more resistant to inertia bias; under the same NIS-Agent framework, it attains average performance comparable to GPT-4o on deep research benchmarks. Our code is publicly available at https://github.com/PangSMPang/NIS-Agent.