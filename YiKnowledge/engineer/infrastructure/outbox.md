---
title: Outbox Pattern / Outbox Pattern
aliases: [outbox-pattern, outbox, transactional-outbox, event-outbox]
tags: [pattern, engineering-pattern, outbox, transactional-outbox, event-driven, eventual-consistency, reliable-messaging]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: DB change and event publish atomic; same transaction writes outbox table + async publisher sends; not directly sending MQ to avoid failure inconsistency; at-least-once + consumer idempotent; links with saga
roles: [engineer, tech-lead, oncall-sre]
benefit: "Messages are reliably published alongside database transactions using an outbox table, ensuring at-least-once delivery"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ./idempotency.md
  - ./retry-with-backoff.md
  - ../projects/build-a-rag-pipeline.md
  - ../architecture-design/decompose-a-monolith.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
---

# Outbox Pattern / Outbox Pattern

> **As an** engineer, **I want to** outbox, **so that** pattern applied consistently.

## Summary

- DB change + event publish atomic; same transaction writes outbox table
- Not directly sending MQ; direct send causes failure inconsistency
- Async publisher scans outbox and sends to MQ
- at-least-once + consumer idempotent
- Links with saga; saga uses outbox to send events
- Order guarantee (same partition)
- failure retry + dead letter
- observable: lag + send rate + failure rate
- LLM scenario: RAG change + index event atomic

## Problem

Pain points of DB change + message publish:

1. **Direct MQ send failure**: DB change success, MQ send failure → data inconsistency
2. **Direct MQ send partial failure**: DB change success, MQ partial send success partial failure → message loss
3. **Send MQ first then update DB**: MQ send success, DB change failure → ghost message
4. **Update DB first then send MQ**: DB change success, MQ send failure → data changed but message not sent
5. **2PC unavailable**: DB + MQ cross-system 2PC impractical
6. **Application crash**: DB changed then app crashes, MQ not sent → message loss
7. **Order disorder**: Multiple event order disorder causes downstream processing errors
8. **Duplicate send**: MQ retry causes downstream duplicate processing
9. **observable missing**: Unknown which events were sent and which not
10. **LLM scenario**: RAG change + index event not atomic causes index drift

Quantified: systems not using outbox have DB + MQ inconsistency rate 0.01-0.1%; post-failure manual reconciliation cost is extremely high.

## Pattern

### Same transaction writes outbox table

```python
# DB transaction
async def update_business(data):
    async with db.transaction():
        await db.update_business(data)
        await db.insert_outbox({
            "event_type": "business_updated",
            "payload": data,
            "status": "pending",
            "created_at": now(),
        })
    # After transaction commit, outbox has record, not lost even if app crashes
```

- **Same transaction atomic**: DB change + outbox write atomic
- **outbox is DB table**: Same DB same transaction as business table
- **Not directly sending MQ**: First enter outbox table
- **Crash not lost**: After transaction commit outbox persists

### Async publisher scans outbox

```python
async def outbox_publisher():
    while True:
        events = await db.fetch_pending_outbox(limit=100)
        for event in events:
            try:
                await mq.publish(event.topic, event.payload)
                await db.mark_outbox_published(event.id)
            except Exception:
                # Retry next scan
                continue
        await asyncio.sleep(1)
```

- **Polling scan**: Scan pending outbox every second
- **Mark after send**: Mark published after send success
- **failure retry**: Don't mark on failure, retry next time
- **at-least-once**: At least sent once (may duplicate)
- **Consumer idempotent**: Consumer must be idempotent (duplicate harmless)

### at-least-once + consumer idempotent

```
producer: at-least-once (may duplicate send)
consumer: idempotent (duplicate consumption harmless)
idempotency key: event_id unique
```

- **at-least-once**: producer guarantees at least one send
- **Consumer idempotent**: consumer uses event_id to dedupe
- **Idempotency key**: event_id (uuid) unique identifier
- **Dedupe storage**: Redis / DB records processed event_id

### Order guarantee

```
same partition:
  event A (event_id=1) → partition by key=order_id
  event B (event_id=2) → same partition
  consumer: process in order
```

- **partition by key**: Same key (e.g. order_id) into same partition
- **Same partition order**: FIFO order guarantee
- **Cross partition no order**: Cross key no order
- **Event version**: event must carry version to prevent old overwriting new

### failure retry + dead letter

```python
max_retries = 5
backoff = exponential(1s, 2s, 4s, 8s, 16s)

for event in outbox:
    if event.retries >= max_retries:
        await db.move_to_dead_letter(event.id)
        alert_oncall(event)
        continue
    try:
        await mq.publish(event)
        await db.mark_published(event.id)
    except Exception:
        await db.increment_retries(event.id)
```

- **Max retry**: 5 times
- **Backoff**: Exponential backoff
- **Dead letter queue**: Over max retry enter dead letter
- **Alert**: Dead letter triggers oncall

### Dual-write scenario

```
Dual-write: DB_A + DB_B
  DB_A transaction:
    update_A
    insert_outbox_A(event: sync_to_B)
  publisher_A:
    on event, write to DB_B
    mark published
```

