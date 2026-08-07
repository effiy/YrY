---
title: Batch Processing Pattern
aliases: [batch-processing-pattern, batch-pattern, spark-batch-pattern]
tags: [pattern, engineering-pattern, batch, data, etl, spark]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: "Batch processing is not just scheduling; it is a contract. Five dimensions: partition + checkpoint + idempotent + observable + recover; business-value driven; measurable"
roles: [engineer, tech-lead, oncall-sre]
benefit: "Large data volumes are processed efficiently without overwhelming system resources or blocking user-facing operations"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./stream-processing.md
 - ./outbox-publisher.md
 - ./cdc.md
 - ./idempotency.md
 - ./distributed-tracing.md
 - ./contract-test-baseline.md
 - ../projects/yiai/architecture.md
 - ../lessons/gotchas/README.md
---

# Batch Processing Pattern

> **As an** engineer, **I want to** batch processing, **so that** pattern applied consistently.

## Summary

- Batch processing = contract; not just scheduling
- Five dimensions: partition + checkpoint + idempotent + observable + recover; no missing dimension
- Complementary with stream-processing; not mixed
- Spark / Flink-batch / Dask / Beam / Airflow / Dagster toolchain

## Core viewpoints

**Batch processing is a contract with the data, not a cron job.** A cron schedule tells you when to run; a batch contract tells you what happens when the run fails halfway through. The five dimensions (partition, checkpoint, idempotent, observable, recover) are not optional layers -- each missing dimension is a guaranteed production incident waiting to happen.

**Checkpointing to in-process memory is equivalent to no checkpointing at all.** If the process dies, in-memory state dies with it. The checkpoint must live in an external store (Redis, S3, database) that survives process restart. This is not a performance optimization -- it is the difference between resuming from the last successful partition and restarting from zero.

**Idempotency is not about the sink being "upsert-capable" -- it is about the batch job being replayable.** If you cannot rerun yesterday's batch job without double-counting, you cannot backfill, you cannot recover from partial failure, and you cannot debug. The batch job's idempotency key is the contract between the scheduler and the data.

**Partition size is a tuning parameter with a cliff, not a slider.** Too small and checkpoint overhead dominates; too large and a single partition failure loses too much work. The right size is the largest partition that can be processed within the retry window of the slowest downstream dependency.

**Observability without a DLQ is alert fatigue with no resolution path.** Knowing that partition 47 failed is useless if you cannot inspect its data, retry it independently, or skip it with a manual override. The dead-letter queue is the operations interface for batch processing.

## Key info

- **Partition strategy**: partition by business key (date, region, tenant), not by row count or hash. Business-key partitioning means a failed partition maps to a specific business entity (e.g., "orders for 2026-08-07 in EU"), making investigation and stakeholder communication straightforward. Hash-based partitioning means a failed partition is "rows 0x3A7F to 0x4B2E" -- unactionable for operations. Partition size target: processable within the retry window of the slowest downstream dependency (typically 5-15 minutes).
- **Checkpoint storage options**: Redis (fast, TTL auto-cleanup, but limited durability for long-running jobs), S3/MinIO (durable, append-only, but higher latency per checkpoint), database (transactional, queryable, but adds load to operational DB). For jobs under 1 hour, Redis with AOF persistence is sufficient. For multi-hour jobs, S3 is the safer choice. Never use in-process memory -- a single OOM kills all progress.
- **Framework comparison**: Airflow (DAG as Python, rich operator ecosystem, scheduler-centered, best for data engineering teams), Dagster (asset-centered, software-defined assets, best for data platform teams), Prefect (workflow as Python function, dynamic DAG, best for ML pipelines), Spark (distributed compute, Catalyst optimizer, best for terabyte-scale transformations). The decision tree: small data (< 100GB) → Airflow/Dagster; large data → Spark; ML pipelines → Prefect; any scale → Dagster if you want asset lineage.
- **Data quality gate thresholds**: row count deviation > 20% from 7-day rolling average → block downstream; null rate > 5% in required columns → block; schema change (added/removed column) → warn but proceed; distinct value count change > 50% in categorical columns → warn. These thresholds should be configurable per dataset and tightened over time as baselines stabilize.
- **DLQ design**: each failed partition writes to `dead_letter` table with: job_id, partition_key, error_message, error_stack, raw_data_sample (first 10 rows), created_at, retry_count, status (pending/retrying/skipped/resolved). The retry interface reads from this table, not from the original source. Skipped partitions update status to `skipped` with a manual_override reason; this is an audit requirement for compliance.

