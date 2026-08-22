---
title: Graphical Design of Interpretable Architectures
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18936
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Pietro Barbiero
---

arXiv:2608.18936v2 Announce Type: cross 
Abstract: Designing, implementing, and comparing interpretable architectures requires a formal language to represent them. The most common representations fall short in one of two ways. Symbolic equations give no global view of an architecture at a glance. Probabilistic graphical models and flowcharts do not describe actual tensor manipulations, thus hiding key insights and limiting reproducibility. To close this gap, we introduce a graphical notation for designing interpretable AI architectures, adapted from Penrose tensor notation. This graphical notation gives a global view of an architecture and maps one to one onto PyTorch einsum code. We first use this notation to describe architectures that are interpretable by construction, including concept bottlenecks, sparse probes, prototype networks, neural additive models, and mixtures of linear models. We then diagram the key architectural components of Steerling-8B, a frontier interpretable language model. The diagram yields global insights into the architecture (e.g., showing that Steerling is a residual model), a geometric interpretation of each individual operation, and a direct translation into 33 lines of PyTorch code.