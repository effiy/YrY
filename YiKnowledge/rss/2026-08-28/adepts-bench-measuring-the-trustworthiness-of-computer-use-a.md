---
title: 'ADeptS-Bench: Measuring the Trustworthiness of Computer Use Agents Across
  Devices'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26204
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Joy Chen, Alejandro Castillejo Munoz, Pierluca D'Oro, Yuxuan Sun, Chloe Evans,
  Joseph Tighe
---

arXiv:2608.26204v1 Announce Type: cross 
Abstract: Computer Use Agents (CUAs) are increasingly deployed to navigate mobile and desktop applications on behalf of users, yet no benchmark comprehensively evaluates whether they can safely interact with visual interfaces while handling ambiguous instructions. We introduce ADeptS-Bench, a dual-stream trustworthiness benchmark, grounded in the ADEPTS capability framework and general population user studies. The Safety stream provides paired benign/malicious tasks with threats embedded in the visual interface. The Disambiguation stream evaluates whether agents seek clarification when intent is ambiguous. Evaluating seven models reveals that no model consistently exceeds 80% task success while staying below 30% attack success; every model clicks "Checkout" on a $25K order without hesitation, and none detects that a "factory reset" button is mislabeled as "Optimize." An ablation reveals three distinct safety architectures: tool-dependent (ASR +21-23pp without refusal tool), partially tool-dependent (+10-11pp), and no mechanism (unchanged). In disambiguation, all models overestimate consequence severity, mirroring the over-refusal bias observed in safety. We release all data, evaluation code, and analysis tools upon publication.