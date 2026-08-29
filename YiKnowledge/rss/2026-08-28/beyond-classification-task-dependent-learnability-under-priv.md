---
title: 'Beyond Classification: Task-Dependent Learnability under Privacy-Motivated
  Image Transformations'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27066
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Leon Ranke, Wolfgang H\"ubner, Ronny Hug, Michael Arens, J\"urgen Beyerer
---

arXiv:2608.27066v1 Announce Type: cross 
Abstract: Privacy-Enhancing Technologies (PETs) in computer vision often rely on noise or image perturbations to protect visual data while securely processing it, creating a trade-off between task performance and protection. This trade-off is commonly evaluated using image classification, which primarily captures semantic separability and remains robust despite significant geometric, spatial layout or local boundary alterations. As a result, it is too simplistic as a proxy for generic vision tasks. Exhaustive downstream-task evaluation, however, is computationally expensive because models must often be trained for each PET transformation and parameter setting. We therefore propose a compute-aware multi-task protocol for evaluating PETs in model training. It combines lightweight proxy tasks that target complementary aspects of visual structure while remaining simple and fast to compute. Across irreversible privacy transformations, key-based block primitives, and learnable image encryption schemes, we demonstrate that PETs with similar classification accuracy can differ substantially on other tasks. The outcomes highlight the need for PET evaluation protocols that move beyond classification-only reporting.