---
title: 'Diagnosing Conformal Prediction Failures Under Distribution Shift: A COVID-19
  Case Study'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2601.00908
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Chorok Lee
---

arXiv:2601.00908v2 Announce Type: replace-cross 
Abstract: Conformal prediction provides distribution-free coverage guarantees, but these degrade under distribution shift - and practitioners lack tools to anticipate which deployed models will fail before observing test data. We propose SHapley Additive exPlanations (SHAP) concentration - the fraction of feature importance concentrated in the top feature - as a pre-deployment diagnostic for conformal prediction vulnerability in gradient-boosted classifiers. Using COVID-19 as a naturalistic case study, eight supply chain tasks experience identical temporal shift yet coverage drops ranging from negligible to catastrophic. Feature-importance concentration is strongly associated with failure severity across 16 multiclass tasks in 9 domains, while standard distributional shift detectors detect shift uniformly across tasks but cannot distinguish catastrophic from robust outcomes. External validation across 9 non-supply-chain datasets shows partial transfer. We prove a formal theorem showing that Adaptive Prediction Sets conformity-score bounds worsen monotonically with concentration under explicit assumptions, verified empirically. The diagnostic identifies concentrated-dependence failures characteristic of gradient-boosted models but does not detect global-sensitivity failures observed in neural networks. A decision framework operationalizes the diagnostic as an exploratory pre-deployment rule with an uncertainty band around a concentration threshold.