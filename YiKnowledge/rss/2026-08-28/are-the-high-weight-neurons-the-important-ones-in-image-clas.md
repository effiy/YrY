---
title: Are the High-weight Neurons the Important Ones in Image Classification Neural
  Networks?
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2607.25529
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Qitao Chen, Dongfu Yin, Xirui Yang, Zhaoye Li, Liang Xiao
---

arXiv:2607.25529v2 Announce Type: replace 
Abstract: As neural network models for image classification advance, neurons play critical roles in pruning, backdoor defense, and interpretability. Yet existing work lacks clarity on the weight-importance relationship. We address this with a neuron importance assessment method using three experiments: quantifying overlap between high-weight and accuracy-impacting neurons, analyzing high-weight neuron perturbation effects, and testing post-retraining accuracy after high-weight neuron ablation. Experiments on CIFAR-10 and Mini-ImageNet reveal key patterns. Overlap analysis shows top 10\% high-weight neurons overlap with important ones by only about 25\% at maximum, dropping further in subsequent intervals. Perturbation tests find top 10\% high-weight neurons cause 45-80\% accuracy degradation under certain operations compared to 3-7\% for random perturbations, but a third of them show minimal impact. Ablation-retraining results show removing top 10\% high-weight neurons leaves accuracy 10-20\% below baseline with no recovery, while ablating top 0.1\% allows near-full recovery. Notably, some low-weight intervals show 10-17\% degradation when perturbed, comparable to mid-range high-weight neurons. These results confirm not all high-weight neurons are important: their importance is nonlinear. Low-weight neurons also contribute significantly. This challenges weight-importance equivalence, offering refined neuron role insights. It supports applications like encryption prioritizing critical high-weight neurons and pruning removing non-critical ones, advancing neural network analysis.