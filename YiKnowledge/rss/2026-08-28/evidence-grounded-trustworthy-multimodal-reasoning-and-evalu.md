---
title: Evidence-Grounded Trustworthy Multimodal Reasoning and Evaluation Benchmark
  in Complex Urban Scenes
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.10954
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Zhaoyang Wei, Bowen Jiang, Xumeng Han, Jiashu Li, Xuehui Yu, Yuling Liu, Guorong
  Li, Zhenjun Han, Jianbin Jiao
---

arXiv:2608.10954v2 Announce Type: replace-cross 
Abstract: While Multimodal Large Language Models (MLLMs) demonstrate impressive performance in benign scenarios, their cognitive reliability deteriorates significantly in complex scenes under adverse conditions. In these settings, models often rely on implicit inference without sufficient visual evidence, leading to a disconnect between perception and reasoning. Meanwhile, existing outcome-oriented benchmarks evaluate only final predictions and fail to diagnose failures in the underlying reasoning process. To address this gap, the authors propose AD2-Bench, which introduces a Hierarchical Visual Diagnosis framework that decomposes reasoning into a structured Chain of Evidence (CoE). This fine-grained diagnosis reveals that robust multimodal reasoning fundamentally depends on accurate evidence acquisition. Building on this perspective, the authors formulate reasoning from a probabilistic viewpoint and identify two primary causes of reasoning failure: Spatial Ambiguity, where models fail to distinguish target objects from background clutter, resulting in localization errors; and Semantic Uncertainty, where degraded visual features lead to incorrect semantic interpretation, resulting in understanding errors. To overcome these evidence deficiencies, they further propose Evidence-grounded Visual Reasoning (EGVOR), which replaces implicit reasoning with the explicit generation of Evidence Atoms - structured spatial-semantic triplets that enforce tight alignment between localization and semantic understanding. The model is trained through a hierarchical curriculum that progresses from reflective supervision construction to reinforcement learning, where reducing reasoning variance is explicitly rewarded. Extensive experiments demonstrate that EGVOR substantially improves reasoning stability under adverse conditions, providing a more robust framework for trustworthy multimodal cognition.