---
title: Outbox publisher pattern
aliases: [outbox-publisher-pattern, outbox-publisher, transactional-outbox-publisher]
tags: [engineering-pattern, event-publishing, transactional-outbox, consistency]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: pattern
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer, tech-lead, oncall-sre]
benefit: "Outbox messages are polled and published to message brokers reliably, decoupling database writes from message delivery"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
- ./outbox.md
  - ./idempotency.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Outbox publishing is not just delivery; it is a contract. transaction + persistence + delivery + idempotency + retry five dimensions; Business-value driven; not one-shot; measurable
---

# Outbox publisher pattern

> **As an** engineer, **I want to** outbox publisher, **so that** pattern applied consistently. 

## Summary

- Outbox publishing = contract; not just delivery
- transaction + persistence + delivery + idempotency + retry five dimensions; no missing dimension
- Business-value driven; not by gut feel
- covers poll-based / CDC-based / trigger-based multiple forms
- and outbox + cdc + event-driven + idempotency + distributed-tracing + saga + saga-with-compensation + graceful-degradation linkage
- Publicly queryable; not hidden
- First principles / inversion / second-order / Occam

## Problem

Directly sending events in business code (e.g. Kafka send / RabbitMQ publish) will cause: 

- DB write success + event send failure — data persisted but downstream unaware; data inconsistent
- DB write failure + event sent — downstream received event but source data missing; misleading
- cross DB + broker distributed transaction — impossible / performance disaster
- event loss — business thinks it was sent but broker never received; downstream never waits
- event duplication — retry causes downstream duplicate processing; needs idempotency protection

inversion thinking: if business can tolerate events occasionally lost + occasionally duplicated + no trace, send directly; no outbox needed. But the vast majority of business systems cannot tolerate this. 

## Pattern

```python
from dataclasses import dataclass
from typing import Callable, Awaitable
from enum import Enum

class OutboxState(Enum):
    PENDING = "pending"     # persisted, awaiting delivery
    IN_FLIGHT = "in_flight"  # delivering
    DELIVERED = "delivered"  # delivery confirmed
    FAILED = "failed"        # delivery failed, into DLQ

@dataclass
class OutboxEvent:
    event_id: str           # globally unique; downstream idempotency key
    aggregate_id: str
    event_type: str
    payload: dict
    created_at: str
    state: OutboxState
    retry_count: int = 0

class OutboxPublisher:
    """transaction + persistence + delivery + idempotency + retry"""
    def __init__(self, db, broker, cdc_source=None):
        self._db = db
        self._broker = broker
        self._cdc = cdc_source  # optional CDC replacing poll

    async def publish_in_transaction(self, business_op: Callable, event: OutboxEvent) -> None:
        """business write + event persistence in same transaction"""
        async with self._db.transaction() as tx:
            await business_op(tx)  # business write
            await tx.insert("outbox", event.__dict__)  # event persistence
            # only visible after commit; all or nothing

    async def poll_and_publish(self, batch_size: int = 100) -> None:
        """poll-based: pull pending → deliver → mark delivered"""
        events = await self._db.query(
            "SELECT * FROM outbox WHERE state = 'pending' ORDER BY created_at LIMIT ?",
            batch_size
        )
        for ev in events:
            await self._try_publish(ev)

    async def _try_publish(self, ev: OutboxEvent) -> None:
        try:
            await self._db.update_state(ev.event_id, OutboxState.IN_FLIGHT)
            # deliver to broker; only counts as success when broker acks
            await self._broker.publish(ev.event_type, ev.payload, key=ev.aggregate_id,
                                       headers={"event_id": ev.event_id})
            await self._db.update_state(ev.event_id, OutboxState.DELIVERED)
        except Exception as e:
            await self._handle_failure(ev, e)

    async def _handle_failure(self, ev: OutboxEvent, e: Exception) -> None:
        ev.retry_count += 1
        if ev.retry_count < MAX_RETRIES:
            # exponential backoff retry
            await self._db.update_state(ev.event_id, OutboxState.PENDING, ev.retry_count)
            await self._schedule_retry(ev, backoff=2 ** ev.retry_count)
        else:
            # exceeded retry limit → DLQ + alert
            await self._db.update_state(ev.event_id, OutboxState.FAILED)
            await self._send_to_dlq(ev, e)
            await self._alert_outbox_failure(ev, e)
```

