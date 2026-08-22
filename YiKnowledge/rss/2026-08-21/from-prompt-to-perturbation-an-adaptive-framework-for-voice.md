---
title: '`From Prompt to Perturbation'': An Adaptive Framework for Voice-Based Jailbreaks
  on Audio LLMs'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2502.00735
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Linghan Huang, Bo Li, Huaming Chen, Kim-Kwang Raymond Choo
---

arXiv:2502.00735v4 Announce Type: replace-cross 
Abstract: As large language models (LLMs) are increasingly integrated into audio-based applications, growing concerns have emerged regarding their vulnerability to audio-based adversarial attacks. These systems typically follow two architectural paradigms: cascaded pipelines, where automatic speech recognition converts audio inputs into text before LLM processing, and end-to-end large audio-language models (LALMs), which directly interpret raw audio signals. Beyond architectural differences, cascaded pipelines are primarily vulnerable to text-level jailbreak strategies delivered through speech, whereas end-to-end LALMs introduce additional acoustic-semantic attack vectors. However, existing studies often focus on a single paradigm and provide limited coverage of the broader audio attack space. To bridge this gap, we propose an adaptive jailbreak attack framework for systematic evaluation of both cascaded pipelines and LALMs under a unified experimental setting. At its core, the framework uses a feedback-guided mutation engine to automatically generate and refine jailbreak candidates across both textual prompts and audio perturbations, thereby expanding attack diversity and coverage. Experiments on six representative audio-based systems demonstrate that both paradigms remain substantially vulnerable to audio jailbreak attacks. Compared with state-of-the-art methods, our framework achieves consistently higher attack success rates across diverse audio-based LLM systems.