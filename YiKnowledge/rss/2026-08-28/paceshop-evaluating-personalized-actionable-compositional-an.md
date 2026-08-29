---
title: 'PACEShop: Evaluating Personalized, Actionable, Compositional, and Evidence-grounded
  Shopping Assistants'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26180
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Weimin Lyu, Chen Luo, Guangrui Li, Yaochen Xie, Dhineshkumar Ramasubbu, Arief
  Koesdwiady, Wanqiu Long, Hansu Gu, Yutong Chen, Zheshen Wang, Dakuo Wang, Yi Liu
---

arXiv:2608.26180v1 Announce Type: cross 
Abstract: Shopping assistants are shifting from ranked product lists toward structured decision support, where systems must synthesize shopper context, product evidence, and next-step guidance into a coherent recommendation experience. This changes the unit of evaluation: a fluent response can still fail by ignoring shopper context, contradicting itself across components, or leaving defects too vague to localize. Existing personalization, grounding, and LLM-as-a-judge benchmarks cover pieces of this problem, but they do not define a joint evaluation target for structured shopping-assistant responses. We formulate this missing evaluation target as PACE: Personalized, Actionable, Compositional, and Evidence-grounded evaluation. We instantiate PACE with two artifacts: PACEShop, a benchmark dataset that makes the target measurable through 22,625 controlled records with structured personas, auditable evidence pools, GOOD/BAD labels, and gold defect family and location annotations; and PACEJudge, a training-free judging protocol that makes the target reportable through a structured output contract. Our experiments show that generic judges can recognize broad quality but fail to recover the diagnostic fields required for PACE; PACEShop makes these failures verifiable, and PACEJudge improves persona-source, cross-component, grounding, and family/location closure without retraining, showing that realistic shopping-assistant evaluation requires a task-matched output contract rather than only a stronger backbone or scalar prompt.