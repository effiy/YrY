---
title: 'No Plan, Yet Human: A Reactive Robotics Model Predicts Human Planning Failures
  on a Clinical Task'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2605.16514
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Michael Migacev, Vito Mengers, Antonia K\"ongeter, Oliver Brock
---

arXiv:2605.16514v2 Announce Type: replace-cross 
Abstract: Understanding why some sequential planning problems are harder than others requires models that go beyond average performance. They should capture the specific pattern of which problems are hard, and ideally fail in the same way people do when planning capacity is reduced. We apply AICON, a reactive gradient-descent framework developed for robotic manipulation, to the Tower of London test, a cognitive test used to assess planning in Parkinson's disease, mild cognitive impairment, and stroke. Without any lookahead planning or knowledge of human cognition, AICON reproduces the fine-grained human difficulty ordering across 24 problems better than structural task parameters and generalizes to held-out problems in a leave-two-out evaluation. Crucially, AICON outperforms a planning baseline for groups with reduced planning capacity while the planning baseline better captures healthy controls. This dissociation was predicted by the original AICON paper, which noted that the model's failure modes resemble those of Parkinson's patients who struggle with goal hierarchies but not move counts. This suggests that as planning capacity is reduced, human behavior shifts toward the reactive mode AICON models. The finding extends a broader pattern: AICON, originally built for robotics, now captures aspects of biological behavior across perception, eye movements, and sequential planning, suggesting its core abstraction reflects something real about how biological systems are organized.