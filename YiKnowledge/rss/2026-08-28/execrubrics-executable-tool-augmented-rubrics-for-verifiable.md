---
title: 'ExecRubrics: Executable Tool-Augmented Rubrics for Verifiable and Efficient
  Long-Form Evaluation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.22559
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Kaustubh D. Dhole, Charles L. A. Clarke, Eugene Y. Agichtein
---

arXiv:2608.22559v2 Announce Type: replace 
Abstract: Rubrics aim to make language-model evaluation transparent by decomposing response quality into interpretable criteria. However, natural-language rubrics are often ambiguous, require black-box LLM judges, and typically assume criteria aggregate independently through linear weighted sums, limiting their ability to capture dependencies, alternatives, penalties, and override conditions. We propose ExecRubrics, a framework for representing rubrics as compact executable programs. ExecRubrics encodes evaluation logic as verifiable Python scoring functions, giving natural-language rubric intent an operational semantics: a fixed decision procedure that can be inspected, executed, and edited. On three long-form response benchmarks-HealthBench, HelpSteer, and ArgQuality-we show that ExecRubrics can substitute for expensive black-box judges in ranking preferred over dispreferred responses, matching or improving NL rubric baselines with best preference accuracies of 52.9%, 75.3%, and 91.5%, respectively, while reducing evaluation latency by a large margin. We show that incorporating external logic and resources from text processing libraries such as NLTK and spaCy can further improve preference accuracy. Our results suggest a novel way of looking at evaluation, by offering a faster, more explainable and less ambiguous alternative to black-box rubric evaluation, particularly in high-stakes domains such as healthcare and banking where precision and auditability are critical.