---
title: 'BekchiAI: Measuring, Observing, and Controlling LLM Agents in One Click'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26867
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Mesut Toruk
---

arXiv:2608.26867v1 Announce Type: new 
Abstract: Large language model agents reason, call tools, and act autonomously over many steps, but their agentic skills-correctly sequencing tools, planning under dependencies, judging untrusted inputs, and grounding generated arguments-are hard to measure with accuracy-only leaderboards. We present BekchiAI, which addresses both sides: a benchmark for measuring agentic skill and a platform for observing and controlling live agents. The BekchiAI-Benchmark, a suite of 13 tool-using ReAct agents across 7 task categories (arithmetic, structured/SQL, security detection, URL grounding, planning, orchestration, and tool-policy), totalling 2,057 deterministic, committed test tasks. Every task is verifier-checkable gold answers are computed by running canonical SQL against a real database, computing the exact schedule of a directed acyclic graph (DAG), or evaluating closed-form lambdas including adversarial security samples paired with deliberately imperfect signature scanners so a score reflects the model's own judgment, not the copying of an oracle. We define a small set of behavioral metrics beyond accuracy-tool-call adherence, URL hallucination and source-match, and per-model token cost and report a four-model comparison (Qwen3.7-Max, gemma-4-31B-it, gemma4:26b, gpt-oss-120b) whose story is in the per-family spread, not the aggregate. The benchmark runs are executed using the provided evaluation scripts. BekchiAI-Platform is a complementary web-based observability and control layer for deployed agents, providing full token and latency telemetry as well as remote run termination. The benchmark, evaluation tools, and platform are publicly released.