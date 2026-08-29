---
title: 'Drift-Adaptive ICU Intervention Prediction: Freezing the Physiological Encoder
  for Auditable Model Updating'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2607.19020
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Fatema Ferdous Tamanna, K. M. Merajul Arefin, Md. Abdul Masud
---

arXiv:2607.19020v3 Announce Type: replace-cross 
Abstract: Clinical decision support degrades as treatment protocols evolve, but the obstacle to updating a deployed model is governance as much as accuracy: once retraining touches every parameter, no one can say afterwards where the update acted. We propose a two-stream architecture separating physiological (LSTM) from treatment (MLP) representations. On a dual distributional and accuracy trigger, updates are confined to the treatment stream and fusion head, leaving the physiological encoder bitwise identical to the source model. Audit logs record which treatment features the update relied on, and evidence retrieval couples per-instance PubMed queries to the frozen encoder. We evaluate on 84,792 MIMIC-IV stays split by three-year era. The constraint proved close to free: selective adaptation cost nothing in aggregate discrimination against unconstrained full adaptation (mean AUROC 0.9316 vs. 0.9249; ahead on vasopressor, marginally behind on intubation) while being six-fold more stable across adaptation seeds. Run sequentially over four era transitions, the detector located the 2020 boundary rather than assuming it, firing once and on the distributional leg alone. Confining updates to named architectural blocks therefore costs little discrimination and bounds each update's scope by construction rather than by inference after the fact. Attribution-conditioned retrieval tracked the source model more closely under the freeze than under full adaptation (physiology Jaccard 0.593 vs. 0.536) without reproducing it, an advantage specific to the frozen stream: a guarantee over weights is not a guarantee over attributions, and this design makes the former structural while leaving the latter observable.