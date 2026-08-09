---
title: Run a FinOps review
aliases:
- i-want-to-run-a-finops-review
- finops-journey
- cloud-cost-journey
- unit-economics-journey
- FinOps entry
tags:
- journeys
- finops
- cloud-cost
- unit-economics
- showback
- chargeback
- cost-optimization
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
- ../../engineer/engineering/reduce-cost.md
- ../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-cost-allocation.md
- ./handle-a-cost-overrun.md
- ../../oncall-sre/observability/capacity-and-cost.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to run a FinOps review

> **As a** oncall sre, **I want to** run a finops review, **so that** process is repeatable. 

> Reach "visibility + allocation + unit economics + optimization + communication + thresholds + retrospective + quarterly audit" within 2 hops via process + thinking + cases. 

## Summary

- Process: [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) + [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) + [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)
- Data: [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) + [data-governance-summary.md](../../ai-engineer/data/data-governance.md)
- Cases: [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) + [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md)

## Core viewpoints

**FinOps is not about spending less; it is about spending with intent.**
The goal is not to minimize the cloud bill. The goal is to know exactly what each dollar buys, and to ensure that every dollar spent is aligned with business value. A team that cuts costs indiscriminately may reduce the bill by 20% while reducing the system's resilience, performance, or development velocity by 50%. The FinOps review should produce a narrative about where money is going and why, not just a list of cost-cutting opportunities.

**Unit economics is the only metric that scales across teams and services.**
Aggregate cloud spend is meaningless for decision-making. Is $50,000/month on compute too much? It depends on how many users, requests, or transactions that compute serves. Unit economics (cost per user, cost per API call, cost per token) enables apples-to-apples comparisons across services, teams, and time periods. Without unit economics, cost discussions devolve into "that number looks big" arguments.

**Cost allocation is the foundation of cost accountability.**
You cannot manage what you cannot measure, and you cannot measure what is not tagged. Every resource must be tagged with project, team, environment, and service. Without these tags, the cloud bill is a single large number with no actionable information. The FinOps review must audit tagging compliance as its first step. If tagging is incomplete, the rest of the review is guesswork.

**The most expensive resource is the one you forgot to decommission.**
Orphaned volumes, idle load balancers, forgotten test environments, and retired services that still have infrastructure running are the lowest-hanging fruit in any FinOps review. A quarterly scan for orphaned resources typically pays for the time spent on the review within the first month of cleanup.

## Scenario

When running a FinOps review / cloud cost audit / unit economics / showback / chargeback / cost optimization / quarterly cloud bill retrospective / post-big-promo cost retrospective / cross-team cost allocation / capacity planning / budget vs actual / resource utilization audit / savings plan selection / unit price / unit cost / quarterly FinOps health check, platform + TL + finance + sponsor need to look up process + thinking + cases. This entry aggregates FinOps-related process + thinking + cases into a 2-hop path, avoiding "visibility scattered / allocation chaos / unit hollow / optimization procrastination / communication lag / thresholds missing / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/processes/` | [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [tech-roadmap-review-process.md](../../engineer/process/tech-roadmap-review.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — cost essence · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — reverse-imagine loss of control · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| `methodology/pm-frameworks/` | [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) |
| `methodology/engineering-patterns/` | [eval-driven](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts--sql-generation.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) · [contract-negotiation-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-contract-strategy.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — cost communication |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — FinOps team |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — cloud consultant |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) |
| `product/strategy/` | [product-strategy-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-strategy.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) · [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons) — cost failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-risks](../../brd/) — business budget |
| `projects/` | each project `architecture-summary.md` §cost + `project-management-summary.md` §budget |
| `journeys/` | [../../engineer/engineering/reduce-cost.md](../../engineer/engineering/reduce-cost.md) · [../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-cost-allocation.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-cost-allocation.md) · [./handle-a-cost-overrun.md](./handle-a-cost-overrun.md) · [../../tech-lead/roadmap/do-a-capacity-plan.md](../../tech-lead/roadmap/do-a-capacity-plan.md) |

