---
title: 'Key Coverage Matters: Semi-Structured Extraction of OCR Clinical Reports'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2605.09440
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yu Wang, Yingyun Li, Ying Qin, Haiyang Qian
---

arXiv:2605.09440v2 Announce Type: replace-cross 
Abstract: Clinical reports are often fragmented across healthcare institutions because privacy regulations and data silos limit direct information sharing. When patients seek care at a different hospital, they often carry paper or scanned reports from prior visits. This hinders EHR integration and longitudinal review, and downstream applications that depend on more complete patient records, such as patient management, follow-up care, real-world studies, and clinical-trial matching. Although OCR can digitize such reports, reliable extraction remains challenging because clinical documents are heterogeneous, OCR text is noisy, and many healthcare settings require low-cost on-premise deployment. We formulate this problem as canonical key-conditioned extractive question answering over OCR-derived clinical reports. Because the key fields are neither fixed nor known in advance, the key space is open. We maintain a canonical key inventory through iterative key mining, normalization, clustering, and lightweight human verification, and introduce key coverage as a metric to quantify inventory completeness. Using a 0.2B BERT-based model, experiments on real-world reports from more than 20 hospitals show performance improves monotonically with key coverage. The model achieves F1 scores of 0.839 and 0.893 under exact match and boundary-tolerant matching, respectively, once the Top-90 canonical keys are covered. These results show that key coverage is a dominant factor for end-to-end performance. At Top-90 coverage, our model outperforms a fine-tuned Qwen3-0.6B baseline under exact match. Although our annotated corpus is Chinese, the method relies on the language-agnostic key-value organization of semi-structured clinical reports and can be adapted to other settings given an appropriate canonical key inventory and alias mapping.