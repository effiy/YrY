---
title: Event-Driven Architecture Pattern
aliases: [event-driven-architecture-pattern, eda-pattern, event-driven]
tags: [pattern, engineering patterns, event-driven, EDA, async]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Services communicate asynchronously through events, enabling loose coupling and independent deployability"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - at least one concrete example or code snippet is provided
related:
  - ./event-sourcing.md
  - ./cqrs.md
  - ./saga.md
  - ./materialized-view.md
  - ../architecture-design/decompose-a-monolith.md
---

# Event-Driven Architecture Pattern

> **As an** engineer, **I want to** event driven architecture, **so that** pattern applied consistently.

## Summary

Services decouple via events; producers do not know consumers; broker relays + topic partitions + offset ordering + replay + DLQ dead-letter + at-least-once + idempotent consumption; works with outbox / event-sourcing / cqrs / saga / cdc; suitable for async / multi-downstream / decoupled scenarios; not suitable for strongly synchronous / simple CRUD.

## Core viewpoints

**EDA is a coupling-reduction strategy, not a performance optimization.** The primary value of event-driven architecture is not throughput -- it is organizational decoupling. When Service A publishes an event instead of calling Service B directly, team A no longer needs to know team B's deployment schedule, API version, or on-call rotation. The event schema becomes the contract, and both teams evolve independently. This organizational benefit consistently outweighs the technical complexity introduced.

**Event schema is a product contract, not an implementation detail.** The moment a second consumer subscribes to an event, the schema becomes a public API. Changing a field name, removing a property, or altering the semantics of an existing field breaks downstream consumers that you may not even know exist. Treat event schemas with the same versioning discipline as REST APIs: schema registry, backward-compatibility checks in CI, and deprecation windows measured in months, not days.

**At-least-once delivery with idempotent consumers is the only reliable foundation.** Exactly-once semantics are either a broker-level fiction (Kafka transactions have narrow scope) or an application-level construct. Designing every consumer to be idempotent from the start -- using event_id deduplication, idempotency keys, and deterministic processing -- is the one pattern that works across all brokers, all failure modes, and all replay scenarios. Do not build a system that assumes exactly-once delivery.

**The DLQ is not a garbage can; it is a work queue.** Dead-letter queues that accumulate events without alerting, without automated retry, and without a human workflow for remediation become the system's dirty secret. Every event in the DLQ represents a broken business process. DLQ must have: per-event-type alerting, a dashboard showing age and count, automated retry with backoff, and an SLA for manual remediation.

**Broker-as-database is the most expensive architectural mistake in EDA.** Using Kafka or RabbitMQ with infinite retention as the permanent system of record creates a system that cannot be queried, indexed, backed up, or migrated without specialized tooling. Events belong in the broker for distribution; they belong in an event store, data lake, or database for long-term storage and query. The broker retention policy should be measured in days, not years.

## Problem

- **Tight coupling**: Service A calls B → B → C → D; chained sync blocking; if any one fails, all fail; avalanche.
- **Sync blocking**: user waits for all downstream; P99 = sum of downstream latencies; timeout during peak; poor experience.
- **Duplicated work**: adding each downstream requires changing business code; DB change + send MQ; transaction boundary broken; inconsistency.
- **Scaling limited**: single instance cannot scale horizontally; sync RPC limits concurrency; queuing during peak.
- **Failure propagation**: downstream failure propagates upstream; no circuit breaker / no fallback; avalanche across the chain.
- **Hard to observe**: no trace_id across services; async chain is a black box; hard to locate failures.

## Pattern

**Core**: Services communicate via events; producers publish events without knowing consumers; consumers subscribe as needed; broker relays + persists + replays.

**Five elements**:
- **Producer**: publish events; unaware of consumers; non-blocking; at-least-once.
- **Broker**: Kafka / RabbitMQ / NATS / Pulsar / Redis Streams; persistence + partitioning + replication.
- **Topic + Partition**: topic partitions; same key ordering; multiple partitions for parallelism.
- **Consumer Group**: each downstream has its own group; offsets managed by itself; no mutual impact.
- **Offset + Replay**: replay from a specified offset; failure recovery; no loss no duplication (with idempotency).

