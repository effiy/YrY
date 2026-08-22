---
title: Candidate-Fate Accounting for Transparent Sensor Diagnostic Pipeline Search
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18665
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Haotao Xie, Yutian Chen, Yangqi Liu, Xiaoyu Jiang
---

arXiv:2608.18665v1 Announce Type: new 
Abstract: Industrial sensor diagnostics relies on preprocessing, representation, and classification pipelines, making automated pipeline search useful for reducing manual design cost. However, existing automated machine/deep learning (AutoML/AutoDL) reports typically retain only fitted trials, scores, and winners, omitting generated candidates that are invalid, pruned, skipped, cached, or unfitted. This omission limits reviewers' ability to check signal constraints, budget use, and unevaluated legal alternatives. To address this, we propose candidate-fate accounting, a candidate-level audit framework for diagnostic search traces. It records each observed candidate as auditable evidence: hashes merge repeated observations, legality checks flag invalid candidates, allocation rationales explain budget decisions, and a closed fate ledger assigns one terminal fate to each candidate. Experiments on three bearing-diagnostic datasets show that the framework detects invalid candidates and identifies 30--41 candidates omitted by fitted-trial-only reports, with closed fate records verifying complete candidate accounting while maintaining competitive diagnostic performance. The code is available at https://github.com/XXIE999/candidate-fate-accounting.