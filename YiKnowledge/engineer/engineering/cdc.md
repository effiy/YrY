---
title: CDC Pattern / Change Data Capture Pattern
aliases: [cdc-pattern, change-data-capture-pattern, cdc]
tags: [pattern, engineering pattern, CDC, change data capture, event stream]
category: engineer/engineering
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
benefit: "Database changes are captured and streamed in real-time, enabling event-driven architectures without application-level polling"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - at least one concrete example or code snippet is provided
related:
---

# CDC Pattern / Change Data Capture Pattern

> **As an** engineer, **I want to** cdc, **so that** pattern applied consistently. 

## Summary

DB change → event stream; downstream subscribes; not directly polling DB; no business code changes; log-based / trigger-based / query-based three tiers; links with outbox / event-sourcing / cqrs / materialized-view; suitable for DB → stream / multiple downstreams / real-time sync; not suitable for low-frequency batch / single downstream / DB without CDC support. 

## Question

- **poll DB**: scan table every second looking up updated_at; peak period table scan saturates the primary DB; high latency + misses deletes; CPU persistent 70%+. 
- **dual-write code**: business code writes DB then sends MQ; DB write then MQ send fails → inconsistent; transaction boundary broken. 
- **DB change no event**: downstream gets no change; cache not refreshed; search index not updated; vector store not updated; avalanche of inconsistencies. 
- **binlog wasted**: DB already has binlog; downstream does not use it; repeated polling; repeated MQ sends. 
- **multiple downstream subscriptions duplicated**: each downstream independently polls the same table; N times DB pressure. 
- **schema evolution breaks stream**: source table adds field; CDC pipeline unaware; event payload missing field; downstream crashes. 

## Pattern

**core**: DB change as an event stream released to downstream; source DB unaware of downstream; downstream subscribes as needed; event package contains before / after / op_type / ts / tx_id / event_id. 

**three-tier implementation**:

- **Log-based CDC**: read DB binlog / WAL; non-intrusive to business; does not add DB load; near real-time; Debezium / Maxwell / AWS DMS / PgLogical. **First choice**. 
- **Trigger-based CDC**: DB trigger writes change table / outbox; strong consistency; intrusive to schema; adds write latency; self-built. **Second choice**. 
- **Query-based CDC**: scan updated_at / version; simple; high latency; misses deletes; adds DB load; only for DBs without CDC support. **Last choice**. 

**event structure**: 

```json
{
  "event_id": "uuid-v7",
  "tx_id": "db-tx-12345",
  "ts": "2026-08-03T10:00:00.123Z",
  "source": {
    "db": "yiai_pg",
    "schema": "public",
    "table": "knowledge",
    "op_type": "u",
    "lsn": "0/16B3748"
  },
  "before": {"id": 1, "title": "old", "status": "draft"},
  "after": {"id": 1, "title": "new", "status": "published"}
}
```

**key code**: 

```python
class CDCPipeline:
    """CDC pipeline: DB → event stream → multiple downstream subscriptions. """
    def __init__(self, source, outbox_topic, consumers):
        self.source = source  # Debezium / Maxwell / trigger
        self.topic = outbox_topic  # Kafka topic
        self.consumers = consumers  # list of CDCConsumer
        self._seen_event_ids = set()  # dedup + idempotent

    def run(self):
        for event in self.source.stream():
            if event["event_id"] in self._seen_event_ids:
                continue  # idempotent dedup
            self._publish(event)
            self._seen_event_ids.add(event["event_id"])
            # LRU cap to prevent memory blowup
            if len(self._seen_event_ids) > 100_000:
                self._seen_event_ids = set(list(self._seen_event_ids)[-50_000:])

    def _publish(self, event):
        # multiple downstreams consume per topic partition in order
        msg = json.dumps(event).encode()
        self.topic.produce(key=event["source"]["table"], value=msg)

    def replay_from_lsn(self, lsn):
        # failure recovery: replay from specified LSN; idempotent ensures downstream eventual consistency
        for event in self.source.stream_from_lsn(lsn):
            self._publish(event)


class CDCConsumer:
    """Downstream subscriber: cache / search / vector store / materialized view / outbox publisher. """
    def __init__(self, name, apply_fn):
        self.name = name
        self.apply = apply_fn

    def on_event(self, event):
        if not self._is_relevant(event):
            return
        try:
            self.apply(event)  # idempotent
        except Exception as e:
            self._dlq(event, e)  # dead letter
```

## Applicable

- DB → streaming sync (cache update / search index / vector store index / materialized view refresh)
- Multiple downstreams subscribing to the same DB change (avoid N times poll)
- Real-time data pipeline (OLTP → OLAP / lakehouse)
- Cross-service read model sync (CQRS read side)
- outbox implementation replacement solution (CDC replaces business code writing outbox table)
- data migration / heterogeneous DB sync (PG → ES / Mongo → PG)
- audit log / compliance audit trail