## Action recommendations

1. **First principles**: first ask "what does FinOps solve / what happens if not done / ROI / business impact"; do not audit for the sake of auditing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **Inversion**: first imagine "FinOps going out of control (visibility scattered / allocation chaos / unit hollow / optimization procrastination / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **Second-order effects**: save once -> capacity tight -> expand again; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
4. **Occam**: the simplest allocation that satisfies business wins; do not pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
5. **Visibility**: must run cost dashboard + tagging + dimensions (project / team / environment / service) + real-time. 
6. **Allocation**: must run [i-want-to-prepare-a-cost-allocation.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-cost-allocation.md) + showback / chargeback + dual track. 
7. **Unit economics**: must run unit economics (per user / per request / per order / per token) + trends + benchmarking. 
8. **Capacity**: must run [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) + utilization + right-size + reserved instances. 
9. **Savings plans**: must run savings plan / Reserved Instance / Commit selection + must ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
10. **AI cost**: LLM must run [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) + token optimization + cache + model routing. 
11. **Data**: data warehouse / ETL must run [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + cold/hot tiering + lifecycle cadence. 
12. **RACI**: must run [raci-matrix-summary.md](../../engineer/process/raci-matrix.md); FinOps / engineering / finance / sponsor owner. 
13. **Cross-timezone**: must run [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md); multi-timezone cost dashboard. 
14. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move budget. 
15. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) communicate sponsor + finance + business. 
16. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) dashboard + thresholds + alerts (anomaly / trend / budget) . 
17. **Retrospective**: after cost failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons). 
18. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether allocation is still accurate + savings still reasonable. 
19. **ADR**: FinOps decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
20. **Flywheel**: good FinOps -> controllable cost -> rising trust -> more investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md). 

## Anti-patterns

- **Reviewing costs without unit economics context.** Presenting a $200,000/month cloud bill with no breakdown by service, feature, or user creates panic but does not enable decision-making. Every cost number in the review must be accompanied by the corresponding unit metric: cost per user, cost per request, or cost per revenue dollar. Without this context, the review is just a bill shock meeting.

- **Optimizing for cost at the expense of reliability.** Moving from provisioned IOPS to general-purpose SSD may save 30% on storage but degrades database performance during peak hours. Switching to a cheaper LLM provider may reduce the quality of responses to the point where users churn. Every cost optimization must include a reliability and quality impact assessment. Cost reduction that increases the incident rate is a net negative.

- **Making the FinOps review an engineering-only exercise.** Finance, product, and executive stakeholders must be in the room. The engineering team can identify cost-saving opportunities, but the business stakeholders must decide which trade-offs are acceptable. If the FinOps review is run by engineers alone, the output is a list of technical optimizations that may or may not align with business priorities.

- **Ignoring the cost of free tiers and open-source tools.** "Free" services have operational costs: maintenance, integration, troubleshooting, and the opportunity cost of not using a managed service. The FinOps review must account for the total cost of ownership, including the engineering time spent managing "free" infrastructure. A self-hosted database that costs $0 in cloud spend but 20 engineering hours per month may be more expensive than a managed service.

- **Reviewing costs annually instead of continuously.** An annual FinOps review means that cost anomalies can go undetected for months. Continuous cost monitoring with weekly anomaly detection alerts is the minimum viable practice. The quarterly review should be a deep dive into trends, not a discovery exercise for unknown cost spikes.

## Related

- Similar journey: [../../engineer/engineering/reduce-cost.md](../../engineer/engineering/reduce-cost.md) — cost reduction
- Similar journey: [../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-cost-allocation.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-cost-allocation.md) — cost allocation
- Similar journey: [./handle-a-cost-overrun.md](./handle-a-cost-overrun.md) — cost overrun
- Similar journey: [../../tech-lead/roadmap/do-a-capacity-plan.md](../../tech-lead/roadmap/do-a-capacity-plan.md) — capacity planning
- Upstream: [../../oncall-sre/observability/README.md](../../oncall-sre/observability/README.md) — infra leaf entry
