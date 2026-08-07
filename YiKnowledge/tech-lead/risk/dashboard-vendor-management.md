---
title: vendor management dashboard
aliases:
- third-party management dashboard
- vendor risk dashboard
- supplier management dashboard
- procurement dashboard
tags:
- dashboard
- vendor-management
- third-party
- vendor-risk
- procurement
- sla
- dependency
category: tech-lead/risk
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- tech-lead
- executive
- oncall-sre
benefit: vendor and third-party risk and performance visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-risk-management.md
- ../../engineer/quality-security/dashboard-security-posture.md
- ../../oncall-sre/observability/dashboard-business-continuity.md
- ../../engineer/engineering/manage-a-vendor-relationship.md
tacit: false
---

# vendor management dashboard

> **As a** tech lead, **I want to** track vendor and third-party risk and performance, **so that** vendor dependencies don't become single points of failure and vendor value is continuously evaluated.

> Every vendor is a dependency, and every dependency carries risk. This dashboard tracks vendor inventory, risk assessment, SLA performance, contract management, and dependency concentration across the vendor portfolio.

## Summary

- 5 vendor dimensions: vendor inventory, risk assessment, SLA & performance, contract lifecycle, dependency concentration
- 28 active vendors across 6 categories: cloud infrastructure, AI/LLM, SaaS tools, developer tools, security/compliance, business operations
- Risk assessed by criticality (critical/high/medium/low), concentration risk, data access level, and vendor viability
- SLA tracked by uptime, response time, and issue resolution; contract renewals tracked by expiry and negotiation status
- Dashboard reviewed monthly; vendor risk review quarterly

## Core viewpoints

- Every vendor is a dependency — a vendor outage is your outage; vendor risk management is business continuity management
- Concentration risk is the silent killer — relying on a single vendor for a critical capability is a single point of failure
- Vendor management is continuous, not transactional — vendor relationships need ongoing evaluation, not just at renewal time
- The cheapest vendor is rarely the cheapest — total cost includes integration, maintenance, migration, and risk; factor all of these into vendor decisions

## Key information

### 5-panel vendor overview

