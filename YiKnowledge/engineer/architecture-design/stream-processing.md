---
title: stream handling pattern / Stream Processing Pattern
aliases: [stream-processing-pattern, stream-pattern, flink-stream-pattern]
tags: [pattern, engineering-pattern, stream, data, realtime, flink]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: stream handling is not just real-time; it is a contract. window + watermark + checkpoint + backpressure + exactly-once five dimensions; business-value driven; measurable
roles: [engineer, tech-lead, oncall-sre]
benefit: "Real-time data streams are processed reliably with backpressure, exactly-once semantics, and fault tolerance"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./batch-processing.md
 - ./outbox-publisher.md
 - ./cdc.md
 - ./backpressure.md
 - ./idempotency.md
 - ./distributed-tracing.md
 - ./contract-test-baseline.md
 - ../projects/yiai/architecture.md
---

# stream handling Pattern / Stream Processing Pattern

> **As an** engineer, **I want to** stream processing, **so that** pattern applied consistently.

## Summary

- stream handling = contract; not just real-time
- window + watermark + checkpoint + backpressure + exactly-once five dimensions; no missing dimension
- Complementary with batch-processing; not mixed
- Flink / Kafka Streams / Pulsar Functions / Spark Structured Streaming toolchain

## Core viewpoints

**The watermark is not a configuration parameter -- it is a business decision about how much staleness you can tolerate.** A watermark delay of 30 seconds means your dashboard is 30 seconds behind reality. A delay of 5 minutes means your fraud detection is 5 minutes late. The watermark trades freshness for completeness; the right value is the point where the cost of acting on stale data exceeds the cost of waiting for late data.

**Exactly-once is a property of the sink, not the stream.** The stream itself can only deliver at-least-once. Exactly-once semantics come from the sink's ability to deduplicate by transaction ID. If the sink is append-only with no dedup key, no amount of stream-level configuration will prevent duplicates on replay.

**Backpressure is not a performance optimization -- it is the only thing preventing a cascading failure.** When the sink slows down, the stream processor buffers. When the buffer fills, the consumer slows down. When the consumer slows down, the broker exerts backpressure on the producer. Without this chain, a slow sink causes OOM in the processor, which causes message loss, which causes data corruption downstream.

**Checkpoint interval is a trade between recovery time and overhead, and the wrong choice is worse than no checkpoint at all.** Too frequent (every 1 second) and checkpoint I/O dominates processing time. Too infrequent (every 30 minutes) and a failure loses 30 minutes of work. The right interval is the point where checkpoint overhead is below 5% of processing time and recovery time is within the SLA window.

**Late data is not an error -- it is a permanent feature of distributed systems.** Network partitions, clock skew, and mobile clients with poor connectivity guarantee that some data will arrive after the watermark. Dropping late data silently is data loss. The stream must have a side-output path for late data, with a reconciliation process that runs periodically.

## Key info

- **Window types**: tumbling (fixed-size, non-overlapping, e.g., "every 5 minutes"), sliding (fixed-size, overlapping, e.g., "last 5 minutes, updated every 1 minute"), session (activity-based, gap-defined, e.g., "user session with 30-minute inactivity gap"), global (one window, triggers on each element). Tumbling is the most common; session is the most expensive (requires per-key timer state). The choice determines whether late data can be reassigned to the correct window or must be routed to the side output.
- **Watermark generation strategies**: periodic (emitted every N ms, the most common), punctuated (emitted when a special record indicates no more data below a timestamp), idle-source timeout (marks a partition as idle when no data arrives for N ms, preventing the watermark from stalling). A stalled watermark (partition idle without timeout) blocks all downstream windows indefinitely -- the most common cause of "my Flink job stopped producing output."
- **Exactly-once semantics**: achieved via two-phase commit between the stream processor and the sink (Kafka transactions for Kafka sink, DynamoDB Streams transactional writes, or idempotent upserts with deterministic keys). The cost is 15-30% throughput overhead. The alternative is at-least-once with idempotent sinks, which is simpler and achieves the same end result for most use cases -- the "exactly-once" checkbox is worth the overhead only for financial reconciliation or audit-trail systems.
- **Flink vs Kafka Streams**: Flink (separate cluster, true streaming, SQL API, exactly-once, checkpoint-based recovery) suits high-throughput heterogeneous pipelines. Kafka Streams (library in your app, no separate cluster, Kafka-only I/O, interactive queries) suits Kafka-centric microservices. The decision tree: if all data flows through Kafka and you want embedded stream processing → Kafka Streams; if you need SQL, multiple sources, or fine-grained checkpointing → Flink.
- **State backend options**: HashMapStateBackend (in-memory, fastest, lost on crash, for testing only), EmbeddedRocksDBStateBackend (on-disk, survives crash, 10x slower reads, for production). The RocksDB choice is the default for production because it survives JVM crashes and supports incremental checkpointing (only changed keys are written to the checkpoint, not the entire state).

