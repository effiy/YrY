---
title: 'What the "Spotless" Mind Remembers: How Knowledge Entanglement Shapes What
  Leaks After Unlearning in LLMs'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2510.25732
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Aakriti Shah, Yifan Hu, Thai Le
---

arXiv:2510.25732v2 Announce Type: replace-cross 
Abstract: Unlearning in large language models (LLMs) is usually evaluated as whether an "unlearned" fact can be recovered. We instead ask whether a fact's structural entanglement with the rest of a model's knowledge predicts whether it leaks after unlearning, whether this relationship changes systematically, and whether it is causal. Across varied unlearning algorithms (WHP and GA+KL), two domains (both fictional Harry Potter and non-fictional U.S. Senators, 2000-2010), and four models (2.7B-13B parameters), we find that before unlearning, more entangled facts are recalled more often (r = +0.39 to +0.51). WHP weakens this relationship but stays positive (r = +0.16 to +0.33); GA+KL inverts it in every domain and model size (r = -0.14 to -0.25). To our knowledge, this is the first report of this specific reversal in the unlearning literature. To confirm this is causal beyond correlation, we directly manipulate a prompt's entanglement score, holding its content, target model fixed, and show recall moves in the predicted direction and reverses sign under GA+KL in the same direction as the correlational analysis. This manipulation is our central evidence that unlearning acts on the underlying knowledge structure, not just its output. Building on this, we train a predictive model that estimates a prompt's post-unlearning factuality/hallucination profile before unlearning is run, creating a unique way of model auditing in triaging which prompts are likely to leak.