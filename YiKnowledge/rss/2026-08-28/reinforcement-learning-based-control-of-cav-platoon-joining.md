---
title: Reinforcement Learning-Based Control of CAV Platoon Joining Maneuvers in Mixed
  Traffic
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26860
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Biao Yin, Abderrahmane Kasmi, Nadir Farhi
---

arXiv:2608.26860v1 Announce Type: cross 
Abstract: Connected and automated vehicle (CAV) platooning offers a promising approach to improving road safety and traffic capacity. However, platoon control in real-world traffic is challenging due to uncertainty and heterogeneous driving behaviors. Reinforcement learning (RL) has strong potential for addressing such control problems, but its practical deployment raises challenges related to safety and learning efficiency. This paper proposes a generic modeling and simulation framework for investigating CAV platoon joining maneuvers and comparing deep reinforcement learning (DRL)-based control algorithms. The problem is particularly challenging in mixed-traffic environments, where CAVs coexist with human-driven vehicles exhibiting heterogeneous longitudinal and lateral behaviors. The objective is to achieve safe and efficient joining maneuvers by either incorporating penalties for risky behaviors into the learning process or using an external safety controller to constrain the learned policy. An agent-based modeling framework coupled with the Simulation of Urban MObility (SUMO) simulator is used to evaluate Deep Q-Network (DQN), Double Deep Q-Network (DDQN), and Proximal Policy Optimization (PPO). Results show that PPO outperforms DQN and DDQN, achieving a joining success rate of approximately 98 % and a collision rate below 1 %, largely due to risk-related penalties incorporated into the reward function. However, this improved performance requires more decision steps to complete the maneuver, revealing a trade-off between safety, joining effectiveness, and decision efficiency. An external safety controller effectively prevents collisions, although its interventions may reduce joining efficiency. The results highlight the importance of jointly considering safety and efficiency when designing RL-based controllers for CAV platoon joining in mixed traffic.