---
title: ADR — YiAi Knowledge Watcher landing
aliases: [adr-knowledge-watcher-deployment, yi-ai-knowledge-watcher-adr, knowledge-watcher-rollout]
tags: [adr, yi-ai, knowledge-watcher, rollout, file-watching, apscheduler, scheduler]
category: tech-lead/decisions/yiai
created: 2026-08-03
updated: 2026-08-03
source: internal
type: adr
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [tech-lead, engineer]
benefit: "YiAi knowledge watcher deployment decision is documented with the apscheduler trade-off rationale"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - "consequences and reversal path are stated
related:
  - ../../../engineer/projects/yiai/architecture.md
  - ../../../engineer/projects/yiai/functional-modules.md
  - ../../../engineer/projects/yiai/dev-standards.md
  - ../../../product-manager/projects/yiai--project-management.md
  - ./route-llm-traffic-across-providers.md
  - ../../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md
  - ../../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md
  - ../../../engineer/quality-security/harden-supply-chain.md
  - ../../../engineer/engineering/evaluation-driven-development.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — YiAi Knowledge Watcher landing

> **As a** tech lead, **I want to** land the knowledge watcher deployment, **so that** the decision is documented and reversible.

> Sync YiKnowledge content changes into the YiAi vector store automatically; apscheduler polling (not FSEvents) + incremental indexing + debounce + failure retry + monitoring.

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-Knowledge-Watcher-Deployment |
| Title | YiAi Knowledge Watcher landing: apscheduler polling + incremental indexing |
| Status | Proposed |
| Date | 2026-08-03 |
| Decision maker | YiAi primary owner |
| Reviewers | CTO, YiVad primary owner |
| Related projects | YiAi (direct) / YiVad (indirect, source of knowledge base leaf content) |
| Related PR | to be opened (`feat(knowledge): watcher apscheduler + incremental index`) |
| Review triggers | recall regression > 5% after launch / apscheduler failure rate > 1% / incremental indexing miss rate > 1% |

## 2. Background

- **Current state**: YiAi `domain/rag/` uses `llama_index` for retrieval; YiKnowledge directory content is manually re-indexed = lag = users search stale content.
- **Pain points**:
  - After YiKnowledge adds / modifies a leaf, YiAi RAG answers still reference the old version = trust collapse.
  - Full re-index takes 30+ min = cannot run frequently = lag accumulates.
  - macOS FSEvents silently drops events (see [macos-fsevents-silent-drop gotcha](../../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md)) = watchfiles / watchdog unreliable.
- **Trigger event**: YiKnowledge 4-diagram refactor + leaf count grew to 28+ + RAG recall must stay ≥ 0.85.
- **External constraint**: YiAi is a Python stack, apscheduler is already a direct dependency.

## 3. Decision

Landing checklist:

| # | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | New `services/knowledge/watcher.py`: apscheduler polling + file hash comparison | YiAi `services/knowledge/` | one-shot |
| 2 | Incremental indexing: only re-index files whose hash changed, no full rebuild | YiAi `domain/rag/engine.py` | follows #1 |
| 3 | Debounce: multiple changes to a single file merged into one indexing (30s window) | YiAi watcher | one-shot |
| 4 | Failure retry: 3 retries + exponential backoff + dead-letter queue | YiAi watcher | one-shot |
| 5 | Monitoring: hash comparison success rate + indexing failure rate + incremental miss rate | YiAi monitoring | one-shot |
| 6 | Manual trigger: `POST /knowledge-rebuild` endpoint + auth | YiAi route | one-shot |
| 7 | Eval set: 50 bilingual baseline + recall regression > 5% blocks | YiAi `tests/eval/` | follows #1 |
| 8 | Supply chain hardening: watcher dependencies via `uv.lock` + `pip-audit` + min-release-age | YiAi full stack | prerequisite (already done in [LLM rollout Phase 1](./llm-multi-provider-rollout.md)) |

## 4. Alternatives

| Alternative | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. apscheduler polling | Scan every N minutes + hash comparison | Bypasses unreliable macOS FSEvents; cross-platform consistent | Real-time < 1 min | ✅ Selected |
| B. watchfiles / watchdog | Filesystem events | Real-time | macOS FSEvents silent drops; cross-platform inconsistent | ❌ Rejected |
| C. Manual rebuild | Human triggered | Simple | Severe lag | ❌ Rejected (fallback only) |
| D. Scheduled full rebuild | Rebuild every midnight | Simple | 30+ min blocking; lag accumulates | ❌ Rejected |

