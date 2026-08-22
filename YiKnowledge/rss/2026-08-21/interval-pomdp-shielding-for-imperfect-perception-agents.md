---
title: Interval POMDP Shielding for Imperfect-Perception Agents
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2604.20728
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: William Scarbro, Ravi Mangal
---

arXiv:2604.20728v2 Announce Type: replace 
Abstract: Autonomous systems that rely on learned perception can make unsafe decisions when sensor readings are misclassified. We study shielding for this setting: given a proposed action, a shield blocks actions that could violate safety. We consider the common case where system dynamics are known but perception uncertainty must be estimated from finite labeled data. From these data we build confidence intervals for the probabilities of perception outcomes and use them to model the system as a finite Interval Partially Observable Markov Decision Process with discrete states and actions. We then propose an algorithm to compute a conservative set of beliefs over the underlying state that is consistent with the observations seen so far.
  This enables us to construct a runtime shield that comes with a finite-horizon guarantee: with high probability over the training data, if the true perception uncertainty rates lie within the learned intervals, then every action admitted by the shield satisfies a stated lower bound on safety. Experiments on four case studies show that our shielding approach (and variants derived from it) improves the safety of the system over state-of-the-art baselines.