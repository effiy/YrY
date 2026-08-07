---
title: CQRS Read-Write Separation Pattern / CQRS Pattern
aliases: [cqrs-pattern, cqrs, command-query-responsibility-segregation, read-write-separation]
tags: [pattern, engineering-pattern, cqrs, read-write-separation, event-sourcing, materialized-view]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: "CQRS = separation of read and write responsibilities. Read model and write model are independent; optimized per scenario; not for all scenarios; links with outbox + event-sourcing; eventually consistent; do not force into simple systems"
roles: [engineer, tech-lead, oncall-sre]
benefit: "Read and write workloads are optimized independently with separate models, improving performance and scalability"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ./saga.md
  - ./circuit-breaker.md
  - ./graceful-degradation.md
  - ../architecture-design/decompose-a-monolith.md
  - ../architecture-design/implement-an-api.md
  - ../projects/build-a-rag-pipeline.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
---

# CQRS Read-Write Separation Pattern / CQRS Pattern

> **As an** engineer, **I want to** cqrs, **so that** pattern applied consistently.

## Summary

- CQRS = separation of read and write responsibilities; not for all scenarios
- Write model: normalized + strongly consistent + business rules
- Read model: denormalized + weakly consistent + query-optimized
- Write → outbox event → read model update; eventually consistent
- Links with outbox + saga + event-sourcing
- Materialized views / cache / index: read model implementations
- Do not force into simple systems; if CRUD suffices, use CRUD
- Read-write separation = model separation ≠ database separation
- LLM scenarios: write DB + read vector DB (semantic retrieval)
- Observable: write latency / read latency / sync lag

## Core viewpoints

**CQRS is a response to asymmetry, not a default architecture.** The pattern is only justified when read and write workloads have fundamentally different shapes: read-heavy write-light, complex query patterns diverging from simple writes, or different consistency requirements. Applying CQRS to a system with balanced reads and writes doubles the model maintenance burden for zero benefit. The heuristic is: if you cannot clearly articulate why a single model fails for both reads and writes, you do not need CQRS.

**The sync lag is the defining characteristic of the system, not a side effect.** Every CQRS system has a window between write acknowledgment and read-model update. The length of this window defines the user experience: if the user creates a record and cannot see it for 5 seconds, the system feels broken even if the architecture is correct. The lag must be a first-class SLO with alerting, and key user journeys must include read-your-own-write paths that bypass the read model.

**LLM applications are already CQRS, whether you acknowledge it or not.** Writing to a relational database and reading from a vector database is the textbook CQRS pattern. The write model is the normalized document store; the read model is the embedding index. Teams that fail to recognize this reinvent CQRS poorly: they build synchronous reindexing that blocks writes, skip lag monitoring, and have no fallback path when the vector index is stale.

**Multiple read models are a feature, not complexity.** The same write model can project to a cache for hot queries, a search index for full-text, a vector database for semantic retrieval, and a materialized view for analytics. Each read model is optimized for its specific access pattern. The alternative -- forcing all reads through a single general-purpose model -- is the real complexity, because it makes every query slow and every index a compromise.

**CQRS without event sourcing is simpler and often sufficient.** Event sourcing (storing every state change as an event) is a powerful companion to CQRS but introduces its own complexity: event schema evolution, snapshot management, and eventual consistency everywhere. Many systems benefit from CQRS with a simple outbox pattern -- write to the normalized DB, emit an event, update the read model asynchronously -- without needing full event sourcing. Start simple; add event sourcing only when you need audit trails or temporal queries.

## Problem

Pain points of mixing reads and writes:

1. **Model conflict**: write normalized (less redundancy) vs read denormalized (more redundancy pre-join); the same model struggles to serve both
2. **Poor query performance**: normalized model queries need many joins, slow
3. **Write lock blocks reads**: write transaction locks reads, reads slow
4. **Unbalanced read-heavy/write-light**: scaling reads scales writes wastefully, scaling writes leaves reads insufficient
5. **Complex queries hard to write**: aggregation / grouping / full-text search are hard on normalized models
6. **Data model compromise**: denormalizing for reads breaks write consistency
7. **Multiple views hard to maintain**: different read views share one model; requirement changes impact the model
8. **LLM scenarios**: DB writes relational data + vector DB for semantic retrieval — this is already CQRS

Quantified: read-heavy write-light systems without CQRS have read P99 latency 2-5x on average; 30-50% storage waste.

## Pattern

### Read-write model separation

```
write_model (command):
  - normalized schema
  - strongly consistent
  - business rules + validation
  - transaction boundary
  - single write entry

read_model (query):
  - denormalized schema
  - weakly consistent / eventually consistent
  - query optimization (index / materialized view / cache)
  - multiple read views (per scenario)
  - multiple read entries
```

- **Write model normalized**: less redundancy, strongly consistent, business rules
- **Read model denormalized**: more redundancy pre-join, fast queries
- **Separation = model separation ≠ database separation**: can be same DB different tables / different DBs
- **Multiple read views**: different read scenarios use different read models

### Write → outbox → read

```
write → DB write + outbox event (same transaction)
outbox publisher → emit event
read model projector → on event, update read model
read query → read model query
```

- **Same-transaction write + outbox**: write + event atomic
- **Async projector**: read model updated asynchronously
- **Eventually consistent**: read model has lag
- **Links with outbox-pattern**: reuses outbox foundation

### Read model implementation choices

