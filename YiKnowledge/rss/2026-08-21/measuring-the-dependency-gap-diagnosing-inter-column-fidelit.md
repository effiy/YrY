---
title: 'Measuring the Dependency Gap: Diagnosing Inter-Column Fidelity in Tabular
  Generative Models'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2607.21636
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Jie Zhang
---

arXiv:2607.21636v4 Announce Type: replace-cross 
Abstract: Synthetic tabular data are valued for preserving not just column-wise marginals but inter-column dependency. Yet the most commonly reported certification score, a linear (logistic-regression) classifier two-sample test (C2ST), is largely blind to it: a fully-factorized baseline that destroys all inter-column dependency still appears nearly real, a known weakness we confirm on four benchmarks, while pairwise Trend penalizes the same baseline only mildly. We therefore apply a stronger, gradient-boosted C2ST and decompose its score into marginal, dependency, and numerical-categorical cross terms, each read against a zero-dependency reference and a real-data oracle. Applied to flow-matching (TabbyFlow) and diffusion (TabDiff) generators, it exposes a persistent dependency gap of the same order in both. Destroying dependency outright with every marginal intact collapses minority-class F1 by 0.38-0.61, though the generators' much smaller residual gaps do not track the shortfalls that remain. The gap is neither a structural limitation of mean-field objectives nor an artifact of sampling discretization, and a 16x capacity increase does not close it. Shrinking capacity eightfold, however, doubles it, so the measurement does respond to capacity; what remains points to the absence of direct dependency supervision.