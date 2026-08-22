---
title: 'When Clean Signals Are Not Enough: Detecting Structural Ambiguity for Safe
  Wearable Stress Classification'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18397
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Saba A. Farahani, Hung Cao, Amir M. Rahmani
---

arXiv:2608.18397v1 Announce Type: new 
Abstract: Wearable stress classifiers can achieve strong average performance while failing completely for a particular individual. On WESAD, a Random Forest reaches 93.0% mean accuracy yet yields F1 = 0 for Subject 14, whose cross-signal coupling weakens near stress onset. We call this structural ambiguity: individually plausible physiological channels form an inter-signal pattern that is poorly supported by the person's non-stress reference. We introduce the Individual Conformal Coupling Monitor (ICCM), a lightweight and transparent pre-inference monitor that quantifies subject-specific coupling divergence and routes each window to classify, defer, or abstain without retraining the downstream classifier. Across WESAD (N = 15) and Stress-Predict (N = 35), full-cohort Pearson associations between ambiguity and accuracy are negative (r = -0.607, p = 0.016; r = -0.412, p = 0.014). Robustness analyses temper this finding: rank correlations are not significant, and the WESAD association disappears when Subject 14 is removed. ICCM changes false-positive counts from 29 to 27 and 94 to 92, although neither paired change is significant. It withholds 3 of Subject 14's 21 stress windows but does not repair the missed-stress failure. These results position ICCM as an interpretable signal of unsupported physiology and individual failure, rather than a stand-alone safety guarantee.