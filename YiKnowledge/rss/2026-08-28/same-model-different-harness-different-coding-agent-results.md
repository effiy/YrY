---
title: 'Same Model, Different Harness: Different Coding-Agent Results'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26218
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Sydney Lewis
---

arXiv:2608.26218v1 Announce Type: new 
Abstract: A coding agent combines a model with a harness, which decides what the model sees, which tools it can use, and how the work continues. We ask whether changing the harness changes the result when the model and task stay fixed. We compare two configurations of the same harness on three coding benchmarks. The control supplies the full conversation in time order, while the treatment keeps the same record but mechanically shortens older tool results as the context fills and responds to repeated or stalled work.
  Under tight context, the treatment raises mean per-task fail-to-pass fraction (F2PF) in all three pressure comparisons and increases complete solutions on SWE-bench Verified and SWE-bench Pro. The tight-window Verified comparison uses 169 tasks, a 20,480-token window, and a fixed 480-second attempt endpoint; on this cohort, treatment raises mean per-task F2PF from 28 percent to 49 percent and complete solutions from 43 to 72. Without model-specific retuning, the same frozen treatment also raises both endpoints on the same cohort for three additional models with different designs. In the wide-window Qwen3.6 comparisons, observed arm outcomes are close on Verified and Pro, while FeatureBench retains a higher mean per-task F2PF under treatment. On the wide-window Verified cohort, treatment also serves fewer prompt tokens per turn. Because changing the harness changed what unchanged model weights could accomplish, coding-agent evaluations should treat the model and harness together as the tested solver.