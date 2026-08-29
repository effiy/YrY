---
title: 'Beyond Execution: Auditing Experimental Fidelity in LLM-Driven Scientific
  Research'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26753
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Lezhi Yu, Xiaogang Xu, Yuhua Zhou, Shuibing He, Aimin Pan
---

arXiv:2608.26753v1 Announce Type: cross 
Abstract: LLM agents used for scientific experimentation must do more than generate executable code: they must implement the reference method faithfully, design experiments that test the paper's claims, and provide evidence supporting those claims. We show that agents often produce methodological hallucinations: silently reducing datasets or training budgets, replacing failed learning or generative components with lookup or oracle functions, or drawing conclusions from resource-limited settings where a method's claimed advantage disappears. To detect these failures, we introduce ABE-Ralph, a reference-anchored auditing framework that represents claims, protocols, required components, baselines, and metrics as structured experimental constraints, guides implementation through an 8-step workflow, and performs quantitative, qualitative, and code-level verification. Across 30 long-horizon reproduction runs covering 12 machine learning domains, ABE-Ralph achieves a 93% robust execution rate and identifies five scientific failure modes. In 23 NatureBench discovery tasks, ABE-Ralph matches or exceeds state-of-the-art performance on 5 tasks. These results show that reliable evaluation of AI scientists must assess whether the experimental design faithfully tests the intended claim and whether the resulting evidence supports it, rather than treating code execution or plausible metrics as evidence of scientific success.