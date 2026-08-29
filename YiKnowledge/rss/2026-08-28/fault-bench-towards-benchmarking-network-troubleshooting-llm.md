---
title: 'FaulT-Bench: Towards Benchmarking Network Troubleshooting LLM Agents under
  Unreliable User Tickets'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27021
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Kuan-Hao Tseng, Niruth Bogahawatta, Yasod Ginige, Kunjan Patel, Kosta Dakic,
  Suranga Seneviratne
---

arXiv:2608.27021v1 Announce Type: cross 
Abstract: LLM-based agents are increasingly proposed for network fault diagnosis, but existing benchmarks evaluate them only on accurate tickets and always assume a fault is present, conditions rarely met in practice. We present FaulT-Bench, a benchmark of 200 troubleshooting scenarios across eight network topologies, five reimplemented from public practitioner labs, spanning genuine faults, false fault reports, incorrect device attribution, and incorrect root-cause claims. To isolate how ticket wording affects diagnosis, we further rewrite 72 false-premise tickets into five reporter personas that vary reporter confidence and verifiable detail one factor at a time, holding the network state fixed. Our automated harness deploys each scenario in Kathar\'a, lets agents interact through the NIKA tool interface, and scores free-text diagnoses with an LLM judge across outcome, fix, and reasoning quality. Evaluating SADE, ReAct, and Claude Code, we find all three are near-saturated on accurate tickets and robust to misdirection, yet degrade sharply when the network is healthy and the ticket is wrong, probing until a benign condition can be promoted to a root cause rather than concluding nothing is wrong. Persona rewrites show that how a ticket is written matters more than what it claims: a confidently wrong report is handled about as well as an accurate one, while a vague, underspecified report degrades performance sharply. The three agents also fail differently, from constant over-diagnosis to unanswered runs, at very different cost. These results position FaulT-Bench as a benchmark for developing agentic systems that can reason reliably over the noisy, unreliable tickets of real-world network troubleshooting.