### Five dimensions

1. **transaction** — business write + event persistence in same transaction; all or nothing
2. **persistence** — outbox table persists event_id / aggregate_id / type / payload / state / retry_count
3. **delivery** — poll-based (periodically pull pending) or CDC-based (binlog real-time stream); only mark delivered after ack
4. **idempotency** — event_id globally unique; downstream consumers dedupe by event_id; retry safe
5. **retry** — exponential backoff + retry limit + DLQ + alert; no silent loss

## Applicable

- business write + event send require atomicity
- cross DB + broker without 2PC
- downstream at-least-once delivery
- business tolerates second-level latency (poll / CDC) 
- event replay + retracing needs

## Not applicable

- strongly consistent real-time events — should use synchronous RPC + business redesign
- losing an event once is fatal + no idempotency — should change business or use 2PC
- extremely high throughput + single-point DB outbox table bottleneck — should partition outbox / multi broker
- business without downstream consumers — no events needed
- simple business + no concurrency — just send directly; outbox is over-engineering

## Landing checklist

1. **outbox table** — event_id PK / aggregate_id / event_type / payload JSON / state / retry_count / created_at / delivered_at
2. **transaction boundary** — business write + outbox insert in same transaction; visible after commit
3. **poll-based** — periodically pull pending → IN_FLIGHT → deliver → DELIVERED; simple / second-level latency
4. **CDC-based** — binlog / WAL stream subscription; real-time / complex
5. **trigger-based** — DB trigger writes outbox; not recommended / poor performance / hard to maintain
6. **event_id globally unique** — UUID / snowflake; downstream idempotency key
7. **at-least-once** — only mark delivered when broker acks; may redeliver; downstream idempotent
8. **retry strategy** — exponential backoff + retry limit (e.g. 8 times) + DLQ + alert
9. **state machine** — PENDING / IN_FLIGHT / DELIVERED / FAILED; persisted + recoverable
10. **watchdog** — IN_FLIGHT timeout returns to PENDING; prevent publisher crash from getting stuck
11. **DLQ** — FAILED events into DLQ; manual intervention
12. **trace_id** — outbox table stores trace_id; downstream consumption continues
13. **schema registry** — event payload schema evolution + upcaster
14. **observability** — outbox lag / delivery rate / failure rate / DLQ size / average latency
15. **batch delivery** — single publisher multiple events batched; improve throughput
16. **partitioned outbox** — partition by aggregate_id hash; multiple publishers in parallel

## Anti-patterns

- business code directly broker.publish — DB + broker inconsistent
- cross DB + broker 2PC — impossible / performance disaster
- outbox table without event_id — downstream cannot be idempotent
- outbox table without state — cannot recover after publisher crash
- no DLQ — failure silently lost; downstream never waits
- no watchdog — IN_FLIGHT stuck forever
- no retry limit — infinite retries drag down system
- no idempotency — retries cause downstream duplicate processing
- poll frequency too high — high DB pressure; too frequent
- poll frequency too low — high latency
- payload schema not evolving — upgrade breaks downstream
- no trace_id — cross-service chain breaks
- outbox table not cleaned — table grows larger; performance degrades
- shared business DB table — outbox mixed with business; hard to maintain

## Related

- [outbox-pattern.md](./outbox.md) — outbox basics
- [cdc-pattern.md](../engineering/cdc.md) — CDC-based publisher
- [event-driven-architecture-pattern.md](../architecture-design/event-driven-architecture.md) — event-driven co-built
- [idempotency-pattern.md](./idempotency.md) — event_id idempotency
- [distributed-tracing-pattern.md](../engineering/distributed-tracing.md) — trace_id throughout
- [saga-pattern.md](../architecture-design/saga.md) — saga forward through outbox
- [saga-with-compensation-pattern.md](../architecture-design/saga-with-compensation.md) — saga compensation events
- [graceful-degradation-pattern.md](../architecture-design/graceful-degradation.md) — outbox failure degradation
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
