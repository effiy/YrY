---
title: Do a capacity plan
aliases:
- I want to do capacity planning
- capacity-plan-journey
- capacity-journey
- capacity planning entry
tags:
- journeys
- capacity
- planning
- cost
- autoscaling
- resource
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- tech-lead
- engineer
benefit: Tech leads can trace the rationale and outcome of this decision, preventing repeated re-derivation
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./plan-tech-roadmap.md
- ../../engineer/engineering/reduce-cost.md
- ../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md
- ../../engineer/infrastructure/capacity-planning.md
review_cycle: quarterly
tacit: false
---

# I want to do a capacity plan

> **As a** tech lead, **I want to** do a capacity plan, **so that** outcome is traceable.

> "Demand → QPS → resources → elasticity + cost + monitoring + scale-up playbook + quarterly retrospective" reach process + template + thinking + case study within 2 hops.

## Summary

- Process follows [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) + [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) + [incident-response-process.md](../../engineer/process/incident-response.md)
- Template follows [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) + [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- Case study follows [lessons/wins/](../../engineer/lessons) + [lessons/failures/](../../engineer/lessons)

## Core viewpoints

**Averages mask outages.** Capacity planning based on average load will fail at peak. The only numbers that matter for capacity are P99 and P999 latency under peak load, plus the three-to-five-times multiplier for promotional events. If your monitoring dashboard shows averages, you are planning for the wrong scenario.

**The bottleneck is never where you think it is.** In most systems, the application layer is the last thing to saturate. The database connection pool, the cache hit ratio under load, or the third-party API rate limit will break first. Capacity planning must model the entire dependency chain, not just the service itself.

**Elasticity without cold-start testing is a false safety net.** Auto-scaling works in theory but fails in practice when cold starts take thirty-plus seconds and traffic spikes in under ten seconds. Every auto-scaling configuration must be tested with a traffic spike that exceeds the cold-start window, and the results must inform the scaling thresholds.

**Cost optimization is a continuous process, not a quarterly event.** Waiting until the quarterly review to check cloud costs means ninety days of potential waste. Cost anomalies should trigger alerts, and unit costs -- per-request, per-user, per-token -- should be monitored continuously, not sampled once per quarter.

**Capacity planning without a runbook is incomplete.** Knowing the capacity numbers is useless if the on-call engineer does not know which knob to turn when the limit is hit. Every capacity plan must include a runbook with explicit scale-up, scale-down, rate-limit, and degrade procedures that have been drilled.

## Key info

- **Capacity modeling methodology (5-step demand-to-resource pipeline)**: (1) Business demand — pull DAU, peak QPS, data volume, and growth curve from business stakeholders; do not model from monitoring data alone; (2) QPS breakdown — business QPS → service QPS → dependency QPS (DB queries per request, cache lookups per request, LLM calls per request); each layer gets a 1.5x buffer; (3) Resource mapping — CPU cores per 1000 QPS, memory per concurrent connection, disk IOPS per write throughput, GPU VRAM per model instance; (4) Bottleneck identification — the resource that saturates first at projected peak defines the capacity ceiling; (5) Cost projection — unit cost (per-request, per-user, per-token) × projected volume = monthly cost. The Yi-family projects use `capacity-and-cost-template.md` for this pipeline.
- **Auto-scaling configuration requirements (6 parameters)**: (1) Scale-out threshold — CPU > 70% or memory > 80% or request queue depth > 100; (2) Scale-in threshold — CPU < 30% for 10 minutes; (3) Cooldown period — minimum 300 seconds between scale events to prevent flapping; (4) Cold-start time — measured from instance launch to first request served; must be less than the traffic spike ramp-up time; (5) Pre-scaling schedule — for known peak events (promotions, batch jobs), scale up 30 minutes before the event; (6) Max instance cap — set to prevent cost runaway; if the cap is hit, rate-limiting or degradation kicks in instead. Every auto-scaling configuration must be tested with a traffic spike that exceeds the cold-start window.
- **Peak capacity multipliers by scenario**: Normal peak — 1.5-2x daily average (weekday business hours); Weekend peak — 2-3x daily average (consumer-facing products); Promotional event — 3-5x daily average (planned marketing campaigns); Flash sale/viral event — 5-10x daily average (unpredictable, requires pre-warmed capacity); LLM inference peak — burst capacity limited by GPU availability (cold start of GPU instance is 2-5 minutes vs. 30 seconds for CPU). The multiplier is applied after the 1.5x buffer at each layer, so the total over-provisioning at peak is 4.5-15x the daily average QPS.
- **Dependency chain bottleneck ranking (most to least likely)**: (1) Database connection pool — typically 100-500 connections, saturates first under concurrent load; (2) Cache hit ratio — under high load, eviction rate increases, hit ratio drops, DB load amplifies; (3) Third-party API rate limits — LLM provider RPM/TPM limits, payment gateway TPS limits; (4) Network bandwidth — egress costs and throughput limits in cloud environments; (5) Application CPU/memory — typically the last to saturate in well-architected systems. The Yi-family's primary bottleneck is LLM provider rate limits (YiAi) and MongoDB connection pool (all 3 projects).
- **Cost anomaly detection thresholds**: Unit cost deviation > 20% from the 7-day rolling average triggers an alert; Monthly bill deviation > 15% from forecast triggers a review; Per-user cost growth > 10% month-over-month with flat user growth indicates inefficiency; Idle resource cost > 30% of total bill indicates over-provisioning. The Yi-family's primary cost is LLM API calls (usage-based, YiAi); infrastructure costs are minimal (MongoDB Atlas M0 free tier, Vercel/Rsbuild free tiers).
- **Yi-family capacity planning state (2026-08)**: All 3 projects run on free/development tiers — no production capacity planning in place. YiAi: single-process FastAPI server, no horizontal scaling, no load testing, LLM provider rate limits are the effective capacity ceiling. YiVad: static frontend on Vercel/Rsbuild, no server-side capacity concerns. YiPet: Chrome extension, client-side only, no server-side capacity. The capacity planning process and templates are designed for future production deployment; the immediate action is to document current capacity ceilings and set up monitoring for the first indicators of saturation.

## Scenario

When doing capacity planning / QPS estimation / elastic scaling / cost budgeting / big-promo playbook / quarterly capacity audit, platform + SRE + architects + business owners need to look up process + template + thinking + case study. This entry aggregates capacity-planning related process + template + thinking into a 2-hop path, avoiding "gut call / no elasticity / big-promo crash / cost out of control / no quarterly retrospective / playbook never drilled".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [oncall-rotation-process.md](../../engineer/process/oncall-rotation.md) · [tech-roadmap-review-summary.md](../../engineer/process/tech-roadmap-review.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) — LLM capacity |
| `tech/data/` | [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) — data layer capacity |
| `lessons/wins/` | [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) · [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons) |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — capacity stakeholders |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — quarterly audit |
| `industry/reports/` | [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) — industry capacity baseline |
| `projects/` | each project `architecture-summary.md` §capacity + `dev-standards-summary.md` §scale-up commands |

## Action recommendations

1. **First principles**: first ask "what to protect / QPS ceiling / latency SLA / data volume / cost ceiling / elasticity window"; do not jump to numbers; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how capacity can blow up (big promos / sudden traffic / single point / cascade / cost explosion)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: scale up → cost doubles → DB bottleneck → cache mismatch; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest stack that meets SLA wins; do not pile up machines; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Demand side**: must pull history + forecast from business side (DAU / peak / big-promo / growth curve); do not only look at monitoring.
6. **QPS breakdown**: business QPS → service QPS → dependency QPS (DB / cache / LLM / third party); leave buffer at each layer.
7. **Resource side**: CPU / memory / disk / network / GPU / token / call count; set scale threshold by bottleneck resource.
8. **Elasticity**: HPA / VPA / Cluster Autoscaler / pre-scaling / scheduled elasticity; choose by scenario; cold start must be tested.
9. **Peak design**: P99 / P999 / big-promo 3-5x daily; do not let averages mask peaks.
10. **Dependency bottleneck**: DB / cache / LLM provider often before application layer; must check [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) + [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md).
11. **Cost**: must run [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md); monthly bill + unit cost (QPS / token / user).
12. **Playbook**: scale up / down / rate-limit / circuit-breaker / degrade / traffic-shift; must land [i-want-to-write-a-runbook.md](../../engineer/infrastructure/write-a-runbook.md).
13. **Monitoring**: must monitor actual vs forecast deviation + elasticity trigger frequency + resource utilization + unit cost; follow [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md).
14. **Drill**: quarterly run [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md) + [i-want-to-prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) to verify the scale-up playbook.
15. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); pre-scale in place + no releases.
16. **Retrospective**: each quarter run [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to retrospect forecast accuracy + elasticity strategy + cost structure.
17. **Flywheel**: capacity forecast accurate → cost controlled → trust → bolder scaling; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).
18. **ADR**: key scale-up decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).

