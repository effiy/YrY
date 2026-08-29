---
title: A Multi-Framework Comparison of Outline Stages in Long-Form Generation with
  LLMs
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26177
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yifan Song
---

arXiv:2608.26177v1 Announce Type: cross 
Abstract: Long-form generation exposes fundamental limitations of large language models. Even 70B-parameter models exhibit length collapse at 16k-token outputs, and multi-chapter stories frequently trigger the attribute drift characteristic of the ``lost-in-the-middle'' effect. The ``outline-first, write-later'' paradigm has gained wide adoption, yet existing research evaluates the final writing rather than the outline itself, conflating two evaluation objects that should be decoupled. We construct a unified head-to-head benchmark covering 7 representative long-form generation frameworks across 3 generation granularities -- single-chapter, multi-chapter, and whole-book -- and propose an anchor-based LLM-as-a-judge protocol that directly assesses outlines against the source text on a 5-point anchored scale. Across 21 framework-granularity cells, no single framework dominates; performance depends on the match between a framework's intrinsic output form and the target granularity. SuperWriter ranks first in the length-constrained single-chapter mode, but this advantage degrades in whole-book mode. The outline-side ranking correlates only moderately with the writing-side ranking, supporting the outline--writing decoupling principle. Compute constraints limit the writing-side evaluation to a subset of cases; follow-up experiments will expand the sample size and add cross-model evaluators to enable stronger statistical inference.