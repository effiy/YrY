---
title: Evaluating Structured Information Extraction with Open Models in a High Risk
  Public Sector Application
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18289
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Elias Schubert, Felix Bie{\ss}mann
---

arXiv:2608.18289v1 Announce Type: new 
Abstract: The extraction of structured information from unstructured documents represents a critical component of digital transformations in all sectors. While proprietary solutions dominate commercial applications, a rapidly growing ecosystem of open-source Optical Character Recognition (OCR) engines, Large Language Models (LLMs), and Vision-Language Models (VLMs) offers accessible alternatives. However, systematic evaluations on realistic, multi-step extraction pipelines remain scarce. Responsible usage of such extraction tools require comprehensive evaluations on realistic tasks, especially as these solutions will be key components of applications in the public sector that the EU AI act categorizes as high risk. To address this gap we present a comprehensive benchmark assessing the end-to-end performance of open-source systems on a complex real-world document processing task classified as high risk: Student applications for an international study program. We conduct a comprehensive empirical evaluation with state-of-the-art OCR engines, LLMs and VLMs. Our results reveal that while VLMs generally outperform OCR+LLM pipelines, even state-of-the-art open-source models struggle to handle such tasks reliably in zero-shot settings. Only 4 of 35 configurations achieved F1 scores above 0.5, with the best OCR+LLM pipeline matching top VLM performance, though most OCR+LLM combinations performed substantially worse. Roughly 75\% of all configurations scored below 0.25. Model scale influences performance, yet the relationship is non-linear: substantially larger models do not guarantee proportionally better results. Input quality, particularly the structural preservation of OCR output, emerges as a critical factor independent of downstream model capability.