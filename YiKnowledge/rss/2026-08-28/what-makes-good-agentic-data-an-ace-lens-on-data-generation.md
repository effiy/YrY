---
title: What Makes Good Agentic Data? An ACE Lens on Data Generation for LLM Agents
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27260
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Xingshan Zeng, Zishan Xu, Boju Zhang, Yuzhou Wu, Lingzhi Wang, Jianghao Lin,
  Liangyou Li, Yasheng Wang, Lifeng Shang, Xin Jiang, Weinan Zhang, Yong Yu, Qun Liu,
  Weiwen Liu
---

arXiv:2608.27260v1 Announce Type: new 
Abstract: LLM agents increasingly rely on generated interaction data to learn how to interact with external environments. Agentic data generation must maintain consistency among environments, tasks, interactions, and success signals while producing experience that is useful rather than merely abundant. Existing work spans many agent domains, but domain-centered organization and heterogeneous evaluation often obscure common generation mechanisms and conflate candidate construction with verification and selection. This work develops a two-level framework for the field. First, we represent agentic data as a common factorized object $(E,q,\tau,v)$, comprising an environment specification, task signal, interaction realization, and optional verifier. We organize generation paradigms by their primary anchor and dependency structure. Second, we formulate generation as constrained distribution design through the Accuracy-Complexity-divErsity (ACE) lens. Accuracy establishes the feasible support of grounded and internally consistent data. Within this support, Complexity places learning mass relative to the capability of a declared learner and execution configuration, while divErsity controls coverage and redundancy of data. Using this framework, we explore how prior work verifies generated experience, constructs and calibrates difficulty, and expands behavioral coverage. The literature reveals a shift toward execution-grounded accuracy, learner-relative complexity, and diversity beyond surface variation or dataset size. We further discuss broader directions and emerging trends in agentic data generation through the ACE lens, including their implications for scaling, data sources, training regimes and adaptive learning. Overall, the central challenge is not simply to generate more data, but to continually allocate valid, informative, and non-redundant experience as agents and environments evolve.