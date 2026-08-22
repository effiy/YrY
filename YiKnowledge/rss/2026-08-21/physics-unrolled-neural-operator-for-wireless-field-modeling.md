---
title: Physics-Unrolled Neural Operator for Wireless Field Modeling
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18495
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Rafid Umayer Murshed, Saif Ur Rahman, Mingyue Tang, Elahe Soltanaghai
---

arXiv:2608.18495v1 Announce Type: cross 
Abstract: Radio maps are essential for wireless decision-making tasks such as access-point placement, coverage planning, and localization, but their fine spatial details are governed by complex propagation effects and are costly to simulate accurately. Machine learning offers a path to high-fidelity radio-map prediction without running expensive high-fidelity simulations for every scene. However, generating high-quality training labels at scale is also difficult: the affordable labels come from finite-ray simulations, which are richer than low-fidelity inputs but carry residual Monte Carlo noise. We address this challenge with Physics-Unrolled Hybrid Neural Operator (PU-HNO), a three-stage cascade that predicts high-fidelity indoor radio maps from low-fidelity ray-tracing outputs and scene priors by progressively capturing reflection, diffraction, and scattering effects, rather than treating radio maps as generic images. We prove that, under conditionally unbiased label noise, the model can learn stable propagation structure and outperform its own training labels. Experiments across diverse floorplans show that PU-HNO outperforms image-to-image baselines, wireless learning models, and monolithic neural operators across both image-quality and wireless deployment metrics.