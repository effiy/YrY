---
title: 'When the Canonical Completion Is Wrong: Formalizing and Measuring the Jump
  in Large Language Models'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26187
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Dai Shi, Xiaoyu Li, Jos\'e Miguel Hern\'andez-Lobato
---

arXiv:2608.26187v1 Announce Type: cross 
Abstract: Whether large language models (LLMs) can perform the abductive leap from evidence to a new system of axioms, commonly referred to as a jump, has recently attracted considerable debate. A prominent position holds that LLMs are structurally incapable of such jumps, while recent studies challenge both its mechanism and its evidence. However, the debate remains difficult to settle, since the field still lacks a formal definition of the jump and a measure to test either side. In this paper, we develop a formal account of the jump in four steps and measure the second. The steps ask what the default completion of partial data is, when abandoning it is forced, when the abandonment is correct, and how successive jumps compound. Specifically, we define a jump instance as a finite extension problem with a machine-checked certificate that a correct completion exists, is unique up to renaming, and differs from the canonical completion of the data. The canonical completion is given by the left and right Kan extensions and is also what models produce without constraints, so it serves as the default. We prove that jump instances are well-posed and establish a family theorem that certifies instances of unbounded difficulty without enumeration. We further formalize when a jump is correct and how successive jumps compound. Finally, we run the measurement on nine certified instances and four frontier models. The Kan-default rate is zero in all 248 constrained trials, so the models do jump at this step and abandon the excluded default every time. Failures at higher difficulty stem from exhausted reasoning budgets or constraint errors, never from reverting to the default. These results indicate that the second step is not the bottleneck. If the disputed incapacity is real, it lies in generating the constraints or inventing the framework. Code can be found at: https://github.com/EEthanShi/kan-jump-test.