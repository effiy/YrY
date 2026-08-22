---
title: 'ContextSniper: AntTrail''s Token-Efficient Code Memory for Repository-Level
  Program Repair'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2607.01916
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Chiwang Luk, Matin Mohammad Najafi, Zhifeng Jia, Wei Yang, Xiuchang Li, Jinwei
  Zhu, Yang Ren, Lei Chen, Gao Cong
---

arXiv:2607.01916v5 Announce Type: replace 
Abstract: Large language model agents can repair real repository issues, but they often spend large context budgets on whole-file reads, broad searches, and long terminal outputs where useful evidence is mixed with irrelevant code and logs. This paper presents ContextSniper, AntTrail's code-repair module for precision evidence selection in repository-level program repair, part of AntTrail's broader agent-memory engine. AntTrail is available at https://gitcode.com/datagallery/AntTrail. ContextSniper indexes code and action memory as three abstract levels, retrieves candidates with a hybrid ranker, filters long tool output through an intention-aware context gate, and returns compact evidence packets while keeping full source recoverable on demand. In a matched 50-task-per-condition comparison on SWE-bench Lite (same tasks, baseline vs.\ ContextSniper), ContextSniper reduces total token use by 51.5% and logged cost by 36.4% for OpenClaw, and by 38.9% and 27.3% for Claude Code, with submitted-resolution rates essentially unchanged in both host-agent settings. In a separate five-task comparison, ContextSniper beats existing memory- and RAG-style integrations on token efficiency. These results suggest ContextSniper can substantially cut token and cost overhead for repository-level repair agents without a measurable loss in repair quality. The evaluation harness for this study is available at https://gitcode.com/lukchiwang/ContextSniper.