---
title: 'Different Facets of Verbalised Overconfidence: an Interpretability Study'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18106
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Davide Mazzaccara, Leonardo Bertolazzi, Raffaella Bernardi
---

arXiv:2608.18106v1 Announce Type: cross 
Abstract: Large language models tend to overconfidence, giving assertive answers when the evidence suggests hedging or abstention. Using controlled reasoning scenarios that manipulate logical necessity and possibility, we study this behavior in Qwen3-4B, across three ways to express uncertainty: verbal epistemic markers, abstention, and numeric confidence scores. Our results confirm this tendency toward overconfidence, particularly when the model is prompted to output a numeric confidence score. At the interpretability level, we propose a method that differentially identifies transcoder features responsible for uncertainty and certainty. Our analysis reveals Qwen3-4B's default mechanism favors certainty generation through a broad coalition of shared features, while uncertainty is implemented as a sparse override mediated by a small set of dedicated features. Intervening on these uncertainty features both causally proves this imbalance underlying overconfidence and also mitigate overconfident errors. The same set of features generalise across the three uncertainty-expression settings, languages, and an out-of-distribution modality task.