## Problem

Pain of not using this pattern (quantified):

1. **Re-run everything**: single failure reruns everything; hour-level tasks take hours; ML feature regeneration takes hours; SLA broken
2. **Duplicate consumption**: no idempotency → sink double-writes; users receive two SMS; financial reconciliation drift
3. **No trace**: task stuck unknown; monitoring blank; oncall paged at 3am
4. **No recovery**: OOM restarts from scratch; partition loss; downstream dependency chaos
5. **No audit**: who ran / read what / wrote what; compliance failure

## Pattern

```python
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Callable, Awaitable
import asyncio
import json

class BatchState(Enum):
 PENDING = "pending"
 RUNNING = "running"
 CHECKPOINTING = "checkpointing"
 SUCCEEDED = "succeeded"
 FAILED = "failed"
 SKIPPED = "skipped" # idempotent dedup

@dataclass
class BatchJob:
 job_id: str # business unique ID (e.g. "orders-2026-08-02")
 source_query: str # idempotent partition query
 sink_writer: Callable[[list], Awaitable[None]]
 partition_keys: list[str] # partition dimensions (e.g. ["date", "region"])
 checkpoint_store: object # persistence (Redis/DB/S3)
 idempotency_key: str
 trace_id: str
 state: BatchState = BatchState.PENDING
 _executed_partitions: list[str] = field(default_factory=list)

 async def run(self) -> None:
 self.state = BatchState.RUNNING
 await self._checkpoint({"state": self.state.value, "executed": []})

 partitions = await self._list_partitions()
 for p in partitions:
 if await self._already_done(p): # idempotency check
 self._executed_partitions.append(p)
 continue
 try:
 rows = await self._read_partition(p)
 await self._write_idempotent(rows)
 self._executed_partitions.append(p)
 await self._checkpoint({
 "state": BatchState.CHECKPOINTING.value,
 "executed": self._executed_partitions,
 })
 except Exception as e:
 await self._fail(e)
 raise

 self.state = BatchState.SUCCEEDED
 await self._checkpoint({
 "state": self.state.value,
 "executed": self._executed_partitions,
 "finished_at": datetime.now(timezone.utc).isoformat(),
 })

 async def _write_idempotent(self, rows: list) -> None:
 # sink must support upsert or event_id dedup
 await self.sink_writer(rows)

 async def _already_done(self, partition: str) -> bool:
 return partition in self._executed_partitions

 async def _list_partitions(self) -> list[str]:
...

 async def _read_partition(self, p: str) -> list:
...

 async def _checkpoint(self, payload: dict) -> None:
 payload["job_id"] = self.job_id
 payload["trace_id"] = self.trace_id
 await self.checkpoint_store.set(
 f"batch:{self.job_id}", json.dumps(payload)
 )

 async def _fail(self, e: Exception) -> None:
 self.state = BatchState.FAILED
 await self._checkpoint({
 "state": self.state.value,
 "error": repr(e),
 "executed": self._executed_partitions,
 })
 # alert + DLQ (failed partition list)
```

## Apply

- Data warehouse ETL (orders → facts)
- ML feature offline generation
- Finance monthly close / daily close
- Historical data backfill
- Cross-system reconciliation

## Do not apply

- Real-time risk control (use stream-processing)
- User online interaction (use sync API)
- Single-transaction writes (use outbox)

## Landing checklist

1. Partition key fixed (business date + dimension)
2. Checkpoint written to external partition storage (not in-process)
3. Sink idempotent: upsert or event_id dedup
4. trace_id spans source → transform → sink
5. Failed partitions go to DLQ; alert + rerun interface
6. Rate limiting + backpressure (avoid taking down downstream)
7. Data quality gate (row count / schema / null rate)
8. Audit: who triggered / read what / wrote how much
9. Scheduler integration (Airflow / Dagster / Prefect): retry + SLA + dependency
10. Contract QA: source schema + sink schema + failure injection

