---
title: Backpressure Pattern
aliases: [backpressure-pattern, backpressure, flow-control, load-shedding-backpressure]
tags: [pattern, engineering-pattern, backpressure, flow-control, producer-consumer, load-shedding, stream-processing]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: When production > consumption, apply backpressure; do not buffer infinitely. Feed back to producer to slow down / drop / reject; link with rate limiting + degradation + bulkheads; no pile-up, no overflow
roles: [engineer, tech-lead, oncall-sre]
benefit: "Downstream consumers signal their capacity to upstream producers, preventing buffer overflow and resource exhaustion"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ./outbox.md
  - ../engineering/scale-a-service.md
  - ../quality-security/do-a-load-test.md
  - ../projects/build-a-rag-pipeline.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
---

# Backpressure Pattern

> **As an** engineer, **I want to** backpressure, **so that** pattern applied consistently.

## Summary

- When production > consumption, apply backpressure; do not buffer infinitely
- Three strategies: slow down / drop / reject
- Feed back to producer; do not carry it alone
- Link with rate limiting + degradation + bulkheads
- No pile-up, no overflow; bounded queue
- Streaming LLM is a natural backpressure scenario
- Consumption lag monitoring; alerting
- Backpressure ≠ slow; it is controllable
- Async + flow control + feedback
- End-to-end backpressure; cross-service
- First principles / inversion / second-order / Occam

## Problem

Pain points when production > consumption:

1. **Infinite buffer**: memory blows up, OOM
2. **Queue pile-up**: message latency grows unbounded
3. **Resource exhaustion**: consumer crushed
4. **Avalanche**: slow consumption → queue pile-up → memory blow-up → service crash → producer also crashes
5. **No feedback**: producer unaware consumption is slow, keeps producing furiously
6. **Fairness issues**: slow consumers drag down fast consumers
7. **Latency explosion**: long queue = large latency
8. **LLM streaming**: tokens produced fast, consumed slow; without backpressure it blows up
9. **Batch crush**: batch producer dumps everything at once on consumer
10. **No end-to-end backpressure across services**: A backpressures B, B does not backpressure C, C blows up

Quantification: systems without backpressure, OOM failure rate under burst traffic is 30%+; consumption latency can reach hours or even infinity.

## Pattern

### Three strategies

```
backpressure strategies:
  1. slow down: feed back to producer to slow down
  2. drop: drop some messages
  3. reject: reject reception
```

- **Slow down**: feed back to producer to slow down; most elegant
- **Drop**: drop some messages (latest / oldest / random)
- **Reject**: reject reception; return error
- **Strategy selection**: prefer slow down when possible; reject if key messages cannot be lost

### Bounded queue

```python
queue = BoundedQueue(capacity=1000)
queue.on_full = DROP_OLDEST  # or BLOCK / DROP_NEWEST / REJECT

def produce(item):
    if queue.full():
        if queue.on_full == BLOCK:
            wait()  # feed back to producer to slow down
        elif queue.on_full == DROP_OLDEST:
            queue.drop_oldest()
            queue.put(item)
        elif queue.on_full == REJECT:
            raise QueueFullError()
    else:
        queue.put(item)
```

- **Bounded**: must have a cap, not infinite
- **Full strategy**: BLOCK / DROP_OLDEST / DROP_NEWEST / REJECT
- **BLOCK**: block producer to slow down (suitable for important, non-droppable)
- **DROP_OLDEST**: drop oldest (suitable for real-time streams)
- **DROP_NEWEST**: drop newest (suitable for preserving history)
- **REJECT**: reject (producer retries or degrades)

### Feedback to producer

```python
# pull-based (consumer pulls)
consumer.pull()  # consumer pulls based on capacity

# push-based + feedback (producer pushes + consumer feeds back)
consumer.ack_capacity = 100
while True:
    if consumer.ack_capacity > 0:
        msg = producer.next()
        consumer.process(msg)
        consumer.ack_capacity -= 1
    # if consumer capacity full, do not pull; producer blocks
```

- **pull-based**: consumer pulls based on capacity; natural backpressure
- **push-based + feedback**: consumer feeds back capacity; producer pushes by capacity
- **credit-based**: consumer issues credit; producer sends by credit
- **TCP flow control**: window size = backpressure

### End-to-end backpressure

```
producer → A → B → consumer
  producer backpressures A
  A backpressures B
  B backpressures consumer
End-to-end backpressure: consumer slow → B slow → A slow → producer slow
```

- **Cross-service backpressure**: each hop backpressures the previous hop
- **Not local**: A backpressures B but B does not backpressure C, then C blows up
- **Streaming systems**: Reactive Streams / Rx standardizes
- **HTTP/2 flow control**: HTTP/2 frame-level backpressure

### Streaming LLM backpressure

```python
async def stream_llm(prompt):
    async for token in llm.stream(prompt):
        if consumer.is_slow():  # client consumes slowly
            await asyncio.sleep(0.01)  # slow down
            # or pause LLM generation (some providers support it)
        yield token
```

- **Client consumes slowly**: client processing slow; without backpressure server buffer blows up
- **Slow down**: server sleep to slow down
- **Pause generation**: some LLM providers support pause / resume
- **token-level**: check consumption speed at each token
- **Link with idempotency**: resume not retry

