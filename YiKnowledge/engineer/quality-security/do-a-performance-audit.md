---
title: Do a performance audit
aliases:
- I want to do a performance audit
- performance-audit-journey
- performance optimization entry
- latency-throughput entry
tags:
- journeys
- performance
- audit
- latency
- throughput
- profiling
- optimization
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: review is structured
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../oncall-sre/observability/set-up-observability.md
- ../../tech-lead/roadmap/plan-tech-roadmap.md
- ../../tech-lead/roadmap/manage-tech-debt.md
- ../../oncall-sre/observability/capacity-and-cost.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to do a performance audit

> **As an** engineer, **I want to** do a performance audit, **so that** review is structured.

> "How to audit latency / throughput / resource usage + how to locate bottlenecks + how to prioritize optimization" reach profiling + capacity cost + monitoring + tech debt + thinking frameworks within 2 hops.

## Summary

- Audit uses three pieces: metrics for trends + traces to restore chains + profiles to find bottlenecks
- Capacity and cost via [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) (FinOps)
- Monitoring via [monitoring-governance-process](../process/monitoring-governance.md) + [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md)
- Optimization priority via [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [ockhams-razor](../../knowledge-curator/templates/thinking/ockhams-razor.md)

## Core viewpoints

**Metrics tell you there is a problem; traces tell you where; profiles tell you why.** A latency spike on a dashboard is a signal, not a diagnosis. The trace pinpoints the slowest hop in the call chain (which service, which database query, which external API). The profile pinpoints the hot function within that hop (CPU-bound loop, blocking I/O, memory allocation). Skipping straight from metrics to optimization means optimizing the wrong thing.

**The highest-impact optimization is rarely the most technically interesting one.** A 200ms improvement from fixing an N+1 query is worth more than a 20ms improvement from hand-optimizing a hot loop. The optimization order is: eliminate unnecessary work, then batch work, then cache results, then optimize algorithms. The technically impressive optimization (rewriting in Rust, custom data structures) should only be explored after the low-hanging fruit is exhausted.

**Without a quantified baseline, optimization is a religion, not an engineering practice.** "It feels faster" is not a measurement. The baseline must include P50/P95/P99 latency, QPS, error rate, and resource utilization at a specific traffic level. After optimization, the same metrics must be measured at the same traffic level. The delta between before and after is the only acceptable evidence of improvement.

**Performance optimization has a second-order cost that must be accounted for.** Adding a cache reduces database load but introduces cache invalidation complexity and consistency risks. Adding connection pooling reduces connection overhead but can mask downstream capacity issues. Every optimization changes the system's failure modes, and those new failure modes must be understood before the optimization is shipped.

**The performance audit is a recurring process, not a one-time project.** Performance degrades continuously as data grows, traffic increases, and new features are added. A quarterly audit that re-measures the baseline, re-profiles the hot paths, and re-evaluates the optimization priorities is the only way to prevent the system from slowly becoming unacceptable.

## Key info

- **Profiling tools by language**: Python (py-spy for sampling profiler, 1-2% overhead, `py-spy top --pid <PID>` for live view; cProfile for deterministic, `python -m cProfile -s cumulative app.py`; memory_profiler for line-by-line memory), JavaScript/TypeScript (Chrome DevTools Performance tab for CPU profiles, Memory tab for heap snapshots; clinic.js for Node.js; React DevTools Profiler for component render times), Go (pprof built-in, `import _ "net/http/pprof"`, `go tool pprof -http=:8080`). For the Yi family: YiAi (Python) should use `py-spy` for live profiling without restart; YiVad/YiPet (browser) should use Chrome DevTools Performance tab.
- **Optimization ROI hierarchy**: Level 1 (eliminate unnecessary work: remove redundant queries, skip zero-impact computations, reduce over-fetching) — 50-80% improvement, 1-2 days. Level 2 (batch work: combine queries, bulk operations, reduce round trips) — 30-50% improvement, 2-5 days. Level 3 (cache results: in-memory, Redis, CDN, with invalidation strategy) — 20-40% improvement, 5-10 days. Level 4 (optimize algorithms: better data structures, indexing, parallelization) — 10-30% improvement, 10-30 days. The rule: never start at Level 4. The most common mistake is jumping to algorithm optimization (rewriting in Rust) when Level 1 fixes (removing an N+1 query) would give 10x the improvement for 1/10th the effort.
- **Baseline measurement template**: each service endpoint should have a baseline card: `{ endpoint: "/api/chat", p50: 120ms, p95: 450ms, p99: 1200ms, qps: 50, error_rate: 0.1%, cpu: 45%, memory: 2.1GB, connections: 85, measured_at: "2026-08-07T10:00:00Z", traffic_level: "normal" }`. The baseline is measured at a specific traffic level because performance varies non-linearly with load. Measuring at 50 QPS and optimizing for that may not help at 500 QPS where the bottleneck is different.
- **Performance audit cadence**: quarterly audit (3 months), re-measure all baselines, compare against previous quarter, flag any regression >20%. The audit report should have three sections: (1) what got worse (regressions from new features, data growth), (2) what got better (from previous quarter's optimizations), (3) what to optimize next (ranked by ROI, with estimates). Without the quarterly cadence, performance issues accumulate silently until users complain.
- **N+1 detection in production**: the most common performance bug is invisible in development (where N is small). In production, the query with the highest `calls * mean_time` in `pg_stat_statements` is the N+1 candidate. A query called 100,000 times with 1ms average = 100s of total DB time, which dwarfs a single slow query taking 5s. The fix pattern: batch loading (WHERE id IN (...)) or eager loading (JOIN FETCH). The detection requires production metrics, not development profiling.

## Scenario

When the system slows down / P95 latency exceeds target / resource usage is high / throughput drops / capacity cost exceeds budget, engineer + architect + FinOps need to audit + locate bottlenecks + prioritize + optimize. This entry aggregates profiling, capacity cost, monitoring, tech debt, and thinking frameworks into a 2-hop path, avoiding "optimizing by intuition / majoring in minors / no validation after optimization".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — FinOps perspective |
| `work/processes/` | [monitoring-governance-process.md](../process/monitoring-governance.md) · [capacity-planning-process.md](../infrastructure/capacity-planning.md) · [incident-response-process.md](../process/incident-response.md) · [chaos-engineering-process.md](chaos-engineering.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) · [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md) — performance patterns |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) — LLM performance selection |
| `lessons/wins/` | [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) — dev 90s->8s + HMR 12%->0.5% · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) — lint -91% |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) — performance incident reference |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) — performance traps |
| `journeys/` | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) · [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) · [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) · [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |

## Action recommendations

1. **Three-piece audit**: metrics (trends: QPS / latency P50/P95/P99 / error rate / resource usage) + trace (restore chain: cross-service calls + DB + LLM calls) + profile (find bottlenecks: CPU / GPU / memory / IO hotspots).
2. **Quantify baseline**: before auditing, set a baseline (e.g. P95 280ms); without a baseline there's no improvement verdict.
3. **Bottleneck location**: trace to find the slowest node; profile to find hot functions; don't chase symptoms ("overall slow"), chase root causes ("DB query N+1" / "LLM first-token latency high").
4. **Optimization priority**: high-impact + low-cost first ([ockhams-razor](../../knowledge-curator/templates/thinking/ockhams-razor.md), don't add complexity unless necessary); high-impact + high-cost next (roadmap scheduling); low-impact, skip optimization.
5. **Thinking frameworks**: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) (essence of performance: latency = queue + service + network) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) "how to make the system slower" reverse reasoning + [second-order-thinking](../../knowledge-curator/templates/thinking/second-order-thinking.md) (optimization second-order effects: cache -> consistency issues) + [flywheel-effect](../../knowledge-curator/templates/thinking/flywheel-effect.md) (performance flywheel: fast -> users use more -> more data -> more accurate optimization).
6. **FinOps alignment**: co-build performance and cost — follow [capacity-and-cost](../../oncall-sre/observability/capacity-and-cost.md); don't optimize only performance or only cost (or vice versa).
7. **Tech debt alignment**: performance issues often stem from tech debt — follow [tech-debt-inventory](../../oncall-sre/observability/tech-debt-inventory.md) to pay down high-interest debt.
8. **Validate after optimization**: run [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) with rollback thresholds; no validation, no verdict.
9. **LLM specifics**: monitor recall rate / faithfulness / error rate / latency — follow [llm-observability-comparison](../../ai-engineer/platform/llm-observability-comparison.md); pick inference engine vLLM for production vs Ollama for local ([inference-engine-comparison](../../ai-engineer/platform/inference-engine-comparison.md)).

