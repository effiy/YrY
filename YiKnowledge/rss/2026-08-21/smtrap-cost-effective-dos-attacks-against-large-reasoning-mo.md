---
title: 'SMTrap: Cost-Effective DoS Attacks Against Large Reasoning Models via SMT
  Conflict Guidance'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18921
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Jian Yang, Zhenqi Feng, Zhaoyang Yu, Zhaoxin Fan, Kejian Wu, Xiaofeng Wang,
  Zheng Zhu, Jianjun Huang, Wei You, Bin Liang
---

arXiv:2608.18921v1 Announce Type: cross 
Abstract: Existing LRM-DoS methods rely heavily on model feedback to synthesize attack queries, requiring either repeated queries to the target model or training a dedicated attack model. These expensive operations severely weaken attack leverage. In this paper, we propose \emph{search amplification}, a novel, model-feedback-free LRM-DoS paradigm. It employs the conflict count derived from an Satisfiability Modulo Theories (SMT) solver as a low-cost external signal to guide the synthesis of inference-heavy Constraint Satisfaction Problem (CSP) instances. Our key observation is that LRMs depend on trial-and-backtracking search when solving CSPs, where higher SMT conflict counts on a given CSP instance positively correlate with more extensive LRM backtracking search and substantially longer output trajectories. Building on this finding, we propose \textsc{SMTrap}, a lightweight, CPU-only framework. Guided by SMT conflict counts, \textsc{SMTrap} generates inference-heavy CSP queries without model queries, attack-model training, or GPU computation. Evaluations across seven frontier models demonstrate the state-of-the-art LRM-DoS capability of \textsc{SMTrap}, producing DoS effects multiple times stronger than existing baselines. To mitigate the threat of \textsc{SMTrap}, we demonstrate a tool-based mitigation that significantly cuts token usage.