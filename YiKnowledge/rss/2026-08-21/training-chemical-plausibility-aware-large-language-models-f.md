---
title: Training Chemical Plausibility-Aware Large Language Models for Single-Step
  Retrosynthesis
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18940
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Bogdan Zagribelnyy, Ivan Ilin, Nikita Bondarev, Maksim Kuznetsov, Mathieu
  Reymond, Vladimir Aladinskiy, Alex Aliper, Alex Zhavoronkov
---

arXiv:2608.18940v1 Announce Type: cross 
Abstract: Single-step retrosynthesis is a central component of computer-aided synthesis planning, yet its intrinsically one-to-many nature is poorly captured by single-answer evaluation and benchmarking protocols. To address this, we introduce Top-K prompting as a robust training and inference paradigm to better capture diverse, plausible reaction predictions. We compile CREED-CCV-2+USPTO-XL, an ultra-large-scale dataset of ~45.6 million verified reactions to train the C3LM (Chemistry Constraint-Consistent Language Model). By integrating fine-tuning with ChemCensor-based and novelty-oriented rewards, our model achieves state-of-the-art performance on the OOD URSA-expert-2026 benchmark. Further analysis of reaction uniqueness shows that LLMs and conventional models explore complementary reaction spaces, motivating ensemble-based retrosynthesis systems. Overall, our results establish Top-K, plausibility-aware training as a practical new direction for robust future LLM-based synthesis planning.