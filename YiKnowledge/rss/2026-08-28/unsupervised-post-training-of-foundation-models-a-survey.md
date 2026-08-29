---
title: 'Unsupervised Post-Training of Foundation Models: A Survey'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.24982
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yijie Xu, Qianyi Cai, Huizai Yao, Yili Wang, Tianfu Wang, Cehao Yang, Xingbo
  Yao, Zhiyu Guo, Aiwei Liu, Xuming Hu, Weiyu Guo, Hui Xiong
---

arXiv:2608.24982v2 Announce Type: replace-cross 
Abstract: Foundation-model post-training usually relies on human labels, preference data, stronger teachers, or executable verifiers. We study Unsupervised Post-Training (UPT): update-bearing adaptation on unlabeled inputs whose learning signal is derived from same-lineage model artifacts rather than an external oracle. We catalog 80 strict UPT methods and organize them by the object that supplies the update signal: a prediction statistic, a sample relation, a self-generated target, or an internal evaluator. Beyond inventory, we show how the choice of internal signal and task structure determines whether post-training improves the model or recursively amplifies error. An orthogonal Input Visibility $\times$ Update Persistence view maps deployment regimes and defines a unified framework for UPT selection and evaluation.