---
title: LoRA as Oracle
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2601.11207
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Marco Arazzi, Antonino Nocera
---

arXiv:2601.11207v2 Announce Type: replace-cross 
Abstract: Practitioners increasingly deploy neural networks they did not train, and must audit them after the fact for hidden backdoors, without the training pipeline, the poisoned data, or knowledge of any trigger. We introduce a low-rank auditing lens built on a single observation: what a model has internalized and how it behaves are distinct axes that can diverge. Fitting a small low-rank adapter toward a hypothesis and reading the geometry of the resulting update, its energy relative to, and its alignment with, the frozen weights, measures internalization directly, independently of the model's output behavior. The lens earns its value where the two axes diverge: a backdoor is malicious internalization, a learned trigger-to-target shortcut, that behavioral auditing can miss. Reading it, we identify the backdoor's target class label-free and without any triggered data when the backdoor leaves a legible internalization signature, then erase the identified shortcut within the same low-rank subspace, uniquely coupling detection confidence to the size of the repair. Across four datasets and four architectures, our lens is the most consistent target identifier among defenses in its threat model; its rank-r repair removes backdoors while preserving clean accuracy where full-model baselines collapse it, at orders-of-magnitude lower parameter and memory cost; and it is the only method that both erases the backdoor and leaves a benign model intact, because it can decline to act when uncertain.