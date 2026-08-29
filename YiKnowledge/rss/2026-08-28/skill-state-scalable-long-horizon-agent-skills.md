---
title: 'SKILL.state: Scalable Long-Horizon Agent Skills'
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-29'
source: https://arxiv.org/abs/2608.26263
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 28 Aug 2026 00:00:00 -0400
author: Sanket Badhe, Priyanka Tiwari, Jonghyun Chung
---

arXiv:2608.26263v1 Announce Type: new 
Abstract: Large Language Models (LLMs) increasingly act as autonomous agents executing complex, long-running procedural skills. Existing agent runtimes maintain execution by continually appending observations, actions, and intermediate reasoning traces to an ever-growing conversation history, causing latency degradation and context-poisoning failures over long horizons. We present SKILL.state, a runtime architecture that replaces append-only conversational history with an explicit, mutable execution state. At each execution step, the model receives only the immutable skill specification, the current structured execution state, and the latest observation. Intermediate reasoning is discarded immediately after producing a validated state update, preventing prompt growth with execution history. Across diverse datasets, models, and execution environments, SKILL.state improves task accuracy while substantially reducing cumulative token consumption. Our results demonstrate that explicit execution state is an effective and architecture-agnostic abstraction for scalable long-horizon agent skills.