---
title: YiAi Knowledge Watcher landing completion win
aliases: [yiai-knowledge-watcher-win, knowledge-watcher landing, file-hash incremental index win]
tags: [lessons, wins, yi-ai, knowledge-watcher, apscheduler, polling, file-hash, incremental-index, fsevents-bypass]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: macOS FSEvents silently dropping events in the dev env is a known trap; apscheduler polling + file-hash comparison is a deterministic replacement that does not depend on OS event mechanisms
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

# YiAi Knowledge Watcher landing completion win

> **As an** engineer, **I want to** yiai knowledge watcher, **so that** success is reproducible. 

## Summary

- Landing: apscheduler polling (30s interval) + file hash comparison (SHA-256 incremental) + 30s debounce + 3 failures with exponential backoff + dead-letter queue + full rebuild cadence fallback
- Bypasses macOS FSEvents silently dropping events (known trap) — does not depend on OS event mechanisms; polling + hash is deterministic
- Incremental index: only changed files enter the RAG pipeline, avoiding peak resource spikes from full rebuilds
- Dead-letter queue: after 3 failures, files enter the queue with alerts + manual intervention; does not block the normal pipeline
- Full rebuild cadence fallback: full rebuild every Sunday at 02:00 to prevent incremental drift
- Co-built 50 bilingual documentation evaluation set with the RAG evaluation ADR; the knowledge watcher syncs the knowledge source to the BRD agent + RAG pipeline
- 0 incidents; incremental index latency < 60s; dead-letter queue trigger rate < 0.5%; full rebuild 0 failures

## Core viewpoints

- **Polling is not a regression from event-driven architecture -- it is a deliberate choice to trade efficiency for determinism**: macOS FSEvents silently dropping events is a known, unresolved bug. Switching to apscheduler polling with SHA-256 file hash comparison replaces an unreliable OS mechanism with a deterministic one. The 30-second polling interval is the price of knowing, with certainty, that no file change was missed.

- **The dead-letter queue is not a garbage collector -- it is an early warning system for systemic issues**: When a file fails indexing three times with exponential backoff, it enters the dead-letter queue. This is not a failure of the watcher; it is a signal that something in the pipeline (file permissions, encoding, size limits) needs attention. A dead-letter rate above 0.5% is not a queue problem -- it is a pipeline health problem that requires investigation.

- **The 30-second debounce is a compromise between responsiveness and resource efficiency, and it is tuned to human editing patterns, not machine write patterns**: An editor saving a file three times in rapid succession triggers three watcher events. Without debouncing, the RAG pipeline would index the same file three times. The 30-second window captures the human editing burst as a single event while maintaining sub-minute index freshness.

- **The weekly full rebuild is not a fallback for the incremental index -- it is a defense against silent corruption**: Hash collisions, file locks during reads, and race conditions between the watcher and the editor can all cause incremental drift. The Sunday 02:00 full rebuild resets the baseline, ensuring that any drift accumulated during the week is corrected before it affects users. Without this cadence, incremental drift compounds indefinitely.

- **The 4-stage canary launch (1% -> 10% -> 50% -> 100%) with one-day observation per stage is the minimum viable safety net for infrastructure changes that affect the RAG pipeline**: The knowledge watcher sits upstream of the BRD agent and the RAG pipeline. A bug in the watcher -- incorrect hash computation, incomplete file reads, missed changes -- corrupts the knowledge base that every downstream system depends on. The canary stages limit the blast radius while the observation period catches latency regressions and dead-letter rate spikes.


1. **Polling over events**: macOS FSEvents silently dropping events in the dev env is a known trap; apscheduler polling + file hash comparison is a deterministic replacement
2. **Incremental over full**: only changed files enter the RAG pipeline, avoiding peak resource spikes from full rebuilds
3. **Dead-letter queue fallback**: after 3 failures, files enter the queue and do not block the normal pipeline; alerts + manual intervention
4. **Full rebuild cadence fallback**: full rebuild every Sunday at 02:00 to prevent incremental drift (hash collision / file lock / race condition)
5. **30s debounce**: editors saving in succession trigger multiple watcher events; the 30s debounce merges them into a single index
6. **3 failures with exponential backoff**: a single file failure does not block the queue; exponential backoff 1s / 2s / 4s then dead-letter
7. **Knowledge source sync**: the watcher syncs the knowledge source to the BRD agent + RAG pipeline + co-built evaluation set
8. **0 incidents**: 4-stage canary launch 1% → 10% → 50% → 100%; observe each stage for 1 day; 0 failures

## Key information

### architecture

