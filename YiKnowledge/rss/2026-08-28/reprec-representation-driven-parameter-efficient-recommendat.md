---
title: 'REPREC: Representation Driven Parameter-Efficient Recommendation System'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2607.24845
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Harshini Kavuru, Dwipam Katariya, Giri Iyengar, Pranab Mohanty, Kalanand Mishra,
  Raghu Machiraju
---

arXiv:2607.24845v3 Announce Type: replace-cross 
Abstract: Large language models (LLMs) have been applied to sequential recommendation by formulating it as a natural language task. Previous work has improved personalization by incorporating collaborative and sequential signals through input conditioning or LLM fine-tuning. However, existing approaches often rely on one or more of the following: LLM fine-tuning, additional architectural modules, representation distillation, or item-level conditioning over long interaction histories, increasing training complexity and deployment cost. We propose REPREC, a lightweight framework that reformulates LLM-based sequential recommendation through lightweight user representation alignment. REPREC maps a fixed-size user embedding from a frozen sequential encoder into a small set of learned soft tokens through a lightweight MLP injector that conditions a frozen LLM, leaving both pretrained backbones unchanged while training only the injector. We conducted exhaustive experiments on multiple benchmark datasets and demonstrate that REPREC consistently outperforms LoRA while remaining compatible with different pretrained sequential encoders and LLM backbones, enabling a modular and production-friendly recommendation pipeline without modifying either pretrained component. The gains are particularly pronounced for casual and core users across all datasets, highlighting REPREC's effectiveness in low-data regimes. Finally, when trained on short prompt histories and evaluated with longer contexts, REPREC maintains 85-100% of LoRA's performance while reducing per-epoch training time by an average of 1.51X, demonstrating an effective balance between recommendation quality and computational efficiency for production deployment. The code is available at https://github.com/phdbotcode/REPREC