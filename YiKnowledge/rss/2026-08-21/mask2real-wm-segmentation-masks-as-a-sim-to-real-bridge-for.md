---
title: 'Mask2Real-WM: Segmentation Masks as a Sim-to-Real Bridge for Controllable
  Dexterous World Models'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2607.04546
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Riccardo O. Feingold, Davide Liconti, Chenyu Yang, Robert K. Katzschmann
---

arXiv:2607.04546v2 Announce Type: replace-cross 
Abstract: Action-conditioned world models allow robots to predict the future consequences of candidate actions without additional physical interaction, supporting policy evaluation, planning, and data augmentation. We present Mask2Real-WM, a two-stage action-conditioned world model for dexterous manipulation that decouples pixel prediction into a dynamics model and a rendering model. The dynamics model predicts future segmentation masks from past masks and 23-DoF action sequences. The rendering model maps the predicted masks to photorealistic RGB using a ControlNet-augmented Stable Video Diffusion backbone. The smaller sim-to-real gap in segmentation space enables the dynamics model to benefit from large-scale pretraining on over 50 h of synthetic simulation data, followed by fine-tuning on fewer than 2.5 h of real demonstrations. Experiments on a dexterous pick-and-place benchmark show that mask conditioning and simulation pretraining are both required for per-DoF action controllability across all 23 degrees of freedom. In contrast, monolithic baselines capture broad hand and end-effector trajectories but do not reliably reflect fine-grained, per-joint action effects.