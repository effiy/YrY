---
title: platform engineering dashboard
aliases:
- internal developer platform dashboard
- IDP dashboard
- platform as product dashboard
- golden path dashboard
tags:
- dashboard
- platform-engineering
- idp
- developer-platform
- golden-paths
- self-service
category: engineer/engineering
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- tech-lead
- oncall-sre
benefit: internal developer platform adoption and effectiveness visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-developer-experience.md
- ../../infrastructure/dashboard-dora-metrics.md
- ../../../oncall-sre/observability/dashboard-system-health.md
- ../../../tech-lead/capacity/dashboard-engineering-capacity.md
tacit: false
---

# platform engineering dashboard

> **As a** platform engineer, **I want to** track internal developer platform adoption and effectiveness, **so that** the platform reduces cognitive load and accelerates delivery across all product teams.

> Platform engineering treats the platform as a product — with users, adoption curves, NPS, and roadmap. This dashboard tracks IDP adoption, golden path coverage, self-service maturity, platform NPS, and platform operations.

## Summary

- 5 platform dimensions: IDP adoption, golden path coverage, self-service maturity, platform experience (NPS), platform operations
- IDP components: CI/CD pipelines, infrastructure provisioning, observability, service catalog, secrets management, feature flags, API gateway
- Golden paths: pre-built, supported, and documented paths for the most common developer workflows
- Self-service measured by % of operations developers can perform without platform team intervention
- Dashboard reviewed monthly; platform strategy review quarterly

## Core viewpoints

- Platform as a product — the platform has users (developers), and their experience is the primary metric of platform success
- Golden paths, not golden cages — golden paths are the recommended, paved road; developers can go off-road but they own the maintenance
- Self-service is the goal — every manual platform team intervention is a platform failure; the platform should enable, not gatekeep
- Cognitive load reduction is the KPI — the platform's value is measured in how much it reduces the cognitive load on stream-aligned teams

## Key information

### 5-panel platform overview

