---
title: How Do LLM Agents Actually Get the Flag? Trace-Level Provenance for Agentic
  Offensive Security Evaluation
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26237
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Kimberly Milner, Minghao Shao, Nanda Rani, Haoran Xi, Venkata Sai Charan Putrevu,
  Meet Udeshi, Sandeep K. Shukla, Prashanth Krishnamurthy, Farshad Khorrami, Muhammad
  Shafique, Ramesh Karri
---

arXiv:2608.26237v1 Announce Type: cross 
Abstract: Capture-the-Flag (CTF) benchmarks are widely used to assess the offensive security capabilities of autonomous language-model agents. Evaluations rely on shallow binary judgments or aggregate scores, overlooking the agent's trajectory to the flag. Consequently actual exploitation is conflated with direct flag exposure, memorized recall, external lookup, guessing, and unsupported claims, potentially overstating the agent's cybersecurity capability. We introduce CTF-ABACUS, a trace-based agent auditing framework that reconstructs each run as an evidence-grounded solve profile. By decomposing agent actions into penetration-testing phases and categorical techniques, it identifies where exploitation occurs, where the flag first appears, and whether the recovered flag is supported by demonstrated behavior. Aggregating solve profiles across agents yields challenge signatures that reveal whether success was achieved via the intended exploit or via shortcut pathways. We apply CTF-ABACUS to 1,435 CTF attempts by six frontier and open-source models on 240 challenges, yielding 2,870 solve profiles under two judge lenses. Trace-verified exploits account for only 62-87% of recovered flags across benchmarks, while shortcut recoveries follow substantially shallower trajectories. These findings shift CTF evaluation from counting recovered flags to verifying demonstrated exploitation and provide a basis for designing benchmarks that better isolate the offensive capabilities.