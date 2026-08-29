---
title: 'AffectOmni: RL-Verifiable People-Centric Grounded Affective Reasoning for
  Social and Art-Related Scenes'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26193
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yibo Wang, Rui Yang, Jisheng Dang, Bimei Wang, Yitao Wu, Pengfei Cao, Wencan
  Zhang, Hong Peng, Bin Hu, Tat-Seng Chua
---

arXiv:2608.26193v1 Announce Type: new 
Abstract: Multimodal large language models (MLLMs) achieve strong performance on VQA and scene understanding, yet affective reasoning remains vulnerable to shortcut behavior. Models may predict correct answers while neglecting people-centric cues such as micro expressions and body language, which weakens traceability and external verification. Prior reinforcement learning approaches mainly reward context or logical coherence without explicitly enforcing attention to human evidence. In addition, LLM as a Judge scoring often suffers from score clustering, which reduces reward discriminability. We propose AffectOmni, a GRPO trained framework for verifiable affective reasoning. AffectOmni introduces People Focus and Temporal Order rewards to encourage people-centric evidence selection and temporally structured reasoning, and it adopts within-group comparative scoring to produce more stable and discriminative reward signals. For verification, a Thinking Summarizer converts free form rationales into executable evidence instructions, which are grounded into pixel level evidence regions via SAM3 to provide an externally auditable interface outside the training loop. Experiments on IntentBench, Daily Omni, and WorldSense show consistent improvements over open source 7B scale baselines, including gains of 4.66% on emotion recognition and +14.29% on temporally sensitive tasks. Code is available at https://github.com/eliot127825-rgb/AffectOmni_nobody.