```
┌──────────────────────────────────────────────────────────────────┐
│  IDP ADOPTION                    │  GOLDEN PATH COVERAGE           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Overall:     78% ███▌  │   │  │  Paths defined: 12       │   │
│  │  CI/CD:       92% ████▌ │   │  │  Coverage:    85% ████   │   │
│  │  Provisioning: 75% ███▌ │   │  │  Documented:  10/12     │   │
│  │  Observability: 88% ████│   │  │  Templated:    9/12     │   │
│  │  Secrets:     90% ████▌ │   │  │  Automated:    8/12     │   │
│  │  Service Cat: 65% ███   │   │  │  Adoption:    72% ███▌  │   │
│  │  Feature Flag: 55% ██▌  │   │  │  Time-to-hello: 8 min   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SELF-SERVICE MATURITY           │  PLATFORM EXPERIENCE (NPS)      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Level:       L3 (75%)  │   │  │  Platform NPS: 38       │   │
│  │  Deploy:      95% self  │   │  │  Promoters:    45%      │   │
│  │  Config:      82% self  │   │  │  Passives:     35%      │   │
│  │  Monitor:     78% self  │   │  │  Detractors:   20%      │   │
│  │  Debug:       65% self  │   │  │  Ease of use:  3.8/5   │   │
│  │  Provision:   70% self  │   │  │  Documentation: 3.5/5   │   │
│  │  Tickets:     15/mo     │   │  │  Time saved:   8 h/wk   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### IDP component adoption by team

| IDP component | YiVad | YiAi | YiPet | Platform | Overall | Target |
|---|---|---|---|---|---|---|
| CI/CD pipeline (GitHub Actions) | 95% | 90% | 85% | 95% | 92% | 95% |
| Infrastructure provisioning (Terraform) | 80% | 70% | 60% | 90% | 75% | 85% |
| Observability (DataDog) | 90% | 85% | 65% | 95% | 88% | 90% |
| Secrets management (Vault) | 92% | 90% | 75% | 95% | 90% | 95% |
| Service catalog (Backstage) | 70% | 60% | 50% | 80% | 65% | 80% |
| Feature flags (LaunchDarkly) | 65% | 55% | 0% | 80% | 55% | 75% |
| API Gateway | 85% | 90% | 50% | 95% | 78% | 85% |
| Contract testing | 80% | 80% | 0% | 75% | 62% | 70% |
| **Team average** | **82%** | **78%** | **48%** | **88%** | **78%** | **85%** |

### Golden path inventory

| # | Golden path | Description | Documented | Templated | Automated | Adoption | Time-to-hello |
|---|---|---|---|---|---|---|---|
| 1 | New service (TypeScript) | Scaffold + CI + deploy + monitor | Yes | Yes | Yes | 85% | 5 min |
| 2 | New service (Python) | Scaffold + CI + deploy + monitor | Yes | Yes | Yes | 80% | 6 min |
| 3 | New frontend app | Scaffold + CI + CDN + monitor | Yes | Yes | Yes | 90% | 4 min |
| 4 | Add database | Provision + connect + backup | Yes | Yes | Yes | 75% | 8 min |
| 5 | Add cache (Redis) | Provision + connect + monitor | Yes | Yes | Yes | 70% | 5 min |
| 6 | Add message queue | Provision + connect + monitor | Yes | Yes | No | 55% | 12 min |
| 7 | Add API endpoint | Scaffold + test + doc + deploy | Yes | Yes | Yes | 88% | 7 min |
| 8 | Set up monitoring | Dashboards + alerts + SLO | Yes | Yes | Partial | 78% | 10 min |
| 9 | Set up feature flag | Flag + targeting + cleanup | Yes | Yes | No | 50% | 8 min |
| 10 | Set up contract test | Consumer + provider + CI | Yes | No | No | 40% | 15 min |
| 11 | Deploy to production | Canary + verify + rollback | Yes | Yes | Yes | 92% | 3 min |
| 12 | Incident response | Runbook + escalation + postmortem | Yes | No | No | 60% | 5 min |
| **Overall** | | | **10/12** | **9/12** | **8/12** | **72%** | **8 min** |

### Self-service maturity model

| Level | Description | % of ops self-service | Current |
|---|---|---|---|
| **L0: Manual** | All infra changes via platform team ticket | 0-20% | |
| **L1: Documented** | Runbooks exist, developers follow manual steps | 20-40% | |
| **L2: Scripted** | CLI scripts for common operations | 40-60% | |
| **L3: Templated** | Self-service via templates and GitOps | 60-80% | **Current (75%)** |
| **L4: Fully automated** | No human intervention for standard ops | 80-95% | |
| **L5: Autonomous** | Platform anticipates and resolves issues | 95-100% | |

### Self-service capability by operation

| Operation | Self-service % | Manual tickets/mo | Avg ticket resolution | Target |
|---|---|---|---|---|
| Deploy to production | 95% | 2 | 15 min | 98% |
| Deploy to staging | 98% | 1 | 10 min | 99% |
| Add environment variable | 85% | 5 | 20 min | 95% |
| Change resource limits | 78% | 4 | 30 min | 90% |
| Provision new service | 70% | 6 | 45 min | 85% |
| Add database | 72% | 3 | 40 min | 85% |
| View logs | 92% | 3 | 15 min | 95% |
| View metrics/dashboards | 88% | 2 | 10 min | 95% |
| Debug production issue | 65% | 8 | 60 min | 80% |
| Rotate secrets/credentials | 82% | 3 | 25 min | 90% |
| Set up alerting | 75% | 4 | 30 min | 85% |
| **Overall** | **75%** | **15/mo** | **28 min** | **85%** |

### Platform ticket analysis

| Ticket category | Volume/mo | % of total | Avg resolution | Trend | Top requestor |
|---|---|---|---|---|---|
| Infrastructure provisioning | 6 | 24% | 45 min | ↓ | YiPet (40%) |
| Debugging assistance | 5 | 20% | 60 min | → | YiVad (35%) |
| CI/CD pipeline issues | 3 | 12% | 30 min | ↓ | YiAi (50%) |
| Access/permissions | 3 | 12% | 20 min | → | All teams |
| Monitoring/alerting setup | 2 | 8% | 35 min | ↓ | YiPet (60%) |
| Database operations | 2 | 8% | 50 min | → | YiAi (55%) |
| Security/compliance | 2 | 8% | 40 min | → | Platform (40%) |
| Other | 2 | 8% | 25 min | → | Various |
| **Total** | **25** | | **38 min avg** | | |

### Platform developer experience survey (N=36)

| Survey dimension | Score (1-5) | Promoters | Detractors | YoY change |
|---|---|---|---|---|
| Platform ease of use | 3.8 | 52% | 15% | +0.2 |
| Documentation quality | 3.5 | 42% | 22% | +0.1 |
| Self-service capability | 3.7 | 48% | 18% | +0.3 |
| Time to get help (platform team) | 4.2 | 65% | 8% | +0.1 |
| Reliability of platform services | 4.0 | 58% | 10% | +0.2 |
| Golden path discoverability | 3.2 | 38% | 28% | +0.1 |
| Platform release communication | 3.6 | 45% | 18% | +0.2 |
| Overall satisfaction | 3.8 | 48% | 15% | +0.2 |
| **Platform NPS** | **38** | **45%** | **20%** | **+5 pts** |

### Platform NPS by team

| Team | NPS | Promoters | Detractors | Top complaint |
|---|---|---|---|---|
| YiVad | 42 | 50% | 15% | Golden path discoverability |
| YiAi | 38 | 45% | 18% | Python-specific tooling gaps |
| YiPet | 22 | 30% | 35% | Feature flag adoption, monitoring |
| 35 | 40% | 20% | Service catalog integration |
| 48 | 60% | 10% | Documentation maintenance |
| **38** | **45%** | **20%** | |

### Platform operations health

| Metric | Current | Target | Status |
|---|---|---|---|
| Platform service uptime (SLO) | 99.92% | 99.95% | Yellow |
| Platform CI pipeline success rate | 96% | > 98% | Yellow |
| Golden path template freshness (< 30 days) | 75% | > 90% | Yellow |
| Platform team: developers ratio | 1:25 | 1:30-40 | Green |
| Platform on-call burden (alerts/week) | 8 | < 5 | Yellow |
| Platform change failure rate | 4.2% | < 2% | Yellow |
| Time to onboard new service (end-to-end) | 45 min | < 30 min | Yellow |
| Platform documentation up-to-date | 72% | > 85% | Yellow |

### Platform roadmap

| Initiative | Priority | Status | Target | Impact |
|---|---|---|---|---|
| Service catalog (Backstage) rollout | P0 | In progress | Q4 | Reduce discovery time 60% |
| YiPet monitoring migration (Sentry → DataDog) | P0 | In progress | Q3 | Unified observability |
| Feature flag adoption (YiPet) | P1 | Planned | Q4 | Experimentation coverage |
| Contract testing golden path | P1 | Planned | Q4 | Cross-service confidence |
| Self-service debug toolkit | P1 | In progress | Q3 | Reduce debug tickets 50% |
| Platform documentation revamp | P2 | Planned | Q4 | Golden path discoverability |
| Multi-region deployment golden path | P2 | Planned | Q1 | Business continuity |
| Developer portal (Backstage homepage) | P2 | Planned | Q1 | Single pane of glass |

## Action recommendations

1. **YiPet platform adoption**: 48% adoption, 22 NPS; prioritize monitoring migration, feature flag rollout, and provisioning templates
2. **Service catalog rollout**: 65% adoption, biggest gap; complete Backstage rollout, enforce service registration for all new services
3. **Golden path discoverability**: 3.2/5 score, top detractor complaint; add golden path search in Backstage, create "I want to..." guided flows
4. **Feature flag adoption**: 55% overall, 0% in YiPet; create mandatory feature flag golden path, add LaunchDarkly to default scaffold
5. **Contract testing gap**: 62% adoption, 0% in YiPet; build contract testing golden path, add to CI pipeline template
6. **Reduce platform tickets**: 25/mo, 38 min avg resolution; target 15/mo by automating top 3 ticket categories
7. **Platform documentation**: 72% up-to-date, 3.5/5 quality; assign documentation owner, add freshness checks to CI
8. **Self-service maturity L3 → L4**: 75% → 85%; automate message queue provisioning, contract test setup, and feature flag configuration
9. **Monthly platform review**: review adoption, NPS, ticket trends, and golden path usage; share platform newsletter
10. **Platform as product mindset**: assign platform PM, maintain platform roadmap, run quarterly platform user interviews



- Platform as gatekeeper → "you must use our platform for everything"; platform is a product teams choose because it's better, not because they're forced
- Build-it-and-they-will-come → building platform capabilities without understanding developer needs; platform must be user-researched, not imagined
- Too many off-road options → allowing every team to use different tools for the same thing; golden paths exist to reduce fragmentation
- Platform team as bottleneck → every infrastructure change requires a platform team ticket; the platform team's job is to make themselves unnecessary
- Ignoring the long tail → optimizing for the 80% use case while ignoring edge cases that consume disproportionate platform team time

## Related

- Same class: [dashboard-developer-experience](dashboard-developer-experience.md) — developer experience
- Same class: [dashboard-dora-metrics](../infrastructure/dashboard-dora-metrics.md) — DORA metrics
- Same class: [dashboard-system-health](../../oncall-sre/observability/dashboard-system-health.md) — system health
- Same class: [dashboard-engineering-capacity](../../tech-lead/capacity/dashboard-engineering-capacity.md) — engineering capacity
- References: Team Topologies — *Platform as a Product*; McKinsey — *Developer Velocity Index*; Google — *Software Engineering at Google* (Chapter 16: Build Systems); Spotify — *Backstage*; Humanitec — *Platform Engineering Maturity Model*