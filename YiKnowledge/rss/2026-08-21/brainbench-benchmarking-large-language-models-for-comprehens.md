---
title: 'BrainBench: Benchmarking Large Language Models for Comprehensive EEG Understanding'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.04156
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Yangxuan Zhou, Yuning Chen, Chen Wu, Jiquan Wang, Shijian Li, Gang Pan, Sha
  Zhao
---

arXiv:2608.04156v2 Announce Type: replace 
Abstract: Electroencephalography (EEG) analysis extends beyond assigning predefined labels to recordings; it requires workflows connecting natural-language instructions, signal processing, quantitative evidence, and scientific interpretation. We term this capability \emph{comprehensive EEG understanding}. Existing evaluations, however, primarily target isolated decoding tasks or system-specific demonstrations, leaving the competence of large language models (LLMs) insufficiently quantified. We introduce \benchmarkname{}, a unified benchmark for comprehensive, instruction-conditioned EEG understanding. It comprises four subsets---Foundational Analysis, Sleep Assessment, Neurocognitive Assessment, and Physiological Integration---covering 17 datasets, \numcases{} tasks, and over \numinstances{} real-data instances. Given an instruction and EEG recordings with optional physiological signals, a system must perform the analysis and produce a scientifically grounded report and, when required, artifacts. Outputs are assessed through numerical, categorical, set, sequence, semantic, and artifact validation. We evaluate \nummodels{} representative LLMs across more than 100K executions under two paradigms: autonomous code execution with CodeAct and structured agentic analysis with BrainAgent. Results vary substantially across models, subsets, difficulty levels, and execution paradigms, showing that EEG competence depends on the model and its operationalization. \benchmarkname{} provides a reproducible testbed for advancing LLM-based EEG understanding. The code and benchmark will be released soon, with evaluation results continuously updated.