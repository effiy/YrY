---
title: 'PGFS++: Molecular Property Improvement under Synthesis and Diversity Constraints'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.19121
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Boqiao Zhang, Godbless James, Sai Krishna Gottipati, Andrew Fitzgibbon
---

arXiv:2608.19121v1 Announce Type: cross 
Abstract: Improving molecular properties, such as drug-likeness or binding affinity, is a recurring task in early-stage drug discovery. However, molecules optimized in an unconstrained chemical space have limited practical value if they cannot be synthesized. Policy Gradient for Forward Synthesis (PGFS) is a synthesis-aware reinforcement learning method for molecular improvement, but its use of reactant embedding prediction makes reactant selection indirect, which, as we show, limits learning effectiveness. We first develop PGFS+, in which reaction templates and second reactants are represented by trainable embedding lookup tables. Combined with a more effective scoring function and RL algorithm, PGFS+ significantly improves the desired property. However, it exposes a reward-hacking failure mode: a powerful reactant search can map diverse input molecules to the same high-reward magnet molecule, improving the reward while collapsing the output diversity. We therefore introduce PGFS++, a synthesis-aware reinforcement learning framework for input-specific molecular improvement. Given an input molecule, PGFS++ treats it as the start of a forward-synthesis trajectory, applies learned reaction templates with compatible in-stock building blocks, and produces a molecule with improved target properties, an explicit synthesis route, and structural similarity to the input. Experiments on molecular improvement tasks show that PGFS++ improves target properties while preserving high output diversity.