---
title: 'CounterVid: Counterfactual Video Generation for Mitigating Action and Temporal
  Hallucinations in Video-Language Models'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2601.04778
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Tobia Poppi, Burak Uzkent, Amanmeet Garg, Lucas Porto, Garin Kessler, Yezhou
  Yang, Marcella Cornia, Lorenzo Baraldi, Rita Cucchiara, Florian Schiffers
---

arXiv:2601.04778v2 Announce Type: replace-cross 
Abstract: Video-language models (VLMs) achieve strong multimodal understanding but remain prone to hallucinations, especially when reasoning about actions and temporal order. Existing mitigation strategies, such as textual filtering or random video perturbations, often fail to address the root cause: over-reliance on language priors rather than fine-grained visual dynamics. We propose a scalable framework for counterfactual video generation that synthesizes videos differing only in actions or temporal structure while preserving scene context. Our pipeline combines multimodal LLMs for action proposal and editing guidance with diffusion-based image and video models to generate semantic hard negatives at scale. Using this framework, we build CounterVid, a synthetic dataset of ~26k preference pairs constructed from short counterfactual action clips and targeting both action recognition and controlled action-sequence ordering. We further introduce MixDPO, a unified Direct Preference Optimization approach that jointly leverages textual and visual preferences. Across Qwen2.5-VL and InternVL3 backbones, MixDPO substantially improves action recognition and temporal ordering, yields gains on most standard video hallucination benchmarks, and largely preserves general video understanding. Our source code, trained models, and dataset are available at https://aimagelab.github.io/CounterVid.