## Not applicable

- Low-frequency batch sync (per minute / per hour; batch ETL sufficient)
- Single downstream (business code sending event is enough; CDC is over-design)
- DB without CDC support (niche DB / no binlog; use query-based or switch DB)
- Strongly consistent real-time read (CDC is eventually consistent; follow sync replica)
- Cross-DB long transactions (CDC transaction boundary breaks; use saga)
- Frequent small transactions + extreme low-latency requirement (CDC lag 50ms-1s; follow business code sync send event)

## implementation list

1. **DB selection confirm CDC support**: PG 14+ logical replication / MySQL binlog row format / Mongo change streams / Kafka Connect. 
2. **Choose CDC tool**: Debezium (first choice) / Maxwell / AWS DMS / Alibaba Canal / self-built trigger. 
3. **DB config**: PG wal_level=logical + replication slot; MySQL binlog_format=ROW + binlog_row_image=FULL. 
4. **schema registry**: event schema registration + upcaster; schema evolution does not break stream. 
5. **event_id idempotent**: UUID v7 or LSN+tx_id+seq; downstream dedup; at-least-once semantics. 
6. **Kafka topic design**: partition by source table; keep 7 days; compaction keeps latest key. 
7. **consumer group**: each downstream independent consumer group; offset managed by itself; no mutual impact. 
8. **DLQ dead letter queue**: consumption failure event enters DLQ; alert; manual handling; no event lost. 
9. **lag Monitoring**: consumer_lag_ms / event_age_ms alert; lag > 60s alert; lag > 5min urgent. 
10. **source DB performance Monitoring**: CDC should not add source DB pressure > 5%; monitor replication slot lag; WAL size. 
11. **failure recovery**: replay from specified LSN / timestamp; downstream idempotent; no loss no duplication. 
12. **schema evolution drill**: add field / drop field / change type; event schema compatibility test; downstream does not crash. 
13. **CI gate**: DDL must have schema registry compatibility check; incompatible DDL blocks PR. 

## Anti-patterns

- **poll DB**: scan table look up updated_at; slow + miss deletes + high DB pressure; fix: log-based CDC. 
- **business code dual-write**: write DB then send MQ; transaction boundary broken; not consistent; fix: CDC extracts DB change or outbox. 
- **CDC no dedup**: event duplicate consumption; downstream status corrupted; fix: event_id idempotent. 
- **CDC lag not monitored**: CDC stream breaks for hours unnoticed; downstream data stale; fix: lag_ms alert + fallback scheduled refresh. 
- **CDC impacts source DB performance**: replication slot lag; WAL buildup; source DB OOM; fix: monitor slot lag + clean lagging slots. 
- **CDC without schema registry**: source table adds field; downstream parsing crashes; event payload missing field; fix: schema registry + upcaster. 
- **CDC across DB long transactions**: transaction boundary broken; event half-committed; downstream status wrong; fix: CDC not across transactions / use saga. 
- **CDC as strongly consistent read**: CDC is eventually consistent; strongly consistent read goes to primary / sync replica; fix: consistency tier annotation. 
- **CDC as business event**: CDC is data change; business event (order paid) sent by business code; fix: CDC + business event layered. 
- **multiple downstreams sharing one consumer group**: mutual block + mutual impact; fix: each downstream independent consumer group. 
- **not linking with outbox**: CDC and outbox each maintained; duplicate build; fix: CDC replaces business code writing outbox or outbox publisher replaces CDC. 

## Related

- [outbox-pattern](../infrastructure/outbox.md) — outbox is a kind of trigger-based CDC; CDC is the log-based replacement solution (core link)
- [event-sourcing-pattern](../architecture-design/event-sourcing.md) — CDC event is a kind of event stream source; replay to rebuild read model (core link)
- [cqrs-pattern](../architecture-design/cqrs.md) — CDC drives read model refresh (core link)
- [materialized-view-pattern](../architecture-design/materialized-view.md) — CDC event drives materialized view streaming refresh
- [saga-pattern](../architecture-design/saga.md) — saga choreography subscribes CDC event to trigger next step
- [idempotency-pattern](../infrastructure/idempotency.md) — CDC at-least-once + event_id idempotent co-built
- [distributed-tracing-pattern](./distributed-tracing.md) — CDC event must carry trace_id across services
- implementation case study: TODO implement YiAi knowledge-watcher CDC + RAG index sync + materialized view refresh
- Upstream: [../tools/set-up-a-data-pipeline.md](../infrastructure/set-up-a-data-pipeline.md)
- Upstream: [prepare-a-data-engineering-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-data-engineering-strategy.md)
- Downstream: [../lessons/gotchas/README.md](../lessons/README.md)
