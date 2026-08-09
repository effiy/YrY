---
title: Do a pre-mortem
aliases: [i-want-to-do-a-pre-mortem, pre-mortem, pre-mortem-analysis, prospective-hindsight]
tags: [journey, methodology, pre-mortem, risk-management, prospective-hindsight, decision-making, launch-readiness]
category: engineer/process
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Teams preemptively identify project failure modes before launch, reducing the risk of unexpected failures"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present"
related:
 - ../../tech-lead/risk/write-a-postmortem.md
 - ../strategies/prepare-an-rfc.md
 - ../../tech-lead/roadmap/prepare-an-architecture-review.md
 - ../../product-manager/frameworks/launch-an-ai-product.md
 - ../strategies/prepare-a-decision-log.md
 - ./run-a-retrospective.md
 - ../../oncall-sre/incident-response/do-a-rollback-drill.md
 - ../../knowledge-curator/templates/thinking--inversion.md
 - ../../knowledge-curator/templates/thinking--second-order-thinking.md
 - ../../knowledge-curator/templates/thinking--first-principles.md
 - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: A pre-mortem is not pessimism; it is foresight before hindsight. Hypothesize that the project has already failed and reverse-engineer the reasons; don't cover up risk; team co-creation, not blame; patch before the battle, not after.
---

# I want to do a pre-mortem

> **As an** engineer, **I want to** do a pre mortem, **so that** outcome is traceable.

## Summary

- pre-mortem = foresight before hindsight; hypothesize the project has already failed and reverse-engineer the reasons
- not pessimism; patch before the battle
- team co-creation; not one person thinking
- no blame; no judgment; only surface risks
- failure pattern checklist; prioritize by probability × impact
- timing: after the decision, before execution; not too early, not too late
- paired with postmortem: pre hypothesis + post validation
- linked to risk register; not just a one-off
- First principles: failure must happen; discovering it earlier costs least
- Inversion: first hypothesize failure, then reverse-engineer
- Second-order thinking: failure of second-order consequences

## Scenario description

A pre-mortem is a rehearsal that must be done before launch; not pessimism but foresight. This entry provides the pre-mortem full path, covering foresight before hindsight, team co-creation, no blame, failure pattern checklist, risk register links, timing, pairing with postmortem, and links to write-a-postmortem / prepare-an-rfc / prepare-an-architecture-review / launch-an-ai-product / prepare-a-decision-log / run-a-retrospective / do-a-rollback-drill and other leaves.

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | postmortem | [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) |
| 2 hops | RFC | [../strategies/prepare-an-rfc.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-rfc.md) |
| 2 hops | Architecture review | [../../tech-lead/roadmap/prepare-an-architecture-review.md](../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-an-architecture-review.md) |
| 2 hops | AI Launch | [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) |
| 2 hops | Decision log | [../strategies/prepare-a-decision-log.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-decision-log.md) |
| 2 hops | Retrospective | [./run-a-retrospective.md](./run-a-retrospective.md) |
| 2 hops | rollback drill | [../../oncall-sre/incident-response/do-a-rollback-drill.md](../../oncall-sre/incident-response/do-a-rollback-drill.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Timing**: after the decision, before execution; solution already set but not yet launched; not too early, not too late
2. **Foresight before hindsight**: hypothesize the project has already failed 6 months later; reverse-engineer reasons from the failure
3. **Team co-creation**: everyone surfaces failure patterns; not one person thinking; not copying from elsewhere
4. **No blame**: no judgment; no blame; only surface risks; blameless
5. **Failure pattern checklist**: every item must tag probability / impact / trigger condition / mitigation strategy
6. **Priority**: sort by probability × impact; mitigate high-probability high-impact first
7. **Risk categories**: tech / team / market / resource / time / compliance / external dependencies
8. **Mitigation strategy**: every risk must tag a mitigation solution; no empty rows
9. **Risk register links**: enter the risk register for continuous tracing; not a one-off
10. **Pair with postmortem**: pre hypothesis + post validation; closed loop
11. **Scenario drills**: every high-risk scenario must be drilled; not just listed
12. **Decision threshold**: high-probability high-impact risk triggers a decision threshold; can cancel the project
13. **Continuous update**: as the project evolves, update the risk register; not one-shot
14. **First principles**: why a pre-mortem is necessary; worst consequence of not doing it
15. **Inversion**: first hypothesize failure, then reverse-engineer reasons; complement forward thinking to catch missed risks
16. **Second-order thinking**: second-order consequences after the pre-mortem (decision consistency / hiring / documentation / risk awareness)
17. **Occam**: the simpler the pre-mortem, the better; cut redundant dimensions

## Related

- postmortem: [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) — pre hypothesis + post validation
- RFC: [../strategies/prepare-an-rfc.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-rfc.md) — before the decision
- Architecture review: [../../tech-lead/roadmap/prepare-an-architecture-review.md](../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-an-architecture-review.md) — architecture risk
- AI Launch: [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) — pre-mortem before launch
- Decision log: [../strategies/prepare-a-decision-log.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-decision-log.md) — decision + risk
- Retrospective: [./run-a-retrospective.md](./run-a-retrospective.md) — risk retrospective
- rollback drill: [../../oncall-sre/incident-response/do-a-rollback-drill.md](../../oncall-sre/incident-response/do-a-rollback-drill.md) — risk mitigation
- Thinking frameworks: [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
