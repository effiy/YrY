---
title: 'Physics-Informed Stochastic Configuration Machine: A Backpropagation-Free
  Neural Network with Fast Training for Nonlinear Differential Equations'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26549
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yuehao Song (School of Automation, Central South University, Changsha, China),
  Zhong Chen (School of Automation, Central South University, Changsha, China), Lihui
  Cen (School of Automation, Central South University, Changsha, China), Liang Wu
  (Johns Hopkins University, Baltimore, USA), Kai Zhang (State Key Laboratory of Simulation
  and Regulation of Water Cycle in River Basin, China Institute of Water Resources
  and Hydropower Research, Beijing, China)
---

arXiv:2608.26549v1 Announce Type: cross 
Abstract: While Physics-Informed Neural Networks (PINNs) have emerged as a transformative paradigm for solving complex differential equations, their reliance on backpropagation-based gradient descent and automatic differentiation (AD) imposes significant computational bottlenecks and severe non-convex optimization challenges. To overcome these fundamental limitations, we propose the Physics-Informed Stochastic Configuration Machine (PI-SCM), a novel backpropagation-free framework for both forward and inverse problems in differential equations. The core mathematical contribution lies in the analytical evaluation of local Jacobians for nonlinear differential operators, which facilitates a linearized representation of the physical loss and projects it into a unified, linearized algebraic subspace. This reformulation allows for the explicit determination of optimal network weights via a sequence of generalized linear least squares solvers, effectively bypassing the iterative traps of traditional nonlinear optimizers. We develop a progressive algorithmic suite comprising localized construction (PI-SC-I), sliding-window updating (PI-SC-II), and global updating (PI-SC-III), and rigorously establish their universal approximation properties. Extensive experiments demonstrate that PI-SCM achieves high-fidelity predictive accuracy and robust parameter identification while accelerating the training process by orders of magnitude compared to standard PINNs. Our work provides a highly efficient and scalable foundation for next-generation, real-time Scientific Machine Learning applications.