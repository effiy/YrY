---
title: ADR — YiAi Knowledge Watcher landing
lifecycle: active
key: brd_brd-tech-lead_msfev6u5qhhp01
tags:
- adr
- yi-ai
- knowledge-watcher
- apscheduler
adr_id: ADR-Knowledge-Watcher-Deployment
project: yiai
domain: Knowledge Sync
decision_type: process
team_size: 3
status: proposed
owner: YiAi lead owner
review_cycle: quarterly
kb_path: tech-lead/decisions/yiai--knowledge-watcher-deployment.md
context: YiKnowledge content changes need to be auto-synced to the YiAi vector DB to support real-time RAG retrieval. macOS FSEvents silently drops events, so apscheduler polling must be used
  instead.
decision: Use apscheduler polling (not FSEvents) + incremental indexing + debounce + failure retry + monitoring. Polling interval 5 minutes, debounce window 30 seconds, failure exponential
  backoff retry 3 times.
alternatives: B. watchdog FSEvents — silently drops events on Mac; C. Git hook trigger — cannot cover non-git changes; D. manual rebuild
  — laggy + easily forgotten. A selected.
risks: 1. polling latency (5min) — acceptable; 2. incremental index misses deletes — tombstone mechanism; 3. retry storm — exponential backoff + max 3 times; 4. monitoring blind spot
  — health check + alerting.
rollback: Watcher exception → switch back to manual rebuild mode + fix + redeploy (1 business day).
stakeholders: YiAi lead owner (decision); YiVad lead owner (knowledge source collaboration); CTO (approval)
tacit: false
related: []
type: reference
---

# ADR — YiAi Knowledge Watcher landing

**ADR ID**: ADR-Knowledge-Watcher-Deployment  |  **Project**: yiai  |  **Domain**: Knowledge Sync
**Decision Type**: process  |  **Team Size**: 3  |  **Status**: proposed  |  **Owner**: YiAi lead owner
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yiai--knowledge-watcher-deployment.md

## Context
YiKnowledge content changes need to be auto-synced to the YiAi vector DB to support real-time RAG retrieval. macOS FSEvents silently drops events, so apscheduler polling must be used instead.

## Decision
Use apscheduler polling (not FSEvents) + incremental indexing + debounce + failure retry + monitoring. Polling interval 5 minutes, debounce window 30 seconds, failure exponential backoff retry 3 times.

## Alternatives
B. watchdog FSEvents — silently drops events on Mac; C. Git hook trigger — cannot cover non-git changes; D. manual rebuild — laggy + easily forgotten. A selected.

## Risks & Mitigations
1. polling latency (5min) — acceptable; 2. incremental index misses deletes — tombstone mechanism; 3. retry storm — exponential backoff + max 3 times; 4. monitoring blind spot — health check + alerting.

## Rollback Plan
Watcher exception → switch back to manual rebuild mode + fix + redeploy (1 business day).

## Stakeholders
YiAi lead owner (decision); YiVad lead owner (knowledge source collaboration); CTO (approval)

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yiai--knowledge-watcher-deployment.md`