## Problem

Pain of not using this pattern (quantified):

1. **Window miscalculation**: no watermark → out-of-order data enters wrong window; stats skewed; downstream alerts
2. **Duplicate consumption**: at-least-once treated as exactly-once; counted twice; finance errors
3. **Backpressure out of control**: upstream fast, downstream slow; sink crushed; backpressure not propagated; cascading OOM
4. **No checkpoint**: failure replays from recent offset; state lost; ML feature jumps
5. **Late data lost**: exceeds watermark dropped; single-order backfill cannot recover; books wrong

## Pattern

```python
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import Callable, Awaitable
import asyncio

class WindowType(Enum):
 TUMBLING = "tumbling" # non-overlapping
 SLIDING = "sliding" # overlapping
 SESSION = "session" # gap-triggered
 GLOBAL = "global"

class Delivery:
 EXACTLY_ONCE = "exactly_once"
 AT_LEAST_ONCE = "at_least_once"
 AT_MOST_ONCE = "at_most_once"

@dataclass
class StreamJob:
 job_id: str
 source_topic: str
 sink_topic: str
 window_type: WindowType
 window_size_sec: int # tumbling/sliding window length
 window_slide_sec: int = 0 # sliding step
 watermark_delay_sec: int = 30 # allow out-of-order window
 delivery: str = Delivery.EXACTLY_ONCE
 state_store: object = None # RocksDB / HDFS / S3
 backpressure_limit: int = 1000 # in-flight upper bound
 trace_id: str = ""

 async def run(self) -> None:
 consumer = await self._subscribe()
 buffer: list = []
 pending: int = 0
 async for msg in consumer:
 if pending >= self.backpressure_limit:
 await self._flush(buffer) # backpressure: flush when full
 pending = 0
 watermark = msg.event_time - timedelta(seconds=self.watermark_delay_sec)
 window_close = self._should_close(msg.event_time, watermark)
 if window_close:
 await self._emit_window(buffer)
 buffer.clear()
 buffer.append(msg)
 pending += 1

 async def _emit_window(self, events: list) -> None:
 # exactly-once: sink uses transaction ID (partition+offset)
 tx_id = f"{self.job_id}-{events[0].partition}-{events[0].offset}"
 await self._sink_idempotent(events, tx_id)
 await self._checkpoint(events[-1].offset)

 async def _sink_idempotent(self, events: list, tx_id: str) -> None:
 # sink must support transactions or event_id deduplication
 for ev in events:
 await self._publish({"tx_id": tx_id, **ev.dict()})
 # or use sink transactional API: sink.begin(tx_id) → write → commit

 async def _checkpoint(self, offset: int) -> None:
 # Flink operator state snapshot; atomic write to state_store
 await self.state_store.set(
 f"stream:{self.job_id}:offset", offset
 )

 def _should_close(self, event_time: datetime, watermark: datetime) -> bool:
 # window close condition: watermark crosses window boundary
...

 async def _subscribe(self):...
 async def _flush(self, buffer: list):...
 async def _publish(self, payload: dict):...
```

## Apply

