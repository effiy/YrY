---
title: 'Knowing When Not to Reuse: Conditional Experience Transfer in Autonomous LLM
  Post-Training'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26730
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Tingyun Li, Wenfeng Feng, Weiqing Li, Abudukelimu Wuerkaixi, Guohua Liu, Yuewei
  Zhang
---

arXiv:2608.26730v1 Announce Type: new 
Abstract: Large language models offer broad capabilities, but adapting them to evolving domains, tools, and requirements often entails repeated post-training. Autonomous systems automate parts of this process by proposing updates, training candidates, and using evaluation feedback to select subsequent proposals. As evidence accumulates, a central problem emerges: which past update evidence remains actionable after subsequent training has changed the parent model? An update's effect depends on its parent, data, and training stage. Treating past success as context-free permission can waste compute. If the resulting child is promoted, it can also degrade the subsequent training trajectory. We formulate this problem as conditional experience transfer and introduce Boundary-Calibrated Intervention Transfer (BCIT), a method that authorizes experience reuse before weight-changing training. BCIT binds an observed effect to its source context, checks applicability conditions, vetoes candidates with named hard conflicts, and obtains current-state evidence through a bounded training trial when needed. Fully trained candidates still face a shared adoption rule, and only observed events extend memory. On one 4B model adapted across finance reasoning, text-to-SQL, and function calling, candidate updates exhibit heterogeneous target and retention effects across the evaluated contexts. Under matched candidates, evidence, and compute, BCIT authorizes fewer harmful updates and attains higher equal-budget final-model quality than the evaluated alternatives. These results support treating experience authorization as a distinct problem in autonomous post-training.