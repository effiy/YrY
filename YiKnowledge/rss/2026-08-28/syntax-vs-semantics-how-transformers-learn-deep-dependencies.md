---
title: 'Syntax vs. Semantics: How Transformers Learn Deep Dependencies'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26139
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Jiangrui Zhao, Xiaoting Du
---

arXiv:2608.26139v1 Announce Type: cross 
Abstract: Large Language Models demonstrate remarkable syntactic fluency, yet the optimization dynamics governing their acquisition of deep semantic dependencies remain poorly understood. We propose a mechanistic framework that models this learning process as a competition between Surface Statistics and Deep Semantics. Our theoretical analysis identifies a ``Gradient Starvation" phenomenon where the error signals for sparse semantic dependencies are actively suppressed during early optimization. This suppression impedes the learning of structural reasoning and causes its emergence to manifest as a sudden phase transition. Furthermore, this framework offers a mechanistic basis for the effectiveness of Chain-of-Thought (CoT) strategies. By externalizing intermediate reasoning steps into concrete tokens, CoT effectively bypasses the suppression regime inherent to implicit reasoning. We validate these findings across scales ranging from toy transformers to production models (Llama-3.1-8B, Qwen2.5-Coder-7B). Finally, guided by this theory, we propose a topology-aligned contrastive objective that explicitly rectifies the gradient geometry. Experiments on variable binding tasks demonstrate that our method achieves an improvement that is over 2x larger than that obtained via standard cross-entropy fine-tuning.