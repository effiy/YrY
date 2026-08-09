---
title: Run a chaos engineering experiment
aliases:
- I want to run a chaos engineering experiment
- chaos-engineering-journey
- fault-injection-journey
- chaos-experiment-journey
- chaos engineering entry
tags:
- journeys
- chaos-engineering
- fault-injection
- game-day
- resilience
- sre
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: process is repeatable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./run-a-game-day.md
- ./prepare-a-disaster-recovery-plan.md
- ../../tech-lead/roadmap/define-an-slo.md
- ../../engineer/architecture-design/graceful-degradation.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to run a chaos engineering experiment

> **As a** oncall sre, **I want to** run a chaos engineering experiment, **so that** process is repeatable.

> "assumption + fault injection + blast radius + monitoring + guardrails + retrospective + quarterly audit" reaches process + thinking + case study within 2 hops.

## Summary

- Process goes through [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) + [incident-response-process.md](../../engineer/process/incident-response.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking goes through [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Platform goes through [graceful-degradation-pattern.md](../../engineer/architecture-design/graceful-degradation.md) + [circuit-breaker-pattern.md](../../engineer/architecture-design/circuit-breaker.md) + [observability-pattern.md](../../engineer/engineering/observability.md)
- Case studies go through [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) + [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md)

## Core viewpoints

**Chaos engineering is a hypothesis-driven scientific practice, not random fault injection.**
Every chaos experiment must start with a specific, falsifiable hypothesis about how the system will behave under a particular failure condition. "If we kill the primary database, the application should fail over to the replica within 5 seconds with no 5xx errors." Without a hypothesis, you are not doing chaos engineering; you are breaking things randomly and hoping to learn something. The hypothesis is the control: it defines what success looks like and what observations matter.

**The blast radius is the single most important control variable.**
You do not need to inject faults into 100% of production traffic to learn something useful. Start with 1% of traffic, a single availability zone, or a single tenant. Expand the radius only after the system has demonstrated resilience at the current scope. The most common chaos engineering failure is not that the system broke; it is that the experiment broke the system for users who were not supposed to be affected.

**Chaos engineering without observability is vandalism.**
You cannot learn from an experiment you cannot observe. Before injecting any fault, verify that you have dashboards showing the steady state, alerts configured for the expected failure mode, and trace sampling that captures the affected request paths. If the observability signals are not in place, the experiment is a blind destruction test whose only outcome is "something broke."

**The goal is to build confidence in the system's ability to withstand failure, not to find every possible bug.**
Chaos engineering is about discovering unknown unknowns in the system's resilience mechanisms. It is not a substitute for unit tests, integration tests, or load tests. If your chaos experiment reveals that the application crashes when the database is unreachable, that is not a chaos engineering finding; that is a basic engineering failure that should have been caught in development.

## Key info

- **Chaos experiment hypothesis template**: "If we [inject specific fault], then the system will [expected behavior] within [time threshold] with [acceptable degradation]." Components: (1) Fault — what specific failure is injected (kill pod, block port, inject latency, exhaust disk); (2) Expected behavior — what the system should do (failover, degrade gracefully, retry with backoff); (3) Time threshold — how quickly the system should recover (e.g., <5 seconds for failover, <30 seconds for connection pool recovery); (4) Acceptable degradation — what level of impact is acceptable (e.g., <1% error rate during failover, <10% latency increase). A hypothesis without a time threshold is not testable; a hypothesis without an acceptable degradation level is not actionable.
- **Fault injection techniques by category**: (1) Network — latency injection (tc netem, 100ms-5s), packet loss (1-50%), connection termination (kill existing TCP connections), DNS failure (return NXDOMAIN); (2) Compute — CPU stress (consume 80%+ CPU), memory pressure (allocate until OOM), process kill (kill -9 on application process), fork bomb (exhaust PID limits); (3) Storage — disk fill (write until disk full), I/O latency (inject read/write latency), filesystem read-only (remount as ro); (4) Dependency — database connection failure (block port 27017/5432/3306), slow query (inject 10s+ query latency), cache failure (Redis/Memcached unreachable), third-party API timeout (5s+ response delay); (5) State — configuration corruption (invalid config file), certificate expiry (expired TLS cert), clock skew (NTP failure, time drift). The Yi-family projects use fault injection primarily for database and third-party API failure scenarios.
- **Blast radius control mechanisms**: (1) Traffic percentage — inject fault for 1% of requests, expand to 5%/25% only after each tier succeeds; (2) User isolation — use a dedicated test tenant or internal user accounts, never inject faults for paying customers in early experiments; (3) Infrastructure scope — single pod/instance first, then single AZ, then region-wide; (4) Time window — schedule experiments during business hours when the full team is available, limit experiment duration to 30-60 minutes; (5) Kill switch — pre-configured command to abort the experiment and restore normal state, tested before the experiment begins. The kill switch is the most important: if the experiment causes unexpected impact, the kill switch must restore the system in <30 seconds.
- **Chaos engineering maturity model**: Level 0 (no chaos) — no resilience testing, incidents are the first signal of failure; Level 1 (manual in staging) — ad-hoc fault injection in staging environment, no production experiments; Level 2 (automated in staging) — automated chaos experiments run in CI/CD pipeline for staging, gate deployments; Level 3 (production game days) — scheduled, supervised production experiments with blast radius controls; Level 4 (continuous production chaos) — automated production experiments run continuously, integrated with monitoring and alerting. Most organizations should target Level 3; Level 4 is appropriate only for organizations with mature observability and incident response. The Yi-family projects are at Level 0-1.
- **Chaos experiment retrospective template**: (1) Hypothesis — what was the expected behavior, was it confirmed or refuted; (2) Observations — what actually happened, any unexpected behaviors; (3) Surprises — what did we learn that we didn't know before; (4) Gaps — what resilience mechanisms were missing or insufficient; (5) Action items — what needs to be built, fixed, or improved, with owner and due date; (6) Next experiment — what should we test next based on what we learned. The retrospective must be published within 24 hours of the experiment; findings that are not documented within 24 hours are findings that will be forgotten.
- **Yi-family chaos engineering readiness**: YiAi — single MongoDB instance (no replica set), single application instance, no load balancer, no failover mechanism. Chaos experiment readiness: Level 0 — a database failure or application crash would cause a full outage. First target: set up MongoDB replica set with automatic failover, then test kill-primary experiment. YiVad — static frontend (no server-side failure modes), depends on YiAi RPC API. Chaos experiment readiness: not applicable for frontend, relevant for YiAi backend dependency. YiPet — Chrome extension (client-side only), depends on YiAi RPC API. Chaos experiment readiness: not applicable.

## Scenario

When running chaos engineering experiments / chaos engineering / fault injection / blast radius / monitoring / guardrails / game day / chaos comms / chaos monitoring / big-promo freeze / quarterly chaos audit / chaos retrospective, TL + SRE + architect + sponsor need to look up process + thinking + case study. This entry aggregates chaos-engineering-related process + thinking + case study into 2-hop paths, avoiding "assumptions hollow / injection chaotic / blast radius out of control / monitoring gaps / guardrails missing / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [code-review.md](../../engineer/quality-security/do-a-code-review.md) |
| `methodology/engineering-patterns/` | [graceful-degradation-pattern.md](../../engineer/architecture-design/graceful-degradation.md) · [circuit-breaker-pattern.md](../../engineer/architecture-design/circuit-breaker.md) · [observability-pattern.md](../../engineer/engineering/observability.md) · [rate-limiting-pattern.md](../../engineer/engineering/rate-limiting.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — essence of chaos · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — invert the out-of-control · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `resources/templates/` | [runbook](../../engineer/infrastructure/write-a-runbook.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — SRE matrix |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — chaos comms |
| `lessons/wins/` | [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md) · [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [bugs/](../../engineer/lessons) — chaos failure archive |
| `lessons/gotchas/` | [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | Each project `architecture-summary.md` § chaos + `adr-*` § chaos |
| `journeys/` | [./run-a-game-day.md](./run-a-game-day.md) · [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) · [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) · [./prepare-an-incident-response-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-an-incident-response-plan.md) |

## Action recommendations

1. **First principles**: first ask "what chaos to solve / what happens if not done / ROI / user impact"; do not do chaos for chaos' sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: first imagine "chaos could go out of control (blast radius / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Second-order effects**: one injection → behavior changes → another injection; go through [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam**: the simplest injection that satisfies the assumption wins; do not pile up faults; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **Assumption**: must run steady-state assumption + must have SLO + must be observable + never without a goal.
6. **Faults**: must run a fault library + must cover CPU / memory / network / disk / process + must be tiered.
7. **Injection**: must run control + must have blast radius + must be stoppable in seconds + never full-volume.
8. **Monitoring**: must run [observability-pattern.md](../../engineer/engineering/observability.md) + must have metrics + must have alerts + never blind runs.
9. **Guardrails**: must run kill switch + must auto-stop + must have fallback; go through [graceful-degradation-pattern.md](../../engineer/architecture-design/graceful-degradation.md).
10. **Circuit breaking**: must run [circuit-breaker-pattern.md](../../engineer/architecture-design/circuit-breaker.md) + must degrade + never cascade.
11. **SLO**: must run [i-want-to-define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) + must have error budget + never without a budget.
12. **RACI**: must run [raci-matrix-summary.md](../../engineer/process/raci-matrix.md); SRE / TL / sponsor owner.
13. **Cross-timezone**: must run [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md); multi-timezone windows.
14. **Freeze period**: during big promos go through [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not run chaos.
15. **Comms**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) inside and outside + must pre-announce.
16. **Drill**: must run [i-want-to-run-a-game-day.md](./run-a-game-day.md) + must rehearse + never directly in production.
17. **Retrospective**: after a chaos failure must run [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) retrospective + archive in [bugs/](../../engineer/lessons).
18. **Quarterly audit**: go through [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether assumptions are still accurate + whether the fault library is still reasonable.
19. **ADR**: chaos decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
20. **Flywheel**: chaos done well → resilience rises → trust rises → more investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).

## Anti-patterns

- **Injecting faults without a steady-state baseline.** Chaos experiments that start without first establishing what "normal" looks like are meaningless. You need 5-10 minutes of steady-state observation before fault injection: QPS, latency percentiles, error rate, system resource utilization. Without this baseline, you cannot distinguish chaos-induced anomalies from pre-existing fluctuations. The experiment is invalid if the steady state was not captured.

- **Running chaos experiments only during business hours.** If your system must survive failures at 3 AM, you must test it at 3 AM. Real failures do not respect business hours. The oncall rotation at 3 AM is a different team with different context and different alert fatigue. Running experiments only when the full engineering team is available creates a false sense of security about the system's 24/7 resilience.

- **Expanding the blast radius because "the first 1% was fine."** The first 1% of traffic may not trigger the threshold at which a circuit breaker opens, a cache becomes saturated, or a connection pool exhausts. The system's behavior at 1% fault injection is not predictive of its behavior at 25%. Expand the radius in small increments and re-validate the steady state at each step. The jump from 1% to 25% is where most chaos experiments go wrong.

- **Confusing chaos engineering with capacity testing.** Killing a pod to see if the system auto-heals is chaos engineering. Hammering the system with 10x normal traffic to find the breaking point is capacity testing. Chaos engineering tests resilience mechanisms; capacity testing finds resource limits. Using chaos tools for capacity testing typically produces results that are hard to interpret and accidentally impacts real users.

- **Not running chaos experiments on the observability stack itself.** Teams often test their application's resilience but never test whether the monitoring, alerting, and logging systems survive a failure. If the observability pipeline goes down during a real incident, you are flying blind. At least one chaos experiment per quarter should target the observability infrastructure: kill the metrics collector, saturate the log pipeline, or partition the alerting system.

## Related

- Same-class journey: [./run-a-game-day.md](./run-a-game-day.md) — drill
- Same-class journey: [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) — DR
- Same-class journey: [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) — SLO
- Same-class journey: [./prepare-an-incident-response-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-an-incident-response-plan.md) — incident plan
- Upstream: [../../README.md](../../README.md) — patterns leaf entry
