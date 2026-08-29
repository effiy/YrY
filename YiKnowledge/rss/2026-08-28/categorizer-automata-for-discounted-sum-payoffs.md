---
title: Categorizer Automata for Discounted-Sum Payoffs
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26763
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Nathalie Bertrand, Pranav Ghorpade, Senthil Rajasekaran, Sasha Rubin, Moshe
  Vardi
---

arXiv:2608.26763v1 Announce Type: new 
Abstract: Categorizing continuous data into discrete bins is a fundamental operation in artificial intelligence. We introduce the categorizer automaton, a deterministic automaton that reads an infinite sequence of rewards and identifies which of finitely many bins contains its discounted sum. Categorizer automata generalize comparator automata, the special case of two bins, which have already proven useful in quantitative synthesis. Our main technical contribution is the construction of a categorizer automaton whose state space is linear in the number of bins, rather than exponential as obtained by a cross-product of comparator automata. We then apply categorizer automata to Markov decision processes, where they allow one to synthesize policies that maximize the expected utility of a discounted-sum payoff for utility functions that may be discontinuous. For piecewise-constant utility functions, the resulting algorithm is exact and runs in pseudo-polynomial time. For piecewise-Lipschitz utility functions, a class that includes any utility with bounded slope between finitely many jumps, it again runs in pseudo-polynomial time and yields an $\varepsilon$-optimal policy. We also show that the synthesis problem considered is PSPACE-hard already for piecewise-constant utilities.