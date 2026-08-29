---
title: Robust Code RL via Faulty-Code-Driven Test case Synthesis and Dense Reward
  Shaping
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.24135
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yiwen Zhang, Xiaodong Yan, Zhenyu Huang, Deng Zhao, Liang Jiang, Qing Cui,
  Zujie Wen, Zhiqiang Zhang, Jun Zhou
---

arXiv:2608.24135v2 Announce Type: replace 
Abstract: Reinforcement Learning from Verifiable Rewards (RLVR) is pivotal for enhancing LLM code generation, yet its efficacy is often hindered by insufficient test case coverage, leading to reward hacking and policy degradation. To address this, we propose RobustTests, a framework featuring a faulty-code-driven test case synthesis strategy. By leveraging "near-correct" faulty codes, RobustTests captures latent logical discrepancies and employs validator agents with behavioral feature clustering to filter invalid or redundant test cases. Additionally, a stepwise dense reward function based on pass rates is introduced to mitigate false negatives and enhance training robustness. Using this pipeline, we construct an augmented version of the CodeContests+ dataset with superior diagnostic utility. Experimental results show that RL fine-tuning of Qwen3-32B via RobustTests achieves a 3% absolute gain on LiveCodeBench, demonstrating its effectiveness in advancing LLM code generation proficiency. Codes and data are available at https://huggingface.co/datasets/sid6/RobustTests.