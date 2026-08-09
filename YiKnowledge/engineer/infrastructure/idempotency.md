---
title: idempotent pattern / Idempotency pattern
aliases: [idempotency-pattern, idempotent-pattern, exactly-once-pattern]
tags: [methodology, engineering-patterns, idempotency, exactly-once, distributed-systems, deduplication]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: "idempotent is not optional; retry precedes idempotency + side effect gatekeeping; GET/PUT/DELETE naturally idempotent; POST uses idempotency-key; service side deduplication; write operations must be idempotent; at-least-once + idempotent = effectively-once; observable: deduplication rate / duplicate request"
roles: [engineer, tech-lead, oncall-sre]
benefit: "Operations can be safely retried without duplicate side effects, essential for reliable distributed systems"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided"
related:
 - ./retry-with-backoff.md
 - ./circuit-breaker.md
 - ./rate-limiting.md
 - ./rpc-envelope.md
 - ./sse-streaming.md
 - ./contract-test-baseline.md
 - ../strategies/implement-an-api.md
 - ../processes/migrate-a-database.md
 - ../tools/set-up-a-data-pipeline.md
 - ../tools/scale-a-service.md
 - ../tools/set-up-testing-infrastructure.md
 - ../lessons/wins/yiai-knowledge-watcher.md
 - ../lessons/wins/yivad-shared-client-vendor.md
---

# idempotent pattern

> **As an** engineer, **I want to** idempotency, **so that** pattern applied consistently. 

## Summary

- idempotent is retry pre-requisite; non-idempotent cannot retry
- HTTP naturally idempotent: GET / PUT / DELETE / HEAD
- POST not idempotent; use idempotency-key
- service side deduplication: key + time window + state machine
- side effect gatekeeping: write operations must be idempotent
- at-least-once + idempotent = effectively-once
- not many times; no duplicate deduction; no duplicate create
- observable: deduplication rate / duplicate request

## Apply scenario

any write operation / retry scenario / message queue consumption / payment / order create / data migration dual-write / webhook callback / distributed system call; any "same request many times consistent result" scenario. 

## Core points

### 1. idempotent is retry pre-requisite

retry = same request sent again; non-idempotent = side effect duplicated. 

- retry must be idempotent
- non-idempotent no retry
- idempotent is contract
- side effect gatekeeping

### 2. HTTP naturally idempotent

HTTP semantics; GET / PUT / DELETE / HEAD naturally idempotent. 

| method | idempotent | safe |
|---|---|---|
| GET | yes | yes |
| HEAD | yes | yes |
| PUT | yes | no |
| DELETE | yes | no |
| POST | no | no |
| PATCH | no | no |

POST / PATCH not idempotent; need external mechanism. 

### 3. idempotency-key

POST not idempotent; use idempotency-key gatekeeping. 

- client generates key (UUID / business unique) 
- request carries `Idempotency-Key` header
- service side deduplicates by key
- same key returns first result
- key validity ≥ business longest retry window

### 4. service side deduplication

service side deduplicates by key; not blindly execute. 

```
request → lookup key cache → hit returns first result / miss execute + store key
```

- Redis / DB store key
- key + request hash + result + time window
- hit: return first result
- miss: execute + store
- concurrent: distributed lock / unique constraint

### 5. side effect gatekeeping

write operations must be idempotent; no duplicates. 

- **deduction**: no duplicate deduction; idempotent key
- **create**: no duplicate create; unique constraint
- **send message**: no duplicate send; message ID
- **update**: overwrite-style update idempotent; incremental update needs version

### 6. state machine idempotent

business state machine; state transition idempotent. 

- same state duplicate request: returns success
- already-passed state: return current state / error
- no duplicate transition
- state machine + version

### 7. at-least-once + idempotent = effectively-once

message queue semantics; do not assume exactly-once. 

- at-least-once: message must arrive; can duplicate
- idempotent: duplicate consumption result consistent
- effectively-once
- do not depend on middleware exactly-once

### 8. database idempotent

database layer idempotent; do not rely on application. 

- unique constraint
- ON CONFLICT DO NOTHING / DO UPDATE
- optimistic lock (version + expected value) 
- pessimistic lock (SELECT FOR UPDATE) 
- do not rely on application check-after-write

### 9. time window

idempotent key validity; not unlimited. 

- validity ≥ business longest retry window
- usually 24h / 7d
- expired cleanup
- expired key treated as new request

### 10. concurrent deduplication

concurrent same key; must deduplicate. 

- distributed lock (Redis SETNX) 
- unique constraint (DB) 
- optimistic lock
- do not rely on application check-after-write
- do not concurrently execute same key twice

### 11. observable

idempotent must be monitored; not blind. 

- deduplication rate (hit rate) 
- duplicate request source
- concurrent deduplication failure
- key expiration rate
- exception deduplication alert

### 12. LLM call idempotent

LLM call idempotent; special scenario. 

- non-streaming: idempotency-key deduplication
- streaming: no retry; resume
- partial output: no retry; streaming resume
- multi provider: each provider independent key
- cost: deduplication no duplicate billing

## Anti-patterns

- **POST without key**: POST without idempotency-key → retry duplicate create → must carry key
- **application check-after-write**: first lookup then write without lock → concurrent duplicate → must DB constraint
- **state not idempotent**: state transition not idempotent → duplicate transition → must state machine
- **no time window**: key permanent → storage explodes → must validity
- **concurrent no lock**: concurrent same key no lock → twice execute → must distributed lock
- **depend on exactly-once**: depend on middleware exactly-once → does not exist → must at-least-once + idempotent
- **streaming retry**: streaming retry → duplicate billing → must resume
- **no monitoring**: idempotent not monitored → don't know deduplication rate → must observable

## Co-build

- journeys: [implement-an-api](../architecture-design/implement-an-api.md) + [migrate-a-database](../infrastructure/migrate-a-database.md) + [set-up-a-data-pipeline](set-up-a-data-pipeline.md) + [scale-a-service](../engineering/scale-a-service.md) + [set-up-testing-infrastructure](../engineering/set-up-testing-infrastructure.md)
- landed win: [yiai-knowledge-watcher-win](../lessons/win-yiai-knowledge-watcher.md) + [yivad-shared-client-vendor-win](../lessons/win-yivad-shared-client-vendor.md)
- Companion pattern: [retry-with-backoff-pattern](./retry-with-backoff.md) + [circuit-breaker-pattern](../architecture-design/circuit-breaker.md) + [rate-limiting-pattern](../engineering/rate-limiting.md) + [rpc-envelope-pattern](../architecture-design/rpc-envelope.md) + [sse-streaming-pattern](../architecture-design/sse-streaming.md) + [contract-test-baseline-pattern](../quality-security/contract-test-baseline.md)