### Rate limiting + degradation + bulkhead linkage

- **Rate limiting front**: rate limiting filters a wave first
- **Bulkhead isolation**: slow consumers in separate pool, not dragging others
- **Degradation backstop**: exceeding capacity goes to degradation
- **Trio + backpressure**: combo

### Consumption lag monitoring

```
metrics:
  queue_size (queue length)
  consumer_lag (consumption latency)
  drop_count (drops)
  reject_count (rejections)
  backpressure_duration (backpressure duration)
```

- **queue size**: queue length alert
- **consumer lag**: consumption latency alert
- **drop / reject count**: drop / reject alerts
- **backpressure duration**: how long backpressure persists
- **backpressure trigger rate**: trigger frequency = system overload signal

### Batch backpressure

```
batch producer → consumer
  batch size adapts to consumer capacity
  not all at once
  split by consumption capacity
```

- **Batch size adaptation**: split batches by consumption capacity
- **Not one-shot dump**: dump in batches
- **ack then next batch**: only send next batch after consumer ack
- **Rate-limited batch production**: batch production also rate-limited

### Streaming processing systems

| System | Backpressure mechanism |
|---|---|
| Kafka | consumer pull (pull by capacity) |
| RabbitMQ | prefetch count (consumer declares capacity) |
| Reactive Streams | credit-based (standard) |
| gRPC streaming | flow control window |
| HTTP/2 | flow control frame |
| Python asyncio.Queue | maxsize + block |
| RxJava / RxJS | credit-based |

- **Kafka**: consumer pull, natural backpressure
- **RabbitMQ**: prefetch count declares capacity
- **Reactive Streams**: standard credit-based
- **gRPC / HTTP/2**: flow control window

## Applicable

- **Production-consumption imbalance**: production > consumption
- **Stream processing**: token / event / message streams
- **LLM streaming**: token-level backpressure
- **Batch processing**: large batch dumped on consumer
- **Cross-service calls**: upstream-downstream imbalance
- **Data pipelines**: ETL production-consumption

## Not applicable

- **Balanced production-consumption**: similar frequency, no backpressure needed
- **Synchronous calls**: sync is natural backpressure
- **Low-frequency operations**: low frequency, no pile-up risk
- **No queue**: no queue, no backpressure

## Landing checklist

1. **Bounded queue**: all queues must have a cap
2. **Full strategy selection**: BLOCK / DROP / REJECT by scenario
3. **Feedback to producer**: pull-based or credit-based
4. **End-to-end backpressure**: each hop backpressures
5. **Rate limiting front**: rate limiting + backpressure combo
6. **Bulkhead isolation**: slow consumers in separate pool
7. **Degradation backstop**: exceed capacity → degradation
8. **LLM streaming backpressure**: token-level checks
9. **Batch processing split**: split batches by capacity
10. **lag monitoring**: queue size / lag / drop / reject
11. **Chaos validation**: inject slow consumption to verify backpressure
12. **Streaming system selection**: Kafka / RabbitMQ / Reactive Streams by scenario

## Anti-patterns

- **Infinite buffer**: unbounded queue OOM
- **No feedback**: producer unaware of slow consumption
- **Drop without alerting**: drops without alerts
- **Local backpressure only**: A backpressures B but B does not backpressure C
- **Sync BLOCK blocking main thread**: blocks thread resources
- **LLM without backpressure**: client slow → server buffer blows up
- **Batch one-shot dump**: large batch crushes consumer
- **No lag monitoring**: unaware how long queue is, how slow consumption is
- **No linkage with rate limiting / degradation / bulkheads**: backpressure alone
- **No chaos validation**: do not know if it works when consumption slow
- **Excessive dropping**: chooses drop when slow down would do; drops important messages
- **No full strategy**: stuck when full without a strategy

## Related

- Rate limiting: [./rate-limiting.md](../engineering/rate-limiting.md) — front rate limiting co-built
- Bulkhead isolation: [./bulkhead.md](../architecture-design/bulkhead.md) — slow consumer isolation co-built
- Graceful degradation: [./graceful-degradation.md](../architecture-design/graceful-degradation.md) — over-capacity degradation co-built
- Circuit breaker: [./circuit-breaker.md](../architecture-design/circuit-breaker.md) — consumer failure circuit breaker co-built
- Load shedding: [./shed-load.md](../engineering/shed-load.md) — drop partial load co-built
- Observability: [./observability.md](../engineering/observability.md) — lag monitoring co-built
- Saga: [./saga.md](../architecture-design/saga.md) — backpressure between long-transaction steps
- Outbox: [./outbox.md](./outbox.md) — outbox publisher backpressure
- Journeys: [set-up-a-data-pipeline](set-up-a-data-pipeline.md) + [scale-a-service](../engineering/scale-a-service.md) + [do-a-load-test](../quality-security/do-a-load-test.md) + [build-a-rag-pipeline](../projects/build-a-rag-pipeline.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) (production-consumption imbalance essence) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) (inversion = feed back to producer) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) (backpressure second-order prevents avalanche) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md) (sync sufficient, do not introduce backpressure)
