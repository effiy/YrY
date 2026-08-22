---
title: Hybrid Reinforcement Learning and Search for Flight Trajectory Planning
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2509.04100
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Alberto Luise, Michele Lombardi
---

arXiv:2509.04100v3 Announce Type: replace 
Abstract: This paper explores the combination of Reinforcement Learning (RL) and search-based path planners to speed up the optimization of flight paths for airliners, where in case of emergency a fast route re-calculation can be crucial. The fundamental idea is to train an RL Agent to pre-compute near-optimal paths based on location and atmospheric data and use those at runtime to constrain the underlying path planning solver and find a solution within a certain distance from the initial guess. The approach effectively reduces the size of the solver's search space, significantly speeding up route optimization. Although global optimality is not guaranteed, empirical results conducted with Airbus aircraft's performance models show that fuel consumption remains nearly identical to that of an unconstrained solver, with deviations typically within 1%. At the same time, computation speed can be improved by up to 50% as compared to using a conventional solver alone. This paper discusses the theoretical framework, the different implementation strategies, the adopted testing procedures, the obtained results and finally further possible developments and future perspectives.can be improved by up to 50% as compared to using a conventional solver alone.