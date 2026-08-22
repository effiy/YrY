---
title: 'ORBITER: Conflict-Aware Decision-Making for Agentic Last-Mile Delivery'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18846
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Mingzhao Li, Chenxi Liu, Yan Zhao, Hao Miao
---

arXiv:2608.18846v1 Announce Type: new 
Abstract: Last-mile delivery aims to handle dynamically arriving orders with couriers while modeling complex spatial and temporal correlations. Recent learning-based methods model spatiotemporal dependencies among orders to predict courier service sequences, but leave next-order decision making unexplained. Describing the current delivery state in language allows LLMs to reason explicitly about the spatial, temporal, and behavioral cues behind an individual decision. As direct predictors, however, LLMs remain sensitive to task presentation and often produce unreliable decisions. To address these challenges, we introduce ORBITER, an agentic Order Arbiter for next-order decision-making in last-mile delivery. ORBITER models courier service through decision points, each containing the courier's spatiotemporal state and visible orders and exposing local trade-offs for modeling and verification. Fixed proposers rank the candidates, and a structured report identifies where their rankings disagree. The LLM uses task-specific tools to gather evidence on the leading alternatives, while an independent critic checks the resulting decision against that evidence. We conduct extensive evaluations on data in four cities, where ORBITER outperforms existing state-of-the-art baselines by up to 9.2% on average showing its effectiveness.