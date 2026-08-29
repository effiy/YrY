---
title: Recurrent Reinforcement Learning with Memoroids
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2402.09900
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Steven Morad, Chris Lu, Ryan Kortvelesy, Stephan Liwicki, Jakob Foerster,
  Amanda Prorok
---

arXiv:2402.09900v4 Announce Type: replace-cross 
Abstract: Memory models such as Recurrent Neural Networks (RNNs) and Transformers address Partially Observable Markov Decision Processes (POMDPs) by mapping trajectories to latent Markov states. Neither model scales particularly well to long sequences, especially compared to an emerging class of memory models called Linear Recurrent Models. We discover that the recurrent update of these models resembles a monoid, leading us to reformulate existing models using a novel monoid-based framework that we call memoroids. We revisit the traditional approach to batching in recurrent reinforcement learning, highlighting theoretical and empirical deficiencies. We leverage memoroids to propose a batching method that improves sample efficiency, increases the return, and simplifies the implementation of recurrent loss functions in reinforcement learning.