---
title: 'FraudBench: Stress-Testing Policy-Grounded Banking Agents Against Adaptive
  Fraud'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18136
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Dheeraj Mohandas Pai, Lu Xian
---

arXiv:2608.18136v1 Announce Type: new 
Abstract: Conversational agents now act for end users through tools while holding access to customer databases and internal policy documents that a caller can reach through dialogue alone. Banking is the clearest case: the same agent that answers a question can also change contact details, reset a PIN, or move money, so ordinary customer service is inseparable from authorization, fraud detection, and policy compliance. Existing financial-fraud benchmarks classify static transactions or messages, and general agent-safety benchmarks target prompt injection or generic harmful use; none test whether a policy-grounded banking agent safely acts when a caller manipulates identity, authorization, and trust over a conversation. We introduce FraudBench, an executable benchmark built on the $\tau^2$-bench dual-control framework and the $\tau$-Knowledge banking environment. Both the agent and the simulated caller act through tools over shared, mutable account state, and the agent may grant the caller access to selected tools; the environment exposes a 698-document internal policy corpus that the agent must retrieve from. FraudBench contains 150 authored adversarial scenarios; a frozen public set of 107 (90 across ten fraud mechanisms plus 17 chained adaptive attacks) is used for all reported runs, with 43 further chained attacks held out. Safety is history-dependent: single-control tasks satisfy every precondition but one, and adaptive attacks make a later, locally valid request unsafe because of an earlier probe, admission, or failed attempt. Each scenario is annotated with observable evidence, prohibited actions, safe dispositions, and intervention points. A preliminary single-trial evaluation of four agents on the 107 graded tasks yields attack-security between 49\% and 65\%, with money-mule and first-party fraud the most common cross-model weaknesses.