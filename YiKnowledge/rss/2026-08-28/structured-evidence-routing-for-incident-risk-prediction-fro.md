---
title: Structured Evidence Routing for Incident Risk Prediction from Multimodal Longitudinal
  EHRs
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26191
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Animesh Agarwal, Meysam Ghaffari, Nina Fatehi, Carlos Morato
---

arXiv:2608.26191v1 Announce Type: new 
Abstract: Incident risk prediction from longitudinal electronic health records (EHRs) is challenging because relevant signals are multimodal, weak in isolation, and distributed across irregular patient histories. We propose structured evidence routing, a router-predictor-reviewer workflow that separates full-record access from disease-specific assessment. The router organizes the complete pre-index EHR into a compact summary and targeted evidence slices; the predictor uses this evidence to form an evidence-linked risk assessment, which the reviewer critiques. For comparison with supervised EHRSHOT baselines, we pair the routed evidence summaries with a supervised classifier readout. Across five 1-year incident diagnosis tasks, our method reaches the AUROC range of established supervised EHRSHOT baselines and remains competitive on AUPRC, while exposing a patient-specific evidence trail. Internal pre-readout ablations further suggest that routing, laboratory evidence, task guidance, and review each contribute to performance.