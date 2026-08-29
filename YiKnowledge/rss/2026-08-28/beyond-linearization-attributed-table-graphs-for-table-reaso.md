---
title: 'Beyond Linearization: Attributed Table Graphs for Table Reasoning'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2601.08444
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yuxiang Wang, Junhao Gan, Shengxiang Gao, Shenghao Ye, Zhengyi Yang, Jianzhong
  Qi
---

arXiv:2601.08444v2 Announce Type: replace 
Abstract: Table reasoning, a task to answer questions by reasoning over data presented in tables, is an important topic due to the prevalence of knowledge stored in tabular formats. Recent solutions use Large Language Models (LLMs) for their semantic understanding and reasoning capabilities. A common paradigm of such solutions linearizes tables to form plain texts that are served as input to LLMs. This paradigm has critical issues. It requires LLMs to infer row-column-cell relations from serialized inputs, makes evidence paths harder to trace, and is subject to the "lost-in-the-middle" issue. To address these issues, we propose Table Graph Reasoner (TabGR), a model that represents tables as an Attributed Table Graph (ATG) without task-specific training. The ATG explicitly preserves row-column-cell structure while enabling graph-based reasoning over traceable evidence paths. We further propose a Question-Guided Personalized PageRank (QG-PPR) mechanism to rerank tabular data and mitigate the lost-in-the-middle issue. Extensive experiments across multiple table reasoning benchmarks show that TabGR consistently outperforms state-of-the-art models by up to 9.7% in accuracy. Our code is available at: https://github.com/yxw-11/TabGR.