## Anti-patterns

- **Optimizing without measuring first.** The engineer identifies a slow-looking function, rewrites it to be faster, and declares victory. Without a before-and-after measurement, there is no evidence that the optimization helped, and there is a significant chance that the perceived slowness was in a different part of the system entirely.

- **Optimizing the P50 and ignoring the P99.** The median latency looks healthy after optimization, but the tail latency is unchanged or worse. P99 is what users experience as "the app is slow sometimes," and P99 regressions are the hardest to diagnose because they are intermittent. The audit must measure and optimize the tail, not just the center.

- **Adding infrastructure to solve an application-level problem.** Slow queries are fixed by adding indexes, not by adding read replicas. Memory leaks are fixed by fixing the leak, not by adding more RAM. Infrastructure scaling masks the symptom and kicks the can down the road, but the underlying problem continues to grow until it can no longer be masked.

- **Performing the audit but never acting on the findings.** The audit produces a report with 20 recommendations, the report is reviewed in a meeting, and then nothing happens. The bottleneck is not the analysis; it is the prioritization. The audit must produce a ranked list of 3-5 actionable items that enter the next sprint, not a comprehensive catalog of every possible improvement.

- **Assuming the production environment matches the staging environment.** A query that takes 50ms in staging with 10K rows takes 2000ms in production with 10M rows. The performance audit must be run against production data (or a production-scale replica), not against a scaled-down staging database. The plan that works in staging is not the plan that matters in production.

## Related

- Same-class journey: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — observability foundation
- Same-class journey: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — roadmap scheduling
- Same-class journey: [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) — performance debt
- Same-class journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — performance incident
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit
