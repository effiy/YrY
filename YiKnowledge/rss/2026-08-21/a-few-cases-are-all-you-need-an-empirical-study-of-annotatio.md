---
title: 'A Few Cases Are All You Need: An Empirical Study of Annotation-Efficient LoRA
  Fine-Tuning of MedSAM3'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18731
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Sachin Dudda Nagaraju, Bendik Skarre Abrahamsen, Ashkan Moradi, Mattijs Elschot
---

arXiv:2608.18731v1 Announce Type: cross 
Abstract: Medical image segmentation is essential for clinical workflows such as treatment planning and disease assessment. While specialist tools like TotalSegmentator and MRSegmentator achieve strong performance, they require large annotated datasets for training. Medical foundation models offer a promising alternative through large-scale pretraining that reduces the annotation burden for new tasks, but zero-shot performance remains limited. Parameter-efficient adaptation via Low-Rank Adaptation (LoRA) enables efficient specialization with few trainable parameters, but a key question remains: how many expert-annotated cases are needed to achieve clinically useful segmentation performance? We address this by adapting MedSAM3 with LoRA for five abdominal organs (liver, kidneys, spleen, gallbladder, and pancreas) in CT and MRI using only 1, 2, 5, and 10 annotated cases, evaluating on AMOS22 dataset. With just 10 cases, models achieve performance competitive with specialist systems trained on orders of magnitude more data. Notably, this includes reliable gallbladder segmentation (Dice 0.68 CT, 0.59 MRI) where existing tools fail almost completely (Dice 0.0004), while remaining within 5--10% of MRSegmentator for liver, kidneys, and spleen using over 100 times fewer annotations. Furthermore, external validation on the Whole Heart Segmentation dataset shows that the approach extends to cardiac segmentation, a use case beyond the scope of TotalSegmentator (MRI) and MRSegmentator, achieving competitive left ventricle (LV) performance with only 10 annotated cases. Training requires only3--5,hours per organ on a single GPU, approximately 2--3 times faster than nnU-Net. These findings suggest that ten annotated cases are sufficient for clinically useful segmentation, effectively reducing bottlenecks for both image annotation and training time.