---
title: 'UniVVT: A Unified End-to-End Framework for High-Fidelity Video Virtual Try-on'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.05745
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yushe Cao, Shikun Feng, Fei Shen, Haikuo Peng, Jianqiang Xia, Yiheng Zhu,
  Dianxi Shi, Chun Yu
---

arXiv:2608.05745v2 Announce Type: replace-cross 
Abstract: Video Virtual Try-On (VVT) synthesizes a video of a person wearing a target garment while preserving identity, motion, and scene dynamics. Dominant approaches cast VVT as mask-conditioned video inpainting and rely on separate modules for human parsing, pose estimation, and garment warping. This multi-stage design complicates deployment and, more critically, allows errors in explicit geometric priors to propagate irreversibly into the generated video. We present UniVVT, a unified end-to-end framework that reframes VVT as semantically conditioned video generation, eliminating mask, pose, and warping modules at inference. At its core, a scene-task perceiver built on a Multimodal Large Language Model jointly encodes the source video, target garment, and task instruction into compact, task-aware latent tokens, implicitly capturing what to transfer and where and how to transfer it. A lightweight semantic bridge then aligns these tokens with the conditioning space of a diffusion-based video generator, enabling coherent garment transfer. To robustly couple the heterogeneous components, we devise a three-stage progressive training strategy comprising semantic alignment, joint task adaptation, and flexible-resolution refinement. Extensive experiments demonstrate that UniVVT achieves state-of-the-art performance across multiple benchmarks, validating implicit semantic guidance as a simple and effective alternative to fragile geometric preprocessing for end-to-end virtual try-on.