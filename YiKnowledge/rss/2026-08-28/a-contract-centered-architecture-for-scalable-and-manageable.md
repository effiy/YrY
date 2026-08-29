---
title: A Contract-Centered Architecture for Scalable and Manageable Agentic Runtimes
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.27086
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Yaxiao Liu, Pengbo Liu, Yiwen Liu, Yihua Guan, Zhenghe Hou, Jiaxing Song
---

arXiv:2608.27086v1 Announce Type: new 
Abstract: Enterprise AI deployment is a coordination problem across business units, application and AI teams, testing, platform engineering, infrastructure, security, operations, and data governance. Use-case benchmarks show whether one agent completes one task, but not how changing capabilities, models, runtime mechanisms, capacity, and enterprise data should be owned, changed, admitted, or evidenced together.
  We present four responsibility objects as shared organizational contracts: Skill (reusable, versioned capability and workflow asset), Harness (runtime compiler and governor), Scaffold (execution/control boundary and NFR owner), and a stack-external data substrate under independent CIO-governed semantics and telemetry. The runtime core is A = <s>, with the data substrate outside that stack.
  The central contribution is one bounded, falsifiable hypothesis, P1 (cost-aware capability-capacity separability): within a declared operating region, changing activated capability preserves the capacity-response interaction within a preregistered equivalence margin, while changing compatible Scaffold capacity preserves capability semantics up to a non-inferiority margin, and the required controls stay within a declared enforcement budget. Six design conditions become measured obligations whose coverage, violations, uncertainty, cost, and exclusions determine whether P1 is decidable.
  We propose a cluster-period randomized crossover experiment (balanced order, reset/washout, repeated seeds and failure regimes, cluster-aware uncertainty) with a four-state verdict: supported, falsified, conditional-engineering, or inconclusive. This paper contributes a contract-bounded runtime architecture, a source-preserving data substrate, and a falsifiable measurement protocol. It reports no completed implementation, experiment, dataset, or measured result.