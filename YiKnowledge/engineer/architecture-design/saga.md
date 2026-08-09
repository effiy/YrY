---
title: Saga long transaction Pattern / Saga Pattern
aliases: [saga-pattern, saga, long-running-transaction, distributed-transaction]
tags: [pattern, engineering-pattern, saga, distributed-transaction, long-running-transaction, compensation, eventual-consistency]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: cross-service long transactions cannot be ACID; use saga + compensation transaction. Every step must tag compensation; compensation must be idempotent; orchestration vs choreography; and outbox + idempotent links; do not mix with 2PC
roles: [engineer, tech-lead, oncall-sre]
benefit: "Distributed transactions maintain data consistency across microservices through compensating actions"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided"
related:
 - ./outbox.md
 - ./idempotency.md
 - ./circuit-breaker.md
 - ./retry-with-backoff.md
 - ./timeout-budget.md
 - ./graceful-degradation.md
 - ./observability.md
 - ../strategies/migrate-data.md
 - ../strategies/decompose-a-monolith.md
 - ../projects/build-a-rag-pipeline.md
 - ../../product-manager/frameworks/launch-an-ai-product.md
 - ../../knowledge-curator/templates/thinking--first-principles.md
 - ../../knowledge-curator/templates/thinking--inversion.md
 - ../../knowledge-curator/templates/thinking--second-order-thinking.md
 - ../../knowledge-curator/templates/thinking--ockhams-razor.md
---

# Saga long transaction Pattern / Saga Pattern

> **As an** engineer, **I want to** saga, **so that** pattern applied consistently. 

## Summary

- cross-service long transactions cannot be ACID; use saga + compensation
- every step must tag compensation; compensation must be idempotent
- orchestration vs choreography; choose by scale
- and outbox + idempotent + circuit breaker links
- do not mix with 2PC; 2PC sync blocking deprecated
- eventual consistency; not strong consistency
- state machine driven; observable and recoverable
- compensation != rollback; business-level rollback
- LLM multi-step workflow is a natural saga scenario
- failure retryable and recoverable; not stuck

## Core viewpoints

**Saga is eventual consistency by design, not a workaround for missing ACID.** Cross-service transactions cannot be made ACID without 2PC, and 2PC is a dead end in distributed systems due to coordinator single-point-of-failure and sync blocking. Accepting eventual consistency upfront forces teams to design compensation from day one, which is the correct posture. Pretending a distributed transaction is ACID is the real architectural mistake.

**Compensation is a business operation, not a database rollback.** A database ROLLBACK undoes row-level changes within a single transaction boundary. Compensation must reverse external side effects: refunding a payment, releasing inventory, notifying users of cancellation. This requires domain knowledge that the database layer does not possess. Teams that map compensation 1:1 to database rollback invariably ship broken recovery logic.

**Orchestration vs. choreography is a spectrum, not a binary choice.** Pure orchestration creates a god coordinator that becomes a bottleneck; pure choreography creates a distributed mess that no one can debug. The right approach is to use orchestration for the top-level saga flow (visibility, timeout, recovery) while letting individual steps use choreography within bounded contexts. Do not be dogmatic.

**Saga without observability is flying blind.** A saga spanning 5+ services with no unified trace_id, no state persistence, and no lag monitoring is a distributed time bomb. Every saga must persist its state machine, emit trace spans, and alert on timeout. Without this, the MTTR for a stuck saga is measured in hours, not minutes.

**The biggest risk is not saga failure -- it is saga neglect.** Teams implement the forward path with enthusiasm and the compensation path with reluctance. Compensation logic goes untested, unmonitored, and unmaintained. When the real failure occurs, the compensation path fails too, creating a double fault. Chaos engineering and regular compensation drills are not optional.

## problem

Pain of cross-service transactions: 

