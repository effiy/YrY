---
title: Saga with compensation pattern
aliases: [saga-with-compensation-pattern, saga-compensation, compensation-pattern]
tags: [engineering-pattern, distributed-transactions, saga, consistency]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer, tech-lead, oncall-sre]
benefit: "Long-running distributed transactions are reversible through explicit compensating actions when partial failures occur"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
- ./saga.md
  - ./event-driven-architecture.md
  - ./cqrs.md
  - ./event-sourcing.md
  - ./graceful-degradation.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Saga compensation is not just rollback; it is a contract. Forward + compensation + idempotency + state machine + observability — five dimensions; business-value driven; not one-shot; measurable
---

# Saga with compensation pattern

> **As an** engineer, **I want to** saga with compensation, **so that** pattern applied consistently.

## Summary

- Saga compensation = contract; not just rollback
- Forward + compensation + idempotency + state machine + observability — five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers choreography / orchestration / hybrid multiple forms
- Links with saga + outbox + event-driven + cqrs + event-sourcing + idempotency + distributed-tracing + graceful-degradation
- Publicly queryable; not hidden
- First principles / inversion / second-order / Occam

## Problem

Cross-service long transactions cannot use 2PC (performance / availability / multi-owner coordination difficulty), yet business requires eventual consistency:

- Order + payment + inventory + logistics span multiple services; any failure requires partial rollback
- 2PC lock wait long / coordinator single point / cross-domain unavailable
- Direct distributed transactions — impossible to land in cloud-native
- No compensation design — failures require manual intervention, MTTR extremely high
- Non-idempotent compensation — retries cause duplicate charges / duplicate refunds

Inversion thinking: if the business can tolerate eventual consistency + step count ≤ 3 + each step has a natural inverse operation, compensation is simple; no heavy framework needed, pure functional-style compensation suffices.

## Pattern

```python
from dataclasses import dataclass
from typing import Callable, Awaitable
from enum import Enum

class SagaState(Enum):
    STARTED = "started"
    FORWARD = "forward"        # forward in progress
    FORWARD_DONE = "forward_done"
    COMPENSATING = "compensating"  # compensating
    COMPENSATED = "compensated"
    FAILED = "failed"

@dataclass
class SagaStep:
    name: str
    forward: Callable[[], Awaitable[None]]  # forward action
    compensate: Callable[[], Awaitable[None]]  # compensation action
    idempotency_key: str  # idempotency key

class SagaWithCompensation:
    """Saga + compensation + state machine + observability"""
    def __init__(self, steps: list[SagaStep], saga_id: str):
        self._steps = steps
        self._id = saga_id
        self._executed: list[SagaStep] = []
        self._state = SagaState.STARTED

    async def execute(self) -> None:
        self._state = SagaState.FORWARD
        try:
            for step in self._steps:
                await self._run_idempotent(step.forward, step.idempotency_key)
                self._executed.append(step)
            self._state = SagaState.FORWARD_DONE
        except Exception as e:
            self._state = SagaState.COMPENSATING
            await self._compensate()
            self._state = SagaState.COMPENSATED
            raise

    async def _compensate(self) -> None:
        # reverse execute completed compensations; idempotent
        for step in reversed(self._executed):
            try:
                await self._run_idempotent(step.compensate, f"compensate-{step.idempotency_key}")
            except Exception as e:
                # compensation failure: alert + manual intervention + retry queue
                await self._alert_compensation_failure(step, e)
                # do not raise — continue compensating other steps; keep failed step in DLQ

    async def _run_idempotent(self, fn: Callable, key: str) -> None:
        # idempotent: check idempotency store first; skip if already done
        if await self._idempotency_store.is_done(key):
            return
        await fn()
        await self._idempotency_store.mark_done(key, ttl="7d")
```

### Five dimensions

