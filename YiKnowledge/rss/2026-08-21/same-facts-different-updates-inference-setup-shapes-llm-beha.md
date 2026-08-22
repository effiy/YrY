---
title: 'Same Facts, Different Updates: Inference Setup Shapes LLM Behavior in Medical
  Allocation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18108
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Spencer Gibson, Tyler Crosse, Magnus Saebo, Achyutha Menon, Eyon Jang, Diogo
  Cruz
---

arXiv:2608.18108v1 Announce Type: cross 
Abstract: Large language models are being incorporated into sensitive and important decision-making processes across nearly all fields. While prior work studies model bias around inputs and scenario framing, models can also behave in unexpected and undesirable ways due to context accumulated over their deployment. In this work, we study a medical example in which a model is asked to assign resource-allocation probabilities to two people given brief clinical context, and then sees the same scenario with a single extra sentence containing contrasting patient information, either with or without its previous response in context. Across three of four tested models, the paired-context and independent-inference experiments have different probability shifts, often in opposite directions (in favor of Person B vs. in favor of Person A) when new information is provided. We include additional paired-context experiments to show the effect of varying attributes across scenario axes. Our findings show the context-dependent effect of patient information in a sensitive medical use case. More broadly, our work shows the importance of carefully incorporating LLM-based systems into decision-making processes, context engineering, and further model behavioral studies.