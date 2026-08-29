---
title: Evaluating Confidence-Gated Retrieval with Matched Trajectory Replay
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26846
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Prateek Chhikara
---

arXiv:2608.26846v1 Announce Type: cross 
Abstract: Interactive language-model agents use confidence signals to decide whether to answer immediately, retrieve additional evidence (from memory or external knowledge), or defer. Yet confidence is usually evaluated in isolation, without measuring the trajectory-level consequences of the actions it triggers. We propose matched trajectory replay, a controlled protocol for comparing confidence-to-action mappings. The protocol holds candidate answer states, evidence points, budgets, and action costs fixed. We use it to compare raw verbalized confidence with post-hoc isotonic calibration in a multi-hop question-answering system using Mistral, GPT, and Qwen models on HotpotQA and MuSiQue datasets. At the same numerical commitment threshold, calibration changes which questions agents ultimately commit to answering. Across all six model-dataset pairs, it increases accuracy among committed answers by up to 41 percentage points. However, it can reduce coverage and increase retrieval use. Overall accuracy improves by up to 15 percentage points on HotpotQA but falls by up to 17 percentage points on MuSiQue. These effects reflect a shift to a more selective, lower-risk operating point, not improved answers or confidence ranking. A calibration map fitted before retrieval improves held-out calibration through retrieval depths one and two, but is worse than raw confidence at depth three for all three models. Additional evidence helps on average, but this aggregate effect does not establish whether confidence identifies which individual episodes will benefit from another retrieval. Taken together, these results show that calibration can make commitment risk interpretable, but it does not estimate the expected benefit of another retrieval. Retrieval therefore requires a separate value-of-information or utility estimate. Evaluations should report held-out calibration, risk-coverage, and retrieval cost.