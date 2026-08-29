---
title: 'HybridProver: Augmenting Theorem Proving with LLM-Driven Proof Synthesis and
  Refinement'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2505.15740
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Jilin Hu, Jianyu Zhang, Yongwang Zhao, Talia Ringer
---

arXiv:2505.15740v2 Announce Type: replace-cross 
Abstract: Formal methods play a crucial role in ensuring the reliability of critical systems through rigorous mathematical verification. However, their adoption remains limited due to the labor-intensive nature of manual proof construction. Recent advances in large language models (LLMs) have opened new opportunities for automated theorem proving. Two main paradigms have emerged: stepwise tactic-based generation and whole-proof synthesis. While both approaches have complementary strengths, existing work largely treats them in isolation. In this work, we propose HybridProver, a unified framework that integrates whole-proof synthesis and tactic-based generation through proof sketches as an intermediate representation. This design enables the reuse of partially correct proof structures while effectively combining high-level planning with fine-grained reasoning. We implement HybridProver in Isabelle/HOL and post-train two 7B-scale LLMs on our optimized Isabelle datasets. Experiments on the miniF2F Isabelle benchmark achieved a 73.8% success rate and improved upon the previous state of the art (61.9%), demonstrating that lightweight models, when combined with our approach, can effectively generate Isabelle/HOL proofs without relying on very large LLMs. Ablation studies further analyze the impact of dataset quality, training configurations, and sampling strategies on proof generation.