- **Dual-write consistency**: DB_A + outbox same transaction, DB_B eventually consistent via outbox event
- **Crash recovery**: DB_A crashes after commit, publisher restarts and continues sending
- **Don't directly write B**: No DB_A + DB_B same transaction (cross DB)

### LLM scenario: RAG index event

```python
async def update_doc(doc):
    async with db.transaction():
        await db.update_doc(doc)
        await db.insert_outbox({
            "event_type": "doc_updated",
            "doc_id": doc.id,
        })

# publisher: listen doc_updated trigger reindex
async def on_doc_updated(event):
    await vector_db.upsert(event.doc_id)
    await db.mark_outbox_published(event.id)
```

- **DB change + index event atomic**: No drift
- **Crash not lost**: After DB commit outbox has record
- **Retry safe**: reindex idempotent (same doc_id upsert)
- **Knowledge Watcher link**: YiAi watcher monitors file changes triggers reindex

### Link with saga

```
saga step:
  DB update + outbox event (same transaction)
  outbox publisher → send event
  downstream service → on event, do next step
```

- **saga uses outbox to send event**: DB change + event atomic
- **Choreography saga natural fit**: event-driven
- **Orchestration saga also uses**: Coordinator writes outbox

### observable

```
metrics:
  outbox_pending_count (unsent lag)
  outbox_publish_rate (send rate)
  outbox_failure_rate (failure rate)
  outbox_retry_count (retry count)
  outbox_dead_letter_count (dead letter count)
  event_lag (event end-to-end latency)
```

- **pending count**: Unsent backlog alert
- **publish rate**: Send throughput
- **failure rate**: Send failure rate
- **dead letter count**: Dead letter alert
- **event lag**: End-to-end latency (outbox write → consumption complete)

## Applicable

- **DB + MQ consistency**: Business change + message publish atomic
- **Microservice event-driven**: Reliable events between services
- **Dual-write consistency**: Cross-DB dual-write eventual consistency
- **saga choreography**: Saga step events
- **LLM index sync**: DB change + vector index event atomic
- **Audit log**: Business change + audit event atomic

## Not applicable

- **Single service single DB**: Local transaction sufficient
- **Strong consistency need**: Strong consistency use sync call
- **Read-only**: No side effect no outbox needed
- **Low frequency operation**: Low frequency use sync call simpler

## Landing checklist

1. **outbox table**: id + event_type + payload + status + retries + created_at + published_at
2. **Same transaction write**: Business change + outbox write same transaction
3. **Async publisher**: Poll scan pending send MQ
4. **at-least-once**: Mark after send + failure retry
5. **Consumer idempotent**: consumer uses event_id to dedupe
6. **Order guarantee**: partition by key
7. **failure retry + backoff**: Exponential backoff + max retry
8. **Dead letter queue**: Over max retry enter dead letter + alert
9. **observable**: pending / publish rate / failure rate / dead letter / event lag
10. **chaos verification**: Inject MQ failure verify outbox not lost
11. **Cleanup strategy**: Sent outbox periodically clean or archive
12. **Partition selection**: Kafka partition / Redis stream / DB polling

## Anti-patterns

- **Direct send MQ**: DB change + MQ send not in same transaction, failure inconsistency
- **Send MQ first then update DB**: Ghost message
- **outbox in memory**: outbox not in DB lost on crash
- **Consumer not idempotent**: Duplicate consumption side effect
- **No order guarantee**: Cross key order disorder
- **No retry**: failure not retry lose message
- **No dead letter**: Over max not enter dead letter, permanently stuck
- **No alert**: Dead letter not alert
- **Not observable**: Unknown pending / lag
- **publisher blocks main process**: Sync publisher blocks business
- **No chaos verification**: When MQ fails unknown whether lost
- **LLM index not atomic**: DB change + index drift

## Related

- saga: [./saga.md](../architecture-design/saga.md) — saga uses outbox to send events
- Idempotent: [./idempotency.md](./idempotency.md) — consumer idempotent co-built
- Retry backoff: [./retry-with-backoff.md](./retry-with-backoff.md) — send retry
- Circuit breaker: [./circuit-breaker.md](../architecture-design/circuit-breaker.md) — MQ failure circuit breaker
- observable: [./observability.md](../engineering/observability.md) — outbox metrics
- Graceful degradation: [./graceful-degradation.md](../architecture-design/graceful-degradation.md) — MQ unavailable degradation
- Timeout budget: [./timeout-budget.md](./timeout-budget.md) — publisher budget
- journeys: [set-up-a-data-pipeline](set-up-a-data-pipeline.md) + [migrate-data](migrate-data.md) + [build-a-rag-pipeline](../projects/build-a-rag-pipeline.md) + [decompose-a-monolith](../architecture-design/decompose-a-monolith.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) (consistency problem essence) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) (not direct send = reverse first enter table) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) (at-least-once second-order idempotent) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md) (outbox the simpler the better)
