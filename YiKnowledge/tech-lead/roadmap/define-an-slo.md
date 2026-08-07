---
title: Define an SLO
aliases: [i-want-to-define-an-slo, define-an-slo, slo-error-budget]
tags: [journey, methodology, slo, error-budget, burn-rate, alerting]
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [tech-lead, engineer]
benefit: "SLOs translate user expectations into measurable engineering targets, enabling data-driven reliability decisions"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../oncall-sre/incident-response/respond-to-an-incident.md
  - ../../engineer/infrastructure/ship-a-release.md
  - ../../engineer/quality-security/do-a-performance-audit.md
  - ../../engineer/process/measure-product-metrics.md
  - ./plan-tech-roadmap.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: SLO is not a replacement for SLA; it is an internal engineering commitment; error budget burn rate drives release cadence; budget exhaustion freezes releases
---

# I want to define an SLO

> **As a** tech lead, **I want to** define an slo, **so that** system stays coherent. 

## Summary

- SLO four-piece set: SLI metrics + SLO goal + error budget + burn-rate alerting
- SLI metrics: latency / availability / throughput / error rate / saturation; choose the one closest to user perception
- SLO goal: 99.9% / 99.95% / 99.99%; tiered by business criticality
- error budget: 100% - SLO; budget exhaustion freezes releases
- burn-rate alerting: 1h / 6h / 24h / 72h multi-window; alert by burn multiple
- SLI → SLO → SLA three layers: SLI measurement / SLO internal goal / SLA external commitment

## Scenario

Service launch, user growth, critical business; need to quantify reliability. This entry gives the SLO definition path, covering SLI metric selection, SLO goal setting, error budget, burn-rate alerting, and links to observability / incident-response / ship-a-release / performance-audit / measure-product-metrics / plan-tech-roadmap / prepare-a-disaster-recovery-plan and other leaves. 

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | observable | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | incident response | [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |
| 2 hops | release | [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) |
| 2 hops | performance audit | [../../engineer/quality-security/do-a-performance-audit.md](../../engineer/quality-security/do-a-performance-audit.md) |
| 2 hops | measurement | [../../engineer/process/measure-product-metrics.md](../../engineer/process/measure-product-metrics.md) |
| 2 hops | roadmap | [./plan-tech-roadmap.md](./plan-tech-roadmap.md) |
| 2 hops | disaster recovery | [../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Choose SLI metric closest to user perception**: latency / availability / throughput / error rate / saturation; do not choose internal technical metrics
2. **Tier SLO goal by business criticality**: 99% / 99.9% / 99.95% / 99.99%; higher is not always better
3. **error budget**: 100% - SLO; budget exhaustion freezes releases
4. **burn-rate alerting multi-window**: 1h / 6h / 24h / 72h; alert by burn multiple
5. **SLI → SLO → SLA three layers**: SLI measurement / SLO internal goal / SLA external commitment
6. **Higher SLO is not always better**: 99.99% is costly; tier by business criticality
7. **error budget drives release cadence**: budget ample → more releases; budget tight → freeze + fix stability
8. **Alerts must be actionable**: no noise; alerts must come with runbook
9. **review cadence**: quarterly review SLO reasonableness; do not set and forget
10. **multiple SLIs**: not just one; latency + error rate + availability multi-dimension
11. **first principles**: why must SLO; worst consequence of not having SLO
12. **inversion thinking**: how much can monitoring replace SLO; if solvable, do not SLO
13. **second-order thinking**: second-order consequences after SLO (cost / release cadence); do not only look at short-term output
14. **Occam**: the fewer SLIs the better; cut redundant metrics

## Related

- observable: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — SLI measurement
- incident response: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — error budget exhaustion incidents
- release: [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) — release cadence
- performance audit: [../../engineer/quality-security/do-a-performance-audit.md](../../engineer/quality-security/do-a-performance-audit.md) — SLI baseline
- measurement: [../../engineer/process/measure-product-metrics.md](../../engineer/process/measure-product-metrics.md) — business metric alignment
- roadmap: [./plan-tech-roadmap.md](./plan-tech-roadmap.md) — quarterly review
- disaster recovery: [../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) — RTO/RPO
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
