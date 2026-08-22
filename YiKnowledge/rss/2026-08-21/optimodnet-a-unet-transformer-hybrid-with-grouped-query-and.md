---
title: 'OptiModNet: A UNet-Transformer Hybrid with Grouped-Query and Channel Attention
  for Optic Disc and Cup Segmentation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18516
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Soumili Ghosh, Debapriya Roy, Aryan Das, Bikash Santra
---

arXiv:2608.18516v1 Announce Type: cross 
Abstract: Precise segmentation of the optic disc and cup is critical for the early detection and diagnosis of glaucoma. However, achieving consistently high performance across datasets while maintaining low computational requirements remains a significant challenge. In glaucoma detection, low-computation methods are crucial for enabling rapid, large-scale screening and facilitating deployment in resource-limited clinical environments. While deep learning models such as UNets, Vision Transformers (ViTs), and Diffusion models have demonstrated strong segmentation performance but these methods often come with substantial computational overhead. UNets are efficient at capturing local features but are limited in modeling global contextual information. Conversely, ViTs excel at long-range dependency modeling but are computationally intensive. Hybrid architectures, such as UNetR, which combine transformer-based encoders with UNet-style decoders, have shown improved performance but while incurring additional complexity. Considering these, in this work, we propose OptiModNet, a light weight novel hybrid architecture tailored for optic disc and cup segmentation. The model integrates diverse attention mechanisms at multiple stages of the network to enhance both local and global feature representation. We include an Aggregated Pyramid Loss that supervises predictions at multiple decoder depths, to promote better gradient flow and structural consistency. We evaluate OptiModNet on the REFUGE2 dataset for both optic disc and cup segmentation tasks. Our method achieves state-of-the-art performance, exceeding existing approaches by over 2.5\%, while maintaining high efficiency with only 3.73 GFLOPs and 1.93M parameters. The code is available at https://github.com/SG1947/OptiModNet.