---
title: 'GSM8K-V: Can Vision Language Models Solve Grade School Math Word Problems
  in Visual Contexts'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2509.25160
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Fan Yuan, Yuchen Yan, Yifan Jiang, Haoran Zhao, Tao Feng, Jinyan Chen, Yanwei
  Lou, Wenqi Zhang, Weiming Lu, Jun Xiao, Yueting Zhuang, Yongliang Shen
---

arXiv:2509.25160v2 Announce Type: replace-cross 
Abstract: Mathematical reasoning is a key capability for vision-language models (VLMs), yet current benchmarks mainly evaluate text-based or explicitly symbolic visual inputs. It remains unclear whether VLMs can reason mathematically when information must be perceived and inferred from images rather than read from explicit symbols. We introduce GSM8K-V, a benchmark transforming GSM8K into multi-image sequences with semantic equivalence preserved. By mapping text-based problems into visual form via an automated pipeline and human verification, we curate 1,319 high-quality samples. In GSM8K-V, quantities must be extracted through visual perception, and reasoning chains must be reconstructed by integrating implicit cues across scenes. Evaluation of 34 VLMs reveals a striking modality gap: while most models exceed 90\% on text, the best model achieves only 59\% on GSM8K-V, far below the 91\% human accuracy. Notably, models enhanced for visual math reasoning show no improvement on GSM8K-V despite large gains on existing benchmarks, confirming that it evaluates a distinct capability. Error analysis shows that the primary bottleneck lies in Implicit Visual Inference Error (IVIE), where models fail to recover visual semantics that are implied rather than explicitly stated. Our code and data are released at https://github.com/ZJU-REAL/GSM8K-V.