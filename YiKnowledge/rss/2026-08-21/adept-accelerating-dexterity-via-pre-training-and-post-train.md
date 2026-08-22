---
title: 'ADEPT: Accelerating Dexterity via Pre-Training and Post-Training using Reinforcement
  Learning'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.19182
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Jayjun Lee, Jessica Yin, Asif Rana, Nicholas Blauch, Sam Mady, Mohak Bhardwaj,
  Nima Fazeli, Nathan Ratliff, Karl Van Wyk, Ankur Handa
---

arXiv:2608.19182v1 Announce Type: cross 
Abstract: We introduce Accelerating Dexterity via Pre-Training (ADEPT), a large-scale reinforcement learning (RL) framework for learning sim-to-real transferable dexterity across high degree-of-freedom (DoF) robot embodiments that can solve long-horizon tasks directly from raw visuo-tactile perception. ADEPT pretrains a dexterous policy on a generic object reposing task, then post-trains downstream policies with this pretrained behavior as a prior. ADEPT enables learning new behaviors that are otherwise difficult to discover from scratch on multi-fingered robots and avoids learning the same set of skills over again for every new downstream task. The pretrained policy zero-shots the reposing phase of downstream tasks, but na\"ive RL fine-tuning rapidly degrades this capability during transfer. We address this with a stable post-training recipe combining behavior-cloning distillation, critic warm-up, and conservative on-policy updates. To safely exploit the full kinematic dexterity, we introduce a joint-space Geometric Fabric that mediates between the RL policy and the robot. We distill post-trained teachers into perceptive students that zero-shot sim-to-real transfer on two embodiments: a 23 DoF Kuka-Allegro with two RGB cameras, and a 29 DoF Flexiv-Sharpa with two RGB cameras and five vision-based tactile sensors, and can solve long-horizon tasks from challenging initial states with dexterity at human-level speed.