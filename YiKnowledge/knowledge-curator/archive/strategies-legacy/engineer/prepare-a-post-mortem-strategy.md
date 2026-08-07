---
title: I want to build a Post-Mortem strategy / Prepare a post-mortem strategy
aliases: [i-want-to-prepare-a-post-mortem-strategy, post-mortem-strategy, pm-strategy]
tags: [journey, methodology, incident, retrospective, planning]
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user story header + 7 fixed-order sections"
related:
  - ../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md
  - ./prepare-a-root-cause-analysis-strategy.md
  - ./prepare-a-lessons-learned-strategy.md
  - ../../oncall-sre/incident-response/respond-to-an-incident.md
  - ../processes/run-a-retrospective.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Post-Mortem is not just writing a report; it is a contract. Capture + analysis + action + Governance + Measurement five dimensions; business-value driven; not one-shot; measurable
---

# I want to build a Post-Mortem strategy

> **As an** engineer, **I want to** prepare a post mortem, **so that** launch is safe.

## Summary

- Post-Mortem = contract; not just writing a report
- Capture + analysis + action + Governance + Measurement five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers incident / outage / launch-failure / security / data multiple types
- Links with blameless-postmortem + root-cause-analysis + lessons-learned + respond-to-incident + retrospective
- Publicly discoverable; not hidden
- Regular review; evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

Post-Mortem is a contract; not just writing a report. This entry provides the PM full path, covering capture + analysis + action + Governance + Measurement, business-value driven not by gut feel, covering incident / outage / launch-failure / security / data multiple types, linking with prepare-a-blameless-postmortem-strategy + prepare-a-root-cause-analysis-strategy + prepare-a-lessons-learned-strategy + respond-to-an-incident + run-a-retrospective, publicly discoverable, regular review, and links to Blameless / RCA / Lessons / Incident / Retro and other leaves.

## 2-hop reachability path

| Hop | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | blameless-postmortem | [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) |
| 1 hop | root-cause-analysis | [./prepare-a-root-cause-analysis-strategy.md](./prepare-a-root-cause-analysis-strategy.md) |
| 2 hops | lessons-learned | [./prepare-a-lessons-learned-strategy.md](./prepare-a-lessons-learned-strategy.md) |
| 2 hops | respond-to-an-incident | [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: capture + analysis + action + Governance + Measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; no empty slogans
3. **Capture**: timeline / data / audit trail / context / closed loop; no leakage
4. **Analyze**: root cause / impact / 5-whys / fishbone / retrospective; no leakage
5. **Action**: priority / owner / cadence / validation / replication; no leakage
6. **Governance**: owner / cadence / review / documentation / drift; no leakage
7. **Measure**: efficiency + trust + speed + risk + cost; no leakage
8. **Not one-shot**: progress from capture -> analysis -> action -> Governance -> Measurement; no skipping levels
9. **No report-ism**: report is just the start; not the end
10. **No empty slogans**: every principle must mark implementation evidence; no vagueness
11. **Versioned**: strategy is versioned; evolution is traceable
12. **Link with blameless-postmortem**: PM + Blameless co-build
13. **Link with root-cause-analysis**: PM + RCA co-build
14. **Link with lessons-learned**: PM + Lessons co-build
15. **Link with respond-to-incident**: PM + Incident co-build
16. **Link with retrospective**: PM + Retro co-build
17. **Toolchain**: Retrospect / Parable / EasyRetro / Metro Retro / Notion
18. **Publicly discoverable**: strategy is publicly discoverable; not hidden
19. **Regular review**: evolve and update; not one-shot
20. **First principles**: why PM is necessary; worst consequence of not doing it
21. **Inversion**: how much can be solved by relying on tickets; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (efficiency / trust / speed / risk)
23. **Occam's razor**: simpler PM is better; cut redundant steps

## Related

- blameless-postmortem: [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) — Blameless co-build
- root-cause-analysis: [./prepare-a-root-cause-analysis-strategy.md](./prepare-a-root-cause-analysis-strategy.md) — RCA co-build
- lessons-learned: [./prepare-a-lessons-learned-strategy.md](./prepare-a-lessons-learned-strategy.md) — Lessons co-build
- respond-to-incident: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — Incident co-build
- retrospective: [../processes/run-a-retrospective.md](../processes/run-a-retrospective.md) — Retro co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