- Real-time risk control (amount exceptions / frequency exceptions)
- Real-time big screen (PV / UV / conversion)
- CQRS read model incremental update
- CDC sync to downstream
- Incremental ML features (user's recent N minutes of behavior)

## Not apply

- Offline data warehouse (use batch-processing)
- Single transaction write (use outbox)
- Low-frequency scheduled tasks (use Airflow)

## Landing checklist

1. Window type selection: tumbling (stats) / sliding (trend) / session (behavior)
2. Watermark: business time - delay; delay >= out-of-order upper bound
3. Exactly-once: source can replay + sink transactional or event_id dedup
4. Checkpoint: operator state snapshot; interval 30s-5min
5. Backpressure: in-flight upper bound + source-side pause
6. Late data: side output fallback; don't drop
7. trace_id: threaded across operators
8. Monitoring: lag / watermark / backpressure / checkpoint failure rate
9. Data quality: row count / out-of-order rate / duplicate rate
10. Contract QA: out-of-order injection + sink idempotent validation

## Action recommendations

1. **Set the watermark delay based on a business decision about tolerable staleness, not a default value.** A 30-second watermark means your dashboard is 30 seconds behind reality; a 5-minute watermark means your fraud detection is 5 minutes late. The right value is the point where the cost of acting on stale data exceeds the cost of waiting for late data.

2. **Implement exactly-once semantics at the sink layer via transaction ID deduplication, not at the stream layer.** The stream can only deliver at-least-once. Exactly-once comes from the sink's ability to deduplicate by a deterministic transaction ID (partition + offset). If the sink is append-only with no dedup key, no amount of stream configuration prevents duplicates on replay.

3. **Add a side-output path for late data instead of dropping it silently.** Late data is a permanent feature of distributed systems, not an error. Dropping late data beyond the watermark is data loss. The side-output path captures late events and feeds them to a periodic reconciliation process that corrects the downstream aggregates.

4. **Set a TTL on all stream operator state, especially session windows.** A session window that keeps state for every user who has ever visited the site will exhaust memory. Session windows must have a gap timeout. Global state must be partitioned and bounded. Unbounded state is a memory leak that will take down the stream processor.

5. **Inject failures in end-to-end tests to verify exactly-once semantics.** Configuring `enableExactlyOnce` is not enough. The only way to verify exactly-once is to inject a failure mid-stream and assert that the downstream count matches the upstream count, with no duplicates and no gaps. This test should be part of every stream processor's CI pipeline.

## Anti-patterns

**Using stream processing when batch is sufficient.** If the business SLA is "data available within 24 hours," a daily batch job is simpler, cheaper, and more reliable than a 24/7 stream processing pipeline. Stream processing is for sub-second to sub-minute latency requirements. Everything else is batch.

**Treating event time and processing time as interchangeable.** Event time is when the business event happened. Processing time is when the stream processor saw it. If a mobile user generates an event at 10:00 but the phone is offline until 10:30, the event time is 10:00 and the processing time is 10:30. Using processing time for windowing puts the event in the wrong window. Use event time with watermarks.

**Unbounded state in stream operators.** A session window that keeps state for every user who has ever visited the site will exhaust memory. State must have a TTL. Session windows must have a gap timeout. Global state must be partitioned and bounded. Unbounded state is a memory leak that will take down the stream processor.

**Exactly-once without end-to-end testing.** Configuring `enableExactlyOnce` on the stream processor is not enough. The sink must support idempotent writes. The source must support replay from a checkpoint. The only way to verify exactly-once is to inject a failure mid-stream and verify that the downstream count matches the upstream count, with no duplicates and no gaps.

**No dead-letter queue for malformed events.** An event with a corrupted payload or an unexpected schema will crash the stream operator. Without a DLQ, the operator either skips the event silently (data loss) or retries forever (pipeline stall). The DLQ captures the malformed event, alerts the team, and lets the pipeline continue processing valid events.


- **No watermark**: use process time as event time; out-of-order all wrong
- **At-least-once-as-exactly-once**: sink not dedup; replay double-write
- **No late data**: dropped beyond watermark; backfill fails
- **No checkpoint**: failure replays from earliest offset; state lost
- **No backpressure**: upstream unbounded in-flight; OOM
- **Shared state**: multiple operators share state; concurrency errors
- **Window too small**: 1s window; downstream crushed
- **Window too large**: 1h window; real-time property lost
- **Session timeout missed**: session window without timeout; state bloat
- **Sink not idempotent**: replay double-write
- **No schema evolution**: field addition → full replay
- **No trace_id**: operator black box
- **No lag alert**: lag for hours before discovery
- **Cross-job state**: implicit dependencies between stream tasks
- **Unbounded state**: session window without cleanup; state explosion

## Related

- Upstream: outbox-publisher-pattern (event source) + cdc-pattern (DB change source) + batch-processing-pattern (stream-batch complement)
- Downstream: materialized-view-pattern (real-time materialize) + cqrs-pattern (read model) + event-sourcing-pattern (event replay)
- Horizontal: backpressure-pattern + idempotency-pattern + distributed-tracing-pattern + contract-test-baseline-pattern + retry-with-backoff-pattern + circuit-breaker-pattern
- Landing: YiAi knowledge event stream / YiVad aicr async task stream / TBD YiPet behavior stream
