---
title: 'PICasso: An AI-Enabled Design Framework for Autonomous Optimization of Silicon
  Photonic Devices'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26113
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Deepak Vungarala, Deniz Najafi, Abdulrahman Aljoudi, Zahra Ghanaatian, Navid
  Khoshavi, Gourav Datta, Arman Roohi, Mahdi Nikdast, Shaahin Angizi
---

arXiv:2608.26113v1 Announce Type: new 
Abstract: We present PICasso, an AI-assisted framework for automated synthesis, verification, and optimization of photonic integrated circuits (PICs) from natural-language specifications. PICasso couples a structured NL -> YAML -> GDS generation pipeline with PDK aware knowledge injection, automated placement and routing, DRC/LVS validation, and SAX-based photonic simulation. To systematically evaluate AI-driven photonic design, we introduce PIC-Set, a benchmark of 36 parameterized PIC design tasks spanning core photonic primitives and multi-component circuits. Using PIC-Set, we benchmark several state-of-the-art Large Language Models (LLMs) under a unified evaluation protocol, including new metrics such as structural and functional $Spec@k$, optimization efficiency, and robustness under perturbations. Across the benchmark, PICasso significantly improves end-to-end specification satisfaction compared to vanilla LLM generation. Structural $Spec@3$ reaches up to 92.7% and functional $Spec@3$ up to 52% on high-complexity circuits. In addition, PICasso consistently reduces circuit insertion loss, lowering the mean loss from 4.98 dB to 3.25 dB (1.74 dB improvement) through simulation-guided optimization. These results demonstrate that structured domain constraints, physical verification, and simulation feedback transform LLMs from brittle netlist generators into practical PIC design agents capable of producing manufacturable layouts with competitive runtimes relative to manual GUI-based workflows.