---
title: Task-Conditioned Least-Privilege Learning for Executable Terminal and MCP Agents
tags:
- arXiv cs.AI
category: aier/foundations
created: '2026-08-22'
source: https://arxiv.org/abs/2608.18351
type: rss
source_name: arXiv cs.AI
source_url: https://rss.arxiv.org/rss/cs.AI
published: Fri, 21 Aug 2026 00:00:00 -0400
author: Alexander Tu, Michael Tu
---

arXiv:2608.18351v1 Announce Type: cross 
Abstract: Tool-using large language-model agents can complete a task while exercising authority that the user did not grant or the task does not need, causing excess-authority errors. Traditional permission gating systems alone for validating agent environments are insufficient. We study whether post-training can teach a 4B-parameter model to choose task-conditioned authority in executable terminal and Model Context Protocol (MCP) environments to complement those measures. We propose a framework where each action is audited before execution and again from observed effects along six dimensions of risk. This auditing is conducted using deterministic verifiers that score completion, evidence, exact state, prohibited attempts, and safe success. In conjunction with predefined task-specific sufficient-authority envelopes, we determine task-specific excess privilege values for trajectories, which are then optimized for in post-training. We find that after training using this framework on Qwen3.5-4B over 1,500 tasks, the selected seed reaches 98.48% safe success across 2,896 evaluation episodes spanning all 500 held-out tasks, compared with 64.36% for the base policy, and reduces excess-authority error events from 4.56% to 0.79%. Furthermore, external tests show capability retention and prompt-directed improvement. A 400 task continuation study also found evidence of generalization, reducing excess-authority events by 6.99 percentage points while maintaining previous capabilities. We conclude learned restraint through least-privilege aware post-training is therefore useful as an additional control layer for tool-using agents in executable terminal and MCP environments, but it does not replace permission gates and sandboxing.