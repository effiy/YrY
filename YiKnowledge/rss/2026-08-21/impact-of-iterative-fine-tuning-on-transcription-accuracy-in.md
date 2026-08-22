---
title: Impact of Iterative Fine-Tuning on Transcription Accuracy in Complex Historical
  Sanskrit Manuscripts
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18696
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Kartik Chincholikar, Kaushik Gopalan, Mihir Hasabnis
---

arXiv:2608.18696v1 Announce Type: cross 
Abstract: Digitizing the text from handwritten historical manuscripts is required to make them easily accessible, preservable, and to enable historical scholars to study them in new ways. Historical manuscripts, however, often exhibit complex heterogeneous layouts and non-standard appearance due to period-specific writing styles, page textures, camera noise, and other nuisance factors, making them difficult to perform OCR on. To tackle this challenge, we introduce a local traditional OCR pipeline, which can be iteratively fine-tuned on the target manuscript at the layout-level and the appearance-level. By adapting to the target manuscript distribution, the proposed Traditional OCR pipeline makes better predictions on subsequent pages, causing iterative reduction in human annotation effort, which is expensive and time-consuming as it requires historical domain expertise. Using this pipeline, we digitize text from three complex historical Sanskrit manuscripts and introduce a dataset with granular layout-level annotations, along with Unicode annotations in the standard PAGE-XML format. We demonstrate quantitative gains due to iterative fine-tuning of the proposed traditional OCR pipeline, and also benchmark the performance of leading Multi-Modal Large Language Models on the introduced Dataset. Code and dataset are available at: https://github.com/flame-cai/gnn-synthetic-layout-historical/.