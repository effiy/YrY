---
title: Predicting Consequences and Reinforcing Navigation Policies with Latent World
  Models
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26190
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Zengmao Wang, Wei Gao, Shuhan Shen
---

arXiv:2608.26190v1 Announce Type: new 
Abstract: World models enable agents to reason about future outcomes and learn policies from their knowledge of state transition, but existing approaches primarily focus on reconstructing future observations or features, which introduces unnecessary complexity and limits their effectiveness for decision making. In this work, we propose a compatibility prediction Latent World Model (LWM) for robot navigation that predicts action-conditioned latent feature compatibility rather than reconstructing observations. Our key insight is that spatial proximity correlates with latent feature similarity, enabling action consequences to be evaluated directly in latent space. To support counterfactual training, our model leverages action sequences sampled across trajectories and learns to predict which sequences lead closer to the goal. Furthermore, we demonstrate how the learned world model can supervise policy learning from unlabeled video data and further improve policies through reinforcement learning entirely within the world model. This imagination-driven framework eliminates the need for action annotations and additional environment interaction. Extensive experiments on multiple real-world robot navigation datasets show that our approach significantly outperforms prior world model and imitation learning methods in prediction accuracy, policy learning, and real-world navigation performance. The code, pretrained models, and additional materials are available at https://wzm206.github.io/latent-world-model-nav.