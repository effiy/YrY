---
title: 'PPE-Bench: A Benchmark for Evaluating MLLM Unlearning under Private-Public
  Entanglement'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2607.02897
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Xianren Zhang, Delvin Ce Zhang, Dongwon Lee, Suhang Wang
---

arXiv:2607.02897v2 Announce Type: replace-cross 
Abstract: Multimodal Large Language Models (MLLMs) have shown strong capabilities, but they may memorize private information from web data, raising privacy concerns. Machine unlearning offers a way to remove such private knowledge without retraining from scratch. However, existing MLLM unlearning benchmarks have two major limitations. First, they rely on simplified images that contain only the single target individual, failing to reflect the visual complexity of real-world photos. Second, they typically assume that the forget set and retain set are fully separated, ignoring the fact that private information is often visually entangled with benign public information. For example, a private individual may appear with a public figure or in front of a well-known landmark, where unlearning the private target should not damage the public context. To address these limitations, we propose PPE-Bench, a new benchmark for evaluating MLLM unlearning under private-public entanglement. Each image contains a target individual to be forgotten and public information to be preserved, including public figure and landmark. We further introduce two simple but effective methods to better preserve public information during unlearning. Through experiments, we find that existing unlearning methods can reduce private information leakage, but often substantially harm adjacent public information.