1. **2PC deprecated**: sync blocking + coordinator single point + poor performance, modern distributed systems do not use it
2. **local transaction out of reach**: cross-service / cross-DB local transaction invalid
3. **inconsistency window**: A succeeds B fails, no compensation then data permanently inconsistent
4. **compensation hard to write**: business-level rollback != database rollback, need business understanding
5. **retry stuck**: long transaction fail after do not know from which step to retry, from scratch then side effect re-occurs
6. **state loss**: transaction interrupt after state loss, no way to recover
7. **LLM multi-step workflow**: RAG -> tool call -> post-process -> ingest, any step fail need compensation
8. **timeout hard to judge**: long transaction timeout cannot determine complete or fail
9. **observable missing**: long transaction across many services, no unified trace hard to locate
10. **idempotent missing**: compensation retry not idempotent then duplicate side effects

quantify: cross-service transactions not doing saga of system, data inconsistency rate 0.1-1%, manual fix cost very high; long transaction fail after MTTR average 2-4 hours. 

## Pattern

### orchestration vs choreography

```
orchestration: 
 saga_coordinator:
 step_1 -> call service A
 step_2 -> call service B (if step_1 ok)
 step_3 -> call service C (if step_2 ok)
 on_fail:
 compensate step_3 (if done)
 compensate step_2 (if done)
 compensate step_1 (if done)

choreography: 
 service A -> emit event A_done
 service B -> on A_done, do step_2, emit B_done
 service C -> on B_done, do step_3, emit C_done
 service A -> on C_failed, compensate A
 service B -> on C_failed, compensate B
```

- **orchestration**: central coordinator; logic centralized; easy to debug; suitable for 5+ steps or complex branching
- **choreography**: event driven; decentralized; extensible; suitable for 3-4 steps simple trace
- **choose type**: 5+ steps / complex branching -> orchestration; 3-4 steps / simple trace -> choreography
- **do not mix**: one saga need orchestration need choreography, do not mix

### every step must tag compensation

```yaml
saga: order_checkout
steps:
 - name: reserve_inventory
 service: inventory
 compensate: release_inventory # must tag
 - name: charge_payment
 service: payment
 compensate: refund_payment # must tag
 - name: create_order
 service: order
 compensate: cancel_order # must tag
 - name: notify_user
 service: notification
 compensate: noop # no side effect, compensation = no-op
```

- **every step must tag compensation**: not tagging compensation = not recoverable
- **compensation != rollback**: business-level rollback (refund / release / cancel) not database rollback
- **no side effect compensation = noop**: notify / log etc no side effect, compensation no-op
- **compensation must be idempotent**: and forward operation idempotent linked
- **compensation sequential**: reverse compensation (first done after compensation) 

### compensation idempotent

```python
def compensate_step(data):
 # idempotency key = saga_id + step_id
 if already_compensated(saga_id, step_id):
 return # do not duplicate compensate
 do_compensate(data)
 mark_compensated(saga_id, step_id)
```

- **idempotent key**: saga_id + step_id unique identifier
- **state machine**: pending -> done -> compensating -> compensated
- **retry safe**: compensation retry no duplicate side effects
- **and idempotency-pattern links**: reuse idempotent basics

### state machine driven

```
saga states:
 pending -> running -> done
 |
 v
 compensating -> compensated
 |
 v
 failed (manual)
```

- **state persisted**: saga state into DB not in-memory
- **every step state**: every step state independently recorded pending / done / failed / compensated
- **recoverable**: process crash restart from DB recover saga state
- **observable**: every saga / every step state queryable trace

### fail recovery

```python
async def recover_saga(saga_id):
 saga = load_saga(saga_id)
 if saga.state == "running":
 # interrupted at some step, retry that step
 await retry_current_step(saga)
 elif saga.state == "compensating":
 # compensation interrupted, retry compensation
 await retry_compensate(saga)
 elif saga.state == "failed":
 # manual intervention
 alert_oncall(saga_id)
```

- **retry current step**: running interrupt retry current step (idempotent protected) 
- **retry compensation**: compensating interrupt retry compensation
- **manual intervention**: failed state alert oncall
- **timeout detect**: long time pending / running saga trigger alert

### and outbox links

```
saga_step -> DB update + outbox event (same transaction) 
outbox publisher -> async send event
eventual consistency across services
```

- **DB + outbox same transaction**: DB change and event release atomic
- **outbox decoupled release**: not blocking main transaction
- **eventual consistency**: cross-service eventual consistency
- **and outbox-pattern links**: saga uses outbox to send events

