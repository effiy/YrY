---
title: risk management dashboard
aliases:
- risk dashboard
- risk register dashboard
- threat assessment dashboard
- risk matrix dashboard
tags:
- dashboard
- risk
- risk-management
- threat
- mitigation
- contingency
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
benefit: risk exposure and mitigation progress visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../capacity/dashboard-engineering-capacity.md
- ../../engineer/quality-security/dashboard-security-posture.md
- ../../oncall-sre/incident-response/dashboard-incident-trends.md
- ../../executive/strategy/dashboard-executive-kpi.md
tacit: false
---

# risk management dashboard

> **As a** tech lead, **I want to** track risk exposure and mitigation progress across all engineering domains, **so that** risks are identified, prioritized, and mitigated before they become incidents.

> Risk management is proactive incident prevention. This dashboard tracks the risk register, probability/impact assessment, mitigation progress, contingency readiness, and residual risk trends.

## Summary

- 5 risk dimensions: risk register, probability/impact matrix, mitigation progress, contingency readiness, residual risk trends
- Risks categorized by domain: technical, operational, security, people, vendor, compliance, market
- Each risk scored on probability (1-5) × impact (1-5) = risk score (1-25)
- Mitigation tracked with owner, deadline, and completion %; contingency plans for high-impact risks
- Dashboard reviewed monthly at risk review; quarterly executive risk briefing

## Core viewpoints

- Risk is not failure — it's uncertainty; managing risk is reducing uncertainty to an acceptable level
- Probability × Impact = Risk Score — but impact is more important than probability for low-probability, catastrophic risks
- Mitigation reduces probability; contingency reduces impact — you need both for high-score risks
- Risk is dynamic — new risks emerge, old risks fade; the register must be a living document

## Key information

### 5-panel risk overview

```
┌──────────────────────────────────────────────────────────────────┐
│  RISK REGISTER SUMMARY           │  PROBABILITY × IMPACT MATRIX    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:     28 risks    │   │  │  Critical (15-25): 4    │   │
│  │  Critical:  4 (14%)     │   │  │  High (10-14):    8     │   │
│  │  High:      8 (29%)     │   │  │  Medium (5-9):   12     │   │
│  │  Medium:   12 (43%)     │   │  │  Low (1-4):      4      │   │
│  │  Low:       4 (14%)     │   │  │  Avg score: 9.2         │   │
│  │  Trend:     ↓ 2 QoQ     │   │  │  Residual avg: 5.8      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  MITIGATION PROGRESS            │  CONTINGENCY READINESS          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  On track:   18 (64%)   │   │  │  Plans:     22/28       │   │
│  │  At risk:     6 (21%)   │   │  │  Tested:    15/22       │   │
│  │  Delayed:     3 (11%)   │   │  │  Drilled:   8/22        │   │
│  │  Blocked:     1 (4%)    │   │  │  Playbook:  18/22       │   │
│  │  Completion: 72% avg    │   │  │  RTO met:   88%         │   │
│  │  Overdue:     2 items   │   │  │  RPO met:   92%         │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Risk register (critical and high)

| ID | Risk | Domain | P | I | Score | Mitigation | Progress | Deadline | Owner | Residual |
|---|---|---|---|---|---|---|---|---|---|---|
| R-001 | Key engineer departure | People | 3 | 5 | 15 | Succession + documentation | 65% | Sep 30 | CTO | 8 |
| R-002 | LLM provider outage | Technical | 3 | 5 | 15 | Multi-provider failover | 40% | Oct 15 | AI Lead | 10 |
| R-003 | Database corruption | Technical | 2 | 5 | 10 | Backup + point-in-time recovery | 85% | Done | SRE Lead | 3 |
| R-004 | Data breach | Security | 2 | 5 | 10 | Encryption + access control + audit | 78% | Aug 30 | Sec Lead | 5 |
| R-005 | Cloud region outage | Operational | 2 | 5 | 10 | Multi-AZ + disaster recovery | 70% | Sep 15 | SRE Lead | 4 |
| R-006 | Competitor launches AI feature | Market | 4 | 4 | 16 | Accelerate roadmap + differentiation | 55% | Ongoing | CPO | 8 |
| R-007 | LLM cost overrun | Financial | 4 | 3 | 12 | Caching + model routing + budget caps | 60% | Sep 30 | AI Lead | 6 |
| R-008 | Regulatory change (AI Act) | Compliance | 3 | 4 | 12 | Legal monitoring + compliance prep | 50% | Dec 31 | GC | 8 |
| R-009 | Supply chain attack | Security | 2 | 5 | 10 | Dependency scanning + SBOM + pinning | 82% | Done | Sec Lead | 4 |
| R-010 | Infrastructure scale failure | Operational | 3 | 4 | 12 | Auto-scaling + load testing + capacity | 75% | Sep 15 | SRE Lead | 5 |
| R-011 | Knowledge loss (team growth) | People | 4 | 3 | 12 | Documentation + cross-training + onboarding | 58% | Ongoing | CTO | 6 |
| R-012 | API gateway DDoS | Security | 3 | 4 | 12 | Rate limiting + WAF + CDN | 80% | Done | SRE Lead | 4 |

### Risk matrix visualization

```
Impact
  5  │  R-003(10)  R-001(15)  │
     │  R-004(10)  R-002(15)  │
     │  R-005(10)             │
     │  R-009(10)             │
     │                        │
  4  │             R-006(16)  │
     │             R-008(12)  │
     │             R-010(12)  │
     │             R-012(12)  │
     │                        │
  3  │  R-018(6)   R-007(12)  │
     │  R-019(6)   R-011(12)  │
     │             R-013(9)   │
     │             R-014(9)   │
     │                        │
  2  │  R-022(4)   R-015(8)   │
     │  R-023(4)   R-016(8)   │
     │             R-017(8)   │
     │                        │
  1  │  R-026(2)   R-024(3)   │
     │  R-027(2)   R-025(3)   │
     │  R-028(1)              │
     └──────────────────────────
        1      2      3      4      5
                Probability
