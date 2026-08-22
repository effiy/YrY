---
title: 'LEDGER: Claim-to-Evidence Trace Graphs for Auditing LLM Agents'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18398
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Daehong Kim, Haichao Miao, Shusen Liu
---

arXiv:2608.18398v1 Announce Type: cross 
Abstract: Large language model (LLM) agents can now carry out long-horizon technical workflows involving complex tool use, code execution, file edits, and generated artifacts. As agents do more work faster, the productivity bottleneck shifts from producing outputs to auditing whether those outputs are correct and trustworthy. Agent observability systems make fine-grained execution events visible, but visibility alone still leaves reviewers to reconstruct which actions, artifacts, and validation steps matter for a particular conclusion. We introduce LEDGER - Layered Evidence and Decision Graphs for Execution Review, a tracing and review system that builds layered trace graphs over observed agent sessions. LEDGER preserves Trace Records while grouping them into Evidence Nodes and Workflow Nodes, representing artifacts as evidence anchors, and adding typed semantic edges that connect claims to supporting actions, artifacts, and checks. Through data-analysis and coding examples, we show how the resulting traces expose workflow decisions, artifact lineage, repair steps, validation coverage, and claim-support paths for evidence-centered audit.