```
┌──────────────────────────────────────────────────────────────────┐
│  VENDOR INVENTORY                │  RISK ASSESSMENT                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:      28 vendors │   │  │  Critical:    4 (14%)   │   │
│  │  Cloud:       5 (18%)   │   │  │  High:        8 (29%)   │   │
│  │  AI/LLM:      4 (14%)   │   │  │  Medium:     10 (36%)   │   │
│  │  SaaS:        8 (29%)   │   │  │  Low:         6 (21%)   │   │
│  │  Dev Tools:   6 (21%)   │   │  │  Concentration: 3 flags │   │
│  │  Security:    3 (11%)   │   │  │  Viability:    2 flags  │   │
│  │  Biz Ops:     2 (7%)    │   │  │  Last audit:  85% done  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SLA & PERFORMANCE               │  CONTRACT LIFECYCLE             │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  SLA met:     92% ████  │   │  │  Active:     25 (89%)   │   │
│  │  Uptime:      99.95%    │   │  │  Renewing:    3 (11%)   │   │
│  │  Incidents:    2 this Q │   │  │  Expiring:     2 in 90d │   │
│  │  Response:    85% < 1h  │   │  │  Spend:      $2.8M/yr   │   │
│  │  Breaches:     1 this Q │   │  │  YoY Δ:       +12%      │   │
│  │  Credits:      $8,500   │   │  │  Negotiation: 2 active  │   │
│  │  Satisfaction: 3.8/5    │   │  │  Multi-year:  18 (64%)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Vendor inventory by category

| Category | Vendors | Annual spend | % of total | Critical vendors | Avg relationship |
|---|---|---|---|---|---|
| **Cloud Infrastructure** | 5 | $1.2M | 43% | 2 (AWS, Cloudflare) | 3.2 years |
| **AI/LLM** | 4 | $680K | 24% | 2 (Anthropic, Voyage) | 1.5 years |
| **SaaS Tools** | 8 | $420K | 15% | 0 | 2.1 years |
| **Developer Tools** | 6 | $280K | 10% | 0 | 2.8 years |
| **Security/Compliance** | 3 | $150K | 5% | 0 | 1.8 years |
| **Business Operations** | 2 | $70K | 3% | 0 | 2.5 years |
| **Total** | **28** | **$2.8M** | | **4** | **2.3 years** |

### Critical vendor profiles

| Vendor | Category | Annual spend | Critical function | Single point of failure? | Alternative identified? | Migration complexity |
|---|---|---|---|---|---|---|
| **AWS** | Cloud Infra | $850K | Compute, storage, networking, DB | **Yes** | Azure (partial), GCP | Extreme — 12+ months |
| **Anthropic** | AI/LLM | $450K | Primary LLM provider (Claude) | **Yes** | OpenAI, Google Gemini | High — 3 months |
| **Cloudflare** | Cloud Infra | $180K | CDN, DNS, DDoS protection | **Yes** | Fastly, AWS CloudFront | Medium — 2 months |
| **Voyage AI** | AI/LLM | $120K | Embedding model provider | No | OpenAI, Cohere | Medium — 1 month |

### Vendor risk matrix

| Vendor | Criticality | Data access | Viability risk | Concentration risk | Compliance risk | Overall risk |
|---|---|---|---|---|---|---|
| AWS | Critical | Full infra | Low | **High** | Low | **High** |
| Anthropic | Critical | Prompt data, outputs | Low | **High** | Medium | **High** |
| Cloudflare | Critical | Traffic data, DNS | Low | **High** | Low | **High** |
| Voyage AI | High | Document embeddings | Medium | Medium | Low | Medium |
| DataDog | High | Metrics, logs, traces | Low | Medium | Medium | Medium |
| GitHub | High | Source code, CI/CD | Low | Medium | Low | Medium |
| LaunchDarkly | Medium | Feature flag config | Low | Low | Low | Low |
| Stripe | High | Payment data, billing | Low | Medium | **High (PCI)** | **High** |
| Sentry | Medium | Error data, stack traces | Low | Low | Low | Low |
| Auth0 | High | User credentials, sessions | Low | Medium | **High (PII)** | **High** |
| Slack | Medium | Internal communications | Low | Low | Medium | Medium |
| Notion | Medium | Documentation, wikis | Low | Low | Low | Low |

### Vendor SLA performance

| Vendor | SLA target | Actual uptime | Incidents (Q) | Response SLA | Response actual | Breaches | Credits |
|---|---|---|---|---|---|---|---|
| AWS | 99.99% | 99.99% | 0 | 1 hour | 45 min | 0 | $0 |
| Anthropic | 99.9% | 99.85% | 2 | 1 hour | 2.5 hours | **1** | $5,200 |
| Cloudflare | 99.99% | 99.99% | 0 | 15 min | 12 min | 0 | $0 |
| Voyage AI | 99.9% | 99.92% | 1 | 4 hours | 3.2 hours | 0 | $0 |
| DataDog | 99.9% | 99.95% | 0 | 1 hour | 55 min | 0 | $0 |
| GitHub | 99.9% | 99.88% | 1 | 2 hours | 2.8 hours | **1** | $3,300 |
| Stripe | 99.99% | 99.99% | 0 | 1 hour | 40 min | 0 | $0 |
| Auth0 | 99.99% | 99.97% | 1 | 30 min | 1.2 hours | **1** | $0 |
| **Overall** | | **99.92%** | **5** | | | **3** | **$8,500** |

### Vendor incident log (this quarter)

| Date | Vendor | Incident | Duration | Impact | Root cause | SLA breach? | Follow-up |
|---|---|---|---|---|---|---|---|
| Jul 28 | Anthropic | API latency spike (P95 > 5s) | 45 min | Chat service degraded | Upstream model serving | No | Multi-provider failover review |
| Jul 15 | GitHub | Actions runner outage | 2.5 hours | CI/CD blocked | Azure DC networking | Yes | Self-hosted runner evaluation |
| Jun 22 | Anthropic | 503 errors on chat endpoint | 18 min | 2% of chat requests failed | Load balancer misconfig | No | Improved client retry logic |
| Jun 10 | Auth0 | Elevated login latency | 35 min | Login delays for SSO users | DB replication lag | Yes | Session caching improvement |
| May 28 | Voyage AI | Embedding batch timeout | 22 min | Search indexing delayed | GPU cluster maintenance | No | Added queue-based retry |

### Vendor dependency concentration analysis

| Capability | Primary vendor | Secondary vendor | Concentration risk | Mitigation status |
|---|---|---|---|---|
| Cloud compute | AWS (100%) | None | **Critical** | Multi-cloud PoC planned Q4 |
| LLM inference | Anthropic (92%) | OpenAI (8%, testing) | **Critical** | Multi-provider routing in progress |
| LLM embeddings | Voyage AI (85%) | OpenAI (15%, fallback) | **High** | Fallback tested, auto-switch in Q3 |
| CDN/DNS | Cloudflare (100%) | None | **High** | Fastly evaluated, not yet contracted |
| Observability | DataDog (90%) | Sentry (10%, errors only) | Medium | DataDog migration in progress for YiPet |
| Authentication | Auth0 (100%) | None | **High** | Self-hosted evaluation in Q4 |
| Payments | Stripe (100%) | None | Medium | No alternative identified |
| Source control | GitHub (100%) | None | Medium | GitLab mirror for disaster recovery |
| Feature flags | LaunchDarkly (80%) | Custom (20%) | Low | Custom fallback for critical paths |

### Contract lifecycle

| Vendor | Contract value | Start | End | Term | Auto-renew? | Negotiation | Status |
|---|---|---|---|---|---|---|---|
| AWS | $850K/yr | 2025-01 | 2027-01 | 2 years | No | Q4 2026 | Active |
| Anthropic | $450K/yr | 2026-03 | 2027-03 | 1 year | No | Q1 2027 | Active |
| Cloudflare | $180K/yr | 2025-06 | 2026-12 | 18 months | Yes | **Q3 2026** | **Renewing** |
| Voyage AI | $120K/yr | 2026-01 | 2027-01 | 1 year | No | Q4 2026 | Active |
| DataDog | $95K/yr | 2025-09 | 2026-09 | 1 year | Yes | **Q3 2026** | **Renewing** |
| GitHub | $65K/yr | 2025-03 | 2027-03 | 2 years | No | Q1 2027 | Active |
| Stripe | Variable | 2024-06 | Ongoing | N/A | N/A | N/A | Active |
| Auth0 | $55K/yr | 2025-11 | 2026-11 | 1 year | Yes | **Q3 2026** | **Renewing** |
| LaunchDarkly | $42K/yr | 2026-04 | 2027-04 | 1 year | No | Q1 2027 | Active |
| Sentry | $28K/yr | 2025-08 | 2026-08 | 1 year | No | **Now** | **Expiring** |

### Upcoming contract actions (next 90 days)

| Vendor | Action | Deadline | Annual value | Recommendation | Risk of not renewing |
|---|---|---|---|---|---|
| Sentry | Renew or replace | Aug 31 | $28K | Replace — DataDog migration for YiPet | Low |
| Cloudflare | Renegotiate | Sep 30 | $180K | Renew — critical infra, negotiate 2-year term | High |
| DataDog | Renegotiate | Sep 30 | $95K | Renew — expand YiPet, consolidate monitoring | Medium |
| Auth0 | Renew or evaluate | Nov 30 | $55K | Evaluate self-hosted vs. renew | Medium |

### Vendor spend trend

| Category | 2025 | 2026 (forecast) | YoY Δ | Primary driver |
|---|---|---|---|---|
| Cloud Infrastructure | $1.05M | $1.20M | +14% | Usage growth, multi-region |
| AI/LLM | $380K | $680K | +79% | New models, increased usage |
| SaaS Tools | $380K | $420K | +11% | Team growth |
| Developer Tools | $250K | $280K | +12% | New tooling, seat growth |
| Security/Compliance | $120K | $150K | +25% | SOC 2 prep, new tools |
| Biz Ops | $60K | $70K | +17% | Team growth |
| **Total** | **$2.24M** | **$2.80M** | **+25%** | |

### Vendor relationship health

| Vendor | Internal owner | Last business review | Satisfaction (1-5) | Strategic alignment | Risk of switching |
|---|---|---|---|---|---|
| AWS | SRE Lead | Jun 2026 | 4.0 | High | Low |
| Anthropic | AI Lead | Jul 2026 | 4.2 | High | Low (lock-in concern) |
| Cloudflare | SRE Lead | May 2026 | 4.5 | High | Low |
| Voyage AI | AI Lead | Jun 2026 | 3.8 | Medium | Medium |
| DataDog | SRE Lead | Apr 2026 | 3.5 | Medium | Medium |
| GitHub | DevEx Lead | Mar 2026 | 4.2 | High | Low |
| Stripe | Finance | Jan 2026 | 4.0 | High | Low |
| Auth0 | Security Lead | Feb 2026 | 3.5 | Medium | Medium |
| LaunchDarkly | DevEx Lead | May 2026 | 4.0 | Medium | Low |
| Sentry | SRE Lead | Dec 2025 | 3.0 | Low | **High** |

## Action recommendations

1. **Multi-provider LLM routing**: Anthropic 92% concentration, 2 incidents this quarter; complete multi-provider routing (Anthropic + OpenAI) by Q3 end
2. **Cloud concentration risk**: AWS 100% of compute; initiate multi-cloud PoC for non-critical workloads, target Q4
3. **Sentry replacement**: Contract expiring Aug 31, 3.0 satisfaction; complete YiPet migration to DataDog, do not renew
4. **Cloudflare renewal**: $180K, expiring Dec 2026, critical infrastructure; negotiate 2-year term with volume discount in Q3
5. **Auth0 evaluation**: 99.97% uptime, 1 SLA breach, $55K/yr; evaluate self-hosted alternatives (Keycloak, Ory) before Nov renewal
6. **Vendor business reviews**: 5 vendors with last review > 6 months ago; schedule QBRs for DataDog, GitHub, Stripe, Auth0, Sentry
7. **AI/LLM spend growth**: +79% YoY, now $680K; implement cost controls, token budgets, and model tiering to manage growth
8. **Vendor risk register**: create formal risk register for all critical and high-risk vendors; review quarterly with procurement
9. **Contract calendar**: add 6-month advance notice for all renewals; assign negotiation owners 90 days before expiry
10. **Quarterly vendor risk review**: review concentration risk, SLA performance, viability, and spend; update mitigation plans



- Single-vendor lock-in → relying on one vendor for a critical capability without a tested alternative; every critical vendor needs a backup plan
- Auto-renew complacency → letting contracts auto-renew without review; every renewal is an opportunity to renegotiate or replace
- Vendor sprawl → adding new vendors without removing old ones; 28 vendors and growing; consolidate where possible
- SLA as insurance → treating SLA credits as compensation for outages; no SLA credit recovers lost user trust or revenue
- Neglecting vendor relationships → only contacting vendors when there's a problem; regular business reviews build partnership and improve service

## Related

- Same class: [dashboard-risk-management](dashboard-risk-management.md) — risk management framework
- Same class: [dashboard-security-posture](../../engineer/quality-security/dashboard-security-posture.md) — security posture
- Same class: [dashboard-business-continuity](../../oncall-sre/observability/dashboard-business-continuity.md) — BC/DR
- Downstream: [manage-a-vendor-relationship](../../engineer/engineering/manage-a-vendor-relationship.md) — vendor management guide
- References: NIST SP 800-161 — *Supply Chain Risk Management*; ISO 27036 — *Supplier Relationships*; OWASP — *Vendor Risk Assessment*; McKinsey — *Third-Party Risk Management*