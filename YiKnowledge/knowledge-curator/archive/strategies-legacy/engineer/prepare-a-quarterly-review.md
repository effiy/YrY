---

title: I want to prepare a quarterly review
aliases:
- I want to prepare a quarterly review
- quarterly-review-journey
- qbr-journey
- quarterly review entry
tags:
- journeys
- quarterly-review
- qbr
- okr
- tech-roadmap
- tech-debt
- security-audit
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../../tech-lead/roadmap/plan-tech-roadmap.md
- ../processes/run-a-retrospective.md
- ../processes/measure-product-metrics.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a quarterly review

> **As an** engineer, **I want to** prepare a quarterly review, **so that** launch is safe. 

> "Quarterly OKR Retrospective + tech debt audit + security audit + capacity planning + Knowledge base audit + team efficiency" reach within 2 hops Review Template + Measurement + Governance cadence. 

## Summary

- OKR Retrospective goes [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) + [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md)
- Tech debt goes [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) + [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md)
- Security goes [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md)
- Capacity goes [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) + [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md)
- Knowledge base goes [knowledge-review-process.md](../../engineer/processes/knowledge-review.md) + [review-log.md](../../knowledge-curator/governance/review-log.md)
- Team efficiency goes [engineering-productivity-metrics-summary.md](../../engineer/process/engineering-productivity-metrics.md) + [org-productivity-diagnosis-summary.md](../../engineer/processes/org-productivity-diagnosis.md)

## Scenario description

At quarter end / OKR Retrospective / tech debt audit / security audit / capacity assessment / team efficiency reporting, when TL + Architect + PM need to look up Review Template + Measurement system + Governance cadence. This entry aggregates quarterly-review-related 6 items Process + Measurement + Governance leaf into 2-hop paths, avoiding "quarterly review becomes ceremony / Measurement fragmented / action item no owner". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) · [tech-roadmap-review-summary.md](../../engineer/processes/tech-roadmap-review.md) · [tech-roadmap-review-template.md](../../engineer/processes/tech-roadmap-review.md) · [knowledge-review-process.md](../../engineer/processes/knowledge-review.md) · [engineering-productivity-metrics-summary.md](../../engineer/process/engineering-productivity-metrics.md) · [engineering-productivity-metrics-template.md](../../engineer/process/engineering-productivity-metrics.md) · [org-productivity-diagnosis-summary.md](../../engineer/processes/org-productivity-diagnosis.md) · [org-productivity-diagnosis-template.md](../../engineer/processes/org-productivity-diagnosis.md) · [iteration-pm-handbook-summary.md](../../engineer/process/iteration-pm-handbook.md) · [dependency-upgrade-process.md](../../engineer/processes/dependency-upgrade.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) · [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) · [directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) |
| `methodology/pm-frameworks/` | [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md) · [dual-track-agile-summary.md](../../product-manager/frameworks/dual-track-agile.md) · [agile-product-management-summary.md](../../product-manager/frameworks/agile-product-management.md) · [product-discovery-framework-summary.md](../../product-manager/frameworks/product-discovery-framework.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `lessons/{wins,failures}/` | [yiai-{rag-hybrid-retrieval,llm-phase-{two,three,four,five},brd-agent-launch,supply-chain-hardening}-win.md](../../engineer/lessons/wins) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) |
| `work/meetings/` | [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) — Review material generated |
| `industry/reports/` | [ai-industry-report-summary.md](../../executive/industry/reports/ai-industry-report.md) — industry benchmark align |
| `projects/` | each project `project-management-summary.md` §quarterly results + §next quarter planning |

## Action recommendations

1. **OKR Retrospective**: each KR must score (0.0-1.0) + self-assessment + peer + manager review; see [okr-design-summary.md](../../product-manager/frameworks/okr-design.md). 
2. **North-star metric**: review this quarter's north star + 3 auxiliary actual change + anomaly attribution; see [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md). 
3. **Tech debt**: scan [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md), sort by ROI, set next quarter payoff capacity 20-30%; follow [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md). 
4. **Security audit**: follow [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md), cover dependency / config / permission / log / data. 
5. **Capacity**: review this quarter peak + predict next quarter + go [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md); see [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md). 
6. **Knowledge base**: follow [knowledge-review-process.md](../../engineer/processes/knowledge-review.md), scan content expiry + naming consistency + isolated islands; record [review-log.md](../../knowledge-curator/governance/review-log.md). 
7. **Team efficiency**: run [engineering-productivity-metrics-summary.md](../../engineer/process/engineering-productivity-metrics.md) + [org-productivity-diagnosis-summary.md](../../engineer/processes/org-productivity-diagnosis.md); look at throughput / quality / satisfaction / collaboration bottlenecks. 
8. **Next quarter planning**: based on this quarter Retrospective + strategy + industry benchmark set next quarter OKR + tech debt list + capacity contingency; see [tech-roadmap-review-summary.md](../../engineer/processes/tech-roadmap-review.md). 
9. **action item**: each item must have owner + due date + Acceptance standard; first week of next quarter review. 
10. **cadence**: quarterly review + monthly review + bi-weekly iteration retro + incident postmortem; see [iteration-pm-handbook-summary.md](../../engineer/process/iteration-pm-handbook.md). 

## Related

- Related journey: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — planning deep
- Related journey: [../processes/run-a-retrospective.md](../processes/run-a-retrospective.md) — Retrospective Template
- Related journey: [../processes/measure-product-metrics.md](../processes/measure-product-metrics.md) — Measurement system
- Related journey: [./diagnose-org-productivity.md](./diagnose-org-productivity.md) — team efficiency
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly review Governance cadence
