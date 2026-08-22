---
title: What Makes Software Issue Resolution Tasks Difficult for Agents?
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18280
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Ebtesam Al-Haque, Brittany Johnson
---

arXiv:2608.18280v1 Announce Type: cross 
Abstract: Background. Advances in agentic systems are simultaneously, and rapidly, saturating benchmarks. Despite this often discussed phenomena, benchmark scores remain difficult to interpret due to the lack of control and characterization of task difficulty. More specifically, we currently have little understanding of what makes one task harder than another, and to what extent task difficulty is predictable from static task properties. Aims. We propose a measurement framework to investigate and systematically quantify what structural properties of software tasks correspond to agent success rates for issue resolution tasks. Method. We conducted a large scale empirical study on CoderForge-Preview, the largest open dataset of coding agent trajectories to date, by extracting features across task patch, repository and prompt. We evaluated the predictive power of each feature against task outcomes using ensemble methods, SHAP attribution, and effect size analysis. Results We found that task difficulty is substantially predictable from static features (AU C = 0.863) and is largely driven by patch fragmentation and repository scale. Prompt linguistic features become visible among top contributors for tasks in the mid-band, revealing a layered structure of difficulty. Conclusion. The difficulty of an issue resolution task is encoded in its structure. This enables static, pre-hoc difficulty estimation and lays the groundwork for difficulty-controlled benchmark construction for evaluation of agents.