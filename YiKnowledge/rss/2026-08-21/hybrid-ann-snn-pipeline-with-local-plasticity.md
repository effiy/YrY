---
title: Hybrid ANN-SNN Pipeline with Local Plasticity
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2606.20151
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Denis Larionov, Khairutin Shtanchaev, Mikhail Kiselev, Mikhail Korovin, Ivan
  Tugoy
---

arXiv:2606.20151v2 Announce Type: replace-cross 
Abstract: This work proposes a hybrid ANN-SNN pipeline that effectively leverages the rich embeddings of pretrained artificial neural networks (ANNs) to enable high-performance spiking neural networks (SNNs). The architecture couples a pretrained EfficientNet encoder with a CoLaNET spiking classifier. We convert the encoder's activations into spike trains via rate-coding and train the subsequent SNN classifier using local, biologically inspired learning rules, bypassing end-to-end gradient propagation. This approach achieves 99.09% accuracy on a 64-class ImageNet benchmark, demonstrating performance on par with conventional deep networks. The work presents a biologically plausible and efficient framework for adapting powerful pretrained encoders to downstream spiking neural network tasks.