### and timeout-budget links

- **saga total budget**: whole saga cannot exceed
- **every step budget**: every step cannot exceed
- **exceed budget go compensation**: exceed means go compensation not continue
- **timeout alert**: long saga trigger alert

### LLM multi-step workflow

```
LLM saga:
 step_1: RAG retrieve (compensate: noop, cache invalidate)
 step_2: LLM generate (compensate: mark output as failed)
 step_3: tool call (compensate: undo tool side effect)
 step_4: post-process (compensate: noop)
 step_5: persist (compensate: delete record)
 step_6: notify (compensate: noop)
```

- **LLM workflow natural saga**: multi-step + cross-service + need compensation
- **every step compensation**: no side effect = noop, has side effect must tag
- **fail resume**: LLM streaming resume = saga retry
- **many provider fallback**: LLM call fail switch provider, not direct compensation

## apply

- **cross-service transaction**: order / payment / inventory / notify many services
- **LLM multi-step workflow**: RAG + tool + post-process + ingest
- **data migration**: cross-DB long transaction
- **microservice**: service mesh many hops
- **event driven Architecture**: choreography Pattern natural fit
- **business Process engine**: approval / ticket / multi-step Process

## not apply

- **single service single DB**: local transaction enough
- **strong consistency requirement**: finance account balance use 2PC or TCC
- **read only operation**: no side effect no need compensation
- **short term transaction**: single HTTP request inside local transaction enough

## Landing checklist

1. **saga state table**: saga_id + state + step_states + created/updated
2. **every step must tag compensation**: yaml / config / code comment explicit
3. **compensation idempotent**: idempotent key saga_id + step_id
4. **state machine driven**: pending / running / done / compensating / compensated / failed
5. **orchestration or choreography choose type**: 5+ steps orchestration, 3-4 steps choreography
6. **outbox links**: DB + outbox same transaction
7. **timeout-budget links**: saga + every step budget
8. **fail recovery**: retry current step / retry compensation / manual intervention
9. **observable**: every saga + every step trace + state query
10. **timeout alert**: long pending / running saga alert
11. **compensation QA**: every step compensation must test (unit + integration + chaos) 
12. **chaos validation**: inject fail validation saga compensation effective

## Anti-patterns

- **2PC forced**: cross-service forced 2PC sync blocking
- **not tag compensation**: some steps no compensation = not recoverable
- **compensation not idempotent**: duplicate compensation produces side effects
- **state in-memory**: saga state in-memory = crash loss
- **mix orchestration choreography**: one saga mixed logic messy
- **compensation = rollback**: business-level rollback != database rollback
- **no timeout**: saga long time no budget stuck
- **no trace**: cross-service no unified trace hard to locate
- **no fail recovery**: crash after no way to recover
- **LLM no saga**: LLM multi-step workflow not establish saga fail hard to handle
- **no compensation QA**: compensation written not tested, fault time ineffective
- **sync blocking**: saga steps sync wait blocking threads

## Related

- outbox: [./outbox.md](../infrastructure/outbox.md) — saga uses outbox to send events
- idempotent: [./idempotency.md](../infrastructure/idempotency.md) — compensation idempotent co-build
- circuit breaker: [./circuit-breaker.md](./circuit-breaker.md) — downstream fault circuit breaker
- retry backoff: [./retry-with-backoff.md](../infrastructure/retry-with-backoff.md) — steps retry
- timeout budget: [./timeout-budget.md](../infrastructure/timeout-budget.md) — saga + every step budget
- graceful degradation: [./graceful-degradation.md](./graceful-degradation.md) — saga fail degradation
- observable: [./observability.md](../engineering/observability.md) — saga trace
- journeys: [migrate-data](../infrastructure/migrate-data.md) + [decompose-a-monolith](decompose-a-monolith.md) + [build-a-rag-pipeline](../projects/build-a-rag-pipeline.md) + [launch-an-ai-product](../../product-manager/frameworks/launch-an-ai-product.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) (cross-service transaction essence)  + [inversion](../../knowledge-curator/templates/thinking--inversion.md) (compensation = reverse operation)  + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) (saga second-order consistency property)  + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md) (saga the simpler the better) 