## Anti-patterns

- **Planning for average load.** Using mean QPS or mean latency as the capacity target. Peaks are what break systems. P99 and P999 under peak load -- including the big-promo multiplier -- are the only meaningful capacity metrics.

- **Ignoring dependency bottlenecks.** Sizing the application tier without checking whether the database, cache, or third-party API can handle the same load. The bottleneck is almost always one layer deeper than the one being planned. Model the full chain.

- **Over-provisioning as a substitute for architecture.** Throwing more machines at a problem instead of fixing the root cause -- missing index, N+1 query, unbounded queue, missing cache. Capacity is a complement to good architecture, not a replacement for it.

- **No load testing before major events.** Assuming the system will handle three-to-five-times normal traffic during a promotion because "it worked last time." Load testing must be part of the pre-promotion checklist, and results must be compared against the capacity plan.

- **Treating capacity and cost as separate concerns.** Capacity planning without cost modeling leads to over-provisioning and budget surprises. Cost optimization without capacity modeling leads to under-provisioning and outages. The two must be co-designed in every planning cycle.

## Related

- similar journey: [./plan-tech-roadmap.md](./plan-tech-roadmap.md) — roadmap
- similar journey: [../../engineer/engineering/reduce-cost.md](../../engineer/engineering/reduce-cost.md) — cost optimization
- similar journey: [../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) — disaster recovery
- similar journey: [../../engineer/engineering/scale-a-service.md](../../engineer/engineering/scale-a-service.md) — service scaling
- Upstream: [../../README.md](../../README.md) - processes leaf entry
