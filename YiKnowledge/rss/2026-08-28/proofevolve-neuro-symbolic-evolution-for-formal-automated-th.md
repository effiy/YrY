---
title: 'ProofEvolve: Neuro-Symbolic Evolution for Formal Automated Theorem Proving'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26334
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Wenqian Ye, Ziwei Guan, Eric Xie, Bohan Liu, Shivani Modi, Buyun Zhang, Ellie
  Dingqiao Wen, Henry Kautz, Aidong Zhang
---

arXiv:2608.26334v1 Announce Type: new 
Abstract: Automated theorem proving offers a natural foundation for recursive self-improvement in scientific discovery. However, existing neural provers do not fully preserve this recursive structure, where the learning process should be self-improving over time. Existing methods either embed proof experience into model parameters through expensive weight updates, or keep verified intermediate deductions only within the current problem. In addition, these methods also heavily rely on sparse whole-proof feedback, even when unsuccessful partial attempts contain useful discoveries. To close the gap, we propose ProofEvolve, a neuro-symbolic framework that evolves explicit, formally verified symbolic proof structures with neural models to decisively expand the knowledge boundary. In this framework, the neural model proposes variation operators, including decompositions, repairs, and schema recombinations. The symbolic Lean kernel verifies every proof transition. Over the evolution loops, ProofEvolve computes verified closure over the resulting proof directed acyclic graphs (DAGs). Within each problem, ProofEvolve evolves partial AND-OR proof DAGs in a behaviorally indexed archive. Across problems, kernel-checked schema extraction adds newly proved sub-DAGs to a persistent schema library. Proof DAGs inherit the solved results through typed schema recombination, with every residual premise exposed as a new subgoal. This evolutionary process preserves verified results from incomplete attempts and makes them available for later proofs without weakening formal soundness. Across three competition-level Lean benchmarks, ProofEvolve achieves the highest average solve rate among the evaluated proof systems.