## 5. Evaluation dimensions

| Dimension | Goal |
|---|---|
| Incremental indexing hit rate | Hash-changed file ratio ≥ 99% (no misses) |
| Indexing failure rate | < 0.5% |
| Recall retention | ≥ 0.85 (baseline) |
| Real-time | file change → searchable index < 1 min (polling window) |
| Dead-letter queue | failures > 3 enter dead-letter + alert |

## 6. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Hash comparison miss | Low | High | Cadence full-rebuild fallback (every midnight) + eval set gate |
| apscheduler process crash | Medium | High | systemd / docker restart=always + dead-letter alert |
| Incremental vs full drift | Medium | Medium | Weekly full rebuild calibration + diff assertion |
| Vector store lock contention | Medium | Medium | Incremental writes + read/write separation |
| Large file changes frequently | Medium | Medium | Debounce 30s window merge |

## 7. Rollback

- Stop apscheduler: `KNOWLEDGE_WATCHER_ENABLED=false` env switch → fall back to manual rebuild endpoint
- Incremental indexing failure: temporarily switch to scheduled full-rebuild task
- Recall regression > 5%: stop watcher + full rebuild + re-run eval set baseline

## 8. Implementation plan

```
Phase 1 (watcher + apscheduler polling) ⏳ to start
  - services/knowledge/watcher.py
  - file hash comparison (md5 / sha256)
  - debounce 30s window
  - estimated 1 week

Phase 2 (incremental indexing + failure retry) ⏳
  - domain/rag/engine.py incremental indexing integration
  - 3 retries + exponential backoff
  - dead-letter queue

Phase 3 (monitoring + manual trigger endpoint) ⏳
  - monitoring metrics
  - POST /knowledge-rebuild auth

Phase 4 (eval set gate) ⏳
  - 50 bilingual baseline run
  - recall regression > 5% blocks
  - launch
```

## 9. Follow-up tracking metrics

- Incremental indexing: hash-changed file count / incremental rebuild success rate / miss rate (diff vs full rebuild)
- Watcher health: apscheduler heartbeat / failure retry rate / dead-letter queue length
- RAG recall: recall / faithfulness / answer-source consistency
- Performance: single-file indexing time / full rebuild time (fallback)

## 10. Methodology reusability

- apscheduler polling + hash comparison = cross-platform file-watching generic solution (bypasses FSEvents)
- Incremental indexing + debounce + dead-letter = RAG knowledge base sync generic pattern
- Eval set gate + regression threshold = quality gates (see [evaluation-driven-development-pattern](../../../engineer/engineering/evaluation-driven-development.md))
- Supply chain hardening prerequisite = must run before introducing new dependencies (already done in [LLM rollout Phase 1](./llm-multi-provider-rollout.md))

## 11. Coupling with other ADRs

- Upstream: [ADR-Multi-Provider-LLM-Routing](./route-llm-traffic-across-providers.md) (generation side uses `llm_router`; retrieval side — this ADR — guards content freshness)
- Co-built: [ADR-RAG-Evaluation-Infra](./rag-evaluation-infra.md) (50 bilingual eval set co-built) + [ADR-Pytest-Introduction](./pytest-introduction.md) (`tests/eval/` co-built) + [ADR-BRD-Agent-Launch](./brd-agent-launch.md) (BRD knowledge source sync)
- Prerequisite: [ADR-LLM-Multi-Provider-Rollout](./llm-multi-provider-rollout.md) Phase 1 supply chain hardening done
- Gotcha: [macos-fsevents-silent-drop gotcha](../../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) — drives the decision to use apscheduler polling over watchfiles
- Gotcha: [no-lockfile-supply-chain-risk gotcha](../../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) — watcher dependencies go through the hardening process

## 12. References

- [ADR template](../../../knowledge-curator/templates/adr.md)
- [YiAi architecture overview](../../../engineer/projects/yiai/architecture.md)
- [YiAi functional modules §knowledge](../../../engineer/projects/yiai/functional-modules.md)
- [YiAi dev standards §RAG pipeline](../../../engineer/projects/yiai/dev-standards.md)
