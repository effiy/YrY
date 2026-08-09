---
title: Plan day two operations
aliases: [i-want-to-plan-day-two-operations, day-two, day-2, handover, run-team, retraining-cadence, model-monitoring]
tags: [journey, process, day-two, handover, run-team, retraining, model-monitoring, oncall, runbook]
category: engineer/engineering
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Systems are designed for long-term operability, not just launch-day success, with monitoring, backup, and runbooks in place"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - cross-references to related journeys and patterns are present
related:
  - ../process/operate-as-a-forward-deployed-engineer.md
  - ../architecture-design/design-a-minimum-viable-architecture.md
  - ../../ai-engineer/foundations/handle-a-model-drift.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Day 2 is not a wrap-up; it is the foundation of project survival. FDE exit goal = make yourself redundant; handover + monitoring + retraining + oncall + runbook + KT six-piece set; no internal owner = project dies
---

# I want to plan Day 2 operations

> **As an** engineer, **I want to** plan day two operations, **so that** launch is safe. 

## Summary

- Day 2 = operations after FDE exit; not a wrap-up
- FDE goal: make yourself redundant at the customer site
- Six-piece set: handover + monitoring + retraining + oncall + runbook + KT
- No internal owner = project dies
- Run Team training + documentation handover + monitoring alerts + drift detection
- Distinguish from project-handover: handover is the action; Day 2 is operations planning
- publicly queryable; periodic review
- First principles / inversion / second-order / Occam

## Scenario

Day 2 is not a wrap-up; it is the foundation of project survival. This entry gives the Day 2 full path, covering handover + monitoring + retraining + oncall + runbook + KT six-piece set, linking with project-handover + write-a-runbook + incident-response + monitoring-governance + oncall-rotation + knowledge-transfer + operate-as-a-forward-deployed-engineer + design-a-minimum-viable-architecture + handle-a-model-drift + prepare-a-model-governance-strategy, publicly queryable, periodic review, and links to handover / runbook / incident-response / monitoring / oncall / KT / fde-role / mva / model-drift / model-governance and other leaves. 

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | handover | [./project-handover.md](../process/project-handover.md) |
| 1 hop | runbook | [./write-a-runbook.md](../infrastructure/write-a-runbook.md) |
| 2 hops | fde-role | [../strategies/operate-as-a-forward-deployed-engineer.md](../process/operate-as-a-forward-deployed-engineer.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **Self-redundancy anchor**: FDE exit goal = system runs itself; not "permanent on-site presence"
2. **Six-piece set**: handover + monitoring + retraining + oncall + runbook + KT; do not omit
3. **Internal Owner identification**: no internal owner = project dies; find one in Week 1
4. **Run Team training**: transfer 1st-line support to customer Ops; do not handle remotely forever
5. **Monitoring alerts**: Prediction Drift + Feature Attribution + Latency + Error Rate; not "look after the fact"
6. **Retraining Cadence**: monthly / quarterly; not "never retrain"
7. **On-Call Rotation transfer**: customer rotates after FDE exit; not "always find the FDE"
8. **Runbook**: every alert has a runbook; not "naked alerts"
9. **KT knowledge transfer**: architecture diagram + decision log + ADR + incident retrospective; not "verbal handover"
10. **UAT follow-up**: whether customer employees truly use it; not "launch = success"
11. **Not documentation for documentation's sake**: every doc connects to a landing scenario
12. **not sloganeering**: each item tagged with measurement and time window
13. **versioned**: Day 2 plan has versions; evolution is traceable
14. **Link with project-handover**: Day 2 + handover co-built
15. **Link with write-a-runbook**: Day 2 + runbook co-built
16. **Link with incident-response**: Day 2 + incident response co-built
17. **Link with monitoring-governance**: Day 2 + monitoring governance co-built
18. **Link with oncall-rotation**: Day 2 + on-call rotation co-built
19. **Link with knowledge-transfer**: Day 2 + knowledge transfer co-built
20. **Link with fde-role**: Day 2 + FDE co-built
21. **Link with mva**: Day 2 + minimum viable architecture co-built
22. **Link with model-drift**: Day 2 + model drift co-built
23. **Link with model-governance**: Day 2 + model governance co-built
24. **Distinguish from project-handover**: handover is the action; Day 2 is operations planning
25. **Toolchain**: Grafana / Prometheus / Loki / PagerDuty / Opsgenie / BigQuery ML / Vertex AI Model Monitoring / Notion / Linear
26. **publicly queryable**: Day 2 plan everyone can look up; not hidden
27. **periodic review**: evolution updates; not one-shot
28. **first principles**: why must Day 2; worst consequence of not doing it (system collapse after FDE leaves / customer churn)
29. **inversion thinking**: how much can be solved by relying on FDE permanent on-site; whether customer budget / team growth can sustain
30. **second-order thinking**: second-order consequences after Day 2 (customer renewal / team reputation / product feedback)
31. **Occam**: Day 2 plan the more focused the better; cut redundant items

## Related

- handover: [./project-handover.md](../process/project-handover.md) — handover co-built
- runbook: [./write-a-runbook.md](../infrastructure/write-a-runbook.md) — runbook co-built
- incident-response: [./incident-response.md](../process/incident-response.md) — incident response co-built
- monitoring-governance: [./monitoring-governance.md](../process/monitoring-governance.md) — monitoring governance co-built
- oncall-rotation: [./oncall-rotation.md](../process/oncall-rotation.md) — on-call rotation co-built
- knowledge-transfer: [./knowledge-transfer.md](../process/knowledge-transfer.md) — knowledge transfer co-built
- fde-role: [../strategies/operate-as-a-forward-deployed-engineer.md](../process/operate-as-a-forward-deployed-engineer.md) — FDE co-built
- mva: [../strategies/design-a-minimum-viable-architecture.md](../architecture-design/design-a-minimum-viable-architecture.md) — minimum viable architecture co-built
- model-drift: [../../ai-engineer/foundations/handle-a-model-drift.md](../../ai-engineer/foundations/handle-a-model-drift.md) — model drift co-built
- model-governance: [../../ai-engineer/foundations/prepare-a-model-governance-strategy.md](../../knowledge-curator/archive/strategies-legacy/ai-engineer/prepare-a-model-governance-strategy.md) — model governance co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
