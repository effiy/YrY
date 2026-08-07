---
title: Orchestrate a microservices workflow
aliases:
- I want to orchestrate a microservices workflow
- microservices-workflow-journey
- saga-pattern-journey
- workflow orchestration entry
tags:
- journeys
- microservices
- workflow
- saga
- orchestration
- choreography
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: process is repeatable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../strategies/decompose-a-monolith.md
- ../strategies/implement-an-api.md
- ../../tech-lead/architecture/design-architecture-decision.md
- ../../engineer/architecture-design/rpc-envelope.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to orchestrate a microservices workflow

> **As an** engineer, **I want to** orchestrate a microservices workflow, **so that** process is repeatable.

> "Orchestration vs choreography + saga + compensation + idempotency + state machine + monitoring + retrospective" — reach patterns + processes + thinking + cases within 2 hops.

## Summary

- Patterns follow [rpc-envelope-pattern.md](rpc-envelope.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) + [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Processes follow [tech-review.md](../../product-manager/delivery/tech-review.md) + [design-review.md](../../product-manager/delivery/design-review.md) + [requirement-review.md](../../product-manager/delivery/requirement-review.md)
- Cases follow [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) + [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) + [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md)

## Core viewpoints

**Orchestration is not about control -- it is about making failure visible.** Centralized orchestration gives you a single pane of glass for every failure mode: which step failed, what compensation ran, what state is dangling. Choreography hides these behind event logs that no one reads until the incident is already escalated. The orchestrator's primary value is not directing traffic; it is answering "what went wrong and what do I do now" in under 30 seconds.

**Idempotency is the foundation, not an afterthought.** Without idempotent steps, retries produce duplicates, compensation produces duplicates, and replay produces duplicates. Every other pattern (saga, timeout, dead-letter queue) is built on the assumption that replaying the same step twice produces the same outcome. Idempotency must be designed into the step contract from day one, not bolted on when the first duplicate invoice appears.

**The state machine is the business contract, not a technical detail.** When the business says "an order can be cancelled before shipping," the state machine must encode exactly that constraint. If the state machine drifts from the business rules, the orchestration silently produces wrong results, and no amount of monitoring will catch it because the monitor assumes the state machine is correct.

**Compensation order matters more than compensation logic.** Forward compensation (undo in reverse order) preserves invariants that forward order destroys. A payment refund before an inventory release is a double-spend; an inventory release before a refund is correct. The order of compensation steps is load-bearing and must be tested as rigorously as the forward path.

**Monitoring without intervention UI is half-finished.** A dashboard showing 500 stuck sagas is useless at 3am if the oncall engineer cannot click "retry," "skip," or "manual compensate" from the same screen. The orchestration system must provide an operations console that closes the loop from detection to resolution.

## Key info

- **Saga patterns**: choreography (event-driven, each service emits/listens) vs orchestration (central coordinator directs steps). Choreography suits 2-3 service flows with simple compensation; orchestration suits 4+ services, conditional branching, or parallelism. The crossover point is when a single service needs to know about 3+ other services' events -- at that point, the implied coordinator is real, just undocumented.
- **State machine engines**: AWS Step Functions (JSON-based, 1-year execution limit, built-in retry/backoff), Temporal/Cadence (code-based, multi-year workflows, SDK-level visibility), Zeebe (BPMN-native, Kafka-backed, horizontal scale), Netflix Conductor (JSON DSL, fork/join/dynamic, microservices-optimized). The choice hinges on: workflow duration (minutes vs years), developer interface (code vs DSL), and whether the operations team can read BPMN diagrams.
- **Idempotency key design**: UUIDv5 derived from business identity (order_id + operation_type), not UUIDv4. Deterministic keys survive client retries across different processes. The key must be stored with the response, not just the receipt -- the second caller needs the same response as the first. Stripe's `Idempotency-Key` header pattern (15-character minimum, stored for 24 hours) is the industry reference implementation.
- **Compensation order**: always reverse-chronological (last step first). If steps A→B→C succeed and D fails, compensate C→B→A, not A→B→C. Forward-order compensation violates invariants (e.g., refunding payment before releasing inventory creates a double-spend window). This is mathematically provable: the compensation of a sequence is the reverse sequence of compensations.
- **Saga timeout defaults**: long-running sagas need per-step timeouts distinct from the saga-level timeout. AWS Step Functions defaults: 1-year max execution, 60-second `TimeoutSeconds` per task, 3-retry `Retry` block with `BackoffRate` 2.0. Temporal defaults: infinite workflow duration, 10-second activity heartbeat timeout, 3-attempt activity retry. Choose based on whether the business process can tolerate a week-long in-flight saga (order fulfillment: yes; payment: no).
- **Outbox + saga coupling**: the outbox pattern (write events to an outbox table in the same transaction as the business write) is the only reliable way to ensure saga events are published. A saga that writes to the database and then publishes to Kafka in two separate transactions will eventually lose events when the process crashes between the two operations.

## Scenario

When orchestrating microservices / saga / workflow engines / business-process orchestration / cross-service transactions / compensation transactions / state machines / orchestration vs choreography / workflow visualization / business-rule engines, the platform + architects + TLs + engineers need to look up patterns + processes + thinking + cases. This entry aggregates workflow-orchestration-related patterns + processes + thinking into a 2-hop path to avoid "wrong orchestration / missed compensation / chaotic idempotency / scattered state machines / missing monitoring / cross-service transaction wrecks".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [rpc-envelope-pattern.md](rpc-envelope.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [sse-streaming-pattern.md](sse-streaming.md) · [eval-driven](../engineering/evaluation-driven-development.md) · [ssot-view-layer-pattern.md](ssot-view-layer.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of orchestration · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — compensation chains · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — think backwards from a wreck · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/ai-specific/` | [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) — agent orchestration · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) |
| `work/processes/` | [tech-review.md](../../product-manager/delivery/tech-review.md) · [design-review.md](../../product-manager/delivery/design-review.md) · [requirement-review.md](../../product-manager/delivery/requirement-review.md) · [release-process.md](../../oncall-sre/release/release.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [incident-response-process.md](../process/incident-response.md) |
| `tech/data/` | [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) · [data-governance-summary.md](../../ai-engineer/data/data-governance.md) |
| `tech/ai-platform/` | [ai-workbench-comparison-summary.md](./../../ai-engineer/platform/ai-workbench-user-guide.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llama-index-evolution-summary.md](../../ai-engineer/platform/llama-index-evolution.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [openapi-spec-template.md](./../../knowledge-curator/templates/tech-design.md) · [runbook-template.md](../infrastructure/write-a-runbook.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) · [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — workflow wreck archive |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — orchestration owner |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) |
| `lifecycle/` | [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [governance.md](../../knowledge-curator/governance/governance.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) |
| `brd/scenarios/` | [scn-unified-ticketing.md](./../../brd/README.md) — business scenarios |
| `projects/` | each project's `architecture-summary.md` §service orchestration + `adr-*` |
| `journeys/` | [../strategies/decompose-a-monolith.md](decompose-a-monolith.md) · [../strategies/implement-an-api.md](implement-an-api.md) · [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) · [../projects/build-an-agent-system.md](../projects/build-an-agent-system.md) |

## Action recommendations

1. **first principles**: First ask "what is the business process / which services are involved / sync or async / what happens if not orchestrated / ROI"; do not orchestrate for the sake of orchestration; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: First imagine "orchestration could go out of control (compensation failure / state inconsistency / infinite loop / dirty data / missing monitoring / performance collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: One compensation → cascades downstream → another compensation; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: The simplest orchestration that satisfies business wins; do not pile up engines; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **orchestration vs choreography**: Must choose between orchestration (centralized) vs choreography (event-driven); select based on business complexity + observability.
6. **saga**: Must run the saga pattern + compensation transactions + must be idempotent + must be replayable; follow [rpc-envelope-pattern.md](rpc-envelope.md).
7. **state machine**: Must run an explicit state machine + state persistence + must prevent ghost states + must have timeout reclaim.
8. **idempotency**: Must run idempotency keys + must prevent replays + must prevent double charges; follow [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md).
9. **compensation**: Must run compensation transactions + must use forward/reverse order + must be retryable + must allow human intervention; follow [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md).
10. **timeout**: Must run timeouts + retries + caps + must distinguish 5xx / 4xx; follow [i-want-to-handle-a-cache-invalidation.md](../../oncall-sre/incident-response/handle-a-cache-invalidation.md).
11. **queues**: Must run queues / streams + consumer groups + dead-letter queues + retries + must monitor lag.
12. **dual-world**: Migrations / refactors must run [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + dual-run + diff.
13. **contract**: Cross-service must run [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) to prevent schema drift.
14. **AI agent**: AI workflows must run [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) + tool calls + multi-step success rates.
15. **monitoring**: Must run [monitoring-governance-process.md](../process/monitoring-governance.md); process graphs / state distribution / timeouts / compensation counts / dead letters.
16. **visualization**: Must have process graphs + state queries + intervention entries (manual compensation / replay / skip).
17. **CI/CD**: Must run [i-want-to-set-up-ci-cd.md](../infrastructure/set-up-ci-cd.md); orchestration code must be tested + contract tested + integration tested.
18. **freeze period**: During big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — do not change orchestration.
19. **rollback**: Must be able to switch back to the old orchestration in seconds + must support manual compensation; follow [i-want-to-do-a-rollback-drill.md](../../oncall-sre/incident-response/do-a-rollback-drill.md).
20. **retrospective**: After an incident follow [i-want-to-write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) retrospective + add test cases + archive in [bugs/](../lessons).
21. **quarterly audit**: Follow [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether orchestration is still accurate + whether state machines still represent the business.
22. **ADR**: Orchestration architecture decisions must land as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **flywheel**: Orchestration done well → business flows smoothly → team dares to scale services → larger orchestration; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Anti-patterns

- **Orchestrating everything.** Not every cross-service call needs a saga. Simple read-only aggregations, fire-and-forget notifications, and idempotent single-step writes do not need orchestration. Adding orchestration to these adds latency and complexity with zero benefit.

- **Saga without timeout.** An un-timed saga step waiting for a downstream service that will never respond ties up resources indefinitely. Every saga step must have a deadline, and the orchestrator must have a timeout reclaim path that triggers compensation.

- **Mixing orchestration logic with business logic.** The orchestrator should know which steps to call and in what order, not what each step does internally. Business rules leaking into the orchestrator make it impossible to change either independently and create a god-module that everyone is afraid to touch.

- **Compensation that assumes success.** Compensation steps can also fail. A compensation that does not have its own retry or fallback path is a ticking time bomb. Every compensation must be idempotent and retryable, with a human escalation path for the final failure mode.

- **Single point of orchestration without redundancy.** If the orchestrator itself is not highly available, it becomes the bottleneck for the entire system. Orchestrator state must be persisted externally so that a failed orchestrator instance can be replaced without losing in-flight saga state.

## Related

- similar journey: [../strategies/decompose-a-monolith.md](decompose-a-monolith.md) — decompose a monolith
- similar journey: [../strategies/implement-an-api.md](implement-an-api.md) — implement an API
- similar journey: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — architecture decision
- similar journey: [../projects/build-an-agent-system.md](../projects/build-an-agent-system.md) — agent system
- upstream: [../../README.md](../../README.md) — engineering-patterns leaf entry
