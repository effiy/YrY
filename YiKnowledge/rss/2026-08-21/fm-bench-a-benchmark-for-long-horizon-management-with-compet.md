---
title: 'FM-Bench: A Benchmark for Long-Horizon Management with Competing Agents'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18423
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Tianyou Wang, Chongyang Gao, Kezhen Chen, Chen Dong, Yinghao He, Donghan Li,
  Wangcheng Xu, Hongjiu Zhang, Chi Li
---

arXiv:2608.18423v1 Announce Type: new 
Abstract: Language model agents now execute bounded tasks reliably. Whether they can sustain effective decision-making over long horizons, where actions have cumulative consequences and the environment responds to their choices, remains largely unmeasured. FM-Bench (Football Management Benchmark) measures this. An LLM agent runs a football club for 20 in-game years through 26 tools and roughly 340 to 400 decision stops. It drafts a squad on the same budget as every rival, trades players, negotiates contracts, invests in facilities and youth, sets lineups, and answers to a board that can fire it, while a deterministic engine accumulates every year into one final score with no LLM judge or human rater. The solo track plays each of 15 frontier models against a frozen scripted world, and the Arena places the same models plus a scripted anchor in one shared 20-year world; to our knowledge, the first head-to-head evaluation at this scale. We measure six behavioral capabilities behind the score. Across three seeds, all 15 models complete every horizon while the blind scripted baselines die out in most of theirs, and claude-fable-5 tops the solo board on mean score and the Arena, where the title nonetheless rotates among ten models. Neither scale, price, nor vendor predicts the order; the order settles only late in the horizon, and the best first-play human lands only at the bottom of the model board. What separates the models is managerial behavior rather than computation. Higher-scoring models reduce slow-payoff investment near the end, keep cash invested rather than idle, and open renewals well before the deadline, while token spend predicts nothing. No model learns the market's hidden prices from hundreds of rejected bids, and self-managed memory fails in two opposite modes: an archive that only grows or a plan rewritten every season. Code is available at https://github.com/Analogy-AI/fm-bench.