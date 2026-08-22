---
title: 'BrainWAM: Action-Space Coordination of Semantic Priors and Predictive Dynamics
  for Autonomous Driving'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.12854
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Bing Zhan, Shuyao Shang, Shuo Lu, Yuan Xu, Zhao Wang, Yida Wang, Xueyang Zhang,
  Kun Zhan, Jiahao Gu
---

arXiv:2608.12854v2 Announce Type: replace-cross 
Abstract: Autonomous driving requires planning under both semantic constraints and predictive dynamics. Existing end-to-end driving approaches, however, typically emphasize only one side of this requirement: Vision-Language-Action (VLA) models exploit VLM priors for semantic reasoning, while World Action Models (WAMs) provide future-aware prediction through generative world modeling. This naturally motivates a unified planner that can leverage both semantic priors and predictive dynamics. However, we find that a naive combination through joint token-level attention suffers from an attention-allocation mismatch, where semantic shortcuts dominate the shared attention space and suppress predictive dynamics. Inspired by neuroscience evidence that complex behavior arises from coordination among functionally specialized systems, we propose BrainWAM, a structured action-space coordination framework that converts semantic reasoning and predictive world modeling into two specialized action-oriented pathways, and aligns them at the level of compact action representations. We further introduce an asynchronous rectified-flow inference strategy with decoupled video and action denoising, which shortens inference latency while preserving planning-relevant predictive context. BrainWAM reaches state-of-the-art performance on both NAVSIM v1 (89.5 PDMS) and NAVSIM v2 (89.6 EPDMS), consistently outperforming VLA-only or WAM-only methods, highlighting BrainWAM as a practical and promising direction for autonomous driving systems.