```
apscheduler (30s polling)
  ↓
file hash comparison (SHA-256 incremental)
  ↓
changed file list
  ↓
30s debounce merge
  ↓
RAG pipeline incremental index
  ↓
3 failures exponential backoff (1s / 2s / 4s)
  ↓
dead-letter queue (alert + manual intervention)

Sunday 02:00 full rebuild (periodic fallback)
```

### key metrics

| Metric | Goal | Actual | Note |
|---|---|---|---|
| Incremental index latency | < 60s | < 45s | 30s polling + 15s debounce + 0s index |
| Dead-letter queue trigger rate | < 1% | < 0.5% | triggered by file lock / race condition |
| Full rebuild success rate | 100% | 100% | Sunday 02:00 0 failures |
| Full rebuild duration | < 30 min | < 22 min | 50 bilingual documents + embedding + index |
| Resource peak | < 50% CPU | < 35% CPU | incremental beats full |
| Incident count | 0 | 0 | 4-stage canary 0 failures |

### canary launch

| Stage | Traffic | Observation | Result |
|---|---|---|---|
| 1% | 1% users | 1 day — incremental latency / dead-letter rate / rebuild | latency 50s / dead-letter 0.3% / rebuild 0 failures |
| 10% | 10% users | 1 day | latency 48s / dead-letter 0.4% / rebuild 0 failures |
| 50% | 50% users | 1 day | latency 45s / dead-letter 0.5% / rebuild 0 failures |
| 100% | full | 1 day | latency 45s / dead-letter 0.5% / rebuild 0 failures |

### knowledge source sync

- RAG pipeline: incremental index → vector store (Milvus / pgvector) + BM25 index
- BRD agent: knowledge source synced to the BRD authoring agent ([adr-brd-agent-launch](../../tech-lead/decisions/yiai--brd-agent-launch.md))
- Co-built evaluation set: 50 bilingual documentation evaluation set ([adr-rag-evaluation-infra](../../tech-lead/decisions/yiai--rag-evaluation-infra.md)) — knowledge source changes trigger evaluation set baseline rerun

## Action recommendations

1. **Polling over events**: macOS FSEvents silently drops events ([macos-fsevents-silent-drop gotcha](gotcha-macos-fsevents-silent-drop.md)) — use apscheduler polling + file hash comparison
2. **Incremental over full**: only changed files enter the RAG pipeline, avoiding full-rebuild resource peaks
3. **30s debounce**: editors saving in succession trigger multiple watcher events; the 30s debounce merges them into a single index
4. **3 failures with exponential backoff**: a single file failure does not block the queue; exponential backoff 1s / 2s / 4s then dead-letter
5. **Dead-letter queue fallback**: after 3 failures, files enter the queue with alerts + manual intervention; does not block the normal pipeline
6. **Full rebuild cadence fallback**: full rebuild every Sunday at 02:00 to prevent incremental drift (hash collision / file lock / race condition)
7. **Knowledge source sync**: the watcher syncs the knowledge source to the BRD agent + RAG pipeline + co-built evaluation set
8. **4-stage canary**: 1% → 10% → 50% → 100%; observe each stage for 1 day; evaluation set gate + monitoring triad

## Anti-patterns

- **Depend on FSEvents**: watchfiles / watchdog silently drop events in the macOS dev env → use apscheduler polling
- **Full rebuild on every trigger**: full rebuild on every file change → resource peaks + high latency → must use incremental
- **No debounce**: editors saving in succession trigger multiple watcher events → must debounce 30s to merge
- **No dead-letter queue**: failed files block the queue → must have dead-letter queue + alerts + manual intervention
- **No full-rebuild fallback**: incremental drift accumulates → must cadence a full rebuild to prevent drift
- **No canary**: direct full launch → 0 canary risk is high → must use 4-stage canary

## Related

- Implementation ADR: [../../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md](../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md) — 4-stage plan
- Evaluation ADR: [../../../tech-lead/decisions/yiai--rag-evaluation-infra.md](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) — 50 bilingual documents co-built
- Multi-provider ADR: [../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) — generation side uses router, retrieval side watcher guards freshness
- BRD agent ADR: [../../../tech-lead/decisions/yiai--brd-agent-launch.md](../../tech-lead/decisions/yiai--brd-agent-launch.md) — BRD knowledge source sync
- Gotcha co-built: [macos-fsevents-silent-drop](gotcha-macos-fsevents-silent-drop.md) — decided on polling over watchfiles
- Pattern co-built: [inline-citation-rag-pattern](../engineering/inline-citation-rag.md) + [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md)
- Upstream win: [yiai-supply-chain-hardening-win](win-yiai-supply-chain-hardening.md) — supply-chain hardening prerequisite
- Related win: [yiai-rag-hybrid-retrieval-win](win-yiai-rag-hybrid-retrieval.md) — full RAG pipeline view
