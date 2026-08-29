---
title: 'Self-Generated Text Recognition: Quality Heuristics, Cross-Task Transfer,
  and Downstream Bias in LLM Evaluation'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26159
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Jesse St. Amand, Callum Canavan, Sohaib Imran, Joseph Hewson, Aaron Lutz,
  Shi Feng, Puria Radmard, Lennie Wells
---

arXiv:2608.26159v1 Announce Type: cross 
Abstract: Self-Generated Text Recognition (SGTR)--the ability of an LLM to identify its own outputs--poses risks to AI safeguards that rely on LLMs as evaluators or monitors. Specifically, an LLM may recognize outputs from other copies of the same model and make biased judgments or collude outright. Prior work has drawn conflicting conclusions about whether current models possess significant SGTR capabilities. We reconcile these findings by identifying key experimental design choices--which we term operationalizations--that drive divergent results. Evaluating 13-21 models across six operationalizations, we find that accuracy varies substantially with evaluation format (pairwise vs. individual assessments of text), conversation structure (presenting candidate text in user tags vs. assistant tags), and the domain of the task used to generate candidate text (e.g., coding vs. summarization). We corroborate previous observations that a quality heuristic--models attributing authorship to text they perceive as higher quality--is a dominant confound. We also find that improving a model's SGTR performance via SFT in one evaluation configuration can generalize to others. Training for SGTR additionally causes models to prefer their own outputs when acting as a judge in the AlpacaEval framework. Finally, we discuss the implications of our evaluations for the safety of future AI systems: our work suggests that, despite confounds, some models possess practical SGTR capabilities, and that training a model for SGTR in one setting can affect its self-recognition and self-preference more generally. We conclude that SGTR should be monitored and considered in the design of safety-critical AI applications.