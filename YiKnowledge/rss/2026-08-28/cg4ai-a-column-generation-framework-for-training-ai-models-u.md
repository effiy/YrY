---
title: 'CG4AI: A Column Generation Framework for Training AI Models Under Constraints'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26375
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Youcef Magnouche, Abderrahmane Driouch, S\'ebastien Martin, Pierre Bauguion
---

arXiv:2608.26375v1 Announce Type: cross 
Abstract: Standard machine-learning training minimizes a loss function over a dataset, but does not guarantee that the resulting model will satisfy predefined rules or constraints on its outputs. In many real-world applications, ranging from autonomous systems to network routing, such guarantees are essential. We propose CG4AI, a framework that builds a convex combination of AI models while enforcing linear constraints on the combined output. A master linear program (LP) determines the optimal mixture weights, while a pricing subproblem generates new models guided by LP dual variables, focusing attention on the most violated constraints. A cutting-plane procedure extends feasibility guarantees beyond the training set. We apply CG4AI to two problems: (i) digit classification on MNIST, where we demonstrate four distinct uses of constraints, learning from constraints alone, improving adversarial robustness, correcting misclassified examples, and enforcing output relabeling; and (ii) the multi-commodity flow problem, where link capacity constraints are enforced on neural-network routing predictors. Experiments on MNIST and standard SNDLIB benchmark networks show that CG4AI reliably produces feasible predictors while achieving better accuracy than single-model baselines.