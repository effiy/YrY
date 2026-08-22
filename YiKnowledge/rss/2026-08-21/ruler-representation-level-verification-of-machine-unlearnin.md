---
title: 'RULER: Representation-Level Verification of Machine Unlearning'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2605.27569
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Georgina Cosma, Axel Finke
---

arXiv:2605.27569v3 Announce Type: replace 
Abstract: Machine unlearning aims to remove the influence of specific training records from a deployed model without retraining from scratch. Current protocols verify this at the output level through membership inference, retain accuracy, and forget-set accuracy, but a model can satisfy all three whilst still encoding forgotten records in its intermediate representations. We introduce RULER, a set of representation-level verification metrics. The oracle-comparative metric M2 measures whether forget-set records occupy the same representational position as in a model retrained without them. The oracle-free metric M4 detects residuals from the unlearned model's internal similarity structure alone, without retraining. Four approximate unlearning methods all pass output-level evaluation, yet under a linear mixed-effects model M2 detects significant residuals in 10 of 12 conditions (p<0.05), with effect sizes growing as the forget fraction increases. A fifth method, Bad Teacher, shows the same residuals despite a different forgetting mechanism. M4 acts as a pre-unlearning diagnostic across tabular, image, clinical text, and face-identity settings: it detects identity-level memorisation in face recognition models where no tested method fully erases the signal.