## Action recommendations

1. **Use a scheduler with DAG awareness (Airflow, Dagster, Prefect) instead of cron for batch jobs.** Cron does not know whether the previous run succeeded or failed, and overlapping runs cause data corruption. A DAG-aware scheduler prevents overlapping runs and manages retry logic based on upstream dependency status.

2. **Write checkpoints to an external store (Redis, S3, database), never to in-process memory.** If the process dies, in-memory state dies with it. The checkpoint must survive process restart so the batch job can resume from the last successful partition rather than restarting from zero.

3. **Use deterministic idempotency keys based on business identity, not execution timestamp.** A key like `orders-2026-08-07` produces the same value on every rerun, preventing duplicates. A key based on `datetime.now()` produces a new value on every rerun, guaranteeing duplicates. The idempotency key is the contract between the scheduler and the data.

4. **Add a data quality gate between batch completion and downstream consumption.** Validate row counts, schema, and null rates against historical baselines before marking the run as successful. A batch that produces 50% fewer rows than yesterday and silently writes them to the sink is a data corruption incident, not a successful run.

5. **Route failed partitions to a dead-letter queue (DLQ) with an independent retry interface.** Knowing that partition 47 failed is useless without the ability to inspect its data, retry it independently, or skip it with a manual override. The DLQ is the operations interface for batch processing -- without it, failed partitions are lost.

## Anti-patterns

**Using cron as the only scheduling mechanism.** A cron schedule that fires every hour does not know whether the previous run succeeded or failed. If a run takes 90 minutes, the next cron fire starts a second overlapping run. Use a scheduler (Airflow, Dagster, Prefect) that understands DAG dependencies and run status.

**Loading all partitions into memory at once.** Reading the entire dataset and then processing it in-memory is not batch processing -- it is an OOM waiting to happen. The batch must read one partition at a time, process it, checkpoint, and release memory before moving to the next partition.

**No data quality gate between batch and downstream.** A batch that produces 50% fewer rows than yesterday and silently writes them to the sink is a data corruption incident. The batch must validate row counts, schema, and null rates against historical baselines before marking the run as successful.

**Idempotency based on timestamp.** Using `datetime.now()` as an idempotency key means every rerun generates a new key and writes duplicates. The idempotency key must be deterministic based on the business identity of the data (e.g., `orders-2026-08-07`), not the execution time.

**Batch processing real-time data.** If the business needs sub-second latency, batch processing is the wrong tool. Streaming is for real-time. Batch is for hourly, daily, or weekly aggregation. Using batch for real-time is a missed SLA; using streaming for daily aggregation is unnecessary complexity.


- **Streaming-as-batch**: using stream handling as batch; no checkpoint; failure loses everything
- **No-checkpoint**: in-process state; OOM loses everything
- **Not-idempotent**: sink append-only; rerun double-writes
- **Shared-state**: many workers share in-memory state; concurrent chaos
- **No-replay**: failure can only rerun everything; partition has no independent ID
- **No-trace_id**: task black box; troubleshooting by guessing
- **No-DLQ**: failed partitions lost; no rerun entry
- **No-watermark-late-data**: batch also fears late data; not reconciled stats drift
- **Sink-not-atomic**: half-write failure; downstream sees half a batch
- **No-quality-gate**: 50% row-count drift still running; downstream dirty data
- **Cross-job-state**: implicit dependencies between tasks; change A breaks B
- **Unbounded-partition**: partition unbounded growth; checkpoint explodes
- **No-idempotency-key**: using timestamp as key; rerun generates new ID

## Related

- Upstream: stream-processing-pattern (stream/batch complement) + outbox-publisher-pattern (event-triggered batch) + cdc-pattern (incremental source)
- Downstream: materialized-view-pattern (batch result materialization) + cqrs-pattern (read model) + event-sourcing-pattern (event replay)
- Horizontal: idempotency-pattern + distributed-tracing-pattern + contract-test-baseline-pattern + backpressure-pattern
- Landing: YiAi Knowledge base batch processing / YiVad aicr index rebuild / TBD YiPet daily-close reconciliation