| implementation | applicable | example |
|---|---|---|
| materialized view | simple denormalization | PostgreSQL materialized view |
| cache | read-heavy write-light | Redis cache hot queries |
| search engine | full-text + complex queries | Elasticsearch / Solr |
| vector DB | semantic retrieval | PostgreSQL pgvector / Milvus |
| data warehouse | OLAP analytics | Snowflake / BigQuery |
| read replica | read scaling | PostgreSQL read replica |

- **Choose per scenario**: simple use materialized view, complex use search engine
- **Multiple implementations coexist**: different read views use different implementations
- **LLM scenarios**: DB writes relational + vector DB for semantic retrieval = CQRS

### event-sourcing linkage

```
event-sourcing:
  state = sequence of events
  write = append event
  read = project events to read model
  state can be rebuilt at any time
```

- **event = source of truth**: DB stores event sequence
- **read model = projection**: derived from events
- **Rebuild at any time**: replay events to rebuild state
- **Audit natural**: event sequence is the audit log
- **CQRS + event-sourcing**: common combination but not mandatory

### Read-write separation scaling

```
read scaling: read replica / cache / multiple read models
write scaling: sharding / database split
independent read-write scaling: scale read or write as needed
```

- **Read scaling**: replicas / cache / materialized views
- **Write scaling**: sharding / database split
- **Independent scaling**: scale read and write independently as needed
- **No mutual impact**: scaling reads does not impact write performance

### Query optimization

- **Pre-join**: read model denormalized pre-join
- **Index**: build indexes per query patterns
- **Materialized view**: pre-compute complex aggregations
- **Cache layer**: Redis cache for hot queries
- **CDN**: CDN for static reads
- **Short read path**: minimize hops in read path

### Eventually consistent lag

- **Sync lag**: write → read model update delay
- **Lag monitoring**: read model lag alert
- **Lag tolerance**: how much lag the business can accept
- **Strong consistency fallback**: key reads go to write model
- **Read-your-own-write**: right after write, read from write model

### LLM scenarios: DB + vector DB

```
write: DB update + outbox event (doc_updated)
projector: on doc_updated, reindex to vector DB
read: semantic retrieval via vector DB + key fields via DB
```

- **Write DB + read vector DB**: natural CQRS
- **Reindex async**: does not block writes
- **Lag monitoring**: index lag alert
- **Strong-consistency read via DB**: right after write, read via DB

## Applicable

- **Read-write asymmetry**: read-heavy write-light or read-light write-heavy
- **Complex queries**: full-text / aggregation / multi-dimensional analytics
- **Multiple read views**: different scenarios different views
- **LLM + relational hybrid**: DB + vector DB
- **event-sourcing**: events as source of truth
- **Microservices**: service boundary is natural CQRS
- **Audit needs**: event sequence audit

## Not applicable

- **Simple CRUD**: if CRUD suffices, do not introduce CQRS
- **Balanced reads and writes**: similar read/write frequency needs no separation
- **Low-complexity queries**: single-table queries suffice
- **Strong consistency for all reads**: all reads strongly consistent — no read model needed
- **Small team**: maintaining multiple models is costly

## Landing checklist

1. **Read-write model separation**: write model normalized + read model denormalized
2. **outbox linkage**: write + outbox event same transaction
3. **projector**: async update read model
4. **Read model choice**: materialized view / cache / search / vector DB
5. **Multiple read views**: different scenarios different read models
6. **Lag monitoring**: read model lag alert
7. **Strong consistency fallback**: key reads via write model
8. **Independent read-write scaling**: scale as needed
9. **event-sourcing optional**: strong audit needs can adopt
10. **Chaos verification**: projector failure to verify lag
11. **Observable**: write latency / read latency / lag / sync rate
12. **Simplicity first**: if materialized view works, do not introduce complex CQRS

## Anti-patterns

- **Forcing into simple systems**: CRUD suffices but force CQRS
- **Same read-write model**: separation = same model = no separation
- **Sync projector**: synchronously updating read model blocks writes
- **No lag monitoring**: do not know how old read model is
- **All reads via read model**: strong-consistency reads also via read model cause problems
- **Read model not split by scenario**: all reads use one model
- **No chaos verification**: projector failure unknown
- **event-sourcing forced**: adopt even without audit needs
- **Over-denormalization**: too much redundancy is hard to maintain
- **LLM not recognized as CQRS**: DB + vector DB is CQRS but not recognized
- **No fallback**: large lag with no strong-consistency read path
- **Independent read-write DB with no sync**: read-write separated but no sync mechanism

## Related

- Outbox: [./outbox.md](../infrastructure/outbox.md) — write + event atomic co-built
- saga: [./saga.md](./saga.md) — long transactions multi-step can use CQRS
- Idempotency: [./idempotency.md](../infrastructure/idempotency.md) — projector idempotent
- Rate limiting: [./rate-limiting.md](../engineering/rate-limiting.md) — read-write rate limiting independent
- Circuit breaker: [./circuit-breaker.md](./circuit-breaker.md) — read model failure circuit break
- Observable: [./observability.md](../engineering/observability.md) — lag monitoring
- Graceful degradation: [./graceful-degradation.md](./graceful-degradation.md) — read model failure degradation
- Journeys: [decompose-a-monolith](decompose-a-monolith.md) + [implement-an-api](implement-an-api.md) + [build-a-rag-pipeline](../projects/build-a-rag-pipeline.md) + [set-up-a-data-pipeline](../infrastructure/set-up-a-data-pipeline.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) (read-write asymmetry essence) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) (inversion = do not force) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) (lag second-order) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md) (CRUD suffices, do not introduce)
