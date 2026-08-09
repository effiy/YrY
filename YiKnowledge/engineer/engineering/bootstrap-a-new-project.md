---
title: Bootstrap a new project
aliases: [i-want-to-bootstrap-a-new-project, bootstrap-a-new-project, greenfield-setup]
tags: [journey, methodology, project, bootstrap, greenfield, scaffolding]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "New projects start with a consistent, production-ready scaffold that includes CI, linting, and deployment configuration"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - cross-references to related journeys and patterns are present
related:
- ../../tech-lead/roadmap/do-a-tech-selection.md
  - ../infrastructure/set-up-ci-cd.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../new-hire/onboarding/onboard-as-a-new-engineer.md
  - ../../tech-lead/architecture/design-architecture-decision.md
  - ../../knowledge-curator/templates/write-documentation.md
  - ../../engineer/architecture-design/ssot-view-layer.md
  - ../../engineer/engineering/evaluation-driven-development.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
tacit: A new project is 80% determined in the first week; stack selection + scaffolding + CI/observability/hardening + onboarding documentation start simultaneously; don't write business first then fill foundation
---

# I want to bootstrap a new project

> **As an** engineer, **I want to** bootstrap a new project, **so that** baseline is reproducible. 

## Summary

- Do four things in the first week of a new project: stack selection + scaffolding + foundation (CI / observability / hardening) + onboarding documentation
- Stack selection: first-principles sets scaffolding; ockhams don't add unless necessary; ADR records decision
- Scaffolding: routing + config + error handling + logging + test directory + lint + format
- Foundation triad: CI gate (lint + tests + supply chain hardening) + observability (log/metric/trace) + hardening (lockfile + audit + min-release-age + allowlist) 
- Onboarding documentation: 8-section structure (project goal / tech stack / architecture / run / test / deploy / common issues / resource links) 

## Scenario

New project bootstrap, engineer builds from scratch; the most common mistake is to write business first then fill foundation, only to find tech debt has piled up. This entry provides the standard actions for the first week of a new project, covering stack selection, scaffolding, CI/observability/hardening triad, onboarding documentation starting in parallel, and links to tech-selection / CI-CD / observability / secrets / onboarding / harden-supply-chain / ADR and other leaves. 

## 2-hop reachability paths

| Hops | goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | tech-selection | [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) |
| 1 hop | CI/CD | [../tools/set-up-ci-cd.md](../infrastructure/set-up-ci-cd.md) |
| 2 hops | observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | secrets and config | [./handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) |
| 2 hops | supply chain hardening | [./harden-supply-chain.md](../process/harden-supply-chain.md) |
| 2 hops | new-hire onboarding | [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) |
| 2 hops | ADR | [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) |
| 2 hops | documentation writing | [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) |
| 2 hops | SSOT view layer | [../../engineer/architecture-design/ssot-view-layer.md](../architecture-design/ssot-view-layer.md) |
| 2 hops | evaluation-driven | [../../engineer/engineering/evaluation-driven-development.md](../engineering/evaluation-driven-development.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |

## Action recommendations

1. **Stack selection via ADR**: first-principles sets scaffolding; ockhams don't add unless necessary; ADR 12-section decision record
2. **First week do four things**: stack selection + scaffolding + foundation + onboarding documentation; parallel not serial
3. **Scaffolding includes**: routing + config + error handling + logging + test directory + lint + format; don't write business before scaffolding
4. **CI gate triad**: lint + tests + supply chain hardening; PR not passing blocks
5. **observability foundation**: log / metric / trace triad; SLO + error budget; exists at launch
6. **hardening foundation**: lockfile + audit + min-release-age 7d + lifecycle allowlist
7. **SSOT view layer**: state layer and view layer separated; don't create another state source ([ssot-view-layer pattern](../architecture-design/ssot-view-layer.md)) 
8. **evaluation-driven foundation**: evaluation set baseline built in parallel; regression > 5% blocks ([eval-driven pattern](../engineering/evaluation-driven-development.md)) 
9. **onboarding documentation 8 sections**: project goal / tech stack / architecture / run / test / deploy / common issues / resource links
10. **secrets and config three layers**: env / secret / vault; don't put secrets in repo
11. **don't over-design**: first week no microservices; no multi-provider; no distributed transactions; modularization is legitimate
12. **second-order thinking**: second-order consequences of first-week decisions (migration cost / lock-in / maintenance); don't only look at short-term output
13. **fast validation**: scaffolding + one business path through then publish v0.1; early publish early feedback
14. **follow-up**: after v0.1 via [staged-port methodology](../architecture-design/staged-port-methodology.md) push feature extension

## Related

- tech-selection: [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) — stack selection
- CI/CD: [../tools/set-up-ci-cd.md](../infrastructure/set-up-ci-cd.md) — CI gate
- observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — log/metric/trace
- secrets: [./handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) — env/secret/vault
- hardening: [./harden-supply-chain.md](../process/harden-supply-chain.md) — lockfile triad
- onboarding: [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — new-hire path
- ADR: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — decision record
- documentation: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — onboarding documentation
- Pattern: [ssot-view-layer](../architecture-design/ssot-view-layer.md) + [eval-driven](../engineering/evaluation-driven-development.md) + [staged-port](../architecture-design/staged-port-methodology.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md)