**Key code**:

```python
class EventProducer:
    """Publish events; unaware of consumers; at-least-once + idempotent."""
    def __init__(self, broker, topic):
        self.broker = broker
        self.topic = topic

    def publish(self, event_type, payload, key=None, event_id=None):
        event = {
            "event_id": event_id or uuid_v7(),
            "event_type": event_type,
            "trace_id": current_trace_id(),
            "ts": now_iso(),
            "payload": payload,
        }
        # Same transaction writes outbox table → publisher asynchronously scans outbox to send (at-least-once)
        # Or send directly to broker (no transaction guarantee; not recommended)
        self.broker.produce(self.topic, key=key, value=json.dumps(event))
        return event["event_id"]


class EventConsumer:
    """Subscribe to events; idempotent consumption + DLQ + offset management."""
    def __init__(self, broker, topic, group, handler, dlq):
        self.broker = broker
        self.topic = topic
        self.group = group
        self.handler = handler
        self.dlq = dlq
        self._seen = LRUSet(capacity=100_000)  # event_id idempotent dedup

    def run(self):
        for record in self.broker.consume(self.topic, self.group):
            event = json.loads(record.value)
            if event["event_id"] in self._seen:
                self.broker.commit(self.group, record.offset)
                continue
            try:
                self.handler(event)  # business idempotent
                self._seen.add(event["event_id"])
                self.broker.commit(self.group, record.offset)
            except Exception as e:
                self._dlq(event, e)  # dead letter
                self.broker.commit(self.group, record.offset)  # do not block the stream


class EventBus:
    """event routing + multi consumer group broadcast."""
    def __init__(self, broker, routes):
        self.broker = broker
        self.routes = routes  # topic -> [consumer_groups]

    def dispatch(self, topic, event):
        self.broker.produce(topic, value=event)
        # broker internally routes by partition + broadcasts to multiple groups
```

## Applicable

- Async tasks (order create → inventory / notification / points / audit multi-downstream)
- Multi-downstream subscribing to the same change (CDC / outbox event → cache / search / vector / materialized view)
- Service decoupling (producer unaware of consumer; can evolve independently)
- Peak shaving (peak writes to broker; downstream consumes at its own pace)
- Long-process orchestration (saga cross-service long transactions; choreography mode)
- Real-time data pipeline (OLTP → OLAP / lakehouse)
- Cross-team boundary contract (event schema is the contract)
- Microservice communication (replace sync RPC to reduce coupling)

## Not applicable

- Strong sync requirement (user waits for return result; sync RPC + sync replica more appropriate)
- Simple CRUD (CRUD is enough; EDA is over-engineering)
- Single instance / monolithic application (no multi-service communication need)
- Strong consistency transaction (EDA is eventually consistent; use ACID or saga + outbox)
- Extreme low latency (broker relay +1-10ms; use RPC or shared memory)
- Complex query / report (use OLAP / materialized view)
- Debug / fault localization (async chain is hard to trace; needs trace_id + chain observability)

## Landing checklist

