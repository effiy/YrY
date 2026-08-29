---
title: 'CPGRec+: A Balance-oriented Framework for Personalized Video Game Recommendations'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2604.14586
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Xiping Li, Aier Yang, Jianghong Ma, Kangzhe Liu, Shanshan Feng, Haijun Zhang,
  Yi Zhao
---

arXiv:2604.14586v4 Announce Type: replace-cross 
Abstract: The rapid expansion of gaming industry requires advanced recommender systems tailored to its dynamic landscape. Existing Graph Neural Network (GNN)-based methods primarily prioritize accuracy over diversity, overlooking their inherent trade-off. To address this, we previously proposed CPGRec, a balance-oriented gaming recommender system. However, CPGRec fails to account for critical disparities in player-game interactions, which carry varying significance in reflecting players' personal preferences and may exacerbate over-smoothness issues inherent in GNN-based models. Moreover, existing approaches underutilize the reasoning capabilities and extensive knowledge of large language models (LLMs) in addressing these limitations. To bridge this gap, we propose two new modules. First, Preference-informed Edge Reweighting (PER) module assigns signed edge weights to qualitatively distinguish significant player interests and disinterests while then quantitatively measuring preference strength to mitigate over-smoothing in graph convolutions. Second, Preference-informed Representation Generation (PRG) module leverages LLMs to generate contextualized descriptions of games and players by reasoning personal preferences from comparing global and personal interests, thereby refining representations of players and games. Experiments on \textcolor{black}{two Steam datasets} demonstrate CPGRec+'s superior accuracy and diversity over state-of-the-art models. The code is accessible at https://github.com/HsipingLi/CPGRec-Plus.