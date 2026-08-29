---
title: 'LeVJEPA: Efficient & Scalable Video Pretraining without the Heuristics'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27395
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Lukas Kuhn, Lucas Maes, Giuseppe Serra, Quentin Le Lidec, Yann LeCun, Randall
  Balestriero, Florian Buettner
---

arXiv:2608.27395v1 Announce Type: cross 
Abstract: Video carries the temporal structure of the physical world, yet learning representations from it has remained computationally expensive: prevailing self-supervised methods either prevent representation collapse through architectural asymmetries, coupling an exponential-moving-average target encoder, a stop-gradient, and a capacity-limited predictor, or circumvent it by reconstructing masked content in pixel space. We introduce LeVJEPA, the first video encoder trained under LeJEPA's collapse-free objective, which dispenses with both. A single encoder is trained with an invariance loss over global and local views of a clip, regularized by SIGReg, which excludes collapse with a provable guarantee. The architecture reduces to an encoder and a projector, and the objective to a single hyperparameter. This formulation admits two properties. First, the cost of pretraining is governed by the number of tokens the encoder observes; uniform random token dropping renders this number small while simultaneously improving downstream accuracy. At matched epochs on identical data, LeVJEPA matches or surpasses V-JEPA 2 across ViT-S/B/L at 5.6 to 20.8x less pretraining compute, and at matched total FLOPs it exceeds the strongest video baseline by 7.6 points on ImageNet-1K while remaining competitive on motion-centric benchmarks. Second, since no asymmetry between branches is required, the encoder can be trained with block-causal attention at no measurable accuracy cost: temporal ordering becomes a property of the encoder itself. Against a compute-matched DINOv2 trained on frames of the same videos, LeVJEPA approaches the image-pretrained encoder on appearance-centric evaluation while nearly doubling its motion-centric accuracy. These results indicate that, once its computational overhead is removed, video becomes a viable and in several respects preferable substrate for general-purpose visual pretraining.