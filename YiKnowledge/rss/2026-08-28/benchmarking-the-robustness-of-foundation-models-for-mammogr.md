---
title: Benchmarking the Robustness of Foundation Models for Mammography under Domain
  Shift
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2607.10358
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Giang Nguyen, Raghav Mehta, Emma A. M. Stanley, Tian Xia, Thi Hao Nguyen,
  Hieu Pham, Ben Glocker
---

arXiv:2607.10358v3 Announce Type: replace-cross 
Abstract: Foundation models are increasingly used as image feature extractors for mammography, but their robustness under external domain shift remains unclear. We benchmark 15 foundation-model backbones across breast density, BI-RADS severity, and cancer status using a unified frozen-backbone linear-probe protocol, training on 3 source datasets and evaluating on 12 task-compatible out-of-distribution (OOD) datasets after label harmonization. Mammography-specific vision-language models (Mammo-FM and MaMA) provide the strongest mean OOD performance, but robustness is not explained by mammography exposure alone. DINOv3 remains a competitive vision-only baseline, and mammography-adapted pretraining does not consistently improve generalization. Dataset-level analysis further shows that even leading models show heterogeneous performance across datasets. Feature-space inspection reveals that useful representations can preserve clinical signal while retaining dataset and acquisition structure. These findings highlight dataset-level OOD evaluation as a central criterion for assessing mammography representations. Our code is publicly available: https://github.com/biomedia-mira/mammo-ood.