1. **Choose broker**: Kafka (high throughput + persistence + stream processing) / RabbitMQ (low latency + routing) / NATS (lightweight + cloud-native) / Pulsar (multi-tenant + tiered storage) / Redis Streams (simple + low latency).
2. **topic design**: by business domain + entity + event type; name `<domain>.<entity>.<event>`; do not put multiple event types in one topic.
3. **partition**: partition by key to preserve order; partition count = expected parallelism; same key consumed in order.
4. **event schema**: schema registry + upcaster; event immutable + event_id + trace_id + ts + payload; do not embed current state.
5. **at-least-once + idempotency**: producer retry + consumer event_id dedup; do not assume exactly-once (unless broker supports it).
6. **DLQ dead letter**: consumption failure events go to DLQ + alert + manual handling; do not drop events; do not block the stream.
7. **offset management**: consumer group manages its own offset; commit after business success; do not auto-commit.
8. **replay**: replay from a specified offset / timestamp; failure recovery; idempotency ensures downstream eventual consistency.
9. **lag monitoring**: consumer_lag_ms / event_age_ms alerts; lag > 60s alert; lag > 5min page.
10. **trace_id throughout**: events must carry trace_id; must pass across async boundaries; distributed tracing spans logs + metrics + traces.
11. **schema evolution**: adding fields backward compatible; deleting fields deprecate first; changing types needs upcaster; CI compatibility check.
12. **contract test**: producer / consumer bidirectional contract test; schema change CI block.
13. **with outbox**: DB change + event publish in the same transaction writes outbox; at-least-once; do not double-write in business code.
14. **with CDC**: CDC is a log-based event stream source; can replace business code emitting events.
15. **do not use broker as DB**: broker does not store data long-term; retention 7 days + compaction; long-term storage goes to event store / lakehouse.



- **Sync RPC chain**: A → B → C → D; if any one fails all fail; avalanche; fix: EDA + outbox + idempotent consumption.
- **Business code double-write**: change DB then send MQ; transaction boundary broken; inconsistent; fix: outbox same transaction + publisher async.
- **Event embeds current state**: event contains all entity fields; downstream reads event without querying DB; schema evolution breaks; fix: event contains changed fields + entity_id; downstream queries as needed.
- **No dedup**: events consumed repeatedly; downstream state corrupt; fix: event_id idempotency.
- **lag not monitored**: consumer lags hours unnoticed; downstream data stale; fix: lag_ms alert + fallback scheduled refresh.
- **Auto commit**: business failure but offset already committed; event lost; fix: commit after business success.
- **Broker as DB**: broker stores data long-term; retention fills disk; fix: retention + compaction + long-term storage to event store.
- **schema not evolved**: adding fields without notifying downstream; downstream parsing breaks; fix: schema registry + upcaster + contract test.
- **No DLQ**: consumption failure events dropped; no alert; fix: DLQ + alert + manual handling.
- **trace_id not passed**: async chain black box; hard to locate faults; fix: events must carry trace_id + chain observability.
- **Multiple downstreams sharing one consumer group**: mutual blocking; fix: each downstream its own group.
- **Cross-broker data migration without replay**: migration drops events; fix: dual-write + verify + switch stream + delete old.
- **EDA as strong consistency**: EDA is eventually consistent; for strong consistency use ACID or saga + outbox; fix: annotate consistency level.

## Related

- [outbox-pattern](../infrastructure/outbox.md) — outbox implements atomic event publish (core tie-in)
- [event-sourcing-pattern](./event-sourcing.md) — event store is the event stream source (core tie-in)
- [cqrs-pattern](./cqrs.md) — EDA drives read-model refresh (core tie-in)
- [saga-pattern](./saga.md) — saga choreography subscribes to events to trigger next step (core tie-in)
- [cdc-pattern](../engineering/cdc.md) — CDC is a log-based event stream source
- [materialized-view-pattern](./materialized-view.md) — EDA events drive streaming materialized-view refresh
- [backpressure-pattern](../infrastructure/backpressure.md) — broker + consumer speed matching + backpressure
- [distributed-tracing-pattern](../engineering/distributed-tracing.md) — trace_id must pass across async boundaries
- [idempotency-pattern](../infrastructure/idempotency.md) — at-least-once + event_id idempotency co-built
- [bulkhead-pattern](./bulkhead.md) — each consumer group independent resource pool isolation
- landing cases: pending landing YiAi knowledge-watcher event bus + RAG index sync
- upstream: [../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md](../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-a-data-architecture-strategy.md)
- upstream: [../tools/set-up-a-data-pipeline.md](../infrastructure/set-up-a-data-pipeline.md)
- downstream: [../lessons/gotchas/README.md](../lessons/README.md)
