---
title: 'Decomposing Wrong-Consensus Agreement in LLM Self-Consistency: A GPT-4.1 Case
  Study'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18795
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Lizhuo Zhang, Mengmeng Tang, Chenfeng Long, Xiaoyong Tang, Xiang Luo
---

arXiv:2608.18795v1 Announce Type: cross 
Abstract: Majority voting over multiple LLM samples is widely used to raise answer accuracy, yet its gain varies erratically: on hard questions it can even backfire. This paper gives a quantitative account of this failure. A pluralistic agreement index Gamma is defined as the expected fraction of the samples of a wrong run that agree with the consensus, normalized by a reference scale d=(1-p)/(C-1), and is decomposed into a mechanical component (what a vote delivers given only a per-case answer preference) and a preference-unexplained residual. The mechanical null is difficulty-matched and leak-free: each case is resimulated at its own accuracy and option preference, estimated from the case's other runs, so no run predicts its own agreement. On GPT-4.1 the decomposition shows benchmark-associated direction (an observational ordering over n=4 cells per benchmark, not a significance claim). On multiple-choice GPQA-Diamond, the per-case answer preference explains 81-93% of the held-out test-run agreement index: the shared-bias-dominates account over-claims here, because a wrong but attractive option the whole cohort latches onto is captured by the per-case preference channel (whether that preference is induced by shared training bias is not identified). On open-domain AIME, the mechanical preference explains only 59-78% (21-29% if shrunk to pure noise), and a preference-unexplained residual of 1.56-2.80 Gamma units survives, which a run-level preference-heterogeneity reference more than absorbs (1.4-2.1). A self-consistency backfire on hard questions is reproduced (binned voting gap down to -0.09, coupled CI [-0.12,-0.07]), and the highest-agreement bin reaches an accuracy of only 0.42-0.83, a 1.2-3.6x lift over base rate: agreement is graded evidence, not certification. No new voting method is proposed; code and evidence are committed and reproducible.