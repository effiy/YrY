---
title: A Critical Synthesis of Uncertainty Quantification and Foundation Models for
  Semantic Segmentation
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18709
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Steven Landgraf, Joceline Hinz, Markus Ulrich
---

arXiv:2608.18709v1 Announce Type: cross 
Abstract: Foundation models are increasingly breaking what seemed to be impossible not long ago by enabling unprecedented accuracy and cross-domain generalization. Yet their lack of interpretability, tendency to be overconfident, and sensitivity to real-world domain shifts pose critical challenges for safety- and mission-critical applications. Uncertainty quantification (UQ) offers a principled way to address these issues, but its integration into segmentation foundation models has yet to be explored. In this paper we present the first systematic evaluation of UQ methods applied to a foundation model for semantic segmentation. We fine-tune a lightweight DPT decoder on top of the pretrained SAM2 encoder to establish a simple yet competitive baseline and benchmark four representative UQ approaches - Monte Carlo Dropout, Deep Sub-Ensemble, Test-Time Augmentation, and Evidential Deep Learning - across Cityscapes, NYUv2, and two challenging out-of-domain settings. Our analysis compares segmentation accuracy, calibration, uncertainty quality, and inference time, revealing clear trade-offs between predictive performance, reliability, and computational cost. These results highlight both the promise and the current limitations of uncertainty-aware foundation models, pointing to the need for future work that jointly optimizes accuracy, robustness, and efficiency for real-world deployment.