1. **Forward** — forward steps executed in order; each step independently callable + independent owner
2. **Compensation** — compensate steps executed in reverse; not rollback; business-level reverse operations (refund / return inventory / cancel order)
3. **Idempotency** — forward and compensate both idempotent; idempotency key + store; retry safe
4. **State machine** — STARTED / FORWARD / FORWARD_DONE / COMPENSATING / COMPENSATED / FAILED; persisted + recoverable
5. **Observability** — trace_id throughout + per-step events + state changes + DLQ + alerts + business metrics

## Applicable

- Cross-service long transactions (order / payment / inventory / logistics / billing)
- Cross-domain eventual consistency + any failure needs partial rollback
- Multi-owner coordination (autonomous teams + independent deploys)
- Business can tolerate second-level / minute-level eventual consistency
- Compensation actions business-definable (refund / return inventory / revoke)

## Not applicable

- Strong-consistency cross-domain transactions — should use 2PC or business redesign
- Step count > 7 — compensation chain too long; MTTR high; split saga
- No business-level inverse operation (e.g. email / SMS already sent) — compensation meaningless; use outbox + event subscription
- Real-time sync response — saga is asynchronous; should not be implemented as sync API
- Business tolerates eventual consistency + step count ≤ 3 + natural inverse operations — pure functional-style compensation sufficient; no heavy framework needed

## Landing checklist

1. **Saga split** — split by business boundary; each step independent owner + independent deploy
2. **Forward design** — each step independently callable + business executable + does not depend on prior step state
3. **Compensate design** — business-level inverse operation; not SQL rollback; business-definable
4. **Idempotency** — forward + compensate both idempotent; idempotency key + store; TTL ≥ business longest retry window
5. **State machine** — persist state + recoverable; restarting saga process does not lose state
6. **Choreography vs orchestration** — choreography (event subscription) decoupled / orchestration (central orchestrator) controllable; choose by complexity
7. **Hybrid** — key steps orchestrator + decoupled steps choreography; mixed form
8. **Outbox linkage** — forward step publishes events via outbox; guarantee at-least-once
9. **DLQ + retry** — compensation failures enter DLQ + retry queue + alerts + manual intervention
10. **trace_id** — throughout saga + per-step events; observable + traceable
11. **State query** — saga state queryable; users / customer service can view progress
12. **Timeout + watchdog** — stuck saga timeouts alert + watchdog compensates
13. **Drill** — compensation path drill regularly; do not wait for real failure to discover broken compensation
14. **Business metrics** — saga success rate + average duration + compensation rate + MTTR
15. **Versioned** — saga schema evolution + upcaster; does not break in-flight sagas

## Anti-patterns

- 2PC as saga — performance / availability disaster
- Compensation = SQL rollback — not business-level; cross-owner infeasible
- Forward not idempotent — retries cause duplicate charges / duplicate creates
- Compensate not idempotent — retries cause duplicate refunds / duplicate revocations
- No state machine — restart loses state; saga stuck
- No DLQ — compensation failures silent; MTTR extremely high
- Choreography overuse — event chains too long to trace; should switch to orchestration
- Orchestration as 2PC — orchestrator single point + lock wait
- Step count > 7 — compensation chain too long; split saga
- No trace_id — saga chain not traceable
- No drill — real failure discovers broken compensation
- No business metrics — saga health unknown
- Email / SMS as saga step — no business inverse operation; should use outbox + event subscription

## Related

- [saga-pattern.md](./saga.md) — saga basics
- [outbox-pattern.md](../infrastructure/outbox.md) — forward step publishes events via outbox
- [event-driven-architecture-pattern.md](./event-driven-architecture.md) — choreography saga
- [cqrs-pattern.md](./cqrs.md) — saga write / query separation
- [event-sourcing-pattern.md](./event-sourcing.md) — saga state is event stream
- [idempotency-pattern.md](../infrastructure/idempotency.md) — forward + compensate idempotency
- [distributed-tracing-pattern.md](../engineering/distributed-tracing.md) — trace_id throughout
- [graceful-degradation-pattern.md](./graceful-degradation.md) — compensation is a form of degradation
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
