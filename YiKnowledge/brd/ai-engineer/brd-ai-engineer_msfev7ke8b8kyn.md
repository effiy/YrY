---
title: Agent architecture patterns
lifecycle: active
key: brd_brd-ai-engineer_msfev7ke8b8kyn
tags:
- ai
- agent
- claude-sdk
model: Claude Opus 4.7 + Claude Agent SDK
task_type: agent
framework: Claude Agent SDK
dataset: BRD agent 5 phases
eval_metric: task completion rate / step count / cost
status: in_progress
owner: AI Engineer
kb_path: ai-engineer/methodology/agent-architecture-patterns.md
context: Agent loop = plan → tool call → result stream back → reflect. Needs selection + patterns + evaluation. Claude Agent SDK is most stable for > 20-step tasks.
methodology: "5 major patterns: planning (decompose tasks) / tool call (structural contract) / result stream back (business system) / reflection (eval set) / gradual rollout (5 people → all)."
baseline: BRD agent single agent task completion rate 85%; average 8 steps; cost $0.10/task
target: Multi-agent collaboration (plan + execute + review) completion rate 95%; average 12 steps; cost $0.15/task
risks: 1. Multi-agent coordination complexity — planning agent + execution agent; 2. Step inflation — task decomposition strategy; 3. Cost runaway — prompt caching
  + short model
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# Agent architecture patterns

**Model**: Claude Opus 4.7 + Claude Agent SDK  |  **Task Type**: agent  |  **Framework**: Claude Agent SDK
**Dataset**: BRD agent 5 phases  |  **Eval Metric**: task completion rate / step count / cost  |  **Status**: in_progress  |  **Owner**: AI Engineer
**KB Source**: ai-engineer/methodology/agent-architecture-patterns.md

## Context
Agent loop = plan → tool call → result stream back → reflect. Needs selection + patterns + evaluation. Claude Agent SDK is most stable for > 20-step tasks.

## Methodology
5 major patterns: planning (decompose tasks) / tool call (structural contract) / result stream back (business system) / reflection (eval set) / gradual rollout (5 people → all).

## Baseline → Target
- **Baseline**: BRD agent single agent task completion rate 85%; average 8 steps; cost $0.10/task
- **Target**: Multi-agent collaboration (plan + execute + review) completion rate 95%; average 12 steps; cost $0.15/task

## Risks & Mitigations
1. Multi-agent coordination complexity — planning agent + execution agent; 2. Step inflation — task decomposition strategy; 3. Cost runaway — prompt caching + short model

## References
- **KB Source**: `YiKnowledge/ai-engineer/methodology/agent-architecture-patterns.md`
