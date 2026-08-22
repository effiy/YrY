---
title: 'FedCoRe: Target-Adaptive Completion for Missing Modalities in Healthcare Federated
  Learning'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18311
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Holger R. Roth, Ziyue Xu, Peter Cnudde
---

arXiv:2608.18311v1 Announce Type: cross 
Abstract: Federated multimodal models often assume every site has every modality, although hospitals differ in access to EHRs, chest radiographs, and ECGs. We study this setting on a MIMIC-derived respiratory deterioration task with simulated FL clients and introduce FedCoRe (Federated Cross-Modal Representation Completion). FedCoRe learns representation- or logit-space corrections rather than generating synthetic ECGs or CXR images. When a client observes a modality that may be missing at deployment, it evaluates the same example with and without that modality to obtain paired supervision. Only clients with such pairs update the completion module, and validation may retain the unchanged prediction. We freeze the trained multimodal predictor during evaluation so that measured differences come only from completion. Hiding ECG reduced AUROC by about 0.085; paired-example FedAvg restored 0.0415 AUROC, or 49.0% of the lost performance. We therefore report two distinct effects: paired-example FedAvg partially recovers the missing-ECG gap, while validation-selected completion is a task-specific classifier-logit correction rather than literal ECG recovery. For CXR, effect-aware completion recovers 52.8% of the loss in a controlled test where CXR is hidden. Paired-example FedAvg transfers part of this effect, but validation keeps the no-completion baseline for deployment cases whose inputs lack CXR. Thus, FedCoRe should be read as a validation-gated completion/correction framework: it can recover missing-modality signal in supported settings, but it should be deployed only when paired examples and validation evidence support that modality.