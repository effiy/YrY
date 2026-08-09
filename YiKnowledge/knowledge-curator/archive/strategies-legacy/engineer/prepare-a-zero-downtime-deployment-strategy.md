---
title: I want to build a zero-downtime deployment strategy / Prepare a zero downtime deployment strategy
aliases: [i-want-to-prepare-a-zero-downtime-deployment-strategy, zero-downtime-deployment, zdd-strategy]
tags: [journey, methodology, deployment, infrastructure, governance, planning]
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
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
  - ./prepare-a-deployment-strategy.md
  - ./prepare-a-release-calendar.md
  - ../tools/set-up-a-staging-environment.md
  - ../../oncall-sre/incident-response/do-a-rollback-drill.md
  - ../../oncall-sre/incident-response/run-a-game-day.md
  - ../tools/set-up-ci-cd.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../tools/set-up-feature-flags.md
  - ../../tech-lead/roadmap/define-an-slo.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Zero downtime is not just deployment; it is a contract. Prepare + traffic cut + rollback + validation + drill; business-SLA driven; not one-shot; measurable
status: deprecated
---

# I want to build a zero-downtime deployment strategy

> **As an** engineer, **I want to** prepare a zero downtime deployment, **so that** launch is safe.

## Summary

- Zero downtime = contract; not just deployment
- Prepare + traffic cut + rollback + validation + drill; no missing dimension
- Business-SLA driven; not by gut feel
- Covers blue-green / canary / rolling / gradual rollout multiple strategies
- Links with deployment + release-calendar + staging + rollback-drill + game-day + CI-CD + observability + feature-flag + SLO
- Publicly discoverable; not hidden
- Regular review; evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

Zero downtime is a contract; not just deployment. This entry gives the zero-downtime full path, covering prepare + traffic cut + rollback + validation + drill, business-SLA driven (not by gut feel), covering blue-green / canary / rolling / gradual rollout multiple strategies, and linking to deployment-strategy + release-calendar + staging + rollback-drill + game-day + CI-CD + observability + feature-flag + SLO, publicly discoverable, regular review, and linking to prepare-a-deployment-strategy / prepare-a-release-calendar / set-up-a-staging-environment / do-a-rollback-drill / run-a-game-day / set-up-ci-cd / set-up-observability / set-up-feature-flags / define-an-slo and other leaves.

## 2-hop reachability path

| Hop | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | deployment | [./prepare-a-deployment-strategy.md](./prepare-a-deployment-strategy.md) |
| 2 hops | release-calendar | [./prepare-a-release-calendar.md](./prepare-a-release-calendar.md) |
| 2 hops | staging | [../tools/set-up-a-staging-environment.md](../tools/set-up-a-staging-environment.md) |
| 2 hops | rollback-drill | [../../oncall-sre/incident-response/do-a-rollback-drill.md](../../oncall-sre/incident-response/do-a-rollback-drill.md) |
| 2 hops | game-day | [../../oncall-sre/incident-response/run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) |
| 2 hops | CI-CD | [../tools/set-up-ci-cd.md](../tools/set-up-ci-cd.md) |
| 2 hops | observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | feature-flags | [../tools/set-up-feature-flags.md](../tools/set-up-feature-flags.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: prepare + traffic cut + rollback + validation + drill; no missing dimension
2. **Business-SLA driven**: Define strategy by SLO + business window + tolerance; no empty slogans
3. **Prepare**: contract test + shadow + DB forward-compatible schema + config SSOT; no leakage
4. **Traffic cut**: blue-green / canary / rolling / gradual rollout selected by risk; no leakage
5. **Rollback**: auto threshold + one-click rollback + DB forward + backward; no leakage
6. **Validation**: health check + business metrics + SLO burn rate + old-version standby; no leakage
7. **Drill**: game-day + rollback-drill + chaos; no leakage
8. **Not one-shot**: Progress gradually from rolling → blue-green → canary → gradual rollout; no skipping levels
9. **No report-ism**: report is just the start; not the end
10. **No empty slogans**: every principle must mark implementation evidence; no vagueness
11. **Versioned**: strategy is versioned; evolution is traceable
12. **Link with deployment**: zero downtime + deployment co-build
13. **Link with release-calendar**: zero downtime + cadence co-build
14. **Link with staging**: zero downtime + pre-release co-build
15. **Link with rollback-drill**: zero downtime + rollback co-build
16. **Link with game-day**: zero downtime + drill co-build
17. **Link with CI-CD**: zero downtime + gatekeeping co-build
18. **Link with observability**: zero downtime + observation co-build
19. **Link with feature-flag**: zero downtime + switch co-build
20. **Link with SLO**: zero downtime + SLO co-build
21. **Toolchain**: Kubernetes / Argo CD / Spinnaker / Flagger / Istio / Envoy
22. **Publicly discoverable**: strategy is publicly discoverable; not hidden
23. **Regular review**: evolve and update; not one-shot
24. **First principles**: why must zero downtime; worst consequence of not doing
25. **Inversion**: how much can be solved using maintenance windows; if solvable, don't introduce zero downtime
26. **Second-order thinking**: second-order consequence after the strategy (cost / complexity / risk / business)
27. **Occam's razor**: zero downtime — simpler is better; cut redundant steps

## Related

- deployment: [./prepare-a-deployment-strategy.md](./prepare-a-deployment-strategy.md) — deployment co-build
- release-calendar: [./prepare-a-release-calendar.md](./prepare-a-release-calendar.md) — cadence co-build
- staging: [../tools/set-up-a-staging-environment.md](../tools/set-up-a-staging-environment.md) — pre-release co-build
- rollback-drill: [../../oncall-sre/incident-response/do-a-rollback-drill.md](../../oncall-sre/incident-response/do-a-rollback-drill.md) — rollback co-build
- game-day: [../../oncall-sre/incident-response/run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) — drill co-build
- CI-CD: [../tools/set-up-ci-cd.md](../tools/set-up-ci-cd.md) — gatekeeping co-build
- observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — observation co-build
- feature-flags: [../tools/set-up-feature-flags.md](../tools/set-up-feature-flags.md) — switch co-build
- SLO: [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) — SLO co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
