---
title: 'From Accuracy to Robustness: A Study of Rule- and Model-based Verifiers in
  Mathematical Reasoning'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2505.22203
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yuzhen Huang, Weihao Zeng, Xingshan Zeng, Qi Zhu, Junxian He
---

arXiv:2505.22203v3 Announce Type: replace-cross 
Abstract: Trustworthy verifiers are essential for the success of reinforcement learning with verifiable reward (RLVR), which is the core methodology behind various large reasoning models such as DeepSeek-R1. In complex domains like mathematical reasoning, rule-based verifiers have been widely adopted in previous works to train strong reasoning models. However, the reliability of these verifiers and their impact on the RL training process remain poorly understood. In this work, we take mathematical reasoning as a case study and conduct a comprehensive analysis of various verifiers in both static evaluation and RL training scenarios. We show that widely used rule-based verifiers fail to recognize equivalent answers in different formats, leading to substantial false negatives that increasingly hinder RL performance as the policy model gets stronger. Model-based verifiers substantially improve static accuracy but are highly susceptible to reward hacking during RL, where they misclassify certain patterns in responses as correct, particularly after fine-tuning. Our findings underscore the challenges inherent to both rule- and model-based verifiers and provide insights toward developing more accurate and robust reward systems for reinforcement learning.