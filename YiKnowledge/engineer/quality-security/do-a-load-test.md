---
title: Do a load test
aliases:
- I want todo load test
- load-test-journey
- stress-test-journey
- load test entry
tags:
- journeys
- load-test
- stress-test
- performance
- capacity
- benchmark
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../tech-lead/roadmap/do-a-capacity-plan.md
- ./do-a-performance-audit.md
- ../../oncall-sre/observability/set-up-observability.md
- ../../engineer/infrastructure/capacity-planning.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to do a load test

> **As an** engineer, **I want to** do a load test, **so that** outcome is traceable. 

> "scenario + traffic model + load test script + bottleneck locate + elastic property validation + Monitoring + Retrospective"reach within 2 hopsProcess + Thinking + Case study. 

## Summary

- Process walk [capacity-planning-process.md](../infrastructure/capacity-planning.md) + [chaos-engineering-process.md](chaos-engineering.md) + [monitoring-governance-process.md](../process/monitoring-governance.md)
- Thinking walk [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Pattern walk [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md)
- Monitoring walk [i-want-to-set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) + [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md)

## Core viewpoints

**The traffic model is the load test's most important input, not the script.** A load test that uses a uniform traffic rate is testing a scenario that never happens in production. Real traffic has diurnal patterns, bursty behavior, and correlated spikes (e.g., all users checking notifications at the same time). The traffic model must be derived from production traffic curves, not from a target QPS number divided by 3600 seconds.

**A load test that does not reach the breaking point is a load test that has not finished.** Testing at the expected peak load (e.g., 1000 QPS) confirms that the system works at 1000 QPS, but it does not tell you what happens at 1100 QPS. The load test must continue past the expected peak until the system degrades or fails, so the team knows the actual capacity ceiling and the failure mode (graceful degradation vs. hard crash).

**Load testing in production requires isolation, not a separate environment.** A staging environment with 1/10th the capacity and 1/100th the data cannot predict production behavior. Production load testing with shadow traffic (marked requests, isolated tenants, separate data) gives real results. The isolation mechanism (header markers, tenant separation, data cleanup) must be validated before the load test, not during it.

**The load test must exercise the full request path, not just the application layer.** Load-testing only the API endpoint misses the database, cache, message queue, and external service dependencies that are the most common bottlenecks. The load test script must include the full trace: user -> gateway -> application -> database -> cache -> external API. If a dependency is mocked, the load test results are meaningless.

**Memory leaks and connection leaks only appear under sustained load.** A 5-minute load test at peak QPS will not reveal a slow memory leak that takes 30 minutes to exhaust the heap. The load test must include a sustained load phase (30+ minutes) at the expected peak QPS to catch leaks, GC pauses, and connection pool exhaustion that only manifest over time.

## Key info

- **Load test tool comparison**: k6 (JavaScript, developer-friendly, built-in checks + thresholds, Grafana integration, 10K+ VUs on a single machine, open source), Locust (Python, `pip install locust`, code-as-config, web UI, 5K+ VUs, best for Python teams), wrk2 (C, constant throughput mode, 10M+ req/s, CLI only, best for low-level benchmarking, no scripting), JMeter (Java, GUI + CLI, legacy, 1K+ VUs, best for enterprise legacy integration). For the Yi family: k6 (YiVad/YiPet frontend + API), Locust (YiAi Python backend). The key differentiator: k6's `thresholds` feature (e.g., `http_req_duration: ['p(95)<500']`) blocks the test from passing if performance degrades, making it CI-integrable.
- **Load test phases**: (1) ramp-up (gradually increase from 0 to target QPS over 2-5 minutes, lets auto-scaling and connection pools warm up), (2) steady-state (hold at expected peak QPS for 15-30 minutes, measure baseline), (3) spike (sudden 2-3x traffic burst, simulates real-world incident pattern), (4) sustained peak (hold at 1.5x expected peak for 30+ minutes, catch leaks), (5) soak (hold at 0.8x expected peak for 4+ hours, catch slow degradation), (6) ramp-down (gradually decrease, observe recovery). Most teams only run phases 1-2; phases 3-5 are where the real issues are found.
- **Traffic model from production**: extract the QPS distribution by hour from production metrics (e.g., CloudWatch, Grafana) over a 7-day period. The model should capture: peak hour QPS (P95 of hourly max), average QPS, peak-to-average ratio, and burst pattern (e.g., "every hour on the hour, QPS spikes 3x for 30 seconds"). The load test script should replay this pattern at 1x, 2x, and 3x the production traffic level. The most common mistake: using a flat QPS = peak_hour_QPS / 3600, which tests a uniform distribution that never occurs.
- **Breaking point identification**: increase QPS in 10% increments from the expected peak until the system fails. Record: (1) the QPS at which p95 latency exceeds 2x baseline, (2) the QPS at which error rate exceeds 1%, (3) the QPS at which the system crashes. The first point is the "soft ceiling" (degraded but still serving); the last point is the "hard ceiling." The capacity headroom = (hard ceiling QPS / expected peak QPS) - 1. A headroom of <0.5 means the system is at risk of overload during a traffic spike.
- **Load test in CI**: run a reduced-scale load test (10% of expected peak QPS, 5 minutes) on every PR that touches performance-critical paths. The test must pass (no regression >10% in p95 latency) to merge. This catches performance regressions at the PR level, not weeks later in a quarterly audit. The Yi family currently has no load testing at any level.

## Scenario description

When doing load test / stress test / capacity validation / pre-promo load test / elastic expansion validation / bottleneck locate / disaster recovery drill, Platform + SRE + architect + business owner need to look up Process + Thinking + Pattern + Case study. This entry aggregates load test related Process + Thinking + Pattern into a 2-hop path, avoiding "load test detached from reality / bottleneck not clear / elasticity not validated / promo incident / Monitoring missing / load test without Retrospective". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [capacity-planning-process.md](../infrastructure/capacity-planning.md) · [chaos-engineering-process.md](chaos-engineering.md) · [disaster-recovery-drill-process.md](../infrastructure/disaster-recovery-drill.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [incident-response-process.md](../process/incident-response.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [oncall-rotation-process.md](../process/oncall-rotation.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — load test target · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagining incident · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) · [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) — LLM load test |
| `tech/data/` | [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) |
| `lessons/wins/` | [yiai-llm-phase-{two,three,four,five}-win.md](../lessons) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — load test communication |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) |
| `lifecycle/` | [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — load test plan archive |
| `journeys/` | [../../tech-lead/roadmap/do-a-capacity-plan.md](../../tech-lead/roadmap/do-a-capacity-plan.md) · [./do-a-performance-audit.md](./do-a-performance-audit.md) · [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) · [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |
| `projects/` | each project `architecture-summary.md` §capacity + `dev-standards-summary.md` §load test command |

## Action recommendations

1. **First principles**: first ask "what does load test need to validate (QPS / latency / elasticity / stability / disaster recovery) / what happens if not loaded"; do not load test for loading's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "how load test could blow up (production data pollution / traffic hitting real users / cost explosion / false-trigger alerts) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one-shot load test → exposes bottleneck → rework → load again; loop; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest script that satisfies validation target wins; do not pile up tools; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Scenario**: must first list load test scenarios (normal / peak / promo / burst / disaster recovery / elasticity) ; each scenario independent. 
6. **Traffic model**: must be based on real traffic curves (diurnal / promo / burst) ; do not load at uniform rate. 
7. **Load test environment**: production load test (shadow traffic + marker + isolation)  / pre-prod load test (independent but real)  / QA environment (baseline) ; choose by risk. 
8. **Data**: must desensitize + mark + isolate + clean after load; do not pollute production data; walk [data-compliance-process.md](../infrastructure/data-compliance.md). 
9. **Script**: must run [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md); script versioned + replayable. 
10. **Bottleneck locate**: must locate at layer level (application / DB / cache / network / LLM provider) ; do not only look at application layer. 
11. **Elasticity validation**: must run [i-want-to-do-a-capacity-plan.md](../../tech-lead/roadmap/do-a-capacity-plan.md); trigger HPA / Cluster Autoscaler / pre-expansion. 
12. **Monitoring**: must run [monitoring-governance-process.md](../process/monitoring-governance.md); during load test monitor QPS / latency / error rate / resource utilization / elasticity triggers. 
13. **Trace load test**: must load all traces (users → gateway → application → DB → cache → LLM) ; do not only load a single interface. 
14. **Stability**: long-time load (30min+) validates memory leaks / connection leaks / GC jitter. 
15. **Extreme value**: must load to breaking point + find inflection + define SLA threshold; do not only load target value. 
16. **Isolation**: load test traffic must be isolated from real traffic (header / tenant / marker) ; walk [i-want-to-handle-multi-tenancy.md](../architecture-design/handle-multi-tenancy.md). 
17. **Freeze period**: pre-promo must load; during promo walk [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not load again. 
18. **Rollback**: must be able to stop load in seconds + rollback; walk [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md). 
19. **Communication**: pre-load must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate. 
20. **Retrospective**: post-load walk [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) Retrospective bottleneck + improvement items + Archive [review-log.md](../../knowledge-curator/governance/review-log.md). 
21. **Flywheel**: load test → improve → trust → more confident expansion; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Anti-patterns

- **Running the load test from a single machine.** A single load-generating machine will hit its own network, CPU, or file descriptor limits before it stresses the target system. The load generator must be distributed across multiple machines, and the aggregate throughput must be measured, not the per-machine throughput.

- **Using average response time as the only latency metric.** A load test that reports "average latency 200ms" hides the fact that P99 is 5000ms. The load test must report P50, P95, P99, and max latency, and the pass/fail criteria must be based on the tail (P99), not the mean.

- **Testing only the happy path.** A load test that only exercises the successful request path misses the behavior of the system under error conditions. A percentage of the load test traffic should trigger error paths (invalid inputs, expired tokens, missing resources) to verify that error handling does not degrade under load.

- **Running the load test without monitoring in place.** If the load test is running but the team cannot see the dashboard, the load test is a black box. Monitoring (QPS, latency, error rate, CPU, memory, DB connections, cache hit rate) must be in place and visible before the load test starts. The load test is as much a test of the monitoring as it is a test of the system.

- **Treating the load test as a pre-launch checkbox.** A load test that passes once and is never repeated is a snapshot of the system at one point in time. As the codebase, data volume, and traffic patterns change, the system's capacity changes. The load test must be repeated on a regular cadence (quarterly, or before every major release) and the results must be trended over time.

## Related

- Related journey: [../../tech-lead/roadmap/do-a-capacity-plan.md](../../tech-lead/roadmap/do-a-capacity-plan.md) — capacity planning
- Related journey: [./do-a-performance-audit.md](./do-a-performance-audit.md) — performance audit
- Related journey: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — Monitoring
- Related journey: [../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) — disaster recovery
- Upstream: [../../README.md](../../README.md) — processes leaf entry
