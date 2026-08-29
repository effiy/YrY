---
title: 'Residual Reward Models: Leveraging Prior Knowledge for Efficient Preference-based
  Reinforcement Learning in Robotics'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2507.00611
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Chenyang Cao, Miguel Rogel-Garc\'ia, Mohamed Nabail, Xueqian Wang, Nicholas
  Rhinehart
---

arXiv:2507.00611v2 Announce Type: replace-cross 
Abstract: Preference-based Reinforcement Learning (PbRL) provides a promising alternative to heuristic reward design in complex robotic environments. However, PbRL often suffers from poor sample efficiency, requiring extensive and costly human feedback, which limits its real-world applicability. Prior work has proposed learning a reward model from demonstrations and fine-tuning it using preferences. However, when the model is a neural network, transitioning between different loss functions across training phases often leads to unstable optimization and performance degradation. In this paper, we propose a method to effectively leverage prior knowledge with a Residual Reward Model (RRM). An RRM assumes that the true reward of the environment can be split into a sum of two parts: a prior reward and a learned reward. The prior reward is a term available before training, such as an engineering heuristic ``best guess'', a language-generated reward, or a reward function learned from inverse reinforcement learning, and the learned reward is then trained with preferences as a residual offset. Experimental results in Meta-World and DM-Control show that RRMs substantially improve the sample efficiency of common PbRL methods across various prior reward types. Furthermore, we demonstrate the practical efficacy of our method on a physical Franka Panda robot, accelerating policy learning and achieving high success rates in fewer steps than baselines.