```

### Risk by domain

| Domain | Count | Total score | Avg score | Critical | High | Trend |
|---|---|---|---|---|---|---|
| Technical | 6 | 62 | 10.3 | 2 | 2 | ↓ |
| Operational | 5 | 42 | 8.4 | 0 | 3 | → |
| Security | 5 | 46 | 9.2 | 0 | 4 | ↓ |
| People | 3 | 33 | 11.0 | 1 | 2 | ↑ |
| Vendor | 3 | 24 | 8.0 | 0 | 1 | → |
| Compliance | 3 | 28 | 9.3 | 0 | 2 | ↑ |
| Market | 2 | 24 | 12.0 | 1 | 1 | → |
| Financial | 1 | 12 | 12.0 | 0 | 1 | → |

### Mitigation status tracking

| Status | Count | % | Definition |
|---|---|---|---|
| On track | 18 | 64% | Mitigation progressing per plan, within deadline |
| At risk | 6 | 21% | Mitigation behind schedule, may miss deadline |
| Delayed | 3 | 11% | Mitigation past deadline, new plan needed |
| Blocked | 1 | 4% | Mitigation blocked by external dependency |
| Complete | 0 | 0% | Risk mitigated to acceptable residual level |

### Overdue mitigation items

| Risk | Mitigation item | Original deadline | Days overdue | Owner | Impact |
|---|---|---|---|---|---|
| R-002 | Implement multi-provider routing | Aug 1 | 5 | AI Lead | Single provider outage = full AI outage |
| R-006 | Ship key differentiator features | Jul 31 | 6 | CPO | Competitor may capture market share |

### Contingency readiness

| Risk | Contingency plan | Playbook | Tested | Last drill | RTO | RTO met |
|---|---|---|---|---|---|---|
| R-001 | Knowledge transfer + contractor backup | Yes | Yes | Jul 2026 | 2 weeks | ✓ |
| R-002 | Manual fallback to secondary provider | Yes | Yes | Jun 2026 | < 1 hour | ✓ |
| R-003 | Database restore from backup | Yes | Yes | Jul 2026 | < 4 hours | ✓ |
| R-004 | Incident response + customer notification | Yes | Yes | Jun 2026 | < 24 hours | ✓ |
| R-005 | Multi-region failover | Yes | Partial | May 2026 | < 1 hour | ✗ (1.5h) |
| R-006 | Accelerate roadmap + marketing response | No | No | — | < 30 days | — |
| R-007 | Enforce budget caps + model routing | Yes | No | — | < 1 day | — |
| R-008 | Compliance roadmap execution | Draft | No | — | < 90 days | — |

### Residual risk trend

| Quarter | Total risks | Avg score | Avg residual | Risk reduction | New risks | Retired risks |
|---|---|---|---|---|---|---|
| 2025-Q4 | 32 | 10.8 | 7.2 | 33% | — | — |
| 2026-Q1 | 30 | 10.2 | 6.8 | 33% | 5 | 7 |
| 2026-Q2 | 29 | 9.5 | 6.2 | 35% | 4 | 5 |
| 2026-Q3 | 28 | 9.2 | 5.8 | 37% | 3 | 4 |

## Action recommendations

1. **Address overdue mitigations**: R-002 (multi-provider) and R-006 (differentiator features) are overdue; escalate to leadership
2. **Write contingency plans for high risks**: R-006 and R-007 have no tested contingency; target all critical/high risks with plans by Q4
3. **Drill top 5 risks quarterly**: R-001 through R-005 should have quarterly drills; untested contingency = no contingency
4. **People risk trending up**: R-001 + R-011 scores increasing; invest in retention, documentation, and cross-training
5. **Market risk monitoring**: competitor activity increasing; weekly competitive intelligence review
6. **Risk retirement celebration**: when a risk is successfully mitigated to residual < 3, celebrate it
7. **Monthly risk review**: first Monday of each month, review all critical and high risks with owners
8. **New risk triage**: any team member can submit a risk; triage within 1 week; add to register if score ≥ 6



- Risk register as shelfware → risks documented but never reviewed; monthly review is mandatory
- Optimism bias → "it probably won't happen"; probability estimates should be based on data, not gut feeling
- Mitigation without deadline → "we're working on it" indefinitely; every mitigation has a deadline and owner
- Ignoring low-probability, high-impact risks → "it's only a 2"; impact 5 × probability 2 = score 10 (high), not low
- No contingency for mitigated risks → mitigation reduces probability but doesn't eliminate risk; always have a plan B

## Related

- Same class: [dashboard-security-posture](../../engineer/quality-security/dashboard-security-posture.md) — security risk detail
- Same class: [dashboard-incident-trends](../../oncall-sre/incident-response/dashboard-incident-trends.md) — realized risks (incidents)
- Upstream: [dashboard-executive-kpi](../../executive/strategy/dashboard-executive-kpi.md) — executive risk register
- Upstream: [dashboard-engineering-capacity](../capacity/dashboard-engineering-capacity.md) — people risk
- References: ISO 31000 — *Risk Management Guidelines*; NIST SP 800-30 — *Risk Assessment*; Douglas Hubbard — *How to Measure Anything in Cybersecurity Risk*