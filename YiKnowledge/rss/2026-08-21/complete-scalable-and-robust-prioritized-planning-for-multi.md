---
title: Complete, Scalable, and Robust Prioritized Planning for Multi-Robot Ordered
  Storage and Retrieval at Maximum Capacity
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.07734
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: William Zhang, Tzvika Geft, Jingjin Yu, Kostas Bekris
---

arXiv:2608.07734v2 Announce Type: replace-cross 
Abstract: Automated warehouses face a fundamental trade-off between maximizing storage density and achieving high retrieval throughput. While puzzle-based storage (PBS) architectures increase capacity by eliminating aisles, coordinating multiple robots in these high-density spaces is computationally challenging. This paper formalizes the challenge through a novel multi-robot problem formulation for ordered storage and retrieval: We consider rectangular 2D grids, where uniform-sized loads are first stored, up to full capacity, and subsequently retrieved according to prescribed arrival and departure sequences. The main contribution of this work is an online prioritized multi-agent path planning algorithm for this problem. The algorithm builds on prior work that constructs arrangements supporting sequential storage and retrieval, i.e., of one load at a time, without relocating loads. By exploiting the structural invariants of such arrangements, we achieve the scalability of decoupled planning while guaranteeing complete, deadlock-free parallel execution even at full storage density. Experiments demonstrate that the algorithm achieves near-linear improvement in makespan with respect to the number of robots, up to $C$ robots, where $C$ is the width of the grid's open side. Furthermore, the algorithm supports robust storage arrangements that accommodate bounded uncertainty in the departure sequence, with negligible impact on execution makespan.