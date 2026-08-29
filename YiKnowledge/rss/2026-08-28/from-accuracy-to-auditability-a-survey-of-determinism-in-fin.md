---
title: 'From Accuracy to Auditability: A Survey of Determinism in Financial AI Systems'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2605.23955
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Ruizhe Zhou, Xiaoyang Liu, Gaoyuan Du, Yi Zheng, Shouxi Ren, Deepayan Chakrabarti,
  Dengdu Jiang
---

arXiv:2605.23955v4 Announce Type: replace 
Abstract: Deploying machine learning in regulated financial environments -- credit risk, fraud detection, and anti-money laundering -- exposes critical vulnerabilities in algorithmic reproducibility. While early financial ML addressed statistical challenges such as backtest overfitting, deep neural networks and Generative AI have introduced mechanical nondeterminism rooted in hardware and architecture. This survey provides a systems perspective on reproducibility failures across three modalities now dominant in financial AI: tabular models (post-hoc explanation variance), graph networks (stochastic sampling and temporal asynchrony), and LLM-based agentic workflows (batch-dependent divergence and trajectory drift). We supplement the literature analysis with first-party experiments on public financial datasets -- quantifying explanation rank instability in credit scoring, prediction flip rates in GNN-based fraud detection, and tensor-parallel-induced output divergence in LLM entity extraction. We propose a layered evaluation framework linking modality-specific metrics (RBO, D_cos, TDI, PSD) to audit readiness, and report where these measures overlap rather than complement one another.