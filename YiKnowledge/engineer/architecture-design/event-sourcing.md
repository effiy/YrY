---
title: Event Sourcing Pattern
aliases: [event-sourcing-pattern, event-sourcing, event-store, events-as-source-of-truth]
tags: [pattern, engineering patterns, event-sourcing, events, cqrs, audit, temporal-query, replay]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "System state is fully auditable and reconstructable from immutable event logs, enabling temporal queries and replay"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ./cqrs.md
  - ./saga.md
  - ../projects/INDEX.md
---

# Event Sourcing Pattern

> **As an** engineer, **I want to** event sourcing, **so that** pattern applied consistently. 

## Summary

Event sourcing = events as source of truth; state is the folding of events. append-only event store + projection rebuilds read models; no delete, no update, only append. 

## Problem

CRUD pattern pain points: 
- History lost: UPDATE overwrites previous value, cannot answer "account state 3 months ago"
- Audit hard: no operation history, audit needs separate audit log -> dual-write inconsistency
- Temporal queries unavailable: cannot replay "system state at time t"
- Events not replayable: after failure recovery cannot re-enact events to rebuild read models
- Multiple read models hard to derive: same data needs different read views (OLTP / search / recommendations) each written
- Integration events lost: DB change and event publish not atomic -> inconsistency (see outbox-pattern) 

## Pattern

**Core structure: append-only event store + projections**

1. **event store**: append-only, each event immutable, includes `event_id / aggregate_id / sequence / type / payload / metadata / timestamp`
2. **aggregate**: domain object, state computed by replaying events, does not store current state
3. **projections**: derive read models from events (materialized view / read store) 
4. **replay**: replay events from event store to rebuild any read model
5. **snapshots**: long aggregates store snapshots every N events to speed up replay
6. **subscriptions**: real-time projections subscribe to event stream to update read models

**Key code / config (event store write)**

```python
def apply(account, event):
    if event.type == "AccountOpened":
        return Account(id=event.aggregate_id, balance=event.payload["initial"])
    elif event.type == "Deposited":
        return Account(id=account.id, balance=account.balance + event.payload["amount"])
    elif event.type == "Withdrawn":
        return Account(id=account.id, balance=account.balance - event.payload["amount"])

def deposit(account_id, amount, expected_version):
    events = event_store.load(account_id)
    account = fold(apply, Account.empty(), events)
    if account.version != expected_version:
        raise OptimisticConcurrencyError
    event = Event(type="Deposited", aggregate_id=account_id, payload={"amount": amount})
    event_store.append(account_id, event, expected_version=expected_version)
    bus.publish(event)  # trigger projections
```

## Applicable

- Need complete audit (finance / medical / compliance scenarios) 
- Need temporal queries (state replay at any moment) 
- Need multiple read models derived (OLTP + search + recommendations + BI) 
- Need event replay recovery (rebuild read models after failure) 
- Need to link with outbox / saga (event store is the outbox source) 
- Business is naturally event-driven (order state machine / workflow / approval flow) 

## Not applicable

- Simple CRUD: no audit / temporal needs, CRUD suffices
- High-frequency writes: event store append + projection multiple writes, write amplification severe
- Strong consistency reads: read store is eventually consistent; strongly consistent reads need reading event store (slow) 
- Team unfamiliar: event sourcing complexity is high, team unfamiliar easily pits
- Aggregates with massive events: replay slow, need snapshot optimization

## Landing checklist

1. Selection: EventStoreDB / Axon / Kafka + schema registry / self-built PG event table
2. Event schema: `event_id uuid / aggregate_id / sequence / type / payload json / metadata json / timestamp / version`
3. Aggregate design: domain object + apply function (events -> state) 
4. Event store implementation: append-only + optimistic locking (expected_version) 
5. Snapshot strategy: snapshot every N events, speed up replay
6. Projections: each read model independent projection, subscribe to event stream
7. Read store selection: PG / Redis / Elasticsearch / vector DB, choose by read pattern
8. Idempotent projection: event_id dedup, replay no duplicate writes
9. CQRS linkage: writes = event store, reads = projections, separated
10. Link with outbox: event store is outbox source, bus.publish in same transaction
11. Link with saga: saga choreography subscribes to event stream, each step triggers next event
12. Temporal query: replay events by timestamp + aggregate_id to rebuild state
13. Schema evolution: events immutable, new version events use upcaster to convert old versions
14. Audit: events are the audit, no need for separate audit log
15. Replay drill: periodically replay to rebuild read models, validate schema + upcaster consistency



- **Event embeds current state**: event should record "what happened" not "current state", otherwise loses temporal
- **Projection not idempotent**: replay duplicate writes to read model, must dedup by event_id
- **No snapshot**: long aggregate replay slow, no snapshot -> performance collapses
- **Event schema evolution without upcaster**: old events fail on replay
- **Read store same DB as event store**: loses read-write separation value
- **Business logic in projection**: projection should only project, business rules in aggregate
- **Event store UPDATE / DELETE**: violates append-only, loses audit and temporal
- **No replay drill**: only discovers schema incompatibility when rebuilding read models during failure
- **Event store without version/sequence**: optimistic locking invalid, concurrent writes overwrite
- **Multiple sources of truth**: event store + another DB written simultaneously -> inconsistency

## Related

- Landing cases: pending landing (YiAi BRD Agent multi-step workflow natural event sourcing candidate / RAG index sync event store candidate) 
- Upstream gotcha: lessons/gotchas/sse-ondone-guard (event stream and SSE streaming differ) 
- Downstream ADR: projects/YiAi/adr-knowledge-watcher-deployment (index sync can change to event sourcing) 
- Companion: cqrs-pattern (read-write separation natural fit) / saga-pattern (long transaction choreography) / outbox-pattern (event store is outbox) / idempotency-pattern (projection idempotent) / distributed-tracing-pattern (trace across events) 
